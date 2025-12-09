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

## 📞 联系方式

- 作者: Your Name
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！