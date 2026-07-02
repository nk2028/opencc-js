# opencc-js
[![npm package badge](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js)
[![GitHub Testing Badge](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest)
[![jsDelivr Monthly Downloads Badge](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)
[![Socket.dev Supply Chain Security Badge](https://badge.socket.dev/npm/package/opencc-js)](https://socket.dev/npm/package/opencc-js/)

[English](README.md) - [简体版](README-zh-CN.md)

**開放中文轉換（OpenCC）的純 JavaScript 版本**

`opencc-js` 是面向瀏覽器和 Node.js 的 [OpenCC](https://github.com/BYVoid/OpenCC) 純 JavaScript 實作。它會在建置時打包從 [`opencc-data`](https://github.com/nk2028/opencc-data) 產生的字典資料，不需要 native binary。

轉換流程已向官方 OpenCC 實作對齊，包括內建轉換器的詞組分詞，並通過 upstream OpenCC test cases 和 golden outputs 驗證。但它仍不保證對所有輸入都與官方 OpenCC 產生完全相同的結果。

`opencc-js` 支援內建轉換器使用的 OpenCC mmseg 風格分詞，但不支援 jieba 等擴充分詞演算法。

> 注意：如需了解與 [`opencc`](https://www.npmjs.com/package/opencc) 和 [`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) package 的比較，請見下文。

## 資料

字典資料會在建置時從 [`opencc-data`](https://www.npmjs.com/package/opencc-data) 產生，並打包進發布 package。瀏覽器執行時不會額外下載字典文字檔案。

為了避免在瀏覽器和系統字型中較常缺字的字元顯示成豆腐塊，`opencc-js` 不打包 OpenCC 的 `TSCharactersExt` tofu-risk 映射。因此，少數繁轉簡擴充字元轉換會有意與 upstream OpenCC test data 不同。

## 使用

請選擇適合目前環境的安裝或載入方式。

> **重要：** 版本 `1.4.0` 同步 `opencc-data` 1.4.0，並刷新產生的字典資料。

**為 Node.js 或 bundler 安裝 opencc-js**

```sh
npm install opencc-js
```

ES modules:

```javascript
import OpenCC from 'opencc-js';
```

CommonJS:

```javascript
const OpenCC = require('opencc-js');
```

**在瀏覽器中使用 opencc-js**

自行託管的 ES module:

```html
<script type="module">
  import OpenCC from './dist/esm/full.js';

  const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  console.log(converter('汉语')); // 漢語
</script>
```

CDN ES module:

```html
<script type="module">
  // 請使用 https://www.npmjs.com/package/opencc-js 上的最新 stable 版本，或明確固定 1.4.0
  import OpenCC from 'https://cdn.jsdelivr.net/npm/opencc-js@1.4.0/dist/esm/full.js';

  const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  console.log(converter('汉语')); // 漢語
</script>
```

用於普通 script 標籤的 UMD build:

```html
<!-- 請使用 https://www.npmjs.com/package/opencc-js 上的最新 stable 版本，或明確固定 1.4.0 -->

<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.4.0/dist/umd/full.js"></script>
```

**基本用法**

```javascript
// 將繁體中文（香港）轉換為簡體中文（中國大陸）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
console.log(converter('漢語')); // output: 汉语
```

**自訂轉換器**

```javascript
const converter = OpenCC.CustomConverter([
  ['香蕉', 'banana'],
  ['蘋果', 'apple'],
  ['梨', 'pear'],
]);
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

或使用空格和直線作為分隔符。

```javascript
const converter = OpenCC.CustomConverter('香蕉 banana|蘋果 apple|梨 pear');
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**添加字詞**

* 使用較底層的 `ConverterFactory` 函數建立轉換器。
* 透過 `Locale` 屬性取得字典。

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn,                   // 簡體中文（中國大陸）=> OpenCC 標準
  OpenCC.Locale.to.tw.concat([customDict]) // OpenCC 標準 => 繁體中文（臺灣）+ 自訂字詞
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

下面的寫法也會得到相同的結果，只是會多做一次轉換。

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn, // 簡體中文（中國大陸）=> OpenCC 標準
  OpenCC.Locale.to.tw,   // OpenCC 標準 => 繁體中文（臺灣）
  [customDict]           // 繁體中文（臺灣）=> 自訂字詞
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

**DOM 操作**

HTML 屬性 `lang='*'` 定義了目標。

```html
<span lang="zh-HK">漢語</span>
```

```javascript
// 將繁體中文（香港）轉換為簡體中文（中國大陸）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
// 設定轉換起點為根節點，即轉換整個頁面
const rootNode = document.documentElement;
// 將所有 lang='zh-HK' 的元素轉為 lang='zh-CN'
const HTMLConvertHandler = OpenCC.HTMLConverter(converter, rootNode, 'zh-HK', 'zh-CN');
HTMLConvertHandler.convert(); // 開始轉換  -> 汉语
HTMLConvertHandler.restore(); // 復原      -> 漢語
```

## API

* `.Converter({})`：透過 locale 宣告轉換方向。
  * 預設值：`{ from: 'tw', to: 'cn' }`
  * 語法：`{ from: locale1, to: locale2 }`
* locales：用字母代碼定義書寫地區，有時也包含該地區的慣用詞彙。
  * `cn`：簡體中文（中國大陸）
  * `tw`：繁體中文（臺灣）
    * `twp`：且轉換詞彙（例如：自行車 -> 腳踏車）
  * `hk`：繁體中文（香港）
    * `hkp`：且轉換香港詞彙（例如：鼠标 -> 滑鼠）
  * `jp`：日本新字體
  * `t`：繁體中文（[OpenCC 標準繁體](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md)），主要適合作為中間形態

除非明確需要 [OpenCC 標準繁體](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md) 作為中間形態，否則不建議把 `to: 't'` 作為面向使用者展示的目標。多數場景應優先使用 `tw`、`twp`、`hk` 或 `hkp` 等地區輸出。

| opencc-js options | OpenCC config | 說明 |
|---|---|---|
| `{ from: 'cn', to: 'tw' }` | `s2tw` | 推薦：簡體中文到臺灣繁體。 |
| `{ from: 'cn', to: 'twp' }` | `s2twp` | 推薦：簡體中文到臺灣繁體，並轉換臺灣常用詞。 |
| `{ from: 'cn', to: 'hk' }` | `s2hk` | 推薦：簡體中文到香港繁體。 |
| `{ from: 'cn', to: 'hkp' }` | `s2hkp` | 簡體中文到香港繁體，並轉換香港常用詞。該短語字典仍在開發中，目前詞組不多，請謹慎使用。 |
| `{ from: 't', to: 'cn' }` | `t2s` | 推薦：通用繁體中文到簡體中文。 |
| `{ from: 'tw', to: 'cn' }` | `tw2s` | 推薦：臺灣繁體到簡體中文。 |
| `{ from: 'twp', to: 'cn' }` | `tw2sp` | 推薦：臺灣繁體詞彙到簡體中文。 |
| `{ from: 'hk', to: 'cn' }` | `hk2s` | 推薦：香港繁體到簡體中文。 |
| `{ from: 'hkp', to: 'cn' }` | `hk2sp` | 香港繁體詞彙到簡體中文。該短語字典仍在開發中，目前詞組不多，請謹慎使用。 |
| `{ from: 'cn', to: 't' }` | `s2t` | 進階用法：簡體中文到 OpenCC 標準繁體，通常不是最佳的使用者展示 locale。 |
| `{ from: 't', to: 'tw' }` | `t2tw` | 進階用法：OpenCC 標準繁體到臺灣繁體。 |
| `{ from: 't', to: 'hk' }` | `t2hk` | 進階用法：OpenCC 標準繁體到香港繁體。 |
| `{ from: 'tw', to: 't' }` | `tw2t` | 進階用法：臺灣繁體到 OpenCC 標準繁體。 |
| `{ from: 'hk', to: 't' }` | `hk2t` | 進階用法：香港繁體到 OpenCC 標準繁體。 |
| `{ from: 'jp', to: 't' }` | `jp2t` | 試驗性功能：日本新字體到 OpenCC 標準繁體，不建議用於生產環境。 |
| `{ from: 't', to: 'jp' }` | `t2jp` | 試驗性功能：OpenCC 標準繁體到日本新字體，不建議用於生產環境。 |

* `.CustomConverter([])`：定義自訂字典。
  * 預設值：`[]`
  * 語法：`[  ['item1','replacement1'], ['item2','replacement2'], ... ]`
* `.HTMLConverter(converter, rootNode, langAttrInitial, langAttrNew )`：使用先前定義的 converter()，從起始 root node 向下轉換所有 HTML 元素的文字內容為目標 locale。也會把所有現有 `langAttrInitial` 的 `lang` 屬性轉換為 `langAttrNew`，並轉換 `placeholder` 和 `aria-label` 屬性。
* `lang` 屬性：HTML 屬性，用於在開始時（`langAttrInitial`）以及轉換後（`langAttrNew`）向瀏覽器定義文字內容的語言。
  * 語法約定：[IETF language codes](https://www.w3.org/International/articles/bcp47/#macro)，主要是 `zh-TW`、`zh-HK`、`zh-CN`、`zh-SG` 等。
* `ignore-opencc`：HTML class，表示該元素及其所有子節點不會被轉換。

## 打包優化

* Tree Shaking（僅 ES Modules）可以減小 bundle 檔案大小。
* 使用 `ConverterFactory` 取代 `Converter`。
* 除非明確需要 OpenCC 標準繁體，否則建議優先輸出到 `tw` 或 `hk` 等地區字典，而不是 `to: 't'`。

```javascript
import * as OpenCC from 'opencc-js/core'; // 核心程式碼
import * as Locale from 'opencc-js/preset'; // 字典

const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
console.log(converter('漢語'));
```

## 不同 [`opencc`](https://www.npmjs.com/package/opencc) npm package 的區別

OpenCC 轉換相關的 npm package 主要有三個。它們在執行環境、實作方式和分詞支援上有所不同。

[`opencc-js`](https://www.npmjs.com/package/opencc-js) 是面向瀏覽器和 Node.js 的純 JavaScript 實作。它會在建置時打包從 `opencc-data` 產生的字典資料，不需要 native binary，也不會在執行時下載字典檔案。它的轉換流程已向官方 OpenCC 實作對齊，包括內建轉換器的 mmseg 風格詞組分詞，並通過 upstream OpenCC test cases 和 golden outputs 驗證。但它仍不保證對所有輸入都與官方 OpenCC 產生完全相同的結果。不支援 Jieba 等擴充分詞演算法。

[`opencc`](https://www.npmjs.com/package/opencc) 是官方 OpenCC C++ 專案的 Node.js native binding。它依賴 native 或 prebuilt binary，並跟隨官方 OpenCC 引擎。在官方 OpenCC 設定和執行環境支援時，它可以使用 Jieba 等擴充分詞演算法。

[`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) 是另一個可在瀏覽器中使用的 WebAssembly 實作。它的設定和轉換邏輯與官方 `opencc` package 對齊，並可透過官方 OpenCC runtime 支援 Jieba 分詞。

| | [`opencc-js`](https://www.npmjs.com/package/opencc-js) | [`opencc`](https://www.npmjs.com/package/opencc) | [`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) |
|---|---|---|---|
| 瀏覽器 | ✅ | ❌ | ✅ |
| Node.js | ✅ | ✅ | ✅ |
| 實作方式 | 純 JavaScript | Native C++ binding | WebAssembly |
| 需要 native binary | ❌ | ✅ | ❌ |
| 字典來源 | 建置時打包 | 執行時載入 | 執行時載入 |
| 與官方 OpenCC 對齊 | 近似 | ✅ | ✅ |
| mmseg 分詞 | ✅ | ✅ | ✅ |
| 可使用 Jieba 分詞 | ❌ | ✅ | ✅ |
