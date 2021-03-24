# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

The JavaScript version of Open Chinese Convert (OpenCC)

[繁體版](README-zh-TW.md) - [简体版](README-zh-CN.md)

## Import

**Import opencc-js in HTML page**

Import in HTML pages:

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/data.min.js"></script>          <!-- Required -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/data.cn2t.min.js"></script>     <!-- For Simplified to Traditional -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/data.t2cn.min.js"></script>     <!-- For Traditional Chinese to Simplified Chinese -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.2/bundle-browser.min.js"></script><!-- Required -->
```

**Import opencc-js in Node.js script**

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

## API
* `.Converter({})`: declare the converter's direction via locals.
  * default: `{ from: 'tw', to: 'cn' }`
  * syntax : `{ from: local1, to: local2 }`
* locals: letter codes defining a writing local tradition, occasionally its idiomatic habits.
  * `cn`: Simplified Chinese (Mainland China)
  * `tw`: Traditional Chinese (Taiwan)
    * `twp`: with phrase conversion (ex: 自行車 -> 腳踏車）
  * `hk`: Traditional Chinese (Hong Kong)
  * `jp`: Japanese Shinjitai
  * `t`: Traditional Chinese (OpenCC standard. Do not use unless you know what you are doing)
* `.CustomConverter([])` : defines custom dictionary.
  * default: `[]`
  * syntax : `[  ['item1','replacement1'], ['item2','replacement2'], … ]`
* `.HTMLConverter(converter, rootNode, langAttrInitial, langAttrNew )` : uses previously defined converter() to converts all HTML elements text content from a starting root node and down, into the target local. Also converts all attributes `lang` from existing `langAttrInitial` to `langAttrNew` values.
* `lang` attributes : html attribute defines the languages of the text content to the browser, at start (`langAttrInitial`) and after conversion (`langAttrNew`). 
  * syntax convention: [IETF languages codes](https://www.w3.org/International/articles/bcp47/#macro), mainly `zh-TW`, `zh-HK`, `zh-CN`, `zh-SG`,…
* `ignore-opencc` : html class signaling an element and its sub-nodes will not be converted. 
