const test = require("node:test");
const Logger = require("./index.js")
const mapLikeObject = require("./mapLikeObject.js")
const { ref, reactive } = require("vue")


const testCases = {
    "標準型": [
        {s: "数字", v: 1234},
        {s: "文字列", v:"Hello Strings"},
        {s: "Date", v: new Date("2024/10/1")},
        {s: "Boolean", v: true},
        {s: "Undefiend", v: undefined},
        {s: "null", v: null},
        {s: "オブジェクト", v:{name: "I'm object"}},
        {s: "配列", v: [1, 2, 3, 4]},
        {s: "Proxy", v: mapLikeObject({hoo: 123, bar: 456})},


        {s: "Symbol", v: Symbol("シンボル")},
        {s: "Bigint", v: 100n},
    ],
    "vue": [
        {s: "Ref(Vue)", v: ref("a")},
        {s: "Reactive(Vue)", v: reactive({hoo: 123, bar: 456})}
    ]
}

testCases.標準型.forEach(element => {
    console.log(`---- 標準型 ---- ${element.s}`)
    console.log(element.v)
    Logger.log(element.v)
});



testCases.標準型.forEach(element => {
    console.log(`--- 引数が2つ --- ${element.s}`)
    console.log(element.v , element.v)
    Logger.log(element.v , element.v)
})

testCases["vue"].forEach(element => {
    Logger.config({
        unwrapReactivity: true
    })
    Logger.log(element)
})




testCases.標準型.forEach(element => {
    console.log(`---- 標準型 ---- ${element.s}`)
// console.long には console.config({format: "long"}) が設定された RiinLoggerが入っている
    Logger.long.log(element.v)
});

Logger.log("これはショートフォーマット")