# opencc2-js [![JSDelivr badge](https://data.jsdelivr.com/v1/package/npm/opencc2/badge)](https://www.jsdelivr.com/package/npm/opencc2)

JavaScript implementation of OpenCC 2

## Usage

HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/opencc2/index.min.js"></script>
```

JavaScript:

```javascript
(async () => {
	const cc = await OpenCC2.Converter.create({ from_variant: 'hk', to_variant: 'cn' });
	console.log(cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置'));
})();
// ouptput: 政府初步倾向试验为绿色专线小巴设充电装置
```

## API

`OpenCC2.Converter.create(config)`:

`config` is a JavaScript Object which contains `from_variant` and `to_variant`.

Possible values are: `cn`, `hk`, `tw` and `t`. `t` stands for Traditional Chinese (OpenCC 2 standard).
