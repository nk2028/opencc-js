# opencc-js
[![npm package badge](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js)
[![GitHub Testing Badge](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest)
[![jsDelivr Monthly Downloads Badge](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)
[![Socket.dev Supply Chain Security Badge](https://badge.socket.dev/npm/package/opencc-js)](https://socket.dev/npm/package/opencc-js/)

[繁體版](README-zh-TW.md) - [简体版](README-zh-CN.md)

**The Pure JavaScript version of Open Chinese Convert (OpenCC)**

`opencc-js` is a pure JavaScript implementation of [OpenCC](https://github.com/BYVoid/OpenCC) for both browsers and Node.js. It bundles dictionary data generated from [`opencc-data`](https://github.com/nk2028/opencc-data) at build time, and no native binary is required.

The conversion pipeline aligns with the official OpenCC implementation, including phrase-level segmentation for the built-in converters, verified against upstream OpenCC test cases and golden outputs. Exact parity with the official OpenCC output is not guaranteed for all inputs.

`opencc-js` supports the OpenCC mmseg-style segmentation used by the built-in converters, but does not support extended segmenters such as jieba.

> Note: For a comparison with the [`opencc`](https://www.npmjs.com/package/opencc) and [`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) packages, see below.

## Data

Dictionary data is generated from [`opencc-data`](https://www.npmjs.com/package/opencc-data) at build time and bundled in the published package. Browser usage does not fetch extra dictionary text files at runtime.

To avoid producing tofu boxes for glyphs that are often missing from browser and system fonts, `opencc-js` does not bundle OpenCC's `TSCharactersExt` tofu-risk mappings. A small number of rare Traditional-to-Simplified extension-character conversions may therefore intentionally differ from the upstream OpenCC test data.

## Usage

Choose the installation method that matches your environment.

> **Important:** Version `1.4.0` syncs with `opencc-data` 1.4.0 and refreshes the generated dictionary data.

**Install opencc-js for Node.js or a bundler**

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

**Use opencc-js in a browser**

Self-hosted ES module:

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
  // Use the latest stable version from https://www.npmjs.com/package/opencc-js, or pin 1.4.0 explicitly
  import OpenCC from 'https://cdn.jsdelivr.net/npm/opencc-js@1.4.0/dist/esm/full.js';

  const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  console.log(converter('汉语')); // 漢語
</script>
```

UMD build for plain script tags:

```html
<!-- Use the latest stable version from https://www.npmjs.com/package/opencc-js, or pin 1.4.0 explicitly -->

<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.4.0/dist/umd/full.js"></script>
```

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

This will get the same result with an extra conversion.

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
* `.Converter({})`: declare the converter's direction via locales.
  * default: `{ from: 'tw', to: 'cn' }`
  * syntax : `{ from: locale1, to: locale2 }`
* locales: letter codes defining a writing locale and, occasionally, its idiomatic habits.
  * `cn`: Simplified Chinese (Mainland China)
  * `tw`: Traditional Chinese (Taiwan)
    * `twp`: with phrase conversion (ex: 自行車 -> 腳踏車）
  * `hk`: Traditional Chinese (Hong Kong)
    * `hkp`: with Hong Kong phrase conversion (ex: 鼠標 -> 滑鼠)
  * `jp`: Japanese Shinjitai
  * `t`: Traditional Chinese ([OpenCC standard](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md)), mainly useful as an intermediate form

Unless you specifically need the [OpenCC standard Traditional Chinese](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md) intermediate form, prefer regional output such as `tw`, `twp`, `hk`, or `hkp` instead of `to: 't'`.

| opencc-js options | OpenCC config | Notes |
|---|---|---|
| `{ from: 'cn', to: 'tw' }` | `s2tw` | Recommended for Simplified Chinese to Traditional Chinese (Taiwan). |
| `{ from: 'cn', to: 'twp' }` | `s2twp` | Recommended for Simplified Chinese to Traditional Chinese (Taiwan) with phrase conversion. |
| `{ from: 'cn', to: 'hk' }` | `s2hk` | Recommended for Simplified Chinese to Traditional Chinese (Hong Kong). |
| `{ from: 'cn', to: 'hkp' }` | `s2hkp` | Simplified Chinese to Traditional Chinese (Hong Kong) with phrase conversion. The phrase dictionary is still developing and currently small; use with care. |
| `{ from: 't', to: 'cn' }` | `t2s` | Recommended for generic Traditional Chinese to Simplified Chinese. |
| `{ from: 'tw', to: 'cn' }` | `tw2s` | Recommended for Traditional Chinese (Taiwan) to Simplified Chinese. |
| `{ from: 'twp', to: 'cn' }` | `tw2sp` | Recommended for Traditional Chinese (Taiwan, with phrases) to Simplified Chinese. |
| `{ from: 'hk', to: 'cn' }` | `hk2s` | Recommended for Traditional Chinese (Hong Kong) to Simplified Chinese. |
| `{ from: 'hkp', to: 'cn' }` | `hk2sp` | Traditional Chinese (Hong Kong, with phrases) to Simplified Chinese. The phrase dictionary is still developing and currently small; use with care. |
| `{ from: 'cn', to: 't' }` | `s2t` | Advanced: Simplified Chinese to OpenCC standard Traditional Chinese. Usually not the best end-user display locale. |
| `{ from: 't', to: 'tw' }` | `t2tw` | Advanced: OpenCC standard Traditional Chinese to Traditional Chinese (Taiwan). |
| `{ from: 't', to: 'hk' }` | `t2hk` | Advanced: OpenCC standard Traditional Chinese to Traditional Chinese (Hong Kong). |
| `{ from: 'tw', to: 't' }` | `tw2t` | Advanced: Traditional Chinese (Taiwan) to OpenCC standard Traditional Chinese. |
| `{ from: 'hk', to: 't' }` | `hk2t` | Advanced: Traditional Chinese (Hong Kong) to OpenCC standard Traditional Chinese. |
| `{ from: 'jp', to: 't' }` | `jp2t` | Experimental: Japanese Shinjitai to OpenCC standard Traditional Chinese. Not recommended for production use. |
| `{ from: 't', to: 'jp' }` | `t2jp` | Experimental: OpenCC standard Traditional Chinese to Japanese Shinjitai. Not recommended for production use. |

* `.CustomConverter([])` : defines custom dictionary.
  * default: `[]`
  * syntax : `[  ['item1','replacement1'], ['item2','replacement2'], … ]`
* `.HTMLConverter(converter, rootNode, langAttrInitial, langAttrNew )` : uses previously defined converter() to convert all HTML elements text content from a starting root node and down, into the target locale. Also converts all attributes `lang` from existing `langAttrInitial` to `langAttrNew` values, and converts `placeholder` and `aria-label` attributes.
* `lang` attributes : html attribute defines the languages of the text content to the browser, at start (`langAttrInitial`) and after conversion (`langAttrNew`).
  * syntax convention: [IETF languages codes](https://www.w3.org/International/articles/bcp47/#macro), mainly `zh-TW`, `zh-HK`, `zh-CN`, `zh-SG`,…
* `ignore-opencc` : html class signaling an element and its sub-nodes will not be converted.

## Bundle optimization

* Tree Shaking (ES Modules Only) may result less size of bundle file.
* Using `ConverterFactory` instead of `Converter`.
* Prefer regional output dictionaries such as `tw` or `hk` over `to: 't'` unless you specifically need OpenCC standard Traditional Chinese.

```javascript
import * as OpenCC from 'opencc-js/core'; // primary code
import * as Locale from 'opencc-js/preset'; // dictionary

const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
console.log(converter('漢語'));
```

## Differences between various [`opencc`](https://www.npmjs.com/package/opencc) npm packages

There are three related npm packages for OpenCC conversion. They differ in runtime environment, implementation approach, and segmentation support.

[`opencc-js`](https://www.npmjs.com/package/opencc-js) is a pure JavaScript implementation for browsers and Node.js. It bundles dictionary data generated from `opencc-data` at build time, requiring no native binaries and no runtime file fetching. Its conversion pipeline aligns with the official OpenCC implementation, including mmseg-style phrase segmentation for built-in converters, verified against upstream OpenCC test cases and golden outputs. Exact parity with the official OpenCC output is not guaranteed for all inputs. Extended segmenters such as Jieba are not supported.

[`opencc`](https://www.npmjs.com/package/opencc) is the official Node.js native binding for the OpenCC C++ project. It depends on native or prebuilt binaries and follows the official OpenCC engine. Extended segmentation algorithms such as Jieba are supported when the official OpenCC configuration and runtime allow it.

[`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) is another browser-capable implementation using WebAssembly. Its configuration and conversion logic stay aligned with the official `opencc` package, and it can support Jieba segmentation through the official OpenCC runtime.

| | [`opencc-js`](https://www.npmjs.com/package/opencc-js) | [`opencc`](https://www.npmjs.com/package/opencc) | [`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) |
|---|---|---|---|
| Browser | ✅ | ❌ | ✅ |
| Node.js | ✅ | ✅ | ✅ |
| Implementation | Pure JavaScript | Native C++ binding | WebAssembly |
| Native binary required | ❌ | ✅ | ❌ |
| Dictionary source | Bundled at build time | Loaded at runtime | Loaded at runtime |
| Aligned with official OpenCC | Approximately | ✅ | ✅ |
| mmseg segmentation | ✅ | ✅ | ✅ |
| Jieba segmentation available | ❌ | ✅ | ✅ |
