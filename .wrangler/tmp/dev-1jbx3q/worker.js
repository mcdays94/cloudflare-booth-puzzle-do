var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  static {
    __name(this, "ReadStream");
  }
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};

// ../../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  static {
    __name(this, "WriteStream");
  }
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};

// ../../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/worker.js
var RegistryDO = class {
  static {
    __name(this, "RegistryDO");
  }
  constructor(state, env2) {
    this.state = state;
    this.env = env2;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    if (url.pathname === "/list" && method === "GET") {
      const list = await this.state.storage.list({ prefix: "conf:" });
      const ids = [];
      for (const [key, name] of list) {
        const id = key.replace(/^conf:/, "");
        ids.push({ id, name });
      }
      return new Response(JSON.stringify(ids), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/exists" && method === "GET") {
      const id = url.searchParams.get("id");
      const exists = !!await this.state.storage.get("conf:" + id);
      return new Response(JSON.stringify({ exists }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/add" && method === "POST") {
      const { id, name } = await request.json();
      const exists = await this.state.storage.get("conf:" + id);
      if (exists) return new Response("Conflict", { status: 409 });
      await this.state.storage.put("conf:" + id, name || id);
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/remove" && method === "POST") {
      const { id } = await request.json();
      await this.state.storage.delete("conf:" + id);
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Not Found", { status: 404 });
  }
};
var ConferenceDO = class {
  static {
    __name(this, "ConferenceDO");
  }
  constructor(state, env2) {
    this.state = state;
    this.env = env2;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    if (url.pathname === "/get" && method === "GET") {
      const conference = await this.state.storage.get("conference");
      if (!conference) return new Response("Not Found", { status: 404 });
      return new Response(JSON.stringify(conference), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/create" && method === "POST") {
      const { id, name, puzzle, created } = await request.json();
      const existing = await this.state.storage.get("conference");
      if (existing) return new Response("Conflict", { status: 409 });
      const conference = { id, name, puzzle, active: true, created };
      await this.state.storage.put("conference", conference);
      await this.state.storage.delete("display-mode");
      const subs = await this.state.storage.list({ prefix: "submission:" });
      for (const [k] of subs) await this.state.storage.delete(k);
      return new Response(JSON.stringify(conference), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/reshuffle" && method === "POST") {
      const conf = await this.state.storage.get("conference");
      if (!conf) return new Response("Not Found", { status: 404 });
      const { puzzle } = await request.json();
      conf.puzzle = puzzle;
      await this.state.storage.put("conference", conf);
      const subs = await this.state.storage.list({ prefix: "submission:" });
      for (const [k] of subs) await this.state.storage.delete(k);
      return new Response(JSON.stringify(conf), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/finish" && method === "POST") {
      const conf = await this.state.storage.get("conference");
      if (!conf) return new Response("Not Found", { status: 404 });
      conf.active = false;
      await this.state.storage.put("conference", conf);
      return new Response(JSON.stringify(conf), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/reopen" && method === "POST") {
      const conf = await this.state.storage.get("conference");
      if (!conf) return new Response("Not Found", { status: 404 });
      conf.active = true;
      conf.winner = null;
      delete conf.ended;
      conf.reopened = (/* @__PURE__ */ new Date()).toISOString();
      await this.state.storage.put("conference", conf);
      await this.state.storage.delete("display-mode");
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/submit" && method === "POST") {
      const { name, email, answer } = await request.json();
      const conf = await this.state.storage.get("conference");
      if (!conf) return new Response("Conference not found", { status: 404 });
      if (!conf.active) return new Response("Contest has ended", { status: 400 });
      const isCorrect = JSON.stringify(answer) === JSON.stringify(conf.puzzle.solution);
      const submission = {
        id: crypto.randomUUID(),
        conferenceId: conf.id,
        answer,
        name,
        email,
        correct: isCorrect,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.state.storage.put("submission:" + submission.id, submission);
      return new Response(JSON.stringify({ success: true, correct: isCorrect }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/submission-count" && method === "GET") {
      const subs = await this.state.storage.list({ prefix: "submission:" });
      let count3 = 0, correctCount = 0;
      for (const [, v] of subs) {
        count3++;
        if (v && v.correct) correctCount++;
      }
      return new Response(JSON.stringify({ count: count3, correctCount }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/submissions" && method === "GET") {
      const subs = await this.state.storage.list({ prefix: "submission:" });
      const submissions = [];
      for (const [, v] of subs) submissions.push(v);
      submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return new Response(JSON.stringify(submissions), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/set-mode" && method === "POST") {
      const { mode } = await request.json();
      if (mode) await this.state.storage.put("display-mode", mode);
      else await this.state.storage.delete("display-mode");
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/get-mode" && method === "GET") {
      const mode = await this.state.storage.get("display-mode");
      return new Response(JSON.stringify({ mode: mode || "puzzle" }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/end-contest" && method === "POST") {
      const { winner } = await request.json();
      const conf = await this.state.storage.get("conference");
      if (!conf) return new Response("Conference not found", { status: 404 });
      conf.winner = winner;
      conf.active = false;
      conf.ended = (/* @__PURE__ */ new Date()).toISOString();
      await this.state.storage.put("conference", conf);
      await this.state.storage.put("display-mode", "ended");
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Not Found", { status: 404 });
  }
};
function getRegistryStub(env2) {
  const id = env2.REGISTRY.idFromName("registry");
  return env2.REGISTRY.get(id);
}
__name(getRegistryStub, "getRegistryStub");
function getConferenceStub(env2, conferenceId) {
  const id = env2.CONFERENCE_DO.idFromName(conferenceId);
  return env2.CONFERENCE_DO.get(id);
}
__name(getConferenceStub, "getConferenceStub");
var worker_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path === "/" || path === "/puzzle") {
        const conferenceId = url.searchParams.get("conference");
        if (conferenceId) {
          const modeResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get-mode");
          const { mode: displayMode } = modeResp.ok ? await modeResp.json() : { mode: "puzzle" };
          if (displayMode === "winner") {
            return handleWinnerWheel(url, env2);
          }
        }
        return handlePuzzleDisplay(url, env2);
      } else if (path === "/admin") {
        return handleAdminUI(env2);
      } else if (path === "/winner") {
        return handleWinnerWheel(url, env2);
      } else if (path === "/submit") {
        return handleSubmitForm(url, env2);
      } else if (url.pathname === "/api/submit") {
        return handleAPI(request, env2, corsHeaders);
      }
      if (url.pathname === "/api/finish-contest") {
        return handleFinishContest(request, env2);
      }
      if (url.pathname === "/api/end-contest") {
        return handleEndContest(request, env2);
      }
      if (path.startsWith("/api/")) {
        return handleAPI(request, env2, corsHeaders);
      } else {
        return new Response("Not Found", { status: 404 });
      }
    } catch (error3) {
      console.error("Worker error:", error3);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
function generatePuzzle() {
  const solution = [];
  while (solution.length < 3) {
    const digit = Math.floor(Math.random() * 10);
    if (!solution.includes(digit)) {
      solution.push(digit);
    }
  }
  const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !solution.includes(d));
  let clue1;
  do {
    clue1 = [];
    const solutionDigit = solution[Math.floor(Math.random() * 3)];
    let wrongPos;
    do {
      wrongPos = Math.floor(Math.random() * 3);
    } while (solution[wrongPos] === solutionDigit);
    clue1[wrongPos] = solutionDigit;
    for (let i = 0; i < 3; i++) {
      if (i !== wrongPos) {
        clue1[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue1.some((num, idx) => num === solution[idx]) || clue1.filter((num) => solution.includes(num)).length !== 1);
  let clue2;
  do {
    clue2 = [];
    const solutionDigit = solution[Math.floor(Math.random() * 3)];
    let wrongPos;
    do {
      wrongPos = Math.floor(Math.random() * 3);
    } while (solution[wrongPos] === solutionDigit);
    clue2[wrongPos] = solutionDigit;
    for (let i = 0; i < 3; i++) {
      if (i !== wrongPos) {
        clue2[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue2.some((num, idx) => num === solution[idx]) || clue2.filter((num) => solution.includes(num)).length !== 1 || JSON.stringify(clue2) === JSON.stringify(clue1));
  let clue3;
  do {
    clue3 = [];
    const positions = [0, 1, 2];
    const selectedPositions = [];
    for (let i = 0; i < 2; i++) {
      const posIndex = Math.floor(Math.random() * positions.length);
      selectedPositions.push(positions.splice(posIndex, 1)[0]);
    }
    selectedPositions.forEach((pos) => {
      clue3[pos] = solution[pos];
    });
    for (let i = 0; i < 3; i++) {
      if (clue3[i] === void 0) {
        clue3[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue3.filter((num, idx) => num === solution[idx]).length !== 2 || clue3.filter((num) => solution.includes(num)).length !== 2);
  let clue4;
  do {
    clue4 = [];
    const solutionDigits = [...solution];
    const usedPositions = [];
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
    for (let i = 0; i < 3; i++) {
      if (clue4[i] === void 0) {
        clue4[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      }
    }
  } while (clue4.some((num, idx) => num === solution[idx]) || clue4.filter((num) => solution.includes(num)).length !== 2);
  let clue5;
  do {
    clue5 = [];
    for (let i = 0; i < 3; i++) {
      clue5[i] = availableDigits[Math.floor(Math.random() * availableDigits.length)];
    }
  } while (clue5.some((num) => solution.includes(num)));
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
__name(generatePuzzle, "generatePuzzle");
async function handlePuzzleDisplay(url, env2) {
  const conferenceId = url.searchParams.get("conference") || "default";
  const modeResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get-mode");
  const { mode: displayMode } = modeResp.ok ? await modeResp.json() : { mode: "puzzle" };
  if (displayMode === "winner") {
    return handleWinnerWheel(url, env2);
  }
  let confResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get");
  let conference;
  if (!confResp.ok) {
    const defaultPuzzle = generatePuzzle();
    const newConf = {
      id: conferenceId,
      name: conferenceId === "default" ? "Default Conference" : conferenceId,
      puzzle: defaultPuzzle,
      created: (/* @__PURE__ */ new Date()).toISOString()
    };
    await getConferenceStub(env2, conferenceId).fetch("https://do/create", { method: "POST", body: JSON.stringify(newConf) });
    await getRegistryStub(env2).fetch("https://do/add", { method: "POST", body: JSON.stringify({ id: conferenceId, name: newConf.name }) });
    confResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get");
  }
  conference = confResp.ok ? await confResp.json() : null;
  if (!conference) {
    return new Response("Failed to create or retrieve conference", { status: 500 });
  }
  const clueRows = conference.puzzle.clues.map((clue) => {
    const numberBoxes = clue.numbers.map((num) => '<div class="number-box">' + num + "</div>").join("");
    return '<div class="clue-row"><div class="number-boxes">' + numberBoxes + '</div><div class="clue-text">' + clue.hint + "</div></div>";
  }).join("");
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
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url.origin + "/submit?conference=" + conferenceId)}" alt="QR Code" />
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
    <\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
__name(handlePuzzleDisplay, "handlePuzzleDisplay");
async function handleAPI(request, env2, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  if (path === "/api/conferences" && method === "GET") {
    const regResp = await getRegistryStub(env2).fetch("https://do/list");
    const entries = regResp.ok ? await regResp.json() : [];
    const conferences = [];
    for (const { id } of entries) {
      const resp = await getConferenceStub(env2, id).fetch("https://do/get");
      if (resp.ok) conferences.push(await resp.json());
    }
    return new Response(JSON.stringify(conferences), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path === "/api/conferences" && method === "POST") {
    try {
      const body = await request.json();
      const conferenceId = body.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/--+/g, "-");
      const existsResp = await getRegistryStub(env2).fetch("https://do/exists?id=" + conferenceId);
      const existsData = existsResp.ok ? await existsResp.json() : { exists: false };
      if (existsData.exists) {
        return new Response(JSON.stringify({
          error: "A conference with this name already exists. Please choose a different name."
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const puzzle = generatePuzzle();
      const conference = {
        id: conferenceId,
        name: body.name,
        puzzle,
        created: (/* @__PURE__ */ new Date()).toISOString()
      };
      await getConferenceStub(env2, conferenceId).fetch("https://do/create", { method: "POST", body: JSON.stringify(conference) });
      await getRegistryStub(env2).fetch("https://do/add", { method: "POST", body: JSON.stringify({ id: conferenceId, name: conference.name }) });
      return new Response(JSON.stringify(conference), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error3) {
      console.error("Error creating conference:", error3);
      return new Response("Error creating conference: " + error3.message, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/reshuffle$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/reshuffle$/)[1];
    const newPuzzle = generatePuzzle();
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/reshuffle", { method: "POST", body: JSON.stringify({ puzzle: newPuzzle }) });
    if (!resp.ok) return new Response("Conference not found", { status: 404, headers: corsHeaders });
    const conferenceData = await resp.json();
    return new Response(JSON.stringify(conferenceData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/finish$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/finish$/)[1];
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/finish", { method: "POST" });
    if (!resp.ok) return new Response("Conference not found", { status: 404, headers: corsHeaders });
    const conferenceData = await resp.json();
    return new Response(JSON.stringify(conferenceData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path === "/api/submit" && method === "POST") {
    const { conference, name, email, answer, turnstileToken } = await request.json();
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: "Turnstile token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${env2.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
    });
    const turnstileResult = await turnstileResponse.json();
    if (!turnstileResult.success) {
      return new Response(JSON.stringify({ error: "Turnstile verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const conferenceId = conference;
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submit", { method: "POST", body: JSON.stringify({ name, email, answer }) });
    if (!resp.ok) return new Response(await resp.text(), { status: resp.status, headers: corsHeaders });
    return new Response(await resp.text(), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-winner$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-winner$/)[1];
    await getConferenceStub(env2, conferenceId).fetch("https://do/set-mode", { method: "POST", body: JSON.stringify({ mode: "winner" }) });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-puzzle$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/switch-to-puzzle$/)[1];
    await getConferenceStub(env2, conferenceId).fetch("https://do/set-mode", { method: "POST", body: JSON.stringify({ mode: null }) });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/display-mode$/) && method === "GET") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/display-mode$/)[1];
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/get-mode");
    const data = resp.ok ? await resp.json() : { mode: "puzzle" };
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path.match(/^\/api\/display-mode\/([^\/]+)$/) && method === "GET") {
    const conferenceId = path.match(/^\/api\/display-mode\/([^\/]+)$/)[1];
    try {
      const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/get-mode");
      const data = resp.ok ? await resp.json() : { mode: "puzzle" };
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error3) {
      console.error("Error fetching display mode:", error3);
      return new Response(JSON.stringify({ mode: "puzzle" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  if (path.match(/^\/api\/admin\/([^\/]+)\/switch-to-winner$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/admin\/([^\/]+)\/switch-to-winner$/)[1];
    try {
      await getConferenceStub(env2, conferenceId).fetch("https://do/set-mode", { method: "POST", body: JSON.stringify({ mode: "winner" }) });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error3) {
      console.error("Error switching to winner:", error3);
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  if (path.match(/^\/api\/admin\/([^\/]+)\/switch-to-puzzle$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/admin\/([^\/]+)\/switch-to-puzzle$/)[1];
    try {
      await getConferenceStub(env2, conferenceId).fetch("https://do/set-mode", { method: "POST", body: JSON.stringify({ mode: null }) });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error3) {
      console.error("Error switching to puzzle:", error3);
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/submission-count$/) && method === "GET") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/submission-count$/)[1];
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submission-count");
    const data = resp.ok ? await resp.json() : { count: 0, correctCount: 0 };
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path.match(/^\/api\/conferences\/([^\/]+)\/reopen$/) && method === "POST") {
    const conferenceId = path.match(/^\/api\/conferences\/([^\/]+)\/reopen$/)[1];
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/reopen", { method: "POST" });
    if (!resp.ok) return new Response("Conference not found", { status: 404, headers: corsHeaders });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path === "/api/submissions" && method === "GET") {
    const conferenceId = url.searchParams.get("conference");
    if (!conferenceId) {
      return new Response("Conference ID required", { status: 400, headers: corsHeaders });
    }
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submissions");
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
  ${submissions.map(
      (sub) => `<tr class="${sub.correct ? "correct" : "incorrect"}">
      <td>${new Date(sub.timestamp).toLocaleString()}</td>
      <td>${sub.name}</td>
      <td>${sub.email}</td>
      <td>${Array.isArray(sub.answer) ? sub.answer.join("") : sub.answer}</td>
      <td>${sub.correct ? "\u2705" : "\u274C"}</td>
    </tr>`
    ).join("")}
</table>
</body></html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
  if (path === "/api/test-submit" && method === "POST") {
    const { conference, name, email, answer } = await request.json();
    const conferenceId = conference;
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submit", { method: "POST", body: JSON.stringify({ name, email, answer }) });
    if (!resp.ok) return new Response(await resp.text(), { status: resp.status, headers: corsHeaders });
    return new Response(await resp.text(), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (path === "/api/populate-test-data" && method === "POST") {
    return handlePopulateTestData(request, env2);
  }
  if (path === "/api/debug-submissions" && method === "GET") {
    const conferenceId = url.searchParams.get("conference");
    if (!conferenceId) {
      return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submissions");
    const submissions = resp.ok ? await resp.json() : [];
    return new Response(JSON.stringify(submissions, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response("API endpoint not found", { status: 404, headers: corsHeaders });
}
__name(handleAPI, "handleAPI");
async function handleAdminUI(env2) {
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
            <h1>\u{1F527} Cloudflare Booth Puzzle Admin - Durable Objects Version</h1>
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
                    <span class="collapse-icon collapsed">\u25BC</span>
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
        const SERVICE_TOKEN_ID = '${env2.CF_ACCESS_CLIENT_ID || ""}';
        const SERVICE_TOKEN_SECRET = '${env2.CF_ACCESS_CLIENT_SECRET || ""}';

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
                    '<strong>\u{1F3C6} Winner: ' + conf.winner.name + '</strong><br>' +
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
                '<p><strong>\u{1F4CA} Submissions:</strong> ' + submissionCount + ' total, ' + correctCount + ' correct (' + correctRatio + '%)</p>' +
                (displayMode ? '<p><strong>\u{1F5A5}\uFE0F Currently Displaying:</strong> ' + (displayMode === 'winner' ? '\u{1F389} Winner Wheel' : '\u{1F9E9} Puzzle Screen') + '</p>' : '<p><strong>\u{1F5A5}\uFE0F Currently Displaying:</strong> \u{1F9E9} Puzzle Screen</p>') +
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
                    '<button onclick="copyPuzzleUrl(&quot;' + conf.id + '&quot;)" class="btn-secondary">\u{1F4CB} Copy URL</button>' +
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
                button.innerHTML = '\u2705 Copied!';
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
                button.innerHTML = '\u2705 Copied!';
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
    <\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
__name(handleAdminUI, "handleAdminUI");
async function handleSubmitForm(url, env2) {
  const conferenceId = url.searchParams.get("conference") || "default";
  const confResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get");
  if (!confResp.ok) {
    return new Response("Conference not found", { status: 404 });
  }
  const conferenceData = await confResp.json();
  if (!conferenceData.active) {
    return new Response("Contest has ended", { status: 400 });
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
            <h1>\u{1F3AF} Submit Your Answer</h1>
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
                <div class="cf-turnstile" data-sitekey="${env2.TURNSTILE_SITE_KEY || ""}" data-callback="onTurnstileSuccess"></div>
            </div>

            <button type="submit" class="submit-btn" id="submitBtn" disabled>\u{1F680} Submit Answer</button>
        </form>

        <div id="successMessage" class="success-message">
            <h3>\u2705 Submission Successful!</h3>
            <p>Your answer has been recorded. Good luck in the raffle!</p>
        </div>

        <div id="errorMessage" class="error-message">
            <h3>\u274C Submission Failed</h3>
            <p id="errorText">Please try again.</p>
        </div>
    </div>

    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer><\/script>
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
    <\/script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
__name(handleSubmitForm, "handleSubmitForm");
async function handleWinnerWheel(url, env2) {
  const conferenceId = url.searchParams.get("conference") || "default";
  const confResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get");
  if (!confResp.ok) {
    return new Response("Conference not found", { status: 404 });
  }
  const conference = await confResp.json();
  const subsResp = await getConferenceStub(env2, conferenceId).fetch("https://do/submissions");
  const allSubs = subsResp.ok ? await subsResp.json() : [];
  const correctSubmissions = allSubs.filter((s) => s.correct);
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
            <h1>\u{1F389} Winner Selection</h1>
            <p>${conference.name}</p>
        </div>

        ${correctSubmissions.length > 0 ? `
            <div style="position: relative;">
                <div class="wheel-pointer"></div>
                <div class="wheel" id="wheel">
                    <!-- Wheel segments will be generated by JavaScript -->
                </div>
            </div>

            <button class="spin-btn" id="spinBtn" onclick="spinWheel()">\u{1F3B2} SPIN THE WHEEL!</button>

            <div class="winner-display" id="winnerDisplay">
                <div id="winnerText"></div>
            </div>

            <button class="end-contest-btn" id="endContestBtn" onclick="endContest()">\u{1F3C6} END CONTEST & SAVE WINNER</button>
        ` : `
            <div style="background: #e17055; color: white; padding: 30px; border-radius: 15px; margin: 30px 0;">
                <h3>No Correct Submissions Yet</h3>
                <p>Wait for attendees to solve the puzzle correctly before selecting a winner.</p>
            </div>
        `}

        <div class="participants">
            <h3>Correct Submissions (${correctSubmissions.length})</h3>
            <div class="participant-list">
                ${correctSubmissions.map(
    (sub) => '<div class="participant"><strong>' + sub.name + "</strong><br><small>" + sub.email + "</small></div>"
  ).join("")}
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <button class="back-to-puzzle-btn" onclick="backToPuzzle()">\u2190 Back to Puzzle Screen</button>
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
                        displayName = displayName.substring(0, 10) + '\u2026';
                    }
                } else if (participants.length > 40) {
                    // For crowded wheels, show full name with moderate truncation
                    displayName = participant.name.length > 15 ? 
                        participant.name.substring(0, 13) + '\u2026' : 
                        participant.name;
                } else {
                    // For less crowded wheels, show full name with generous truncation
                    displayName = participant.name.length > 20 ? 
                        participant.name.substring(0, 18) + '\u2026' : 
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
            document.getElementById('spinBtn').textContent = '\u{1F3B2} SPINNING...';
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
                    '\u{1F3C6} WINNER: ' + winner.name + '<br><small>' + winner.email + '</small>';
                const winnerDisplay = document.getElementById('winnerDisplay');
                winnerDisplay.style.background = winnerColor;
                winnerDisplay.style.display = 'block';
                document.getElementById('endContestBtn').style.display = 'inline-block';

                isSpinning = false;
                document.getElementById('spinBtn').disabled = false;
                document.getElementById('spinBtn').textContent = '\u{1F3B2} SPIN AGAIN!';
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
                        winnerDisplay.innerHTML = '<h2>\u{1F389} Contest Ended! \u{1F389}</h2><p>Winner: <strong>' + selectedWinner.name + '</strong></p><p>Thank you all for participating!</p>';
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
    <\/script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
__name(handleWinnerWheel, "handleWinnerWheel");
async function handleFinishContest(request, env2) {
  return new Response("Deprecated", { status: 410 });
}
__name(handleFinishContest, "handleFinishContest");
async function handleEndContest(request, env2) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const { conferenceId, winner } = await request.json();
    const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/end-contest", { method: "POST", body: JSON.stringify({ winner }) });
    if (!resp.ok) return new Response(await resp.text(), { status: resp.status });
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    console.error("Error ending contest:", error3);
    return new Response("Internal server error", { status: 500 });
  }
}
__name(handleEndContest, "handleEndContest");
async function handlePopulateTestData(request, env2) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const { conferenceId, region, count: count3, correctPercentage } = await request.json();
    const submissionCount = count3 || 130;
    const correctRate = correctPercentage || 88;
    const namesByRegion = {
      portuguese: [
        "Jo\xE3o Silva",
        "Maria Santos",
        "Ant\xF3nio Ferreira",
        "Ana Costa",
        "Carlos Oliveira",
        "Catarina Rodrigues",
        "Pedro Almeida",
        "Sofia Pereira",
        "Miguel Carvalho",
        "In\xEAs Martins",
        "Ricardo Sousa",
        "Beatriz Fernandes",
        "Nuno Gon\xE7alves",
        "Mariana Ribeiro",
        "Tiago Lopes",
        "Leonor Pinto",
        "Bruno Correia",
        "Rita Moreira",
        "Diogo Teixeira",
        "Francisca Dias"
      ],
      dutch: [
        "Jan de Jong",
        "Emma van der Berg",
        "Daan Bakker",
        "Sophie Janssen",
        "Lucas Visser",
        "Lotte de Vries",
        "Milan Smit",
        "Fleur Mulder",
        "Sem de Boer",
        "Noa Bos",
        "Finn van Leeuwen",
        "Zo\xEB Vos",
        "Levi Hendriks",
        "Isa van den Berg",
        "Noah Peters",
        "Mila Dekker",
        "Bram Willems",
        "Eva van der Meer",
        "Lars Verhoeven",
        "Sara de Wit"
      ],
      english: [
        "James Smith",
        "Emily Johnson",
        "Michael Williams",
        "Sarah Brown",
        "David Jones",
        "Emma Davis",
        "Daniel Miller",
        "Olivia Wilson",
        "Matthew Moore",
        "Sophie Taylor",
        "Joshua Anderson",
        "Charlotte Thomas",
        "Andrew Jackson",
        "Amelia White",
        "Christopher Harris",
        "Isabella Martin",
        "Ryan Thompson",
        "Grace Garcia",
        "Benjamin Martinez",
        "Lily Robinson"
      ],
      spanish: [
        "Alejandro Garc\xEDa",
        "Mar\xEDa Rodr\xEDguez",
        "David L\xF3pez",
        "Carmen Mart\xEDnez",
        "Jos\xE9 Gonz\xE1lez",
        "Ana S\xE1nchez",
        "Manuel P\xE9rez",
        "Laura G\xF3mez",
        "Francisco Mart\xEDn",
        "Elena Jim\xE9nez",
        "Antonio Ruiz",
        "Pilar Hern\xE1ndez",
        "Carlos D\xEDaz",
        "Isabel Moreno",
        "Miguel Mu\xF1oz",
        "Cristina \xC1lvarez",
        "Rafael Romero",
        "Beatriz Guti\xE9rrez",
        "Fernando Navarro",
        "Silvia Torres"
      ],
      turkish: [
        "Mehmet Y\u0131lmaz",
        "Ay\u015Fe Kaya",
        "Mustafa Demir",
        "Fatma \u015Eahin",
        "Ahmet \xC7elik",
        "Emine Y\u0131ld\u0131z",
        "Ali Ayd\u0131n",
        "Hatice \xD6zkan",
        "H\xFCseyin Arslan",
        "Zeynep Do\u011Fan",
        "\u0130brahim K\u0131l\u0131\xE7",
        "Meryem Aslan",
        "\xD6mer Polat",
        "Elif Ko\xE7",
        "Yusuf \u015Een",
        "B\xFC\u015Fra \xC7ak\u0131r",
        "Osman \xD6zt\xFCrk",
        "Seda Erdo\u011Fan",
        "Emre G\xFCne\u015F",
        "Gamze Yavuz"
      ],
      polish: [
        "Jan Kowalski",
        "Anna Nowak",
        "Piotr Wi\u015Bniewski",
        "Maria W\xF3jcik",
        "Krzysztof Kowalczyk",
        "Katarzyna Kami\u0144ska",
        "Andrzej Lewandowski",
        "Barbara Zieli\u0144ska",
        "Tomasz Szyma\u0144ski",
        "Agnieszka Wo\u017Aniak",
        "Marcin D\u0105browski",
        "Magdalena Koz\u0142owska",
        "Pawe\u0142 Jankowski",
        "Monika Mazur",
        "Micha\u0142 Krawczyk",
        "Joanna Piotrowski",
        "Robert Grabowski",
        "Ewa Nowakowska",
        "Rafa\u0142 Paw\u0142owski",
        "Aleksandra Michalska"
      ],
      american: [
        "John Smith",
        "Jennifer Johnson",
        "Michael Brown",
        "Jessica Davis",
        "Robert Miller",
        "Ashley Wilson",
        "William Moore",
        "Amanda Taylor",
        "David Anderson",
        "Stephanie Thomas",
        "Christopher Jackson",
        "Melissa White",
        "Matthew Harris",
        "Sarah Martin",
        "Joshua Thompson",
        "Nicole Garcia",
        "Daniel Martinez",
        "Elizabeth Robinson",
        "Anthony Clark",
        "Heather Rodriguez"
      ]
    };
    const selectedNames = namesByRegion[region] || namesByRegion.portuguese;
    const confResp = await getConferenceStub(env2, conferenceId).fetch("https://do/get");
    if (!confResp.ok) {
      return new Response("Conference not found", { status: 404 });
    }
    const conference = await confResp.json();
    const correctAnswer = conference.puzzle.solution;
    const correctCount = Math.floor(submissionCount * (correctRate / 100));
    const incorrectCount = submissionCount - correctCount;
    let actualSubmissionCount = 0;
    for (let i = 0; i < correctCount; i++) {
      const name = selectedNames[i % selectedNames.length];
      let emailDomain;
      switch (region) {
        case "dutch":
          emailDomain = "example.nl";
          break;
        case "english":
          emailDomain = "example.co.uk";
          break;
        case "spanish":
          emailDomain = "ejemplo.es";
          break;
        case "turkish":
          emailDomain = "ornek.tr";
          break;
        case "polish":
          emailDomain = "przyklad.pl";
          break;
        case "american":
          emailDomain = "example.com";
          break;
        default:
          emailDomain = "exemplo.pt";
      }
      const email = `${name.toLowerCase().replace(/\s+/g, ".").replace(/[áàâãäå]/g, "a").replace(/[éêëè]/g, "e").replace(/[íîïì]/g, "i").replace(/[óôõöò]/g, "o").replace(/[úûüù]/g, "u").replace(/[ç]/g, "c").replace(/[ñ]/g, "n").replace(/[ş]/g, "s").replace(/[ğ]/g, "g").replace(/[ı]/g, "i").replace(/[ł]/g, "l").replace(/[ą]/g, "a").replace(/[ę]/g, "e").replace(/[ć]/g, "c").replace(/[ń]/g, "n").replace(/[ś]/g, "s").replace(/[ź]/g, "z").replace(/[ż]/g, "z")}${i > selectedNames.length ? i : ""}@${emailDomain}`;
      const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submit", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          answer: correctAnswer
        })
      });
      if (resp.ok) actualSubmissionCount++;
    }
    for (let i = 0; i < incorrectCount; i++) {
      const name = selectedNames[(correctCount + i) % selectedNames.length];
      let emailDomain;
      switch (region) {
        case "dutch":
          emailDomain = "example.nl";
          break;
        case "english":
          emailDomain = "example.co.uk";
          break;
        case "spanish":
          emailDomain = "ejemplo.es";
          break;
        case "turkish":
          emailDomain = "ornek.tr";
          break;
        case "polish":
          emailDomain = "przyklad.pl";
          break;
        case "american":
          emailDomain = "example.com";
          break;
        default:
          emailDomain = "exemplo.pt";
      }
      const email = `${name.toLowerCase().replace(/\s+/g, ".").replace(/[áàâãäå]/g, "a").replace(/[éêëè]/g, "e").replace(/[íîïì]/g, "i").replace(/[óôõöò]/g, "o").replace(/[úûüù]/g, "u").replace(/[ç]/g, "c").replace(/[ñ]/g, "n").replace(/[ş]/g, "s").replace(/[ğ]/g, "g").replace(/[ı]/g, "i").replace(/[ł]/g, "l").replace(/[ą]/g, "a").replace(/[ę]/g, "e").replace(/[ć]/g, "c").replace(/[ń]/g, "n").replace(/[ś]/g, "s").replace(/[ź]/g, "z").replace(/[ż]/g, "z")}${correctCount + i > selectedNames.length ? correctCount + i : ""}@${emailDomain}`;
      const incorrectAnswer = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
      ];
      if (JSON.stringify(incorrectAnswer) === JSON.stringify(correctAnswer)) {
        incorrectAnswer[0] = (incorrectAnswer[0] + 1) % 10;
      }
      const resp = await getConferenceStub(env2, conferenceId).fetch("https://do/submit", {
        method: "POST",
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
      region: region || "portuguese"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Error populating test data:", error3);
    return new Response("Internal server error", { status: 500 });
  }
}
__name(handlePopulateTestData, "handlePopulateTestData");

// ../../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-3ygP7P/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-3ygP7P/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ConferenceDO,
  RegistryDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
