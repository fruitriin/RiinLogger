# RiinLogger

私が本当に必要だったもの

```
import Logger from "riinlogger"

Logger.log("a")
-> [ファイル名:行番号] 'a'
```

```
// 標準 console を上書き！
import console from 'riinlogger'

console.log("a")
-> [ファイル名:行番号] 'a'
```

## インストール

```
npm i https://github.com/fruitriin/RiinLogger
```
＊まだ npm にpublishしてません



# methods

## log,info, warn, error

## .short

.config()で上書きする前の short フォーマットの RiinLogger が入っている

##.long
.config()で上書きする前の long フォーマットの RiinLogger が入っている

##.unwrap, .unwrapLong
unwrapReactivity: true の RiinLogger が入っている

## config(option)

引数にオブジェクトを渡せる

### option

```.ts
{
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

```

format: "short", "long", または自由文　以下の文字列は置き換えられる
// %t -> timestamp
// %c -> caller.functionName
// %f -> caller.file
// %l -> caller.line
// %a -> args

unwrapReactivity:Proxy と Vue の ref と reactive を再帰的に unwrap する

inspect: Utils.inspect 参照
