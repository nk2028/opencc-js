# opencc2-js

JavaScript implementation of OpenCC 2

## Usage

```javascript
>>> cc = await Converter.create({ from_variant: 'hk', to_variant: 'cn' });
>>> cc.convert('政府初步傾向試驗為綠色專線小巴設充電裝置')
"政府初步倾向试验为绿色专线小巴设充电装置"
```
