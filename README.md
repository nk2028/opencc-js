# opencc-js [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

[English](README-en.md)

開放中文轉換 JavaScript 實現

## 引入

在 HTML 中引入：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.3.7"></script>
```

或在 Node.js 中引入：

```sh
npm install opencc-js
```

```javascript
const OpenCC = require('opencc-js');
```

## 使用

```javascript
OpenCC.Converter('hk', 'cn')  // 香港繁體轉簡體
.then(convert => console.log(convert('漢字，簡體字')));  // output: 汉字，简体字
```

引數 1 為源變體類型，引數 2 為目標變體類型。兩個引數的可能取值如下：

- OpenCC 繁體：`t`
- 台灣繁體：`tw`
- 台灣繁體，台灣用詞：`twp`
- 香港繁體：`hk`
- 大陸簡體：`cn`
- 日本新字體：`jp`

香港繁體暫不支援用詞轉換。

## 自訂轉換器

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

## DOM 操作

```javascript
((async () => {
  const convert = await OpenCC.Converter('hk', 'cn');
  const startNode = document.documentElement; // 轉換整個頁面
  const HTMLConvertHandler = OpenCC.HTMLConverter(convert, startNode, 'zh-HK', 'zh-CN'); // 將所有 zh-HK 標籤轉為 zh-CN 標籤
  HTMLConvertHandler.convert(); // 開始轉換
  HTMLConvertHandler.restore(); // 回到原貌
})());
```

class list 包含 `ignore-opencc` 的元素會跳過後續的轉換，該節點的所有子節點都不會被轉換。
