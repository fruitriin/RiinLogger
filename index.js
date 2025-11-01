const fs = require("fs");
const util = require("util")
const { TraceMap, originalPositionFor } = require("@jridgewell/trace-mapping");
const { isReactive, toRaw } = require("@vue/reactivity");


class RiinLogger {
  originalOption = {
    enableTimestamp: true,
    lineInfoWrap: true,
    somethingElse: false,
    unwrapReactivity: false,
    inspect: {
      colors: true,
      depth: 2,
      showHidden: false,
      // compact: false だと オブジェクトや配列が常に改行される
      compact: true,
      breakLength: 80,
      maxArrayLength: 100
    }
  };
  original = console
  option = structuredClone(this.originalOption);
  // Note: この辺の設計は改善の余地あり

  constructor() {}
  config(option = {}) {
    this.option = { ...this.option, ...option };
  }

  // 呼び出し元を調べる関数
  _getCallerInfo = getCallerInfo;
  _toRawRecursive = toRawRecursive;

  _format(...args) {
    const timestamp = this.option.enableTimestamp
      ? `[${new Date().toLocaleTimeString("ja-JP", {
          timeZone: "Asia/Tokyo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}]`
      : "";
    const caller = this._getCallerInfo();

    // 各引数を個別にフォーマットしてスペース区切りで結合
    const formattedArgs = args.map(arg =>
      this.option.unwrapReactivity
        ? util.inspect(toRawRecursive(arg), this.option.inspect)
        : util.inspect(arg, this.option.inspect)
    ).join(' ');

    // Log Levelが必要なら [${level}] で足せるけど多分必要ない
    return `${timestamp}[${caller}]${
      this.option.lineInfoWrap ? "\n" : ""
    }${formattedArgs}`;
  }

  log(...args) {
    console.log(this._format(...args) );
  }

  info(...args) {
    console.info(this._format(...args));
  }

  warn(...args) {
    console.warn(this._format(...args));
  }

  error(...args) {
    console.error(this._format(...args));
  }

  debug(...args) {
    console.debug(this._format(...args));
  }
}

// デフォルトインスタンスを作成
const logger = new RiinLogger();

// デフォルトインスタンスをエクスポート
module.exports = logger;

function getCallerInfo() {
  const err = new Error();
  if(!err.stack) return "unknown"
  const stack = err.stack.split("\n");
  // stack[0] = "Error"
  // stack[1] = at _getCallerInfo
  // stack[2] = at _findOriginalPosition または _format
  // stack[3] = at _format または log/info/warn/error/debug
  // stack[4] = at log/info/warn/error/debug または actual caller
  // stack[5] = at actual caller <- 呼び出し元（調整が必要）
  const callerLine = stack[4] || "";

  // 関数名を取得: "at functionName (" または "at Object.functionName (" の形式
  const functionMatch = callerLine.match(/at\s+(?:.*\.)?(\w+)\s+\(/);
  const functionName = functionMatch ? functionMatch[1] : "<anonymous>";

  // ファイル名と行番号を取得
  const locationMatch =
    callerLine.match(/\((.+):(\d+):(\d+)\)/) ||
    callerLine.match(/at (.+):(\d+):(\d+)/);

  if (locationMatch) {
    const fullPath = locationMatch[1];
    const line = parseInt(locationMatch[2]);
    const column = parseInt(locationMatch[3]);
    const file = fullPath.split("/").pop(); // ファイル名のみ

    // ソースマップで元の位置を探す
    const original = findOriginalPosition(fullPath, line, column);
    if (original && original.source) {
      const originalFile = original.source.split("/").pop();
      return `${functionName}@${originalFile}:${original.line}`;
    }

    return `${functionName}()@${file}:${line}`;
  }
  return "unknown";
}

// Vuejsのreactivity を はずす
function toRawRecursive(value, visited = new WeakSet()) {
  // プリミティブ値はそのまま返す
  if (value === null || typeof value !== "object") {
    return value;
  }

  // 循環参照チェック
  if (visited.has(value)) {
    return "[Circular]";
  }

  // リアクティブオブジェクトの場合は生の値に変換
  const raw = isReactive(value) ? toRaw(value) : value;
  visited.add(raw);

  // 配列の場合
  if (Array.isArray(raw)) {
    return raw.map((item) => toRawRecursive(item, visited));
  }

  // オブジェクトの場合
  if (Object.prototype.toString.call(raw) === "[object Object]") {
    const result = {};
    for (const key in raw) {
      if (raw.hasOwnProperty(key)) {
        result[key] = toRawRecursive(raw[key], visited);
      }
    }
    return result;
  }

  // その他（Date, RegExp, など）はそのまま返す
  return raw;
}

// モジュールレベルのソースマップキャッシュ
const sourceMapCache = new Map();

function loadSourceMap(filePath) {
  // キャッシュチェック
  if (sourceMapCache.has(filePath)) {
    return sourceMapCache.get(filePath);
  }

  const mapPath = filePath + ".map";
  try {
    if (fs.existsSync(mapPath)) {
      const mapContent = fs.readFileSync(mapPath, "utf8");
      const rawSourceMap = JSON.parse(mapContent);
      const traceMap = new TraceMap(rawSourceMap);
      sourceMapCache.set(filePath, traceMap);
      return traceMap;
    }
  } catch (e) {
    // ソースマップが読めない場合は無視
  }

  sourceMapCache.set(filePath, null);
  return null;
}

function findOriginalPosition(filePath, line, column) {
  const traceMap = loadSourceMap(filePath);
  if (!traceMap) {
    return null;
  }

  try {
    const original = originalPositionFor(traceMap, { line, column });
    if (original && original.source) {
      return {
        source: original.source,
        line: original.line,
        column: original.column,
        name: original.name,
      };
    }
  } catch (e) {
    // エラーは無視
  }

  return null;
}

// クラスも提供（カスタムインスタンス作成用）
module.exports.RiinLogger = RiinLogger;
