# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

The JavaScript version of Open Chinese Convert (OpenCC)

[繁體版](README-zh-TW.md) - [简体版](README-zh-CN.md)

Dictionary data is generated from `opencc-data` at build time and bundled in the published package. Browser usage does not fetch extra dictionary text files at runtime.

## Import

**Import opencc-js in HTML page**

Import in HTML pages:

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.3.0/dist/umd/full.js"></script>     <!-- Full version -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.3.0/dist/umd/cn2t.js"></script>     <!-- For Simplified to Traditional -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.3.0/dist/umd/t2cn.js"></script>     <!-- For Traditional Chinese to Simplified Chinese -->
```

ES6 import

```html
<script type="module">
  import * as OpenCC from './dist/esm/full.js'; // Full version
  import * as OpenCC from './dist/esm/cn2t.js'; // For Simplified to Traditional
  import * as OpenCC from './dist/esm/t2cn.js'; // For Traditional Chinese to Simplified Chinese
</script>
```

**Import opencc-js in Node.js script**

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

Or using space and vertical bar as delimiter.

```javascript
const converter = OpenCC.CustomConverter('香蕉 banana|蘋果 apple|梨 pear');
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**Add words**

* Use low-level function `ConverterFactory` to create converter.
* Get dictionary from the property `Locale`.

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn,                   // Simplified Chinese (Mainland China) => OpenCC standard
  OpenCC.Locale.to.tw.concat([customDict]) // OpenCC standard => Traditional Chinese (Taiwan) with custom words
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

This will get the same result with an extra convertion.

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn, // Simplified Chinese (Mainland China) => OpenCC standard
  OpenCC.Locale.to.tw,   // OpenCC standard => Traditional Chinese (Taiwan)
  [customDict]           // Traditional Chinese (Taiwan) => custom words
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
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
  * `t`: Traditional Chinese ([OpenCC standard](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md). For most use cases, prefer a regional locale such as `tw` or `hk`)
* `.CustomConverter([])` : defines custom dictionary.
  * default: `[]`
  * syntax : `[  ['item1','replacement1'], ['item2','replacement2'], … ]`
* `.HTMLConverter(converter, rootNode, langAttrInitial, langAttrNew )` : uses previously defined converter() to converts all HTML elements text content from a starting root node and down, into the target local. Also converts all attributes `lang` from existing `langAttrInitial` to `langAttrNew` values, and converts `placeholder` and `aria-label` attributes.
* `lang` attributes : html attribute defines the languages of the text content to the browser, at start (`langAttrInitial`) and after conversion (`langAttrNew`).
  * syntax convention: [IETF languages codes](https://www.w3.org/International/articles/bcp47/#macro), mainly `zh-TW`, `zh-HK`, `zh-CN`, `zh-SG`,…
* `ignore-opencc` : html class signaling an element and its sub-nodes will not be converted.

## Bundle optimization

* Tree Shaking (ES Modules Only) may result less size of bundle file.
* Using `ConverterFactory` instead of `Converter`.
* Import `opencc-js/cn2t` or `opencc-js/t2cn` when only one conversion direction is needed.

```javascript
import * as OpenCC from 'opencc-js/core'; // primary code
import * as Locale from 'opencc-js/preset'; // dictionary

const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
console.log(converter('漢語'));
```

## Difference from the `opencc` npm package

The `opencc` npm package is the Node.js native binding for the official OpenCC C++ project. It is intended for Node.js, depends on native or prebuilt binaries, and follows the official OpenCC engine.

The `opencc-js` npm package is a pure JavaScript implementation for browsers and Node.js. It bundles dictionary data generated from `opencc-data`, so it does not require native binaries and does not fetch dictionary text files at runtime.

`opencc-js` is not a complete port of the official C++ OpenCC algorithm. It uses a JavaScript trie and dictionary pipeline, and is tested against upstream OpenCC test cases, but it should not be treated as bit-for-bit equivalent for every possible input.

The `opencc-wasm` npm package is another browser-capable implementation. It uses WebAssembly and keeps its configuration and conversion logic aligned with the official `opencc` package.
