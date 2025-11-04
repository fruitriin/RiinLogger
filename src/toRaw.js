const { isReactive, isRef, toRaw } = require("@vue/reactivity");

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

  // Refの場合は.valueで値を取得、Reactiveの場合はtoRawで生の値に変換
  let raw = value;
  if (isRef(value)) {
    raw = value.value;
  } else if (isReactive(value)) {
    raw = toRaw(value);
  }

  // オブジェクトの場合のみvisitedに追加（プリミティブ値は追加できない）
  if (raw !== null && typeof raw === "object") {
    visited.add(raw);
  }

  // Refから取得した値がプリミティブの場合はここで返す
  if (raw === null || typeof raw !== "object") {
    return raw;
  }

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

module.exports  = {
    toRawRecursive
}