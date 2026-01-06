# unplugin-webfont

> 🔤 通用字体转换工具，支持多种格式和文本子集化

[![npm version](https://img.shields.io/npm/v/unplugin-webfont.svg)](https://www.npmjs.com/package/unplugin-webfont)
[![License](https://img.shields.io/npm/l/unplugin-webfont.svg)](https://github.com/yourusername/unplugin-webfont/blob/main/LICENSE)

## ✨ 特性

- 🔄 **多格式支持** - 输入: TTF、OTF、WOFF、WOFF2；输出: WOFF2、WOFF、TTF
- ✂️ **文本子集化** - 只打包需要的文字，大幅减小文件体积
- 🔌 **unplugin框架** - 支持 Vite、Webpack、Rollup 等多种构建工具
- 💻 **CLI工具** - 命令行快速转换
- 🎨 **可视化界面** - Web UI 图形化操作
- ⚡ **性能优化** - 生成现代Web字体格式，优化加载速度

## 📦 安装

```bash
npm install unplugin-webfont -D
# 或
pnpm add unplugin-webfont -D
# 或
yarn add unplugin-webfont -D
```

## 🚀 使用方法

### 1. 作为构建工具插件

#### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import WebFont from 'unplugin-webfont/vite'

export default defineConfig({
  plugins: [
    WebFont({
      include: './fonts/*.ttf',
      text: '你好世界Hello World',
      formats: ['woff2', 'woff'],
      outputDir: 'public/fonts',
      cssOutput: true
    })
  ]
})
```

#### Webpack

```javascript
// webpack.config.js
const WebFont = require('unplugin-webfont/webpack')

module.exports = {
  plugins: [
    WebFont({
      include: './fonts/*.ttf',
      text: '你好世界',
      formats: ['woff2', 'woff']
    })
  ]
}
```

#### Rollup

```javascript
// rollup.config.js
import WebFont from 'unplugin-webfont/rollup'

export default {
  plugins: [
    WebFont({
      include: './fonts/*.ttf',
      text: '你好世界'
    })
  ]
}
```

### 2. 作为CLI工具

#### 转换字体格式

```bash
# 基础转换
webfont convert input.ttf -o output/

# 指定输出格式
webfont convert input.ttf --formats woff2,woff -o output/

# 生成CSS文件
webfont convert input.ttf -o output/ -c --font-family MyFont
```

#### 创建字体子集

```bash
# 指定文本
webfont subset input.ttf -t "你好世界" -o output/

# 从文件读取文本
webfont subset input.ttf -f text.txt -o output/

# 同时指定格式和CSS
webfont subset input.ttf -t "Hello" --formats woff2,woff -c
```

#### 查看字体信息

```bash
webfont info input.ttf
```

#### 启动可视化界面

```bash
webfont serve
# 或指定端口
webfont serve -p 8080 --open
```

### 3. 可视化界面

启动Web UI后，可以通过浏览器进行以下操作：

1. 📤 **上传字体文件** - 支持拖拽上传
2. ✏️ **输入文字** - 指定要包含的字符
3. ⚙️ **配置选项** - 选择输出格式、字体名称等
4. 👁️ **预览效果** - 实时查看字体信息
5. 💾 **下载结果** - 单独或批量下载转换后的文件

## ⚙️ 配置选项

### 插件选项

```typescript
interface WebFontPluginOptions {
  /** 字体文件路径（支持glob模式） */
  include?: string | string[]
  
  /** 要包含的文字 */
  text?: string
  
  /** 从文件读取文字 */
  textFile?: string
  
  /** 输出格式 */
  formats?: ('woff' | 'woff2' | 'ttf')[]
  
  /** 输出目录 */
  outputDir?: string
  
  /** 是否生成CSS文件 */
  cssOutput?: boolean | string
  
  /** 字体名称 */
  fontFamily?: string
  
  /** 字体粗细 */
  fontWeight?: number
  
  /** 字体样式 */
  fontStyle?: string
  
  /** 字体显示策略 */
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}
```

### CLI选项

```bash
webfont convert <input> [options]
  -o, --output <dir>           输出目录 (默认: output)
  --formats <formats>          输出格式 (默认: woff2,woff)
  --font-family <name>         字体名称
  -c, --css                    生成CSS文件

webfont subset <input> [options]
  -t, --text <text>            要包含的文字
  -f, --text-file <file>       从文件读取文字
  -o, --output <dir>           输出目录 (默认: output)
  --formats <formats>          输出格式 (默认: woff2,woff)
  --font-family <name>         字体名称
  -c, --css                    生成CSS文件

webfont info <input>           查看字体信息

webfont serve [options]        启动可视化界面
  -p, --port <port>            端口号 (默认: 3000)
  --open                       自动打开浏览器
```

## 📖 使用示例

### 示例1: 中文字体子集化

```typescript
// vite.config.ts
import WebFont from 'unplugin-webfont/vite'

export default {
  plugins: [
    WebFont({
      include: './fonts/SourceHanSans.ttf',
      // 只包含网站使用的汉字
      text: '欢迎使用字体转换工具',
      formats: ['woff2'],
      outputDir: 'public/fonts',
      cssOutput: true,
      fontFamily: 'Source Han Sans'
    })
  ]
}
```

生成的CSS：

```css
@font-face {
  font-family: 'Source Han Sans';
  src: url('./SourceHanSans.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 示例2: 批量处理多个字体

```typescript
// vite.config.ts
import WebFont from 'unplugin-webfont/vite'

export default {
  plugins: [
    WebFont({
      include: './fonts/*.{ttf,otf}',
      textFile: './chars.txt', // 从文件读取常用字符
      formats: ['woff2', 'woff'],
      outputDir: 'dist/fonts'
    })
  ]
}
```

### 示例3: 不同粗细的字体家族

```bash
# Regular
webfont subset font-regular.ttf -t "文字" -o dist/ --font-family MyFont

# Bold
webfont subset font-bold.ttf -t "文字" -o dist/ --font-family MyFont
```

## 🎯 最佳实践

### 1. 字体子集化

对于中文字体（通常几MB甚至几十MB），**强烈建议**使用子集化功能：

```typescript
WebFont({
  include: './fonts/chinese-font.ttf',
  text: '网站实际使用的所有文字...',
  formats: ['woff2'] // WOFF2压缩率最高
})
```

### 2. 格式选择

- **现代浏览器**: 只需 `woff2`
- **兼容旧浏览器**: `['woff2', 'woff']`
- **需要原始字体**: `['woff2', 'woff', 'ttf']`

### 3. 字体加载优化

生成的CSS使用 `font-display: swap`，避免FOIT（Flash of Invisible Text）：

```css
@font-face {
  font-family: 'MyFont';
  src: url('./font.woff2') format('woff2');
  font-display: swap; /* 立即显示后备字体 */
}
```

### 4. 配置文件

创建 `webfont.config.js` 统一管理配置：

```javascript
export default {
  include: './fonts/**/*.{ttf,otf}',
  textFile: './common-chars.txt',
  formats: ['woff2', 'woff'],
  outputDir: 'dist/fonts',
  cssOutput: true,
  fontDisplay: 'swap'
}
```

## 🔧 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/unplugin-webfont.git
cd unplugin-webfont

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 启动UI开发服务器
pnpm dev:ui
```

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

[MIT](./LICENSE) License © 2024

## 🙏 致谢

- [fontkit](https://github.com/foliojs/fontkit) - 字体解析
- [fontmin](https://github.com/ecomfe/fontmin) - 字体子集化
- [unplugin](https://github.com/unjs/unplugin) - 统一插件框架
- [opentype.js](https://github.com/opentypejs/opentype.js) - OpenType字体处理

## ❓ 常见问题

### Q: 支持哪些字体格式？

A: 输入支持 TTF、OTF、WOFF、WOFF2；输出支持 WOFF2、WOFF、TTF。

### Q: 子集化后字体还能正常显示吗？

A: 是的，只要包含了需要显示的字符。建议收集网站所有使用的文字。

### Q: 转换速度如何？

A: 小字体（几百KB）几乎瞬间完成；大字体（几MB）可能需要几秒钟。子集化会显著提升速度。

### Q: 生成的WOFF2文件比WOFF还大？

A: 极少数情况下会发生，这时可以只使用WOFF格式。

### Q: 如何在CSS中使用生成的字体？

A: 如果开启了 `cssOutput`，会自动生成CSS文件。或者手动引入：

```css
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/font.woff2') format('woff2'),
       url('./fonts/font.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'MyFont', sans-serif;
}
```

## 🏗️ 项目架构

```
src/
├── cli/                    # CLI 命令实现
│   ├── commands/           # 各个子命令
│   └── index.ts            # CLI 入口
├── constants/              # 常量定义
│   └── index.ts            # 魔数、预设、默认配置
├── core/                   # 核心功能
│   ├── analyzer.ts         # 字体分析和优化建议
│   ├── converter.ts        # 格式转换
│   ├── detector.ts         # 格式检测
│   ├── generator.ts        # CSS 生成
│   └── subsetter.ts        # 子集化处理
├── errors/                 # 错误处理
│   └── index.ts            # 自定义错误类型
├── types/                  # TypeScript 类型
│   └── index.ts            # 类型定义和守卫
├── unplugin/               # 构建工具插件
│   ├── index.ts            # unplugin 入口
│   ├── vite.ts             # Vite 插件
│   ├── webpack.ts          # Webpack 插件
│   └── rollup.ts           # Rollup 插件
└── utils/                  # 工具函数
    └── index.ts            # 缓存、验证、格式化等
```

## 🛠️ API 参考

### 字体分析

```typescript
import { analyzeFont, generateReport } from 'unplugin-webfont'

// 分析字体文件
const analysis = await analyzeFont(fontBuffer)

console.log(analysis.info.family)         // 字体家族名
console.log(analysis.charStats.cjkCount)  // CJK 字符数
console.log(analysis.suggestions)         // 优化建议

// 生成分析报告
const report = generateReport(analysis)
console.log(report)
```

### 字符集预设

```typescript
import {
  CHAR_PRESETS,
  getCharPresets,
  getBasicLatinChars,
  categorizeChars,
} from 'unplugin-webfont'

// 使用预设字符集
const digits = CHAR_PRESETS.DIGITS           // '0123456789'
const latin = CHAR_PRESETS.BASIC_LATIN       // ASCII 可打印字符

// 组合多个预设
const chars = getCharPresets(['DIGITS', 'LETTERS', 'CJK_PUNCTUATION'])

// 分类字符
const { ascii, cjk, latin, other } = categorizeChars('你好Hello123')
```

### 子集化并获取统计

```typescript
import { subsetFontWithStats } from 'unplugin-webfont'

const result = await subsetFontWithStats({
  fontBuffer,
  text: '你好世界Hello World',
})

console.log(`原始大小: ${result.originalSize}`)  // 原始大小
console.log(`子集大小: ${result.subsetSize}`)    // 子集后大小
console.log(`减小: ${result.reduction}%`)         // 减小百分比
console.log(`字符数: ${result.charCount}`)       // 包含的字符数
```

### Unicode 范围检测

```typescript
import { detectUnicodeRange, checkCharSupport } from 'unplugin-webfont'

// 检测字符的 Unicode 范围
const range = detectUnicodeRange('你好世界')
console.log(range)  // 'U+4F60, U+597D, U+4E16, U+754C'

// 检查字体是否支持指定字符
const support = await checkCharSupport(fontBuffer, '你好Hello')
console.log(`支持率: ${support.supportRate}%`)
console.log(`缺失: ${support.missing.join(', ')}`)
```

### 错误处理

```typescript
import {
  WebFontError,
  SubsetError,
  isWebFontError,
  wrapError,
} from 'unplugin-webfont'

try {
  await convertFont(options)
} catch (error) {
  if (isWebFontError(error)) {
    console.error(`[错误 ${error.code}] ${error.message}`)
  }
}
```

### 工具函数

```typescript
import {
  formatBytes,
  calculateCompressionRatio,
  MemoryCache,
  ProgressTracker,
} from 'unplugin-webfont'

// 格式化字节
formatBytes(1024 * 1024)  // '1.0 MB'

// 计算压缩率
const ratio = calculateCompressionRatio(1000, 600)  // 40

// 使用缓存
const cache = new MemoryCache<Buffer>(100)
cache.set('key', buffer, 60000)  // 1 分钟 TTL
const cached = cache.get('key')

// 进度追踪
const progress = new ProgressTracker(100, (info) => {
  console.log(`${info.percent}% - ETA: ${info.eta}ms`)
})
progress.update(10)
```

## 📞 联系方式

- GitHub: [unplugin-webfont](https://github.com/ldesign/unplugin-webfont)
- Issues: [报告问题](https://github.com/ldesign/unplugin-webfont/issues)

---

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！
