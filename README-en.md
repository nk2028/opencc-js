# opencc-js [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

Pure JavaScript implementation of OpenCC

## Import

In HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.3.2"></script>
```

Or in Node.js:

```javascript
const OpenCC = require('opencc-js');
```

## Usage

```javascript

OpenCC.Converter('hk', 'cn')  // Traditional Chinese (Hong Kong) to Simplified Chinese
.then(convert => console.log(convert('漢字，簡體字')));  // output: 汉字，简体字
```

The first argument is the source type, the second argument is the destination type. Possible values are:

- Traditional Chinese (OpenCC)：`t`
- Traditional Chinese (Taiwan)：`tw`
- Traditional Chinese (Taiwan, with Taiwan phrases)：`twp`
- Traditional Chinese (Hong Kong)：`hk`
- Simplified Chinese (Mainland China)：`cn`
- Japanese _Shinjitai_：`jp`

Trad (Hong Kong, with Hong Kong phrases) is currently not supported.

## Custom Converter

```javascript
const convert = OpenCC.CustomConverter({ '香蕉': '🍌️', '蘋果': '🍎️', '梨': '🍐️' });
console.log(convert('香蕉蘋果梨'));  // output: 🍌️🍎️🍐️
```

## DOM operation

```javascript
(async () => {
    const convert = await OpenCC.Converter('hk', 'cn');
    const startNode = document.documentElement;  // Convert the whole page
    const HTMLConvertHandler = OpenCC.HTMLConverter(convert, startNode, 'zh-HK', 'zh-CN');  // Convert all zh-HK to zh-CN
    HTMLConvertHandler.convert();  // Start conversion
    HTMLConvertHandler.restore();  // Restore
})()
```
