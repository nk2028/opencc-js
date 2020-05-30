# opencc-js [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

開放中文轉換 JavaScript 實現

## 用法

在 HTML 中引入：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.2.0"></script>
```

### 預設轉換器 `Converter`

```javascript
(async () => {
    const convert = await OpenCC.Converter('hk', 'cn');  // 初始化轉換器，香港繁體轉簡體
    console.log(convert('漢字'));
    // output: 汉字
})()
```

其中，第一個引數為源變體類型，第二個引數為目標變體類型。

兩個引數的可能取值如下：

- OpenCC 繁體：`t`
- 台灣繁體：`tw`
- 台灣繁體，台灣用詞：`twp`
- 香港繁體：`hk`
- 大陸簡體：`cn`
- 日本新字體：`jp`

香港繁體暫不支援詞彙轉換。

### 自訂轉換器 `CustomConverter`

```javascript
const convertTable = { '奇': '竒', '怪': '恠', '不怪': '不怪' };
const convert = OpenCC.CustomConverter(convertTable);
console.log(convert('奇怪，不怪'));
// output: 竒恠，不怪
```

### DOM 操作（暫未實現）

```javascript
const cc = await OpenCC.PresetConverter({ fromVariant: 'hk', toVariant: 'cn' });
const hc = OpenCC.HTMLConverter(cc);
hc.convert();  // 將整個頁面轉換為目標變體
hc.restore();  // 令整個頁面回到原貌
```

## 開源協議

MIT License.

詞庫來源 [nk2028/opencc-data](https://github.com/nk2028/opencc-data)，Apache 2.0 License。
