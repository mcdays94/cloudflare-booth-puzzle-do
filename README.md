# Cloudflare Booth Puzzle (Durable Objects Edition)

This is a migration of the original Workers KV-based project to use Cloudflare Durable Objects for state management. The UI, routes, and API remain the same for compatibility.

## What Changed
- **KV -> Durable Objects**: Replaced `PUZZLE_KV` with two Durable Objects:
  - **`RegistryDO`**: Tracks the list of conference IDs and names.
  - **`ConferenceDO`**: One instance per conference (using `idFromName(conferenceId)`), storing:
    - `conference` object (id, name, puzzle, active, created, winner/ended/reopened)
    - `submission:*` entries
    - `display-mode` state (puzzle/winner/ended)
- **Routes unchanged**: All `/api/*` and pages (`/puzzle`, `/submit`, `/winner`, `/admin`) behave as before, now delegating to DOs.

## Files
- `src/worker.js`: Worker entry with DO classes, route handlers, and HTML rendering.
- `wrangler.toml`: Durable Objects bindings and migration tag.
- `package.json`: Dev/deploy scripts.

## Setup
1. Install Wrangler and login
   ```bash
   npm i -g wrangler
   wrangler login
   ```
2. Configure secrets (sensitive data)
   ```bash
   # Turnstile keys for CAPTCHA verification
   wrangler secret put TURNSTILE_SITE_KEY
   wrangler secret put TURNSTILE_SECRET_KEY
   
   # Cloudflare Access service token for admin S2S calls
   wrangler secret put CF_ACCESS_CLIENT_ID
   wrangler secret put CF_ACCESS_CLIENT_SECRET
   ```
3. Set up custom domain
   - Configure DNS for `puzzledo.lusostreams.com` to point to your Cloudflare zone
   - The route is configured in `wrangler.toml`
4. Dev
   ```bash
   npm run dev
   ```
5. Deploy
   ```bash
   npm run deploy
   ```

## Data Model (Durable Objects)
- `RegistryDO` keys
  - `conf:<id>` -> `name`
- `ConferenceDO` keys
  - `conference` -> conference object
  - `submission:<uuid>` -> submission object
  - `display-mode` -> string (puzzle | winner | ended)

## Migration Notes
- Creating a new conference now:
  - Instantiates/initializes its `ConferenceDO` via `/create`
  - Adds to `RegistryDO`
- Reshuffle clears submissions within the same DO.
- Submission count and listing are per-DO list operations.

## Compatibility
- Public/admin APIs preserved, so the original admin UI should work.
- Uses `puzzledo.lusostreams.com` to avoid conflicts with your existing `puzzle.lusostreams.com` deployment.
- Environment variables moved to secrets for better security.

## Security
- Turnstile verification is preserved.
- Admin endpoints that used Access headers continue to work as before.

---

Original project: https://github.com/mcdays94/cloudflare-booth-puzzle
