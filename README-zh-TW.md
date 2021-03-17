# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

開放中文轉換 JavaScript 版

## 載入

**在 HTML 中載入**

依次載入以下四個 `script` 標籤：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/data.min.js"></script>          <!-- 必須載入 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/data.cn2t.min.js"></script>     <!-- 需要簡轉繁時 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/data.t2cn.min.js"></script>     <!-- 需要繁轉簡時 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/bundle-browser.min.js"></script><!-- 必須載入 -->
```

**在 Node.js 中載入**

```sh
npm install opencc-js
```

```javascript
const OpenCC = require('opencc-js');
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
