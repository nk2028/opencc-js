# opencc-js [![JSDelivr badge](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

N.B.: This project is **NOT** ready for production!

Pure JavaScript implementation of OpenCC | 開放中文轉換 JavaScript 實現

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.1.1"></script>
```

## Examples

### 預設轉換器 `PresetConverter`

```javascript
(async () => {
	const cc = await OpenCC.PresetConverter({ fromVariant: 'hk', toVariant: 'cn' });
	console.log(cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置'));
})();
// output: 政府初步倾向试验为绿色专线小巴设充电装置
```

其中，`fromVariant` 與 `toVariant` 兩個字段爲必填項，可能的取值如下：

- `t`: Traditional Chinese (OpenCC Standard)
- `hk`: Traditional Chinese (Hong Kong)
- `tw`: Traditional Chinese (Taiwan)
- `twp`: Traditional Chinese (Taiwan, with phrases)
- `cn`: Simplified Chinese (Mainland China)

Currently Hong Kong phrases are not supported, so there is no `hkp` currently.

### 自訂轉換器 `CustomConverter`

```javascript
const convertTable = { '法': '灋', '吃': '喫', '口吃': '口吃', '一口吃個大胖子': '一口喫個大胖子' };
const cc = OpenCC.CustomConverter(convertTable);
console.log(cc.convert('飲食法吃出漂亮血脂成績單'));
// output: 飲食灋喫出漂亮血脂成績單
```

### DOM 操作

TODO: 加入操作 DOM 的 API。

## License

Source code (in this project) is distributed under MIT License.

Dictionary data is located at [ngkhyen2028/opencc-data](https://github.com/ngkhyen2028/opencc-data), which follows the Apache 2.0 License.
