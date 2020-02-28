# opencc2-js [![JSDelivr badge](https://data.jsdelivr.com/v1/package/npm/opencc2/badge)](https://www.jsdelivr.com/package/npm/opencc2)

JavaScript implementation of OpenCC 2

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/opencc2@0.1.1"></script>
```

## API Examples

### `PresetConverter`

```javascript
(async () => {
	const cc = await OpenCC2.PresetConverter({ fromVariant: 'hk', toVariant: 'cn' });
	console.log(cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置'));
})();
// output: 政府初步倾向试验为绿色专线小巴设充电装置
```

Possible values are: `cn`, `hk`, `tw` and `t`.

`t` stands for Traditional Chinese (OpenCC 2 standard).

### `CustomConverter`

```javascript
const convertTable = { '法': '灋', '吃': '喫', '口吃': '口吃', '一口吃個大胖子': '一口喫個大胖子' };
const cc = OpenCC2.CustomConverter(convertTable);
console.log(cc.convert('飲食法吃出漂亮血脂成績單'));
// output: 飲食灋喫出漂亮血脂成績單
```

### `convertHTML`

This function applies on an HTML node and all its child nodes.

Input:

```html
<!DOCTYPE html>
<html lang="zh-HK">
<head>
<meta charset="utf-8"/>
<script src="https://cdn.jsdelivr.net/npm/opencc2@0.1.1"></script>
<script>
window.addEventListener('DOMContentLoaded', async () => {
  await OpenCC2.convertHTML(document.documentElement, 'hk', 'cn', 'zh-HK', 'zh-CN');
});
</script>
</head>
<body lang="en-US">
  <p>日本大阪環球影城宣布，因應新型肺炎疫情，（此行不轉換）</p>
  <p lang="zh-HK">由明天起暫停營業，直至下月15日。（此行轉換）</p>
  <div lang="zh-HK">
    <p>較早前東京迪士尼樂園與東京迪士尼海洋亦宣布，（此行轉換）</p>
    <p lang="en-US">明日起關閉樂園兩星期，暫定3月16日開園。（此行不轉換）</p>
  </div>
</body>
</html>
```

Loaded result:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>...</head>
<body lang="en-US">
  <p>日本大阪環球影城宣布，因應新型肺炎疫情，（此行不轉換）</p>
  <p lang="zh-CN">由明天起暂停营业，直至下月15日。（此行转换）</p>
  <div lang="zh-CN">
    <p>较早前东京迪士尼乐园与东京迪士尼海洋亦宣布，（此行转换）</p>
    <p lang="en-US">明日起關閉樂園兩星期，暫定3月16日開園。（此行不轉換）</p>
  </div>
</body>
</html>
```

Explanation:

```javascript
OpenCC2.convertHTML(document.documentElement, 'hk', 'cn', 'zh-HK', 'zh-CN');
```

第一個參數為要應用的節點。該函數會遞歸地遍歷該節點與其子節點。`document.documentElement` 表示文檔的根節點，即轉換整個頁面。

第二個參數為 `fromVariant`，第三個參數為 `toVariant`，參數的取值如上所述。

第四個參數為原 lang 標籤。僅當節點的 lang 與之相等時纔會觸發轉換。

第五個參數為目標 lang 標籤。當節點設置了 lang 標籤，且節點的 lang 與原 lang 標籤相等時，將節點的 lang 標籤改為目標 lang 標籤。
