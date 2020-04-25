# opencc-js [![JSDelivr badge](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

N.B.: This project is **NOT** ready for production!

JavaScript implementation of OpenCC

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@0.1.0"></script>
```

## API Examples

### `PresetConverter`

```javascript
(async () => {
	const cc = await OpenCC.PresetConverter({ fromVariant: 'hk', toVariant: 'cn' });
	console.log(cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置'));
})();
// output: 政府初步倾向试验为绿色专线小巴设充电装置
```

Possible values are: `cn`, `hk`, `tw` and `t`.

`t` stands for Traditional Chinese (OpenCC standard).

### `CustomConverter`

```javascript
const convertTable = { '法': '灋', '吃': '喫', '口吃': '口吃', '一口吃個大胖子': '一口喫個大胖子' };
const cc = OpenCC.CustomConverter(convertTable);
console.log(cc.convert('飲食法吃出漂亮血脂成績單'));
// output: 飲食灋喫出漂亮血脂成績單
```

TODO: 加入操作 DOM 的 API。

## License

Source code (in this project) is distributed under MIT License.

Dictionary data is located at [ngkhyen2028/opencc-data](https://github.com/ngkhyen2028/opencc-data), which follows the Apache 2.0 License.
