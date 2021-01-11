# opencc-js [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

Pure JavaScript implementation of OpenCC

## Import

In HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.3.7"></script>
```

Or in Node.js:

```sh
npm install opencc-js
```

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

Traditional Chinese (Hong Kong, with Hong Kong phrases) is currently not supported.

## Custom Converter

```javascript
const dict = {
  '香蕉': 'banana',
  '蘋果': 'apple',
  '梨': 'pear',
};
const convert = OpenCC.CustomConverter(dict);
console.log(convert('香蕉 蘋果 梨'));
// outputs: banana apple pear
```

## DOM operation

```javascript
((async () => {
  const convert = await OpenCC.Converter('hk', 'cn');
  const startNode = document.documentElement; // Convert the whole page
  const HTMLConvertHandler = OpenCC.HTMLConverter(convert, startNode, 'zh-HK', 'zh-CN'); // Convert all zh-HK to zh-CN
  HTMLConvertHandler.convert(); // Start conversion
  HTMLConvertHandler.restore(); // Restore
})());
```

The conversion is skipped if the class list of a node contains `ignore-opencc`. All child nodes of the node will not be converted.
