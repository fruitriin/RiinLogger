const fs = require("fs");
const { TraceMap, originalPositionFor } = require("@jridgewell/trace-mapping");

function getCallerInfo() {
  const err = new Error();
  if(!err.stack) return { functionName: "unknown", file: "unknown", line: 0 };
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
    const fileName = fullPath.split("/").pop(); // ファイル名のみ

    // ソースマップで元の位置を探す
    const original = findOriginalPosition(fullPath, line, column);
    if (original && original.source) {
      const originalFile = original.source.split("/").pop();
      return {
        functionName,
        file: originalFile,
        line: original.line
      };
    }

    return {
      functionName,
      fileName,
      line
    }
  }
  return {
    functionName: "unknown",
    file: "unknown",
    line: 0
  }
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


module.exports  = {
    findOriginalPosition,
    getCallerInfo,
}