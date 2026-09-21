# opencc-js
[![npm package badge](https://badge.fury.io/js/opencc-js.svg)](https://www.npmjs.com/package/opencc-js)
[![GitHub Testing Badge](https://github.com/nk2028/opencc-js/workflows/Test/badge.svg)](https://github.com/nk2028/opencc-js/actions?query=workflow%3ATest)
[![jsDelivr Monthly Downloads Badge](https://data.jsdelivr.com/v1/package/npm/opencc-js/badge)](https://www.jsdelivr.com/package/npm/opencc-js)
[![Socket.dev Supply Chain Security Badge](https://badge.socket.dev/npm/package/opencc-js)](https://socket.dev/npm/package/opencc-js/)

[English](README.md) - [繁體版](README-zh-TW.md)

**开放中文转换（OpenCC）的纯 JavaScript 版本**

`opencc-js` 是面向浏览器和 Node.js 的 [OpenCC](https://github.com/BYVoid/OpenCC) 纯 JavaScript 实现。它会在构建时打包从 [`opencc-data`](https://github.com/nk2028/opencc-data) 生成的字典数据，不需要 native binary。

转换流程已向官方 OpenCC 实现对齐，包括内置转换器的词组分词，并通过 upstream OpenCC test cases 和 golden outputs 验证。但它仍不保证对所有输入都与官方 OpenCC 产生完全相同的结果。

`opencc-js` 支持内置转换器使用的 OpenCC mmseg 风格分词，但不支持 jieba 等扩展分词算法。

> 注意：如需了解与 [`opencc`](https://www.npmjs.com/package/opencc) 和 [`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) package 的比较，请见下文。

## 数据

字典数据会在构建时从 [`opencc-data`](https://www.npmjs.com/package/opencc-data) 生成，并打包进发布 package。浏览器运行时不会额外下载字典文本文件。

为了避免在浏览器和系统字体中较常缺字的字符显示成豆腐块，`opencc-js` 不打包 OpenCC 的 `TSCharactersExt` tofu-risk 映射。因此，少数繁转简扩展字符转换会有意与 upstream OpenCC test data 不同。

## 使用

请选择适合当前环境的安装或加载方式。

> **重要：** 版本 `1.5.0-beta.0` 为预发布版，同步 `opencc-data` 1.5.0-beta.0，刷新生成的字典数据，并新增试验性的说文小篆入口 `seal.js`。

**为 Node.js 或 bundler 安装 opencc-js**

```sh
npm install opencc-js
```

ES modules:

```javascript
import OpenCC from 'opencc-js';
```

CommonJS:

```javascript
const OpenCC = require('opencc-js');
```

**在浏览器中使用 opencc-js**

自行托管的 ES module:

```html
<script type="module">
  import OpenCC from './dist/esm/full.js';

  const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  console.log(converter('汉语')); // 漢語
</script>
```

CDN ES module:

```html
<script type="module">
  // 请使用 https://www.npmjs.com/package/opencc-js 上的最新 stable 版本，或明确固定 1.5.0-beta.0
  import OpenCC from 'https://cdn.jsdelivr.net/npm/opencc-js@1.5.0-beta.0/dist/esm/full.js';

  const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  console.log(converter('汉语')); // 漢語
</script>
```

用于普通 script 标签的 UMD build:

```html
<!-- 请使用 https://www.npmjs.com/package/opencc-js 上的最新 stable 版本，或明确固定 1.5.0-beta.0 -->

<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.5.0-beta.0/dist/umd/full.js"></script>
```

**基本用法**

```javascript
// 将繁体中文（香港）转换为简体中文（中国大陆）
const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
console.log(converter('漢語')); // output: 汉语
```

**自定义转换器**

```javascript
const converter = OpenCC.CustomConverter([
  ['香蕉', 'banana'],
  ['蘋果', 'apple'],
  ['梨', 'pear'],
]);
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

或使用空格和竖线作为分隔符。

```javascript
const converter = OpenCC.CustomConverter('香蕉 banana|蘋果 apple|梨 pear');
console.log(converter('香蕉 蘋果 梨')); // output: banana apple pear
```

**添加字词**

* 使用较底层的 `ConverterFactory` 函数创建转换器。
* 通过 `Locale` 属性取得字典。

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn,                   // 简体中文（中国大陆）=> OpenCC 标准
  OpenCC.Locale.to.tw.concat([customDict]) // OpenCC 标准 => 繁体中文（台湾）+ 自定义字词
);
console.log(converter('悟空道：“师父又来了。怎么叫做‘水中捞月’？”'));
// output: 悟空道：「師父又來了。怎麼叫做『水中撈月』？」
```

下面的写法也会得到相同的结果，只是会多做一次转换。

```javascript
const customDict = [
  ['“', '「'],
  ['”', '」'],
  ['‘', '『'],
  ['’', '』'],
];
const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn, // 简体中文（中国大陆）=> OpenCC 标准
  OpenCC.Locale.to.tw,   // OpenCC 标准 => 繁体中文（台湾）
  [customDict]           // 繁体中文（台湾）=> 自定义字词
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
// 将所有 lang='zh-HK' 的元素转为 lang='zh-CN'
const HTMLConvertHandler = OpenCC.HTMLConverter(converter, rootNode, 'zh-HK', 'zh-CN');
HTMLConvertHandler.convert(); // 开始转换  -> 汉语
HTMLConvertHandler.restore(); // 复原      -> 漢語
```

**说文小篆（试验性功能，自 1.5.0 起）**

与说文小篆（Unicode 18.0 小篆区块 U+3D000–U+3FC3F）之间的转换不包含在 `full.js` 中，而是由独立的 `seal.js` 入口（约 230 KB）提供，不需要的用户不会多下载任何内容。它的 `Converter` 只提供三种模式，与上游 OpenCC 配置一一对应：

| opencc-js options | OpenCC config | 转换 |
|---|---|---|
| `{ from: 'cn', to: 'seal' }` | `s2seal` | 简体中文到说文小篆 |
| `{ from: 't', to: 'seal' }` | `t2seal` | 繁体中文（OpenCC 标准）到说文小篆 |
| `{ from: 'seal', to: 't' }` | `seal2t` | 说文小篆到繁体中文（OpenCC 标准） |

Node.js 或打包工具（ES modules 或 CommonJS）：

```javascript
import * as OpenCCSeal from 'opencc-js/seal';
// const OpenCCSeal = require('opencc-js/seal');

const s2seal = OpenCCSeal.Converter({ from: 'cn', to: 'seal' });
console.log(s2seal('说文解字')); // output: 𽛛𾧆𽳮𿮵

const t2seal = OpenCCSeal.Converter({ from: 't', to: 'seal' });
console.log(t2seal('天地玄黃，宇宙洪荒')); // output: 𽀃𿡚𽭝𿤶，𾒶𾓼𾿼𽉲

const seal2t = OpenCCSeal.Converter({ from: 'seal', to: 't' });
console.log(seal2t('𽛛𾧆𽳮𿮵')); // output: 說文解字
```

没有对应小篆的字符、标点和非中文文本保持不变：

```javascript
console.log(s2seal('Hello 你们好')); // output: Hello 你們𿒛
```

其他组合会直接报错，而不会用其他字典串接：

```javascript
OpenCCSeal.Converter({ from: 'seal', to: 'cn' }); // 抛出 Error: Unsupported conversion: from `seal` to `cn`
```

`seal.js` 只包含小篆字典，核心代码和共用的简转繁字典从 `full.js` 加载。在浏览器中作为 ES module 使用时，它会自动导入同目录下的 `full.js`：

```html
<script type="module">
  import * as OpenCCSeal from 'https://cdn.jsdelivr.net/npm/opencc-js@1.5.0-beta.0/dist/esm/seal.js';

  const converter = OpenCCSeal.Converter({ from: 't', to: 'seal' });
  console.log(converter('說文解字')); // 𽛛𾧆𽳮𿮵
</script>
```

使用 script 标签时，请先加载 `full.js`，再加载 `seal.js`，后者以全局变量 `OpenCCSeal` 提供：

```html
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.5.0-beta.0/dist/umd/full.js"></script>
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.5.0-beta.0/dist/umd/seal.js"></script>
<script>
  const converter = OpenCCSeal.Converter({ from: 'seal', to: 't' });
</script>
```

`OpenCCSeal` 同样提供 `CustomConverter`、`HTMLConverter` 等函数，因此小篆转换器可以像其他转换器一样配合 `HTMLConverter` 使用。显示转换结果需要支持 Unicode 18.0 小篆区块的字体。

## API

* `.Converter({})`：通过 locale 声明转换方向。
  * 默认值：`{ from: 'tw', to: 'cn' }`
  * 语法：`{ from: locale1, to: locale2 }`
* locales：用字母代码定义书写地区，有时也包含该地区的惯用词汇。
  * `cn`：简体中文（中国大陆）
  * `tw`：繁体中文（台湾）
    * `twp`：且转换词汇（例如：自行車 -> 腳踏車）
  * `hk`：繁体中文（香港）
    * `hkp`：且转换香港词汇（例如：鼠标 -> 滑鼠）
  * `jp`：日本新字体
  * `seal`：说文小篆，使用小篆码位 U+3D000–U+3FC3F 编码，需要支持该码位范围的字体才能显示。仅通过独立的 `seal.js` 入口提供（见上文）。
  * `t`：繁体中文（[OpenCC 标准繁体](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md)），主要适合作为中间形态

除非明确需要 [OpenCC 标准繁体](https://github.com/BYVoid/OpenCC/blob/master/DESIGN_PRINCIPLES.md) 作为中间形态，否则不建议把 `to: 't'` 作为面向用户展示的目标。多数场景应优先使用 `tw`、`twp`、`hk` 或 `hkp` 等地区输出。

| opencc-js options | OpenCC config | 说明 |
|---|---|---|
| `{ from: 'cn', to: 'tw' }` | `s2tw` | 推荐：简体中文到台湾繁体。 |
| `{ from: 'cn', to: 'twp' }` | `s2twp` | 推荐：简体中文到台湾繁体，并转换台湾常用词。 |
| `{ from: 'cn', to: 'hk' }` | `s2hk` | 推荐：简体中文到香港繁体。 |
| `{ from: 'cn', to: 'hkp' }` | `s2hkp` | 简体中文到香港繁体，并转换香港常用词。该短语字典仍在开发中，目前词组不多，请谨慎使用。 |
| `{ from: 't', to: 'cn' }` | `t2s` | 推荐：通用繁体中文到简体中文。 |
| `{ from: 'tw', to: 'cn' }` | `tw2s` | 推荐：台湾繁体到简体中文。 |
| `{ from: 'twp', to: 'cn' }` | `tw2sp` | 推荐：台湾繁体词汇到简体中文。 |
| `{ from: 'hk', to: 'cn' }` | `hk2s` | 推荐：香港繁体到简体中文。 |
| `{ from: 'hkp', to: 'cn' }` | `hk2sp` | 香港繁体词汇到简体中文。该短语字典仍在开发中，目前词组不多，请谨慎使用。 |
| `{ from: 'cn', to: 't' }` | `s2t` | 高级用法：简体中文到 OpenCC 标准繁体，通常不是最佳的用户展示 locale。 |
| `{ from: 't', to: 'tw' }` | `t2tw` | 高级用法：OpenCC 标准繁体到台湾繁体。 |
| `{ from: 't', to: 'hk' }` | `t2hk` | 高级用法：OpenCC 标准繁体到香港繁体。 |
| `{ from: 'tw', to: 't' }` | `tw2t` | 高级用法：台湾繁体到 OpenCC 标准繁体。 |
| `{ from: 'hk', to: 't' }` | `hk2t` | 高级用法：香港繁体到 OpenCC 标准繁体。 |
| `{ from: 'jp', to: 't' }` | `jp2t` | 试验性功能：日本新字体到 OpenCC 标准繁体，不建议用于生产环境。 |
| `{ from: 't', to: 'jp' }` | `t2jp` | 试验性功能：OpenCC 标准繁体到日本新字体，不建议用于生产环境。 |
| `{ from: 'cn', to: 'seal' }` | `s2seal` | 试验性功能，仅 `seal.js`：简体中文到说文小篆。没有对应小篆的字符保持不变。 |
| `{ from: 't', to: 'seal' }` | `t2seal` | 试验性功能，仅 `seal.js`：OpenCC 标准繁体到说文小篆。 |
| `{ from: 'seal', to: 't' }` | `seal2t` | 试验性功能，仅 `seal.js`：说文小篆到 OpenCC 标准繁体。 |

* `.CustomConverter([])`：定义自定义字典。
  * 默认值：`[]`
  * 语法：`[  ['item1','replacement1'], ['item2','replacement2'], ... ]`
* `.HTMLConverter(converter, rootNode, langAttrInitial, langAttrNew )`：使用先前定义的 converter()，从起始 root node 向下转换所有 HTML 元素的文本内容为目标 locale。也会把所有现有 `langAttrInitial` 的 `lang` 属性转换为 `langAttrNew`，并转换 `placeholder` 和 `aria-label` 属性。
* `lang` 属性：HTML 属性，用于在开始时（`langAttrInitial`）以及转换后（`langAttrNew`）向浏览器定义文本内容的语言。
  * 语法约定：[IETF language codes](https://www.w3.org/International/articles/bcp47/#macro)，主要是 `zh-TW`、`zh-HK`、`zh-CN`、`zh-SG` 等。
* `ignore-opencc`：HTML class，表示该元素及其所有子节点不会被转换。

## 打包优化

* Tree Shaking（仅 ES Modules）可以减小 bundle 文件大小。
* 使用 `ConverterFactory` 替代 `Converter`。
* 除非明确需要 OpenCC 标准繁体，否则建议优先输出到 `tw` 或 `hk` 等地区字典，而不是 `to: 't'`。

```javascript
import * as OpenCC from 'opencc-js/core'; // 核心代码
import * as Locale from 'opencc-js/preset'; // 字典

const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
console.log(converter('漢語'));
```

## 不同 [`opencc`](https://www.npmjs.com/package/opencc) npm package 的区别

OpenCC 转换相关的 npm package 主要有三个。它们在运行环境、实现方式和分词支持上有所不同。

[`opencc-js`](https://www.npmjs.com/package/opencc-js) 是面向浏览器和 Node.js 的纯 JavaScript 实现。它会在构建时打包从 `opencc-data` 生成的字典数据，不需要 native binary，也不会在运行时下载字典文件。它的转换流程已向官方 OpenCC 实现对齐，包括内置转换器的 mmseg 风格词组分词，并通过 upstream OpenCC test cases 和 golden outputs 验证。但它仍不保证对所有输入都与官方 OpenCC 产生完全相同的结果。不支持 Jieba 等扩展分词算法。

[`opencc`](https://www.npmjs.com/package/opencc) 是官方 OpenCC C++ 项目的 Node.js native binding。它依赖 native 或 prebuilt binary，并跟随官方 OpenCC 引擎。在官方 OpenCC 配置和运行环境支持时，它可以使用 Jieba 等扩展分词算法。

`opencc-js` 与 `opencc` 的 API 形态也不同：`opencc-js` 使用工厂函数（`OpenCC.Converter({ from, to })`、`ConverterFactory`、`Locale`）返回一个普通的转换函数，而 `opencc` 提供一个 class（`new OpenCC(config, options)`），并带有 `convertSync`/`convert`/`convertPromise` 方法。这个差异从 `opencc-js` 早于 `opencc` 当前 API 存在时就已如此，`opencc-js` 不会跟随它变化。特别是 `opencc` 新增的 `OpenCC.fromConfig()`（从 inline OpenCC 配置对象构建转换器）是 native `opencc` 专属能力；`opencc-js` 用自己的 `ConverterFactory`/`CustomConverter` API 覆盖同样的自定义转换需求。

[`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) 是另一个可在浏览器中使用的 WebAssembly 实现。它的配置和转换逻辑与官方 `opencc` package 对齐，并可通过官方 OpenCC runtime 支持 Jieba 分词。

| | [`opencc-js`](https://www.npmjs.com/package/opencc-js) | [`opencc`](https://www.npmjs.com/package/opencc) | [`opencc-wasm`](https://www.npmjs.com/package/opencc-wasm) |
|---|---|---|---|
| 浏览器 | ✅ | ❌ | ✅ |
| Node.js | ✅ | ✅ | ✅ |
| 实现方式 | 纯 JavaScript | Native C++ binding | WebAssembly |
| 需要 native binary | ❌ | ✅ | ❌ |
| 字典来源 | 构建时打包 | 运行时加载 | 运行时加载 |
| 与官方 OpenCC 对齐 | 近似 | ✅ | ✅ |
| mmseg 分词 | ✅ | ✅ | ✅ |
| 可使用 Jieba 分词 | ❌ | ✅ | ✅ |
