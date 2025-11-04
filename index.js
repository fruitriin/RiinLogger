const { getCallerInfo} = require("./src/sourcemap")
const { toRawRecursive} = require("./src/toRawRecursive")
const {inspect} = require("util")


class RiinLogger {
  static FORMAT_TEMPLATES = {
    short: "[%f:%l]%a",
    long: "[%t][%c()@%f:%l]%a\n"
  };

  defaultOption = {
    format: "short",
    unwrapReactivity: false,
    // utils.inspect の引数
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
  // original に素のままのconsoleを退避
  original = console
  // デフォルトオプションを元に optionを作る
  option = structuredClone(this.defaultOption);

  constructor(option = {}) {
    this.config(option)
  }

  // 引数があれば結合する
  config(option = {}) {
    this.option = { ...this.option, ...option };
  }

  // 呼び出し元を調べる関数
  _getCallerInfo = getCallerInfo;
  _toRawRecursive = toRawRecursive;

  _format(...args) {
    const timestamp = `${new Date().toLocaleTimeString("ja-JP", {
          timeZone: "Asia/Tokyo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`;
    const caller = this._getCallerInfo();

    // 各引数を個別にフォーマットしてスペース区切りで結合
    // inspect()　すると変数の型に合わせて色とかついて素敵
    const formattedArgs = args.map(arg =>
      this.option.unwrapReactivity
        ? inspect(toRawRecursive(arg), this.option.inspect)
        : inspect(arg, this.option.inspect)
    ).join(' ');

    const template = RiinLogger.FORMAT_TEMPLATES[this.option.format] || this.option.format;

    return template.replace(/%[tcfla]/g, match => ({
      '%t': timestamp,
      '%c': caller.functionName,
      '%f': caller.file,
      '%l': caller.line,
      '%a': formattedArgs
    }[match]))
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

// デフォルトインスタンスとショートハンドインスタンスの作成
const logger = new RiinLogger();

// console.longプロパティ: format: "long"が設定されたインスタンス
logger.long = new RiinLogger();
logger.long.config({ format: "long" });

// console.longプロパティ: format: "short"が設定されたインスタンス
logger.short = new RiinLogger();
logger.short.config({ format: "short" });


logger.unwrap = new RiinLogger();
logger.unwrap.config({unwrapReactivity: true, format: "short"})


logger.unwrapLong = new RiinLogger();
logger.unwrapLong.config({unwrapReactivity: true, format: "long"})



// デフォルトインスタンスをエクスポート
module.exports = logger;



// クラスも提供（カスタムインスタンス作成用）
module.exports.RiinLogger = RiinLogger;
