# opencc-js ![](https://github.com/nk2028/opencc-js/workflows/Node.js%20CI/badge.svg?branch=master) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

Pure JavaScript implementation of OpenCC | 開放中文轉換 JavaScript 實現

## 引入

在 HTML 中引入：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.2.1"></script>
```

或在 Node.js 中引入：

```javascript
const OpenCC = require('opencc');
```

## 使用

[JSFiddle Demo](https://jsfiddle.net/AyakaMikazuki/t9sv48f1/)

```javascript
(async () => {
    const convert = await OpenCC.Converter('hk', 'cn');  // 香港繁體轉簡體
    console.log(convert('漢字'));  // output: 汉字
    console.log(convert('簡體字'));  // output: 简体字
})()
```

引數 1 為源變體類型，引數 2 為目標變體類型。兩個引數的可能取值如下：

- OpenCC 繁體：`t`
- 台灣繁體：`tw`
- 台灣繁體，台灣用詞：`twp`
- 香港繁體：`hk`
- 大陸簡體：`cn`
- 日本新字體：`jp`

香港繁體暫不支援用詞轉換。

## 自訂轉換器 `CustomConverter`

```javascript
const convertTable = { '奇': '竒', '怪': '恠', '不怪': '不怪' };
const convert = OpenCC.CustomConverter(convertTable);
console.log(convert('奇怪，不怪'));
// output: 竒恠，不怪
```

## DOM 操作

```javascript
(async () => {
    const convert = await OpenCC.Converter('hk', 'cn');
    const startNode = document.documentElement;  // 轉換整個頁面
    const HTMLConvertHandler = OpenCC.HTMLConverter(convert, startNode, 'zh-HK', 'zh-CN');  // 將所有 zh-HK 標籤轉為 zh-CN 標籤
    HTMLConvertHandler.convert();  // 開始轉換
    HTMLConvertHandler.restore();  // 回到原貌
})()
```
