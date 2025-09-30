// Durable Objects: Conference registry lists and per-conference state
export class RegistryDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    if (url.pathname === '/list' && method === 'GET') {
      const list = await this.state.storage.list({ prefix: 'conf:' });
      const ids = [];
      for (const [key, name] of list) {
        const id = key.replace(/^conf:/, '');
        ids.push({ id, name });
      }
      return new Response(JSON.stringify(ids), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/exists' && method === 'GET') {
      const id = url.searchParams.get('id');
      const exists = !!(await this.state.storage.get('conf:' + id));
      return new Response(JSON.stringify({ exists }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/add' && method === 'POST') {
      const { id, name } = await request.json();
      const exists = await this.state.storage.get('conf:' + id);
      if (exists) return new Response('Conflict', { status: 409 });
      await this.state.storage.put('conf:' + id, name || id);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/remove' && method === 'POST') {
      const { id } = await request.json();
      await this.state.storage.delete('conf:' + id);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not Found', { status: 404 });
  }
}

export class ConferenceDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    if (url.pathname === '/get' && method === 'GET') {
      const conference = await this.state.storage.get('conference');
      if (!conference) return new Response('Not Found', { status: 404 });
      return new Response(JSON.stringify(conference), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/create' && method === 'POST') {
      const { id, name, puzzle, created } = await request.json();
      const existing = await this.state.storage.get('conference');
      if (existing) return new Response('Conflict', { status: 409 });
      const conference = { id, name, puzzle, active: true, created };
      await this.state.storage.put('conference', conference);
      await this.state.storage.delete('display-mode');
      const subs = await this.state.storage.list({ prefix: 'submission:' });
      for (const [k] of subs) await this.state.storage.delete(k);
      return new Response(JSON.stringify(conference), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/reshuffle' && method === 'POST') {
      const conf = await this.state.storage.get('conference');
      if (!conf) return new Response('Not Found', { status: 404 });
      const { puzzle } = await request.json();
      conf.puzzle = puzzle;
      await this.state.storage.put('conference', conf);
      const subs = await this.state.storage.list({ prefix: 'submission:' });
      for (const [k] of subs) await this.state.storage.delete(k);
      return new Response(JSON.stringify(conf), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/finish' && method === 'POST') {
      const conf = await this.state.storage.get('conference');
      if (!conf) return new Response('Not Found', { status: 404 });
      conf.active = false;
      await this.state.storage.put('conference', conf);
      return new Response(JSON.stringify(conf), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/reopen' && method === 'POST') {
      const conf = await this.state.storage.get('conference');
      if (!conf) return new Response('Not Found', { status: 404 });
      conf.active = true;
      conf.winner = null;
      delete conf.ended;
      conf.reopened = new Date().toISOString();
      await this.state.storage.put('conference', conf);
      await this.state.storage.delete('display-mode');
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/submit' && method === 'POST') {
      const { name, email, answer } = await request.json();
      const conf = await this.state.storage.get('conference');
      if (!conf) return new Response('Conference not found', { status: 404 });
      if (!conf.active) return new Response('Contest has ended', { status: 400 });
      const isCorrect = JSON.stringify(answer) === JSON.stringify(conf.puzzle.solution);
      const submission = {
        id: crypto.randomUUID(),
        conferenceId: conf.id,
        answer,
        name,
        email,
        correct: isCorrect,
        timestamp: new Date().toISOString()
      };
      await this.state.storage.put('submission:' + submission.id, submission);
      return new Response(JSON.stringify({ success: true, correct: isCorrect }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/submission-count' && method === 'GET') {
      const subs = await this.state.storage.list({ prefix: 'submission:' });
      let count = 0, correctCount = 0;
      for (const [, v] of subs) {
        count++;
        if (v && v.correct) correctCount++;
      }
      return new Response(JSON.stringify({ count, correctCount }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/submissions' && method === 'GET') {
      const subs = await this.state.storage.list({ prefix: 'submission:' });
      const submissions = [];
      for (const [, v] of subs) submissions.push(v);
      submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return new Response(JSON.stringify(submissions), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/set-mode' && method === 'POST') {
      const { mode } = await request.json();
      if (mode) await this.state.storage.put('display-mode', mode);
      else await this.state.storage.delete('display-mode');
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/get-mode' && method === 'GET') {
      const mode = await this.state.storage.get('display-mode');
      return new Response(JSON.stringify({ mode: mode || 'puzzle' }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/end-contest' && method === 'POST') {
      const { winner } = await request.json();
      const conf = await this.state.storage.get('conference');
      if (!conf) return new Response('Conference not found', { status: 404 });
      conf.winner = winner;
      conf.active = false;
      conf.ended = new Date().toISOString();
      await this.state.storage.put('conference', conf);
      await this.state.storage.put('display-mode', 'ended');
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not Found', { status: 404 });
  }
}

// Helper function to get Service Token headers for internal API calls
function getServiceTokenHeaders(env) {
  return {
    'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
    'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };
}

function getRegistryStub(env) {
  const id = env.REGISTRY.idFromName('registry');
  return env.REGISTRY.get(id);
}

function getConferenceStub(env, conferenceId) {
  const id = env.CONFERENCE_DO.idFromName(conferenceId);
  return env.CONFERENCE_DO.get(id);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/' || path === '/puzzle') {
        // Check if we should display winner wheel instead
        const conferenceId = url.searchParams.get('conference');
        if (conferenceId) {
          const modeResp = await getConferenceStub(env, conferenceId).fetch('https://do/get-mode');
          const { mode: displayMode } = modeResp.ok ? await modeResp.json() : { mode: 'puzzle' };
          if (displayMode === 'winner') {
            return handleWinnerWheel(url, env);
          }
        }
        return handlePuzzleDisplay(url, env);
      } else if (path === '/admin') {
        return handleAdminUI(env);
      } else if (path === '/winner') {
        return handleWinnerWheel(url, env);
      } else if (path === '/submit') {
        return handleSubmitForm(url, env);
      } else if (url.pathname === '/api/submit') {
        return handleAPI(request, env, corsHeaders);
      }

      if (url.pathname === '/api/finish-contest') {
        return handleFinishContest(request, env);
      }

      if (url.pathname === '/api/end-contest') {
        return handleEndContest(request, env);
      }


      if (path.startsWith('/api/')) {
        return handleAPI(request, env, corsHeaders);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

function generatePuzzle() {
  // Generate solution with unique digits
  const solution = [];
  while (solution.length < 3) {
    const digit = Math.floor(Math.random() * 10);
    if (!solution.includes(digit)) {
      solution.push(digit);
    }
  }

  const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => !solution.includes(d));

  // Generate clue 1: One number correct but wrongly placed
  let clue1;
  do {
    clue1 = [];
    const solutionDigit = solution[Math.floor(Math.random() * 3)];
    let wrongPos;
    do {
      wrongPos = Math.floor(Math.random() * 3);
    } while (solution[wrongPos] === solutionDigit);
    clue1[wrongPos] = solutionDigit;

    // Fill other positions with non-solution digits
    for (let i = 0; i < 3; i++) {
      if (i !== wrongPos) {
        clue1[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue1.some((num, idx) => num === solution[idx]) ||
           clue1.filter(num => solution.includes(num)).length !== 1);

  // Generate clue 2: One number correct but wrongly placed
  let clue2;
  do {
    clue2 = [];
    const solutionDigit = solution[Math.floor(Math.random() * 3)];
    let wrongPos;
    do {
      wrongPos = Math.floor(Math.random() * 3);
    } while (solution[wrongPos] === solutionDigit);
    clue2[wrongPos] = solutionDigit;

    // Fill other positions with non-solution digits
    for (let i = 0; i < 3; i++) {
      if (i !== wrongPos) {
        clue2[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue2.some((num, idx) => num === solution[idx]) ||
           clue2.filter(num => solution.includes(num)).length !== 1 ||
           JSON.stringify(clue2) === JSON.stringify(clue1));

  // Generate clue 3: Two numbers correct and well placed
  let clue3;
  do {
    clue3 = [];
    const positions = [0, 1, 2];
    const selectedPositions = [];

    // Select 2 random positions
    for (let i = 0; i < 2; i++) {
      const posIndex = Math.floor(Math.random() * positions.length);
      selectedPositions.push(positions.splice(posIndex, 1)[0]);
    }

    // Place solution digits in correct positions
    selectedPositions.forEach(pos => {
      clue3[pos] = solution[pos];
    });

    // Fill remaining position with non-solution digit
    for (let i = 0; i < 3; i++) {
      if (clue3[i] === undefined) {
        clue3[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue3.filter((num, idx) => num === solution[idx]).length !== 2 ||
           clue3.filter(num => solution.includes(num)).length !== 2);

  // Generate clue 4: Two numbers correct but wrongly placed
  let clue4;
  do {
    clue4 = [];
    const solutionDigits = [...solution];
    const usedPositions = [];

    // Place two solution digits in wrong positions
    for (let i = 0; i < 2; i++) {
      const digitIndex = Math.floor(Math.random() * solutionDigits.length);
      const digit = solutionDigits.splice(digitIndex, 1)[0];
      let pos;
      do {
        pos = Math.floor(Math.random() * 3);
      } while (usedPositions.includes(pos) || solution[pos] === digit);
      clue4[pos] = digit;
      usedPositions.push(pos);
    }

    // Fill remaining position with non-solution digit
    for (let i = 0; i < 3; i++) {
      if (clue4[i] === undefined) {
        clue4[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue4.some((num, idx) => num === solution[idx]) ||
           clue4.filter(num => solution.includes(num)).length !== 2);

  // Generate clue 5: Nothing is correct
  let clue5;
  do {
    clue5 = [];
    for (let i = 0; i < 3; i++) {
      clue5[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
    }
  } while (clue5.some(num => solution.includes(num)));

  return {
    solution,
    clues: [
      { numbers: clue1, hint: "One number is correct but wrongly placed" },
      { numbers: clue2, hint: "One number is correct but wrongly placed" },
      { numbers: clue3, hint: "Two numbers are correct and well placed" },
      { numbers: clue4, hint: "Two numbers are correct but wrongly placed" },
      { numbers: clue5, hint: "Nothing is correct" }
    ]
  };
}

async function handlePuzzleDisplay(url, env) {
  const conferenceId = url.searchParams.get('conference') || 'default';

  // Check if display should show winner wheel instead
  const modeResp = await getConferenceStub(env, conferenceId).fetch('https://do/get-mode');
  const { mode: displayMode } = modeResp.ok ? await modeResp.json() : { mode: 'puzzle' };
  if (displayMode === 'winner') {
    return handleWinnerWheel(url, env);
  }

  // Ensure conference exists or create a default one
  let confResp = await getConferenceStub(env, conferenceId).fetch('https://do/get');
  let conference;
  if (!confResp.ok) {
    const defaultPuzzle = generatePuzzle();
    const newConf = {
      id: conferenceId,
      name: conferenceId === 'default' ? 'Default Conference' : conferenceId,
      puzzle: defaultPuzzle,
      created: new Date().toISOString()
    };
    await getConferenceStub(env, conferenceId).fetch('https://do/create', { method: 'POST', body: JSON.stringify(newConf) });
    await getRegistryStub(env).fetch('https://do/add', { method: 'POST', body: JSON.stringify({ id: conferenceId, name: newConf.name }) });
    confResp = await getConferenceStub(env, conferenceId).fetch('https://do/get');
  }
  conference = confResp.ok ? await confResp.json() : null;

  if (!conference) {
    return new Response('Failed to create or retrieve conference', { status: 500 });
  }

  const clueRows = conference.puzzle.clues.map(clue => {
    const numberBoxes = clue.numbers.map(num => '<div class="number-box">' + num + '</div>').join('');
    return '<div class="clue-row"><div class="number-boxes">' + numberBoxes + '</div><div class="clue-text">' + clue.hint + '</div></div>';
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conference.name} - Crack the Code</title>
    <link rel="icon" type="image/x-icon" href="https://r2.lusostreams.com/puzzleicon.ico">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        }

        .puzzle-container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
            margin: 10px 0;
            min-height: fit-content;
        }

        /* 9:16 Portrait Layout (Default) - Optimized for 1080p and 4K */
        @media screen and (orientation: portrait) {
            body {
                padding: 1vh 2vw;
            }

            .puzzle-container {
                max-width: 96vw;
                width: 100%;
                padding: 1.5vh 3vw;
                margin: 0;
                max-height: 98vh;
                overflow-y: auto;
            }

            .header {
                margin-bottom: 1.5vh;
                padding: 1.5vh;
            }

            .header h1 {
                font-size: clamp(1.2rem, 3vw, 1.6rem);
                margin-bottom: 0.3vh;
                line-height: 1.1;
            }

            .header .subtitle {
                font-size: clamp(1.8rem, 5vw, 2.4rem);
                font-weight: bold;
                margin-top: 0.5vh;
            }

            .clue-row {
                margin: 2vh 0;
                padding: 3vh 2vw;
                flex-direction: row;
                text-align: left;
                align-items: center;
                min-height: 10vh;
            }

            .number-boxes {
                margin-right: 3vw;
                margin-bottom: 0;
                justify-content: flex-start;
                flex-shrink: 0;
            }

            .number-box {
                width: clamp(60px, 12vw, 80px);
                height: clamp(60px, 12vw, 80px);
                font-size: clamp(1.8rem, 5vw, 2.8rem);
            }

            .clue-text {
                text-align: left;
                font-size: clamp(1.8rem, 5.2vw, 2.6rem);
                flex: 1;
                line-height: 1.2;
                font-weight: 500;
            }

            .solution-section {
                margin: 1.5vh 0;
                padding: 1.5vh;
            }

            .solution-box {
                width: clamp(55px, 14vw, 80px);
                height: clamp(55px, 14vw, 80px);
                font-size: clamp(2rem, 6vw, 3.2rem);
            }

            .qr-section {
                margin-top: 1.5vh;
                padding: 1.5vh;
            }

            .qr-section h3 {
                font-size: clamp(1rem, 3vw, 1.3rem);
                margin-bottom: 1vh;
            }

            .qr-code {
                width: clamp(160px, 32vw, 220px);
                height: clamp(160px, 32vw, 220px);
                margin: 1vh auto;
            }

            .qr-section p {
                font-size: clamp(0.9rem, 2.5vw, 1.1rem);
                margin-top: 1vh;
            }

            .footer {
                margin-top: 2vh;
                padding: 2.5vh 2vw;
                font-size: clamp(1.2rem, 3vw, 1.6rem);
                min-height: 8vh;
            }

            .footer img {
                height: clamp(35px, 8vw, 55px);
            }
        }

        /* 16:9 Landscape Layout - Desktop/Laptop browsers */
        @media screen and (orientation: landscape) and (min-aspect-ratio: 16/9) {
            body {
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                min-height: 100vh;
            }

            .puzzle-container {
                display: grid;
                grid-template-columns: 1fr 350px;
                gap: 40px;
                max-width: 1400px;
                width: 100%;
                padding: 20px;
                align-items: start;
            }

            .puzzle-content {
                display: flex;
                flex-direction: column;
            }

            .header {
                padding: 25px;
                margin-bottom: 30px;
            }

            .header h1 {
                font-size: 1.8em;
                margin-bottom: 8px;
            }

            .header .subtitle {
                font-size: 2.6em;
            }

            .clue-row {
                margin: 20px 0;
                padding: 20px;
                min-height: 80px;
            }

            .number-box {
                width: 60px;
                height: 60px;
                font-size: 2em;
                margin: 6px;
            }

            .clue-text {
                font-size: 1.3em;
                line-height: 1.3;
            }

            .solution-section {
                padding: 25px;
                margin: 30px 0;
            }

            .solution-box {
                width: 70px;
                height: 70px;
                font-size: 2.4em;
            }

            .side-panel {
                display: flex;
                flex-direction: column;
                gap: 20px;
                position: sticky;
                top: 20px;
            }

            .qr-section {
                margin: 0;
                padding: 25px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .qr-section h3 {
                font-size: 1.2em;
                margin-bottom: 15px;
            }

            .qr-code {
                width: 200px;
                height: 200px;
            }

            .qr-section p {
                font-size: 0.95em;
                margin-top: 15px;
            }

            .footer {
                grid-column: 1 / -1;
                padding: 25px;
                margin-top: 30px;
                font-size: 1.3em;
            }

            .footer img {
                height: 40px;
            }
        }

        .header {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        }

        .header h1 {
            font-size: 1.8em;
            font-weight: bold;
            margin-bottom: 5px;
            line-height: 1.1;
        }

        .header .subtitle {
            font-size: 2.8em;
            opacity: 1;
            font-weight: bold;
            margin-top: 5px;
        }

        .clue-row {
            display: flex;
            align-items: center;
            margin: 25px 0;
            padding: 20px 15px;
            border-radius: 10px;
            background: #f8f9fa;
            min-height: 90px;
        }

        .clue-row:nth-child(2) { border-left: 5px solid #6c5ce7; }
        .clue-row:nth-child(3) { border-left: 5px solid #a29bfe; }
        .clue-row:nth-child(4) { border-left: 5px solid #00b894; }
        .clue-row:nth-child(5) { border-left: 5px solid #00cec9; }
        .clue-row:nth-child(6) { border-left: 5px solid #74b9ff; }

        .number-boxes {
            display: flex;
            gap: 10px;
            margin-right: 20px;
        }

        .number-box {
            width: 70px;
            height: 70px;
            background: white;
            color: #2d3436;
            font-size: 2.2em;
            font-weight: bold;
            margin: 8px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ddd;
        }

        .clue-row:nth-child(2) .number-box { color: #6c5ce7; border-color: #6c5ce7; }
        .clue-row:nth-child(3) .number-box { color: #a29bfe; border-color: #a29bfe; }
        .clue-row:nth-child(4) .number-box { color: #00b894; border-color: #00b894; }
        .clue-row:nth-child(5) .number-box { color: #00cec9; border-color: #00cec9; }
        .clue-row:nth-child(6) .number-box { color: #74b9ff; border-color: #74b9ff; }

        .clue-text {
            flex: 1;
            text-align: left;
            font-size: 1.4em;
            color: #2d3436;
            font-weight: 500;
            line-height: 1.2;
        }

        .solution-section {
            margin: 20px 0;
            padding: 15px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            border-radius: 15px;
            color: white;
        }

        .solution-boxes {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
        }

        .solution-box {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.2);
            border: 3px solid white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            font-weight: bold;
            color: white;
        }

        .qr-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 2px dashed #ddd;
        }

        .qr-code {
            width: 200px;
            height: 200px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ddd;
        }

        .footer {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 25px 20px;
            border-radius: 15px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1.4em;
            font-weight: bold;
            min-height: 60px;
        }

        .footer img {
            height: 45px;
            width: auto;
        }
    </style>
</head>
<body>
    <div class="puzzle-container">
        <div class="puzzle-content">
            <div class="header">
                <h1>Crack the code to</h1>
                <div class="subtitle">Hack the prize!</div>
            </div>

            ${clueRows}

            <div class="solution-section">
                <div class="solution-boxes">
                    <div class="solution-box">?</div>
                    <div class="solution-box">?</div>
                    <div class="solution-box">?</div>
                </div>
            </div>
        </div>

        <div class="side-panel">
            <div class="qr-section">
                <h3>Scan to Submit Your Answer</h3>
                <div class="qr-code">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url.origin + '/submit?conference=' + conferenceId)}" alt="QR Code" />
                </div>
            </div>
        </div>

        <div class="footer">
            <span>#EverywhereSecurity</span>
            <img src="https://imagedelivery.net/LDaKen7vOKX42km4kZ-43A/21c30227-7801-44fe-6149-121c5044a100/thumbnail" alt="Cloudflare" />
        </div>

        <div style="text-align: center; padding: 10px; font-size: 0.8em; opacity: 0.6; color: #636e72;">
            Built on Cloudflare Durable Objects
        </div>
    </div>

    <script>
        const submitUrl = window.location.origin + '/submit?conference=${conferenceId}';
        console.log('Submit URL:', submitUrl);

        // Generate QR code using API service
        function generateQR() {
            console.log('Generating QR code using API service...');
            const qrImage = document.getElementById('qr-image');
            if (qrImage) {
                const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(submitUrl);
                qrImage.src = qrApiUrl;
                qrImage.onload = function() {
                    console.log('QR Code loaded successfully');
                };
                qrImage.onerror = function() {
                    console.error('QR Code API failed, showing fallback');
                    document.getElementById('qrcode').innerHTML = '<p>QR Code unavailable. <a href="' + submitUrl + '" target="_blank">Click here to submit</a></p>';
                };
            } else {
                console.error('QR image element not found');
            }
        }

        generateQR();

        let displayModeInterval;
        let isNavigating = false;

        displayModeInterval = setInterval(async function() {
            if (isNavigating) return;

            try {
                const response = await fetch('/api/display-mode/${conferenceId}');
                if (response.ok) {
                    const data = await response.json();
                    if (data.mode === 'winner') {
                        isNavigating = true;
                        clearInterval(displayModeInterval);
                        console.log('Switching to winner wheel...');
                        window.location.href = '/winner?conference=${conferenceId}';
                    }
                }
            } catch (error) {
                console.log('Display mode check failed:', error);
            }
        }, 3000);
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function handleAPI(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/conferences' && method === 'GET') {
    const regResp = await getRegistryStub(env).fetch('https://do/list');
    const entries = regResp.ok ? await regResp.json() : [];
    const conferences = [];
    for (const { id } of entries) {
      const resp = await getConferenceStub(env, id).fetch('https://do/get');
      if (resp.ok) conferences.push(await resp.json());
    }
    return new Response(JSON.stringify(conferences), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path === '/api/conferences' && method === 'POST') {
    try {
      const body = await request.json();
      const conferenceId = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-');

      const existsResp = await getRegistryStub(env).fetch('https://do/exists?id=' + conferenceId);
      const existsData = existsResp.ok ? await existsResp.json() : { exists: false };
      if (existsData.exists) {
        return new Response(JSON.stringify({ 
          error: 'A conference with this name already exists. Please choose a different name.' 
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const puzzle = generatePuzzle();

      const conference = {
        id: conferenceId,
        name: body.name,
        puzzle,
        created: new Date().toISOString()
      };

      await getConferenceStub(env, conferenceId).fetch('https://do/create', { method: 'POST', body: JSON.stringify(conference) });
      await getRegistryStub(env).fetch('https://do/add', { method: 'POST', body: JSON.stringify({ id: conferenceId, name: conference.name }) });

      return new Response(JSON.stringify(conference), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error creating conference:', error);
      return new Response('Error creating conference: ' + error.message, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/reshuffle$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/reshuffle$/)[1];
    const newPuzzle = generatePuzzle();
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/reshuffle', { method: 'POST', body: JSON.stringify({ puzzle: newPuzzle }) });
    if (!resp.ok) return new Response('Conference not found', { status: 404, headers: corsHeaders });
    const conferenceData = await resp.json();
    return new Response(JSON.stringify(conferenceData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/finish$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/finish$/)[1];
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/finish', { method: 'POST' });
    if (!resp.ok) return new Response('Conference not found', { status: 404, headers: corsHeaders });
    const conferenceData = await resp.json();
    return new Response(JSON.stringify(conferenceData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path === '/api/submit' && method === 'POST') {
    const { conference, name, email, answer, turnstileToken } = await request.json();

    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Turnstile token required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify Turnstile token
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
    });

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return new Response(JSON.stringify({ error: 'Turnstile verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const conferenceId = conference;
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submit', { method: 'POST', body: JSON.stringify({ name, email, answer }) });
    if (!resp.ok) return new Response(await resp.text(), { status: resp.status, headers: corsHeaders });
    return new Response(await resp.text(), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-winner$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-winner$/)[1];
    await getConferenceStub(env, conferenceId).fetch('https://do/set-mode', { method: 'POST', body: JSON.stringify({ mode: 'winner' }) });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-puzzle$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-puzzle$/)[1];
    await getConferenceStub(env, conferenceId).fetch('https://do/set-mode', { method: 'POST', body: JSON.stringify({ mode: null }) });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/display-mode$/) && method === 'GET') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/display-mode$/)[1];
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/get-mode');
    const data = resp.ok ? await resp.json() : { mode: 'puzzle' };
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Public proxy endpoint for display-mode (no authentication required)
  if (path.match(/^\/api\/display-mode\/([^\/]+)$/) && method === 'GET') {
    const conferenceId = path.match(/^\/api\/display-mode\/([^\/]+)$/)[1];

    try {
      const resp = await getConferenceStub(env, conferenceId).fetch('https://do/get-mode');
      const data = resp.ok ? await resp.json() : { mode: 'puzzle' };
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching display mode:', error);
      return new Response(JSON.stringify({ mode: 'puzzle' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Admin proxy endpoint for switch-to-winner (public for reliability)
  if (path.match(/^\/api\/admin\/([^\/]+)\/switch-to-winner$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/admin\/([^\/]+)\/switch-to-winner$/)[1];

    try {
      await getConferenceStub(env, conferenceId).fetch('https://do/set-mode', { method: 'POST', body: JSON.stringify({ mode: 'winner' }) });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error switching to winner:', error);
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Admin proxy endpoint for switch-to-puzzle (public for reliability)
  if (path.match(/^\/api\/admin\/([^\/]+)\/switch-to-puzzle$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/admin\/([^\/]+)\/switch-to-puzzle$/)[1];

    try {
      await getConferenceStub(env, conferenceId).fetch('https://do/set-mode', { method: 'POST', body: JSON.stringify({ mode: null }) });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error switching to puzzle:', error);
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/submission-count$/) && method === 'GET') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/submission-count$/)[1];
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submission-count');
    const data = resp.ok ? await resp.json() : { count: 0, correctCount: 0 };
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path.match(/^\/api\/conferences\/([^\/]+)\/reopen$/) && method === 'POST') {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/reopen$/)[1];

    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/reopen', { method: 'POST' });
    if (!resp.ok) return new Response('Conference not found', { status: 404, headers: corsHeaders });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (path === '/api/submissions' && method === 'GET') {
    const conferenceId = url.searchParams.get('conference');
    if (!conferenceId) {
      return new Response('Conference ID required', { status: 400, headers: corsHeaders });
    }

    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submissions');
    const submissions = resp.ok ? await resp.json() : [];

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Submissions - ${conferenceId}</title>
<link rel="icon" type="image/x-icon" href="https://r2.lusostreams.com/puzzleicon.ico">
<style>
  body { font-family: Arial, sans-serif; margin: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
  .correct { background-color: #d4edda; }
  .incorrect { background-color: #f8d7da; }
</style>
</head><body>
<h1>Submissions for ${conferenceId}</h1>
<table>
  <tr><th>Time</th><th>Name</th><th>Email</th><th>Answer</th><th>Correct</th></tr>
  ${submissions.map(sub => 
    `<tr class="${sub.correct ? 'correct' : 'incorrect'}">
      <td>${new Date(sub.timestamp).toLocaleString()}</td>
      <td>${sub.name}</td>
      <td>${sub.email}</td>
      <td>${Array.isArray(sub.answer) ? sub.answer.join('') : sub.answer}</td>
      <td>${sub.correct ? '✅' : '❌'}</td>
    </tr>`
  ).join('')}
</table>
</body></html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // Test endpoint for bulk data generation (bypasses Turnstile)
  if (path === '/api/test-submit' && method === 'POST') {
    const { conference, name, email, answer } = await request.json();
    const conferenceId = conference;
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submit', { method: 'POST', body: JSON.stringify({ name, email, answer }) });
    if (!resp.ok) return new Response(await resp.text(), { status: resp.status, headers: corsHeaders });
    return new Response(await resp.text(), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Populate test data endpoint
  if (path === '/api/populate-test-data' && method === 'POST') {
    return handlePopulateTestData(request, env);
  }

  // Debug endpoint to check submissions
  if (path === '/api/debug-submissions' && method === 'GET') {
    const conferenceId = url.searchParams.get('conference');
    if (!conferenceId) {
      return new Response(JSON.stringify([]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submissions');
    const submissions = resp.ok ? await resp.json() : [];

    return new Response(JSON.stringify(submissions, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response('API endpoint not found', { status: 404, headers: corsHeaders });
}

async function handleAdminUI(env) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Booth Puzzle - Admin</title>
    <link rel="icon" type="image/x-icon" href="https://r2.lusostreams.com/puzzleicon.ico">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #2d3436, #636e72);
            min-height: 100vh;
            padding: 15px;
            overflow-x: auto;
        }
        .admin-container {
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: grid;
            grid-template-columns: 350px 1fr;
            grid-template-rows: auto 1fr;
            gap: 20px;
            min-height: calc(100vh - 30px);
        }
        .header {
            grid-column: 1 / -1;
            text-align: center;
            padding: 15px 0;
            border-bottom: 2px solid #f1f2f6;
            margin-bottom: 0;
        }
        .header h1 {
            color: #2d3436;
            font-size: 2em;
            margin-bottom: 5px;
        }
        .header p {
            color: #636e72;
            font-size: 1em;
        }
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .main-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
            max-height: calc(100vh - 150px);
        }
        .section {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #ff6b35;
        }
        .section h2 {
            color: #2d3436;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .collapsible-header {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px 0;
            user-select: none;
        }
        .collapsible-header:hover {
            color: #ff6b35;
        }
        .collapse-icon {
            transition: transform 0.3s ease;
            font-size: 1.2em;
        }
        .collapse-icon.collapsed {
            transform: rotate(-90deg);
        }
        .collapsible-content {
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        .collapsible-content.collapsed {
            max-height: 0;
        }
        .form-group {
            margin: 15px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #2d3436;
        }
        input, button {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1em;
            margin-bottom: 10px;
        }
        button {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            line-height: 1.2;
        }
        button:hover {
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: linear-gradient(135deg, #636e72, #2d3436);
        }
        .btn-danger {
            background: linear-gradient(135deg, #e17055, #d63031);
        }
        .conference-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .conference-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #ddd;
            position: relative;
        }
        .conference-card.active {
            border-color: #00b894;
            background: #f0fff4;
        }
        .conference-card.inactive {
            border-color: #e17055;
            background: #fff5f5;
        }
        .status-badge {
            float: right;
            margin-left: 10px;
            margin-bottom: 5px;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
            clear: right;
        }
        .conference-card h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
            line-height: 1.3;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .status-active {
            background: #00b894;
            color: white;
        }
        .status-inactive {
            background: #e17055;
            color: white;
        }
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 15px;
        }
        .button-group button {
            flex: 1;
            min-width: 80px;
            font-size: 0.85em;
            padding: 8px 12px;
            transition: all 0.3s ease;
        }
        .current-puzzle {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .solution-display {
            background: #ff6b35;
            color: white;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="header">
            <h1>🔧 Cloudflare Booth Puzzle Admin - Durable Objects Version</h1>
            <p>Manage conferences, puzzles, and winners</p>
        </div>

        <div class="sidebar">
            <div class="section">
                <h2>Create New Conference</h2>
                <div class="form-group">
                    <label for="newConferenceName">Conference Name:</label>
                    <input type="text" id="newConferenceName" placeholder="Conference Name" data-placeholder-template="e.g., RSA Conference {year}">
                    <button onclick="createConference()">Create Conference</button>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="section">
                <h2>Active Conferences</h2>
                <div id="conferencesList" class="conference-list">
                    Loading conferences... this may take ~10 seconds...
                </div>
            </div>

            <div class="section">
                <div class="collapsible-header" onclick="toggleHistorySection()">
                    <h2 style="margin: 0;">Conference History</h2>
                    <span class="collapse-icon collapsed">▼</span>
                </div>
                <div id="historyContent" class="collapsible-content collapsed">
                    <div id="historyList" class="conference-list">
                        Loading history...
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let conferences = [];

        // Service Token credentials injected server-side
        const SERVICE_TOKEN_ID = '${env.CF_ACCESS_CLIENT_ID || ""}';
        const SERVICE_TOKEN_SECRET = '${env.CF_ACCESS_CLIENT_SECRET || ""}';

        function getServiceHeaders() {
            // For DO version, we don't require service tokens for basic operations
            if (SERVICE_TOKEN_ID && SERVICE_TOKEN_SECRET && SERVICE_TOKEN_ID !== '' && SERVICE_TOKEN_SECRET !== '') {
                return {
                    'CF-Access-Client-Id': SERVICE_TOKEN_ID,
                    'CF-Access-Client-Secret': SERVICE_TOKEN_SECRET,
                    'Content-Type': 'application/json'
                };
            } else {
                return {
                    'Content-Type': 'application/json'
                };
            }
        }

        async function loadConferences() {
            try {
                console.log('Loading conferences...');
                document.getElementById('conferencesList').innerHTML = '<p>Loading conferences...</p>';
                
                const response = await fetch('/api/conferences', {
                    headers: getServiceHeaders()
                });
                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error('HTTP ' + response.status + ': ' + errorText);
                }

                conferences = await response.json();
                console.log('Loaded conferences:', conferences);
                console.log('Number of conferences:', conferences.length);
                
                if (conferences.length === 0) {
                    document.getElementById('conferencesList').innerHTML = '<p>No conferences found.</p>';
                    return;
                }
                
                await renderConferences();
            } catch (error) {
                console.error('Error loading conferences:', error);
                document.getElementById('conferencesList').innerHTML = '<p style="color: red;">Error loading conferences: ' + error.message + '</p>';
                document.getElementById('historyList').innerHTML = '<p style="color: red;">Error loading history: ' + error.message + '</p>';
            }
        }

        async function renderConferences() {
            console.log('Starting renderConferences...');
            const activeConferences = conferences.filter(conf => conf.active);
            const inactiveConferences = conferences.filter(conf => !conf.active);
            console.log('Active conferences:', activeConferences.length);
            console.log('Inactive conferences:', inactiveConferences.length);

            // Render active conferences
            const activeContainer = document.getElementById('conferencesList');
            if (activeConferences.length === 0) {
                activeContainer.innerHTML = '<p>No active conferences found. Create your first conference above.</p>';
            } else {
                try {
                    console.log('Rendering active conference cards...');
                    activeContainer.innerHTML = '<p>Rendering conference cards...</p>';
                    const activeCards = await Promise.all(activeConferences.map(conf => renderConferenceCard(conf, true)));
                    console.log('Generated', activeCards.length, 'active cards');
                    activeContainer.innerHTML = activeCards.join('');
                } catch (error) {
                    console.error('Error rendering active conferences:', error);
                    activeContainer.innerHTML = '<p style="color: red;">Error rendering conferences: ' + error.message + '</p>';
                }
            }

            // Render conference history
            const historyContainer = document.getElementById('historyList');
            if (inactiveConferences.length === 0) {
                historyContainer.innerHTML = '<p>No finished conferences yet.</p>';
            } else {
                // Sort inactive conferences by ended date (most recent first)
                const sortedInactiveConferences = inactiveConferences.sort((a, b) => {
                    const dateA = new Date(a.ended || a.created);
                    const dateB = new Date(b.ended || b.created);
                    return dateB - dateA; // Most recent first
                });
                const historyCards = await Promise.all(sortedInactiveConferences.map(conf => renderConferenceCard(conf, false)));
                historyContainer.innerHTML = historyCards.join('');
            }

            // Update max-height for collapsible content if it's expanded
            const historyContent = document.getElementById('historyContent');
            if (historyContent && !historyContent.classList.contains('collapsed')) {
                historyContent.style.maxHeight = historyContent.scrollHeight + 'px';
            }
        }

        async function renderConferenceCard(conf, isActive) {
            const clueItems = conf.puzzle.clues.map(clue => 
                '<div><strong>' + clue.numbers.join('') + '</strong><br><small>' + clue.hint + '</small></div>'
            ).join('');

            const winnerInfo = conf.winner ? 
                '<div style="background: #00b894; color: white; padding: 10px; border-radius: 5px; margin: 10px 0;">' +
                    '<strong>🏆 Winner: ' + conf.winner.name + '</strong><br>' +
                    '<small>' + conf.winner.email + '</small>' +
                '</div>' : '';

            // Get submission count and correct ratio for this conference
            let submissionCount = 0;
            let correctCount = 0;
            let correctRatio = 0;
            try {
                const response = await fetch('/api/conferences/' + conf.id + '/submission-count');
                if (response.ok) {
                    const data = await response.json();
                    submissionCount = data.count;
                    correctCount = data.correctCount || 0;
                    correctRatio = submissionCount > 0 ? Math.round((correctCount / submissionCount) * 100) : 0;
                }
            } catch (e) {
                // Ignore errors, default to 0
            }

            // Get display mode for this conference
            let displayMode = null;
            try {
                const response = await fetch('/api/display-mode/' + conf.id);
                if (response.ok) {
                    const data = await response.json();
                    displayMode = data.mode;
                }
            } catch (e) {
                // Ignore errors, default to null
            }

            return '<div class="conference-card ' + (conf.active ? 'active' : 'inactive') + '">' +
                '<div class="status-badge status-' + (conf.active ? 'active' : 'inactive') + '">' + (conf.active ? 'ACTIVE' : 'ENDED') + '</div>' +
                '<h3>' + conf.name + '</h3>' +
                '<p><strong>ID:</strong> ' + conf.id + '</p>' +
                '<p><strong>Created:</strong> ' + new Date(conf.created).toLocaleString() + '</p>' +
                (conf.ended ? '<p><strong>Ended:</strong> ' + new Date(conf.ended).toLocaleString() + '</p>' : '') +
                '<p><strong>📊 Submissions:</strong> ' + submissionCount + ' total, ' + correctCount + ' correct (' + correctRatio + '%)</p>' +
                (displayMode ? '<p><strong>🖥️ Currently Displaying:</strong> ' + (displayMode === 'winner' ? '🎉 Winner Wheel' : '🧩 Puzzle Screen') + '</p>' : '<p><strong>🖥️ Currently Displaying:</strong> 🧩 Puzzle Screen</p>') +
                '<div class="current-puzzle">' +
                    '<h4>Solution:</h4>' +
                    '<div class="solution-display">' + conf.puzzle.solution.join(' - ') + '</div>' +
                    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">' +
                        clueItems +
                    '</div>' +
                '</div>' +
                winnerInfo +
                '<div class="button-group">' +
                    '<button onclick="viewPuzzle(&quot;' + conf.id + '&quot;)" class="btn-secondary">View Puzzle</button>' +
                    '<button onclick="copyPuzzleUrl(&quot;' + conf.id + '&quot;)" class="btn-secondary">📋 Copy URL</button>' +
                    (isActive ? '<button onclick="reshufflePuzzle(&quot;' + conf.id + '&quot;)" class="btn-secondary">Reshuffle</button>' : '') +
                '</div>' +
                (isActive ? 
                    '<div class="button-group">' +
                        '<button onclick="viewSubmissions(&quot;' + conf.id + '&quot;)" class="btn-secondary">View Submissions</button>' +
                        '<button onclick="finishContest(&quot;' + conf.id + '&quot;)" class="btn-danger">Finish Contest</button>' +
                    '</div>' +
                    '<div class="button-group">' +
                        (displayMode === 'winner' ? 
                            '<button onclick="switchToPuzzle(&quot;' + conf.id + '&quot;)" class="btn-secondary">Back to Puzzle Screen</button>' :
                            '<button onclick="switchToWinner(&quot;' + conf.id + '&quot;)" class="btn-secondary">Switch to Winner Wheel</button>'
                        ) +
                    '</div>'
                : 
                    '<div class="button-group">' +
                        '<button onclick="viewSubmissions(&quot;' + conf.id + '&quot;)" class="btn-secondary">View Submissions</button>' +
                        '<button onclick="reopenContest(&quot;' + conf.id + '&quot;)" class="btn-secondary">Reopen Contest</button>' +
                    '</div>'
                ) +
            '</div>';
        }

        async function createConference() {
            const name = document.getElementById('newConferenceName').value.trim();
            if (!name) {
                alert('Please enter a conference name');
                return;
            }

            try {
                const response = await fetch('/api/conferences', {
                    method: 'POST',
                    headers: getServiceHeaders(),
                    body: JSON.stringify({ name })
                });

                if (response.ok) {
                    document.getElementById('newConferenceName').value = '';
                    loadConferences();
                } else {
                    const error = await response.json();
                    alert('Error creating conference: ' + (error.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating conference:', error);
                alert('Error creating conference: ' + error.message);
            }
        }

        async function reshufflePuzzle(conferenceId) {
            if (!confirm('Are you sure you want to reshuffle this puzzle? This will generate a new solution and DELETE ALL EXISTING SUBMISSIONS for this conference.')) {
                return;
            }

            try {
                const response = await fetch('/api/conferences/' + conferenceId + '/reshuffle', {
                    method: 'POST',
                    headers: getServiceHeaders()
                });

                if (response.ok) {
                    loadConferences();
                } else {
                    alert('Error reshuffling puzzle');
                }
            } catch (error) {
                console.error('Error reshuffling puzzle:', error);
                alert('Error reshuffling puzzle');
            }
        }

        async function finishContest(conferenceId) {
            if (!confirm('Are you sure you want to finish this contest? Attendees will no longer be able to submit answers.')) {
                return;
            }

            try {
                const response = await fetch('/api/conferences/' + conferenceId + '/finish', {
                    method: 'POST',
                    headers: getServiceHeaders()
                });

                if (response.ok) {
                    loadConferences();
                } else {
                    alert('Error finishing contest');
                }
            } catch (error) {
                console.error('Error finishing contest:', error);
                alert('Error finishing contest');
            }
        }

        async function reopenContest(conferenceId) {
            if (!confirm('Are you sure you want to reopen this contest? Attendees will be able to submit answers again.')) {
                return;
            }

            try {
                const response = await fetch('/api/conferences/' + conferenceId + '/reopen', {
                    method: 'POST',
                    headers: getServiceHeaders()
                });

                if (response.ok) {
                    loadConferences();
                } else {
                    alert('Error reopening contest');
                }
            } catch (error) {
                console.error('Error reopening contest:', error);
                alert('Error reopening contest');
            }
        }

        function viewPuzzle(conferenceId) {
            window.open('/puzzle?conference=' + conferenceId, '_blank');
        }

        function viewSubmissions(conferenceId) {
            window.open('/api/submissions?conference=' + conferenceId, '_blank');
        }

        async function copyPuzzleUrl(conferenceId) {
            const puzzleUrl = window.location.origin + '/puzzle?conference=' + conferenceId;
            const button = event.target;
            const originalText = button.innerHTML;

            try {
                await navigator.clipboard.writeText(puzzleUrl);

                // Animate button to show success
                button.innerHTML = '✅ Copied!';
                button.style.background = '#00b894';
                button.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    button.style.transform = '';
                }, 2000);

            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = puzzleUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // Animate button to show success
                button.innerHTML = '✅ Copied!';
                button.style.background = '#00b894';
                button.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    button.style.transform = '';
                }, 2000);
            }
        }


        function switchToWinner(conferenceId) {
            if (confirm('This will switch the puzzle display to the winner wheel. Continue?')) {
                // Use public proxy endpoint
                fetch('/api/admin/' + conferenceId + '/switch-to-winner', {
                    method: 'POST'
                }).then(response => {
                    if (response.ok) {
                        alert('Puzzle display switched to winner wheel!');
                        loadConferences(); // Refresh conference list to update display status
                    } else {
                        alert('Failed to switch display mode. Please try again.');
                    }
                }).catch(error => {
                    console.error('Error switching to winner:', error);
                    alert('Error switching display mode. Please try again.');
                });
            }
        }

        function switchToPuzzle(conferenceId) {
            if (confirm('This will switch back to the puzzle display. Continue?')) {
                // Use public proxy endpoint
                fetch('/api/admin/' + conferenceId + '/switch-to-puzzle', {
                    method: 'POST'
                }).then(response => {
                    if (response.ok) {
                        alert('Display switched back to puzzle!');
                        loadConferences(); // Refresh conference list to update display status
                    } else {
                        alert('Failed to switch display mode. Please try again.');
                    }
                }).catch(error => {
                    console.error('Error switching to puzzle:', error);
                    alert('Error switching display mode. Please try again.');
                });
            }
        }

        function toggleHistorySection() {
            const content = document.getElementById('historyContent');
            const icon = document.querySelector('.collapse-icon');
            
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.remove('collapsed');
            } else {
                content.classList.add('collapsed');
                content.style.maxHeight = '0';
                icon.classList.add('collapsed');
            }
        }

        // Set placeholder with current year
        document.addEventListener('DOMContentLoaded', function() {
            const input = document.getElementById('newConferenceName');
            const template = input.getAttribute('data-placeholder-template');
            if (template) {
                const currentYear = new Date().getFullYear();
                input.placeholder = template.replace('{year}', currentYear);
            }
            
            // Load conferences on page load
            loadConferences();
        });
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function handleSubmitForm(url, env) {
  const conferenceId = url.searchParams.get('conference') || 'default';

  const confResp = await getConferenceStub(env, conferenceId).fetch('https://do/get');
  if (!confResp.ok) {
    return new Response('Conference not found', { status: 404 });
  }

  const conferenceData = await confResp.json();
  if (!conferenceData.active) {
    return new Response('Contest has ended', { status: 400 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conferenceData.name} - Submit Answer</title>
    <link rel="icon" type="image/x-icon" href="https://r2.lusostreams.com/puzzleicon.ico">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .submit-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }

        .header {
            margin-bottom: 30px;
        }

        .header h1 {
            color: #2d3436;
            font-size: 2.2em;
            margin-bottom: 10px;
        }

        .header p {
            color: #636e72;
            font-size: 1.1em;
        }

        .form-group {
            margin: 20px 0;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #2d3436;
        }

        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 1.1em;
            transition: border-color 0.3s;
        }

        input:focus {
            outline: none;
            border-color: #ff6b35;
        }

        .answer-inputs {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .answer-input {
            width: 80px;
            height: 80px;
            text-align: center;
            font-size: 2em;
            font-weight: bold;
            border: 3px solid #ff6b35;
        }

        .submit-btn {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 25px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            margin-top: 20px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
        }

        .success-message {
            background: #00b894;
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            display: none;
        }

        .error-message {
            background: #e17055;
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="submit-container">
        <div class="header">
            <h1>🎯 Submit Your Answer</h1>
            <p>Enter your solution to the puzzle and your details to enter the raffle!</p>
        </div>

        <form id="submitForm">
            <div class="form-group">
                <label>Your Answer (3 digits):</label>
                <div class="answer-inputs">
                    <input type="number" class="answer-input" min="0" max="9" maxlength="1" id="digit1" required>
                    <input type="number" class="answer-input" min="0" max="9" maxlength="1" id="digit2" required>
                    <input type="number" class="answer-input" min="0" max="9" maxlength="1" id="digit3" required>
                </div>
            </div>

            <div class="form-group">
                <label for="name">Your Name:</label>
                <input type="text" id="name" required placeholder="Enter your full name">
            </div>

            <div class="form-group">
                <label for="email">Your Email:</label>
                <input type="email" id="email" required placeholder="Enter your email address">
            </div>

            <div class="form-group" style="display: flex; justify-content: center;">
                <div class="cf-turnstile" data-sitekey="${env.TURNSTILE_SITE_KEY || ''}" data-callback="onTurnstileSuccess"></div>
            </div>

            <button type="submit" class="submit-btn" id="submitBtn" disabled>🚀 Submit Answer</button>
        </form>

        <div id="successMessage" class="success-message">
            <h3>✅ Submission Successful!</h3>
            <p>Your answer has been recorded. Good luck in the raffle!</p>
        </div>

        <div id="errorMessage" class="error-message">
            <h3>❌ Submission Failed</h3>
            <p id="errorText">Please try again.</p>
        </div>
    </div>

    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <script>
        let turnstileToken = null;

        // Turnstile callback function
        function onTurnstileSuccess(token) {
            turnstileToken = token;
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').style.opacity = '1';
        }

        // Initially disable submit button
        document.getElementById('submitBtn').style.opacity = '0.5';

        document.querySelectorAll('.answer-input').forEach((input, index) => {
            input.addEventListener('input', function() {
                if (this.value.length === 1 && index < 2) {
                    document.querySelectorAll('.answer-input')[index + 1].focus();
                }
            });
        });

        document.getElementById('submitForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const digit1 = document.getElementById('digit1').value;
            const digit2 = document.getElementById('digit2').value;
            const digit3 = document.getElementById('digit3').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;

            if (!digit1 || !digit2 || !digit3 || !name || !email) {
                showError('Please fill in all fields');
                return;
            }

            if (!turnstileToken) {
                showError('Please complete the security verification');
                return;
            }

            const answer = [parseInt(digit1), parseInt(digit2), parseInt(digit3)];

            try {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        conference: '${conferenceId}',
                        name: name,
                        email: email,
                        answer: answer,
                        turnstileToken: turnstileToken
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showSuccess(result.correct ? 'Correct answer!' : 'Answer submitted!');
                } else {
                    showError(result.error || 'Submission failed');
                }
            } catch (error) {
                console.error('Submission error:', error);
                showError('Network error. Please try again.');
            }
        });

        function showSuccess(message) {
            document.getElementById('successMessage').querySelector('p').textContent = message;
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('submitForm').style.display = 'none';
        }

        function showError(message) {
            document.getElementById('errorText').textContent = message;
            document.getElementById('errorMessage').style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
        }
    </script>
</body>
</html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleWinnerWheel(url, env) {
  const conferenceId = url.searchParams.get('conference') || 'default';

  const confResp = await getConferenceStub(env, conferenceId).fetch('https://do/get');
  if (!confResp.ok) {
    return new Response('Conference not found', { status: 404 });
  }

  const conference = await confResp.json();

  const subsResp = await getConferenceStub(env, conferenceId).fetch('https://do/submissions');
  const allSubs = subsResp.ok ? await subsResp.json() : [];
  const correctSubmissions = allSubs.filter(s => s.correct);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conference.name} - Winner Selection</title>
    <link rel="icon" type="image/x-icon" href="https://r2.lusostreams.com/puzzleicon.ico">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #2d3436, #636e72);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .wheel-container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            text-align: center;
            max-width: 1200px;
        }

        .header {
            margin-bottom: 30px;
        }

        .header h1 {
            color: #2d3436;
            font-size: clamp(2.5rem, 5vw, 4rem);
            margin-bottom: 10px;
        }

        .header p {
            font-size: clamp(1.2rem, 3vw, 2rem);
            color: #636e72;
        }

        .wheel {
            width: min(60vw, 50vh);
            height: min(60vw, 50vh);
            border-radius: 50%;
            position: relative;
            margin: 30px auto;
            border: 8px solid #2d3436;
            transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
            transform-origin: center center;
            overflow: hidden;
            background: #f0f0f0;
        }

        .wheel svg {
            width: 100%;
            height: 100%;
        }

        .wheel-text {
            font-family: Arial, sans-serif;
            font-weight: bold;
            fill: white;
            text-anchor: middle;
            dominant-baseline: middle;
        }

        .wheel-pointer {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 40px solid #ff6b35;
            z-index: 10;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .spin-btn {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            border: none;
            padding: clamp(15px, 3vh, 25px) clamp(30px, 6vw, 50px);
            border-radius: 25px;
            font-size: clamp(1.2rem, 4vw, 2rem);
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            margin: clamp(15px, 3vh, 30px);
        }

        .spin-btn:hover {
            transform: translateY(-2px);
        }

        .spin-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .participants {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }

        .participants h3 {
            color: #2d3436;
            margin-bottom: 15px;
            font-size: clamp(1.5rem, 4vw, 2.5rem);
        }

        .participant-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
        }

        .participant {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #ff6b35;
        }

        .winner-display {
            background: linear-gradient(135deg, #00b894, #00cec9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            font-size: 2em;
            font-weight: bold;
            display: none;
        }

        .end-contest-btn {
            background: linear-gradient(135deg, #e17055, #d63031);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            margin: 20px;
            display: none;
        }

        .end-contest-btn:hover {
            transform: translateY(-2px);
        }

        .back-to-puzzle-btn {
            background: transparent;
            color: #74b9ff;
            border: 1px solid #74b9ff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
            opacity: 0.7;
        }

        .back-to-puzzle-btn:hover {
            background: #74b9ff;
            color: white;
            opacity: 1;
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="wheel-container">
        <div class="header">
            <h1>🎉 Winner Selection</h1>
            <p>${conference.name}</p>
        </div>

        ${correctSubmissions.length > 0 ? `
            <div style="position: relative;">
                <div class="wheel-pointer"></div>
                <div class="wheel" id="wheel">
                    <!-- Wheel segments will be generated by JavaScript -->
                </div>
            </div>

            <button class="spin-btn" id="spinBtn" onclick="spinWheel()">🎲 SPIN THE WHEEL!</button>

            <div class="winner-display" id="winnerDisplay">
                <div id="winnerText"></div>
            </div>

            <button class="end-contest-btn" id="endContestBtn" onclick="endContest()">🏆 END CONTEST & SAVE WINNER</button>
        ` : `
            <div style="background: #e17055; color: white; padding: 30px; border-radius: 15px; margin: 30px 0;">
                <h3>No Correct Submissions Yet</h3>
                <p>Wait for attendees to solve the puzzle correctly before selecting a winner.</p>
            </div>
        `}

        <div class="participants">
            <h3>Correct Submissions (${correctSubmissions.length})</h3>
            <div class="participant-list">
                ${correctSubmissions.map(sub => 
                    '<div class="participant"><strong>' + sub.name + '</strong><br><small>' + sub.email + '</small></div>'
                ).join('')}
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <button class="back-to-puzzle-btn" onclick="backToPuzzle()">← Back to Puzzle Screen</button>
        </div>
    </div>

    <script>
        const participants = ${JSON.stringify(correctSubmissions)};
        let isSpinning = false;

        function createWheel() {
            if (participants.length === 0) return;

            const wheel = document.getElementById('wheel');
            const colors = ['#ff6b35', '#f7931e', '#00b894', '#00cec9', '#6c5ce7', '#a29bfe', '#e17055', '#fd79a8', '#74b9ff', '#55a3ff'];
            const segmentAngle = 360 / participants.length;
            const radius = 150;
            const centerX = 150;
            const centerY = 150;

            let svgHTML = '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">';

            participants.forEach((participant, index) => {
                const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
                const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;
                
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                
                const pathData = [
                    'M', centerX, centerY,
                    'L', x1, y1,
                    'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
                    'Z'
                ].join(' ');
                
                const color = colors[index % colors.length];
                svgHTML += '<path d="' + pathData + '" fill="' + color + '" stroke="#fff" stroke-width="1"/>';
                
                // Add text with dynamic sizing
                const textAngle = (startAngle + endAngle) / 2;
                const textRadius = radius * 0.7;
                const textX = centerX + textRadius * Math.cos(textAngle);
                const textY = centerY + textRadius * Math.sin(textAngle);
                
                // Calculate appropriate font size based on slice size
                // For many participants, use smaller text; for few participants, use larger text
                let fontSize;
                if (participants.length > 100) {
                    fontSize = Math.max(6, 120 / participants.length);
                } else if (participants.length > 50) {
                    fontSize = Math.max(8, 150 / participants.length);
                } else if (participants.length > 20) {
                    fontSize = Math.max(10, 200 / participants.length);
                } else {
                    fontSize = Math.max(12, 240 / participants.length);
                }
                
                // Always show full first and last name, but adjust length based on space
                let displayName;
                if (participants.length > 80) {
                    // For very crowded wheels, show abbreviated full name
                    const nameParts = participant.name.split(' ');
                    if (nameParts.length >= 2) {
                        displayName = nameParts[0] + ' ' + nameParts[nameParts.length - 1];
                    } else {
                        displayName = participant.name;
                    }
                    // Truncate if still too long
                    if (displayName.length > 12) {
                        displayName = displayName.substring(0, 10) + '…';
                    }
                } else if (participants.length > 40) {
                    // For crowded wheels, show full name with moderate truncation
                    displayName = participant.name.length > 15 ? 
                        participant.name.substring(0, 13) + '…' : 
                        participant.name;
                } else {
                    // For less crowded wheels, show full name with generous truncation
                    displayName = participant.name.length > 20 ? 
                        participant.name.substring(0, 18) + '…' : 
                        participant.name;
                }
                
                const textRotation = (textAngle * 180 / Math.PI);
                const finalRotation = textRotation > 90 && textRotation < 270 ? textRotation + 180 : textRotation;
                
                svgHTML += '<text x="' + textX + '" y="' + textY + '" class="wheel-text" font-size="' + fontSize + '" transform="rotate(' + finalRotation + ' ' + textX + ' ' + textY + ')">' + displayName + '</text>';
            });

            svgHTML += '</svg>';
            wheel.innerHTML = svgHTML;
        }

        let selectedWinner = null;

        function spinWheel() {
            if (isSpinning || participants.length === 0) return;

            isSpinning = true;
            document.getElementById('spinBtn').disabled = true;
            document.getElementById('spinBtn').textContent = '🎲 SPINNING...';
            document.getElementById('winnerDisplay').style.display = 'none';
            document.getElementById('endContestBtn').style.display = 'none';

            const wheel = document.getElementById('wheel');

            wheel.style.transition = 'none';
            wheel.style.transform = 'rotate(0deg)';
            wheel.offsetHeight;

            wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';

            const baseSpins = 8 + Math.random() * 4;
            const randomAngle = Math.random() * 360;
            const finalRotation = (baseSpins * 360) + randomAngle;

            wheel.style.transform = 'rotate(' + finalRotation + 'deg)';

            setTimeout(() => {
                const segmentAngle = 360 / participants.length;
                const normalizedRotation = finalRotation % 360;
                const segmentAt12OClock = Math.floor((360 - normalizedRotation) / segmentAngle);
                const winnerIndex = segmentAt12OClock % participants.length;

                const winner = participants[winnerIndex];
                selectedWinner = winner;

                const colors = ['#ff6b35', '#f7931e', '#00b894', '#00cec9', '#6c5ce7', '#a29bfe', '#e17055', '#fd79a8', '#74b9ff', '#55a3ff'];
                const winnerColor = colors[winnerIndex % colors.length];

                document.getElementById('winnerText').innerHTML = 
                    '🏆 WINNER: ' + winner.name + '<br><small>' + winner.email + '</small>';
                const winnerDisplay = document.getElementById('winnerDisplay');
                winnerDisplay.style.background = winnerColor;
                winnerDisplay.style.display = 'block';
                document.getElementById('endContestBtn').style.display = 'inline-block';

                isSpinning = false;
                document.getElementById('spinBtn').disabled = false;
                document.getElementById('spinBtn').textContent = '🎲 SPIN AGAIN!';
            }, 3000);
        }

        async function endContest() {
            if (!selectedWinner) {
                alert('Please spin the wheel first to select a winner!');
                return;
            }

            if (!confirm('Are you sure you want to end this contest and save ' + selectedWinner.name + ' as the winner?')) {
                return;
            }

            try {
                const response = await fetch('/api/end-contest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        conferenceId: '${conferenceId}',
                        winner: selectedWinner
                    })
                });

                if (response.ok) {
                    alert('Contest ended successfully! ' + selectedWinner.name + ' has been saved as the winner.');
                    document.getElementById('spinBtn').style.display = 'none';
                    document.getElementById('endContestBtn').style.display = 'none';

                    const winnerDisplay = document.getElementById('winnerDisplay');
                    if (winnerDisplay) {
                        winnerDisplay.innerHTML = '<h2>🎉 Contest Ended! 🎉</h2><p>Winner: <strong>' + selectedWinner.name + '</strong></p><p>Thank you all for participating!</p>';
                    }
                } else {
                    alert('Error ending contest. Please try again.');
                }
            } catch (error) {
                alert('Error ending contest. Please try again.');
            }
        }

        if (participants.length > 0) {
            createWheel();
        }

        async function backToPuzzle() {
            if (confirm('Switch back to puzzle display?')) {
                try {
                    const response = await fetch('/api/admin/${conferenceId}/switch-to-puzzle', {
                        method: 'POST'
                    });

                    if (response.ok) {
                        window.location.href = '/puzzle?conference=${conferenceId}';
                    } else {
                        alert('Failed to switch display mode. Please try again.');
                    }
                } catch (error) {
                    console.error('Error switching to puzzle:', error);
                    alert('Error switching display mode. Please try again.');
                }
            }
        }
    </script>
</body>
</html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleFinishContest(request, env) {
  return new Response('Deprecated', { status: 410 });
}

async function handleEndContest(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { conferenceId, winner } = await request.json();
    const resp = await getConferenceStub(env, conferenceId).fetch('https://do/end-contest', { method: 'POST', body: JSON.stringify({ winner }) });
    if (!resp.ok) return new Response(await resp.text(), { status: resp.status });
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error ending contest:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function handlePopulateTestData(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { conferenceId, region, count, correctPercentage } = await request.json();
    
    // Default parameters
    const submissionCount = count || 130;
    const correctRate = correctPercentage || 88;
    
    // Name sets for different regions
    const namesByRegion = {
      portuguese: [
        'João Silva', 'Maria Santos', 'António Ferreira', 'Ana Costa', 'Carlos Oliveira',
        'Catarina Rodrigues', 'Pedro Almeida', 'Sofia Pereira', 'Miguel Carvalho', 'Inês Martins',
        'Ricardo Sousa', 'Beatriz Fernandes', 'Nuno Gonçalves', 'Mariana Ribeiro', 'Tiago Lopes',
        'Leonor Pinto', 'Bruno Correia', 'Rita Moreira', 'Diogo Teixeira', 'Francisca Dias'
      ],
      dutch: [
        'Jan de Jong', 'Emma van der Berg', 'Daan Bakker', 'Sophie Janssen', 'Lucas Visser',
        'Lotte de Vries', 'Milan Smit', 'Fleur Mulder', 'Sem de Boer', 'Noa Bos',
        'Finn van Leeuwen', 'Zoë Vos', 'Levi Hendriks', 'Isa van den Berg', 'Noah Peters',
        'Mila Dekker', 'Bram Willems', 'Eva van der Meer', 'Lars Verhoeven', 'Sara de Wit'
      ],
      english: [
        'James Smith', 'Emily Johnson', 'Michael Williams', 'Sarah Brown', 'David Jones',
        'Emma Davis', 'Daniel Miller', 'Olivia Wilson', 'Matthew Moore', 'Sophie Taylor',
        'Joshua Anderson', 'Charlotte Thomas', 'Andrew Jackson', 'Amelia White', 'Christopher Harris',
        'Isabella Martin', 'Ryan Thompson', 'Grace Garcia', 'Benjamin Martinez', 'Lily Robinson'
      ],
      spanish: [
        'Alejandro García', 'María Rodríguez', 'David López', 'Carmen Martínez', 'José González',
        'Ana Sánchez', 'Manuel Pérez', 'Laura Gómez', 'Francisco Martín', 'Elena Jiménez',
        'Antonio Ruiz', 'Pilar Hernández', 'Carlos Díaz', 'Isabel Moreno', 'Miguel Muñoz',
        'Cristina Álvarez', 'Rafael Romero', 'Beatriz Gutiérrez', 'Fernando Navarro', 'Silvia Torres'
      ],
      turkish: [
        'Mehmet Yılmaz', 'Ayşe Kaya', 'Mustafa Demir', 'Fatma Şahin', 'Ahmet Çelik',
        'Emine Yıldız', 'Ali Aydın', 'Hatice Özkan', 'Hüseyin Arslan', 'Zeynep Doğan',
        'İbrahim Kılıç', 'Meryem Aslan', 'Ömer Polat', 'Elif Koç', 'Yusuf Şen',
        'Büşra Çakır', 'Osman Öztürk', 'Seda Erdoğan', 'Emre Güneş', 'Gamze Yavuz'
      ],
      polish: [
        'Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski', 'Maria Wójcik', 'Krzysztof Kowalczyk',
        'Katarzyna Kamińska', 'Andrzej Lewandowski', 'Barbara Zielińska', 'Tomasz Szymański', 'Agnieszka Woźniak',
        'Marcin Dąbrowski', 'Magdalena Kozłowska', 'Paweł Jankowski', 'Monika Mazur', 'Michał Krawczyk',
        'Joanna Piotrowski', 'Robert Grabowski', 'Ewa Nowakowska', 'Rafał Pawłowski', 'Aleksandra Michalska'
      ],
      american: [
        'John Smith', 'Jennifer Johnson', 'Michael Brown', 'Jessica Davis', 'Robert Miller',
        'Ashley Wilson', 'William Moore', 'Amanda Taylor', 'David Anderson', 'Stephanie Thomas',
        'Christopher Jackson', 'Melissa White', 'Matthew Harris', 'Sarah Martin', 'Joshua Thompson',
        'Nicole Garcia', 'Daniel Martinez', 'Elizabeth Robinson', 'Anthony Clark', 'Heather Rodriguez'
      ]
    };
    
    // Determine which names to use
    const selectedNames = namesByRegion[region] || namesByRegion.portuguese;

    // Get conference to know the correct answer
    const confResp = await getConferenceStub(env, conferenceId).fetch('https://do/get');
    if (!confResp.ok) {
      return new Response('Conference not found', { status: 404 });
    }
    const conference = await confResp.json();
    const correctAnswer = conference.puzzle.solution;

    // Calculate submission counts
    const correctCount = Math.floor(submissionCount * (correctRate / 100));
    const incorrectCount = submissionCount - correctCount;

    let actualSubmissionCount = 0;

    // Add correct submissions
    for (let i = 0; i < correctCount; i++) {
      const name = selectedNames[i % selectedNames.length];
      // Generate appropriate email domain based on region
      let emailDomain;
      switch(region) {
        case 'dutch': emailDomain = 'example.nl'; break;
        case 'english': emailDomain = 'example.co.uk'; break;
        case 'spanish': emailDomain = 'ejemplo.es'; break;
        case 'turkish': emailDomain = 'ornek.tr'; break;
        case 'polish': emailDomain = 'przyklad.pl'; break;
        case 'american': emailDomain = 'example.com'; break;
        default: emailDomain = 'exemplo.pt';
      }
      
      const email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[áàâãäå]/g, 'a').replace(/[éêëè]/g, 'e').replace(/[íîïì]/g, 'i').replace(/[óôõöò]/g, 'o').replace(/[úûüù]/g, 'u').replace(/[ç]/g, 'c').replace(/[ñ]/g, 'n').replace(/[ş]/g, 's').replace(/[ğ]/g, 'g').replace(/[ı]/g, 'i').replace(/[ł]/g, 'l').replace(/[ą]/g, 'a').replace(/[ę]/g, 'e').replace(/[ć]/g, 'c').replace(/[ń]/g, 'n').replace(/[ś]/g, 's').replace(/[ź]/g, 'z').replace(/[ż]/g, 'z')}${i > selectedNames.length ? i : ''}@${emailDomain}`;
      
      const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submit', { 
        method: 'POST', 
        body: JSON.stringify({ 
          name, 
          email, 
          answer: correctAnswer 
        }) 
      });
      
      if (resp.ok) actualSubmissionCount++;
    }

    // Add incorrect submissions
    for (let i = 0; i < incorrectCount; i++) {
      const name = selectedNames[(correctCount + i) % selectedNames.length];
      
      // Generate appropriate email domain
      let emailDomain;
      switch(region) {
        case 'dutch': emailDomain = 'example.nl'; break;
        case 'english': emailDomain = 'example.co.uk'; break;
        case 'spanish': emailDomain = 'ejemplo.es'; break;
        case 'turkish': emailDomain = 'ornek.tr'; break;
        case 'polish': emailDomain = 'przyklad.pl'; break;
        case 'american': emailDomain = 'example.com'; break;
        default: emailDomain = 'exemplo.pt';
      }
      
      const email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[áàâãäå]/g, 'a').replace(/[éêëè]/g, 'e').replace(/[íîïì]/g, 'i').replace(/[óôõöò]/g, 'o').replace(/[úûüù]/g, 'u').replace(/[ç]/g, 'c').replace(/[ñ]/g, 'n').replace(/[ş]/g, 's').replace(/[ğ]/g, 'g').replace(/[ı]/g, 'i').replace(/[ł]/g, 'l').replace(/[ą]/g, 'a').replace(/[ę]/g, 'e').replace(/[ć]/g, 'c').replace(/[ń]/g, 'n').replace(/[ś]/g, 's').replace(/[ź]/g, 'z').replace(/[ż]/g, 'z')}${correctCount + i > selectedNames.length ? correctCount + i : ''}@${emailDomain}`;
      
      // Generate random incorrect answer
      const incorrectAnswer = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
      ];
      
      // Ensure it's actually incorrect
      if (JSON.stringify(incorrectAnswer) === JSON.stringify(correctAnswer)) {
        incorrectAnswer[0] = (incorrectAnswer[0] + 1) % 10;
      }
      
      const resp = await getConferenceStub(env, conferenceId).fetch('https://do/submit', { 
        method: 'POST', 
        body: JSON.stringify({ 
          name, 
          email, 
          answer: incorrectAnswer 
        }) 
      });
      
      if (resp.ok) actualSubmissionCount++;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Added ${actualSubmissionCount} submissions to conference ${conferenceId}`,
      correctSubmissions: correctCount,
      incorrectSubmissions: incorrectCount,
      region: region || 'portuguese'
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error populating test data:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
