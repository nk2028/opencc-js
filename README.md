# opencc-js [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

開放中文轉換 JavaScript 版

## 載入

**在 HTML 中載入**

```html
<!-- 下面一條必須載入 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.0/data.min.js"></script>
<!-- 不需要簡轉繁時，可刪除下面一條，以加快載入 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.0/data.cn2t.min.js"></script>
<!-- 不需要繁轉簡時，可刪除下面一條，以加快載入 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.0/data.t2cn.min.js"></script>
<!-- 下面一條必須載入 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.0/main.min.js"></script>
```

説明：以上四個 `script` 標籤必須按順序載入。

**或在 Node.js 中載入**

```sh
npm install opencc-js
```

```javascript
const OpenCC = require('opencc-js');
```

## 使用

**基本用法**

```javascript
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' }); // 將繁體中文（香港）轉換為簡體中文（中國大陸）
console.log(converter('漢字，簡體字')); // output: 汉字，简体字
```

- cn: Simplified Chinese (Mainland China)
- tw: Traditional Chinese (Taiwan)
- twp: Traditional Chinese (Taiwan, with phrase conversion)
- hk: Traditional Chinese (Hong Kong)
- jp: Japanese Shinjitai

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

```javascript
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' }); // 將繁體中文（香港）轉換為簡體中文（中國大陸）
const startNode = document.documentElement; // 設定轉換起點為根節點，即轉換整個頁面
const HTMLConvertHandler = OpenCC.HTMLConverter(converter, startNode, 'zh-HK', 'zh-CN'); // 將所有 zh-HK 標籤轉為 zh-CN 標籤
HTMLConvertHandler.convert(); // 開始轉換
HTMLConvertHandler.restore(); // 復原
```

class list 包含 `ignore-opencc` 的標籤不會被轉換（包括所有子節點）。
