# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

开放中文转换 JavaScript 版

## 加载

**在 HTML 中加载**

依次加载以下四个 `script` 标签：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/data.min.js"></script>        <!-- 必须加载 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/data.cn2t.min.js"></script>    <!-- 需要简转繁时 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/data.t2cn.min.js"></script>    <!-- 需要繁转简时 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.1/bundle-browser.min.js"></script><!-- 必须加载 -->
```

**在 Node.js 中加载**

```sh
npm install opencc-js
```

```javascript
const OpenCC = require('opencc-js');
```

## 使用

**基本用法**

```javascript
// 将繁体中文（香港）转换为简体中文（中国大陆）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
console.log(converter('漢字，簡體字')); // output: 汉字，简体字
```

- `cn`: 简体中文（中国大陆）
- `tw`: 繁体中文（台湾）
  - `twp`: 且转换词汇.
- `hk`: 繁体中文（香港）
- `jp`: 日本新字体
- `t`: 繁体中文（OpenCC 标准。除非你知道自己在做什么，否则请勿使用）

**自订转换器**

```javascript
const converter = OpenCC.CustomConverter([
  ['香蕉', 'banana'],
  ['蘋果', 'apple'],
  ['梨', 'pear'],
]);
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**DOM 操作**

HTML属性`lang='*'`定义了目标。
```html
<span lang="zh-HK">漢語</span>
```

```javascript
// 将繁体中文（香港）转换为简体中文（中国大陆）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
// 设置转换起点为根节点，即转换整个页面
const rootNode = document.documentElement;
// 将所有 zh-HK 标签转为 zh-CN 标签
const HTMLConvertHandler = OpenCC.HTMLConverter(converter, rootNode, 'zh-HK', 'zh-CN');
HTMLConvertHandler.convert();// 开始转换  -> 汉语 
HTMLConvertHandler.restore();// 复原     -> 漢語
```

class list 包含 `ignore-opencc` 的标签不会被转换（包括该标签的所有子节点）。
