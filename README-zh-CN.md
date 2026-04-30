# opencc-js [![](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js) [![](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest) [![](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)

开放中文转换 JavaScript 版

字典数据会在构建时从 `opencc-data` 生成，并打包进发布文件。浏览器运行时不会额外下载字典 txt 文件。

## 加载

**在 HTML 中加载**

加载以下 `script` 标签（择一即可）：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.3.0/dist/umd/full.js"></script>     <!-- 完全版 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.3.0/dist/umd/cn2t.js"></script>     <!-- 只需要简转繁时 -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.3.0/dist/umd/t2cn.js"></script>     <!-- 只需要繁转简时 -->
```

自行托管的话，除了使用原先的 umd，也可以使用 es module

```html
<script type="module">
  import * as OpenCC from './dist/esm/full.js'; // 完全版
  import * as OpenCC from './dist/esm/cn2t.js'; // 只需要简转繁
  import * as OpenCC from './dist/esm/t2cn.js'; // 只需要繁转简
</script>
```

**在 Node.js 中加载**

```sh
npm install opencc-js
```

CommonJS

```javascript
const OpenCC = require('opencc-js');
```

ES Modules

```javascript
import * as OpenCC from 'opencc-js';
```

## 使用

**基本用法**

```javascript
// 将繁体中文（香港）转换为简体中文（中国大陆）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
console.log(converter('漢語')); // output: 汉语
```

- `cn`: 简体中文（中国大陆）
- `tw`: 繁体中文（台湾）
    - `twp`: 且转换词汇（例如：自行車 -> 腳踏車）
- `hk`: 繁体中文（香港）
- `jp`: 日本新字体
- `t`: 繁体中文（[OpenCC 标准繁体](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md)。多数场景建议优先使用 `tw` 或 `hk` 等地区 locale）

**自订转换器**

```javascript
const converter = OpenCC.CustomConverter([
  ['香蕉', 'banana'],
  ['蘋果', 'apple'],
  ['梨', 'pear'],
]);
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

或以「空白」及「|」当作分隔符号

```javascript
const converter = OpenCC.CustomConverter('香蕉 banana|蘋果 apple|梨 pear');
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**添加字词**

* `ConverterFactory` 是比较底层的函数，`Converter` 及 `CustomConverter` 都是这个函数的再包装。
* 透过 `Locale` 属性可以得到原本的字典，进而添加字词。

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn,                   // 中国大陆 => OpenCC 标准
  OpenCC.Locale.to.tw.concat([customDict]) // OpenCC 标准 => 台湾+自订
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

下面的写法也会得到相同的结果，只是内部会多做一次转换

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn, // 中国大陆 => OpenCC 标准
  OpenCC.Locale.to.tw,   // OpenCC 标准 => 台湾
  [customDict]           // 台湾 => 自订
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

**DOM 操作**

HTML 属性 `lang='*'` 定义了目标。

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
HTMLConvertHandler.convert(); // 开始转换  -> 汉语
HTMLConvertHandler.restore(); // 复原      -> 漢語
```

class list 包含 `ignore-opencc` 的标签不会被转换（包括该标签的所有子节点）。

`HTMLConverter` 也会转换 `placeholder` 和 `aria-label` 属性。

## 打包优化

如果使用 rollup 等工具打包程式码，以下方式能让打包工具自动移除用不到的部分，减少档案大小。

如果只需要单一转换方向，也可以直接引入 `opencc-js/cn2t` 或 `opencc-js/t2cn`。

```javascript
import * as OpenCC from 'opencc-js/core'; // 核心程式码
import * as Locale from 'opencc-js/preset'; // 字典资料

const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
console.log(converter('漢語'));
```

备注：

* 由于这是利用 Tree Shaking，所以必须使用 ES Modules
* 在这个模式之下，没有 `Converter` 函式，必须直接使用 `ConverterFactory`

## 与 [`opencc`](https://www.npmjs.com/package/opencc) npm package 的区别

[`opencc`](https://www.npmjs.com/package/opencc) npm package 是官方 OpenCC C++ 项目的 Node.js native binding，主要用于 Node.js，依赖 native 或 prebuilt binary，并跟随官方 OpenCC 引擎。

[`opencc-js`](https://www.npmjs.com/package/opencc-js) npm package 是面向浏览器和 Node.js 的纯 JavaScript 实现。它打包了从 `opencc-data` 生成的字典数据，因此不需要 native binary，也不会在运行时下载字典 txt 文件。

[`opencc-js`](https://www.npmjs.com/package/opencc-js) 不是官方 C++ OpenCC 算法的完整移植。它使用 JavaScript trie 和字典 pipeline，并通过 upstream OpenCC test cases 验证，但不应视为对所有输入都与官方 OpenCC bit-for-bit 等价。

[`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) npm package 是另一个能在浏览器中使用的实现。它使用 WebAssembly，配置和转换逻辑与官方 [`opencc`](https://www.npmjs.com/package/opencc) package 对齐。
