# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

The JavaScript version of Open Chinese Convert (OpenCC)

[繁體版](README-zh-TW.md) - [简体版](README-zh-CN.md)

## Import

**Import opencc-js in HTML**

Load the following four `script` in sequence:

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/data.min.js"></script>          <!-- Required -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/data.cn2t.min.js"></script>     <!-- For Simplified to Traditional -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/data.t2cn.min.js"></script>     <!-- For Traditional Chinese to Simplified Chinese -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/bundle-browser.min.js"></script><!-- Required -->
```

**Import opencc-js in Node.js**

```sh
npm install opencc-js
```

```javascript
const OpenCC = require('opencc-js');
```

## Usage

**Basic usage**

```javascript
// Convert Traditional Chinese (Hong Kong) to Simplified Chinese (Mainland China)
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
console.log(converter('漢語')); // output: 汉语
```

- `cn`: Simplified Chinese (Mainland China)
- `tw`: Traditional Chinese (Taiwan)
    - `twp`: with phrase conversion (ex: 自行車 -> 腳踏車）
- `hk`: Traditional Chinese (Hong Kong)
- `jp`: Japanese Shinjitai
- `t`: Traditional Chinese (OpenCC standard. Do not use unless you know what you are doing)

**Custom Converter**

```javascript
const converter = OpenCC.CustomConverter([
  ['香蕉', 'banana'],
  ['蘋果', 'apple'],
  ['梨', 'pear'],
]);
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**DOM operations**

HTML attribute `lang='*'` defines the targets.

```html
<span lang="zh-HK">漢語</span>
```

```javascript
// Set Chinese convert from Traditional (Hong Kong) to Simplified (Mainland China)
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
// Set the conversion starting point to the root node, i.e. convert the whole page
const rootNode = document.documentElement;
// Convert all elements with attributes lang='zh-HK'. Change attribute value to lang='zh-CN'
const HTMLConvertHandler = OpenCC.HTMLConverter(converter, rootNode, 'zh-HK', 'zh-CN');
HTMLConvertHandler.convert(); // Convert  -> 汉语
HTMLConvertHandler.restore(); // Restore  -> 漢語
```

All the tags which contains `ignore-opencc` in the class list will not be converted (including all sub-nodes of the tags).
