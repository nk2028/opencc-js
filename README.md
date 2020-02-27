# opencc2-js

JavaScript implementation of OpenCC 2

## Usage

```javascript
>>> cc = await OpenCC2.Converter.create({ from_variant: 'hk', to_variant: 'cn' });
>>> cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置')
"政府初步倾向试验为绿色专线小巴设充电装置"
```

## API

`OpenCC2.Converter.create(config)`:

`config` is a JavaScript Object which contains `from_variant` and `to_variant`.

Possible values are: `cn`, `hk`, `tw` and `t`. `t` stands for Traditional Chinese (OpenCC 2 standard).
