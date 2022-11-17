# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

開放中文轉換 JavaScript 版

## 載入

**在 HTML 中載入**

載入以下 `script` 標籤（擇一即可）：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js"></script>     <!-- 完全版 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/cn2t.js"></script>     <!-- 只需要簡轉繁時 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/t2cn.js"></script>     <!-- 只需要繁轉簡時 -->
```

自行託管的話，除了使用原先的 umd，也可以使用 es module

```html
<script type="module">
  import * as OpenCC from './dist/esm/full.js'; // 完全版
  import * as OpenCC from './dist/esm/cn2t.js'; // 只需要簡轉繁
  import * as OpenCC from './dist/esm/t2cn.js'; // 只需要繁轉簡
</script>
```

**在 Node.js 中載入**

```sh
npm install opencc-js
```

CommonJS

```javascript
const OpenCC = require('opencc-js');
```

ES Modules

```javascript
import * as OpenCC from 'opencc-js';
```

## 使用

**基本用法**

```javascript
// 將繁體中文（香港）轉換為簡體中文（中國大陸）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
console.log(converter('漢語')); // output: 汉语
```

- `cn`: 簡體中文（中國大陸）
- `tw`: 繁體中文（臺灣）
    - `twp`: 且轉換詞彙（例如：自行車 -> 腳踏車）
- `hk`: 繁體中文（香港）
- `jp`: 日本新字體
- `t`: 繁體中文（OpenCC 標準。除非你知道自己在做什麼，否則請勿使用）

**自訂轉換器**

```javascript
const converter = OpenCC.CustomConverter([
  ['香蕉', 'banana'],
  ['蘋果', 'apple'],
  ['梨', 'pear'],
]);
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

或以「空白」及「|」當作分隔符號

```javascript
const converter = OpenCC.CustomConverter('香蕉 banana|蘋果 apple|梨 pear');
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**添加字詞**

* `ConverterFactory` 是比較底層的函數，`Converter` 及 `CustomConverter` 都是這個函數的再包裝。
* 透過 `Locale` 屬性可以得到原本的字典，進而添加字詞。

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn,                   // 中國大陸 => OpenCC 標準
  OpenCC.Locale.to.tw.concat([customDict]) // OpenCC 標準 => 臺灣+自訂
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

下面的寫法也會得到相同的結果，只是內部會多做一次轉換

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn, // 中國大陸 => OpenCC 標準
  OpenCC.Locale.to.tw,   // OpenCC 標準 => 臺灣
  [customDict]           // 臺灣 => 自訂
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
// 將所有 zh-HK 標籤轉為 zh-CN 標籤
const HTMLConvertHandler = OpenCC.HTMLConverter(converter, rootNode, 'zh-HK', 'zh-CN');
HTMLConvertHandler.convert(); // 開始轉換  -> 汉语
HTMLConvertHandler.restore(); // 復原      -> 漢語
```

class list 包含 `ignore-opencc` 的標籤不會被轉換（包括該標籤的所有子節點）。

## 打包優化

如果使用 rollup 等工具打包程式碼，以下方式能讓打包工具自動移除用不到的部分，減少檔案大小。

```javascript
import * as OpenCC from 'opencc-js/core'; // 核心程式碼
import * as Locale from 'opencc-js/preset'; // 字典資料

const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
console.log(converter('漢語'));
```

備註：

* 由於這是利用 Tree Shaking，所以必須使用 ES Modules
* 在這個模式之下，沒有 `Converter` 函式，必須直接使用 `ConverterFactory`
