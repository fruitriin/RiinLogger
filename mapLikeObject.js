function mapLikeObject(init) {
      // 1) 下敷きの Map を用意（init の型に応じて初期化）
  let base;
  if (init instanceof Map) {
    base = new Map(init);
  } else if (Array.isArray(init)) {
    // [['k','v'], ...] を想定（雑に渡された配列も Map のルールで処理）
    base = new Map(init);
  } else if (init && typeof init === 'object') {
    base = new Map();
    // オブジェクトの列挙可能な自プロパティの挿入順で投入
    for (const k of Object.keys(init)) base.set(k, init[k]);
  } else {
    base = new Map();
  }

  return new Proxy(base, {
    get(target, prop) {
      // Mapに存在するキーならその値を返す
      if (target.has(prop)) return target.get(prop);
      // それ以外は Map インスタンス自身のプロパティを返す
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      target.set(prop, value);
      return true;
    },
    has(target, prop) {
      return target.has(prop);
    },
    deleteProperty(target, prop) {
      return target.delete(prop);
    },
    ownKeys(target) {
      return [...target.keys()];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (target.has(prop)) {
        return { enumerable: true, configurable: true };
      }
      return undefined;
    }
  });
}



module.exports = mapLikeObject;