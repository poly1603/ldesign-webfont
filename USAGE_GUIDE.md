# 📚 使用指南

这是 unplugin-webfont 的详细使用指南，涵盖各种实际应用场景。

## 🎯 目录

- [基础使用](#基础使用)
- [高级功能](#高级功能)
- [实战案例](#实战案例)
- [性能优化](#性能优化)
- [故障排查](#故障排查)

---

## 基础使用

### 1. 作为Vite插件

#### 最简配置

```typescript
// vite.config.ts
import WebFont from 'unplugin-webfont/vite'

export default {
  plugins: [
    WebFont({
      include: './fonts/MyFont.ttf'
    })
  ]
}
```

#### 完整配置

```typescript
import WebFont from 'unplugin-webfont/vite'

export default {
  plugins: [
    WebFont({
      // 字体文件（支持glob）
      include: './fonts/**/*.{ttf,otf,woff,woff2}',
      
      // 子集化：只包含这些文字
      text: '你好世界Hello World',
      
      // 或从文件读取
      textFile: './common-chars.txt',
      
      // 输出格式
      formats: ['woff2', 'woff'],
      
      // 输出目录
      outputDir: 'public/fonts',
      
      // 生成CSS
      cssOutput: true,  // 或指定路径: 'public/fonts/fonts.css'
      
      // 字体配置
      fontFamily: 'MyCustomFont',
      fontWeight: 400,
      fontStyle: 'normal',
      fontDisplay: 'swap'
    })
  ]
}
```

### 2. CLI使用

#### 基本命令

```bash
# 查看帮助
webfont --help

# 转换字体
webfont convert input.ttf -o output/

# 创建子集
webfont subset input.ttf -t "文字内容" -o output/

# 查看字体信息
webfont info input.ttf

# 启动UI
webfont serve
```

#### CLI完整示例

```bash
# 1. 转换字体并生成CSS
webfont convert fonts/MyFont.ttf \
  --output dist/fonts \
  --formats woff2,woff \
  --css \
  --font-family "My Font"

# 2. 创建字体子集
webfont subset fonts/SourceHanSans.ttf \
  --text "欢迎使用字体转换工具" \
  --output dist/fonts \
  --formats woff2 \
  --css

# 3. 从文件读取文字
webfont subset fonts/font.ttf \
  --text-file common-chars.txt \
  --output dist/fonts

# 4. 批量转换
webfont convert "fonts/*.ttf" \
  --output dist/fonts \
  --formats woff2,woff \
  --css
```

---

## 高级功能

### 1. 多字体配置

```typescript
// vite.config.ts
import WebFont from 'unplugin-webfont/vite'

export default {
  plugins: [
    // Regular字体
    WebFont({
      include: './fonts/MyFont-Regular.ttf',
      text: '常用文字',
      formats: ['woff2'],
      outputDir: 'public/fonts',
      fontFamily: 'MyFont',
      fontWeight: 400
    }),
    
    // Bold字体
    WebFont({
      include: './fonts/MyFont-Bold.ttf',
      text: '常用文字',
      formats: ['woff2'],
      outputDir: 'public/fonts',
      fontFamily: 'MyFont',
      fontWeight: 700
    })
  ]
}
```

### 2. 动态文本收集

创建一个文本收集脚本：

```javascript
// scripts/collect-text.js
import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

async function collectText() {
  const files = await glob('src/**/*.{vue,jsx,tsx}')
  const allText = new Set()
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    // 提取中文字符
    const matches = content.match(/[\u4e00-\u9fa5]/g)
    if (matches) {
      matches.forEach(char => allText.add(char))
    }
  }
  
  // 保存到文件
  writeFileSync('collected-chars.txt', Array.from(allText).join(''))
  console.log(`收集到 ${allText.size} 个唯一字符`)
}

collectText()
```

然后在配置中使用：

```typescript
WebFont({
  include: './fonts/chinese.ttf',
  textFile: './collected-chars.txt',
  formats: ['woff2']
})
```

### 3. 条件构建

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import WebFont from 'unplugin-webfont/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    // 只在生产环境进行字体优化
    mode === 'production' && WebFont({
      include: './fonts/*.ttf',
      textFile: './common-chars.txt',
      formats: ['woff2']
    })
  ].filter(Boolean)
}))
```

---

## 实战案例

### 案例1: 中文博客网站

**需求**：
- 使用思源黑体
- 只包含文章中用到的汉字
- 最小化文件大小

**解决方案**：

```typescript
// vite.config.ts
import WebFont from 'unplugin-webfont/vite'

export default {
  plugins: [
    WebFont({
      include: './fonts/SourceHanSans.ttf',
      // 包含所有文章的文字
      textFile: './content/all-chars.txt',
      // 只用WOFF2（最小）
      formats: ['woff2'],
      outputDir: 'public/fonts',
      fontFamily: 'Source Han Sans',
      cssOutput: 'public/fonts/fonts.css'
    })
  ]
}
```

**结果**：
- 原始字体：15.4 MB
- 优化后：45 KB（减少99.7%）

### 案例2: 多语言网站

**需求**：
- 支持中英文
- 不同语言使用不同字体
- 按需加载

**解决方案**：

```typescript
// vite.config.ts
export default {
  plugins: [
    // 中文字体
    WebFont({
      include: './fonts/NotoSansSC.ttf',
      textFile: './locales/zh-CN.txt',
      formats: ['woff2'],
      outputDir: 'public/fonts',
      fontFamily: 'NotoSansSC',
      cssOutput: 'public/fonts/zh.css'
    }),
    
    // 英文字体
    WebFont({
      include: './fonts/Roboto.ttf',
      formats: ['woff2'],
      outputDir: 'public/fonts',
      fontFamily: 'Roboto',
      cssOutput: 'public/fonts/en.css'
    })
  ]
}
```

然后在HTML中按需加载：

```html
<!-- 中文页面 -->
<link rel="stylesheet" href="/fonts/zh.css">

<!-- 英文页面 -->
<link rel="stylesheet" href="/fonts/en.css">
```

### 案例3: 设计系统字体

**需求**：
- 统一的字体家族
- 多个粗细（Regular, Medium, Bold）
- 生成完整的CSS

**CLI方案**：

```bash
#!/bin/bash
# build-fonts.sh

# Regular
webfont subset fonts/Inter-Regular.ttf \
  -t "$(cat design-system-chars.txt)" \
  -o dist/fonts \
  --formats woff2,woff \
  --font-family Inter \
  -c

# Medium  
webfont subset fonts/Inter-Medium.ttf \
  -t "$(cat design-system-chars.txt)" \
  -o dist/fonts \
  --formats woff2,woff \
  --font-family Inter \
  -c

# Bold
webfont subset fonts/Inter-Bold.ttf \
  -t "$(cat design-system-chars.txt)" \
  -o dist/fonts \
  --formats woff2,woff \
  --font-family Inter \
  -c
```

---

## 性能优化

### 1. 格式选择策略

```typescript
// 现代浏览器（推荐）
formats: ['woff2']

// 兼容IE11+
formats: ['woff2', 'woff']

// 最大兼容性
formats: ['woff2', 'woff', 'ttf']
```

### 2. 字体加载优化

生成的CSS使用最佳实践：

```css
@font-face {
  font-family: 'MyFont';
  src: url('./font.woff2') format('woff2'),
       url('./font.woff') format('woff');
  font-display: swap;  /* 避免FOIT */
  font-weight: 400;
  font-style: normal;
}
```

### 3. 预加载字体

在HTML中添加：

```html
<link rel="preload" 
      href="/fonts/font.woff2" 
      as="font" 
      type="font/woff2" 
      crossorigin>
```

### 4. 字体子集拆分

对于大型网站，可以按页面拆分：

```typescript
// 首页字体
WebFont({
  include: './fonts/font.ttf',
  textFile: './chars/home.txt',
  outputDir: 'public/fonts/home',
  fontFamily: 'MyFont'
})

// 文章页字体
WebFont({
  include: './fonts/font.ttf',
  textFile: './chars/articles.txt',
  outputDir: 'public/fonts/articles',
  fontFamily: 'MyFont'
})
```

---

## 故障排查

### 问题1: 转换失败

**症状**：提示"无法解析字体文件"

**解决**：
```bash
# 1. 检查文件格式
webfont info your-font.ttf

# 2. 确保文件路径正确
# 3. 检查文件是否损坏
```

### 问题2: 子集化后显示方块

**原因**：字符未包含在子集中

**解决**：
```typescript
// 确保包含所有需要的字符
WebFont({
  text: '确保包含所有页面使用的文字',
  // 可以添加常用标点、数字等
  text: '你的文字' + '0123456789' + '，。！？'
})
```

### 问题3: 生成的字体很大

**原因**：
- 未启用子集化
- 包含了太多字符

**解决**：
```typescript
// 方法1: 只包含必要的字符
WebFont({
  text: '只包含实际使用的字符'
})

// 方法2: 只用WOFF2格式
WebFont({
  formats: ['woff2']  // 最小的格式
})
```

### 问题4: CSS未生成

**解决**：
```typescript
WebFont({
  cssOutput: true  // 确保开启
  // 或指定路径
  // cssOutput: './path/to/output.css'
})
```

### 问题5: Web UI无法启动

**解决**：
```bash
# 1. 确保安装了UI依赖
cd src/ui
npm install

# 2. 检查端口是否被占用
webfont serve -p 8080

# 3. 查看错误日志
```

---

## 最佳实践总结

### ✅ 推荐做法

1. **使用子集化**：中文字体必须子集化
2. **优先WOFF2**：现代浏览器都支持，体积最小
3. **font-display: swap**：避免白屏
4. **预加载关键字体**：提升首屏加载速度
5. **版本管理**：字体文件纳入版本控制
6. **自动化收集**：用脚本自动收集使用的文字

### ❌ 避免做法

1. ❌ 不做子集化直接使用大字体文件
2. ❌ 包含过多不需要的字符
3. ❌ 生成所有格式（浪费空间）
4. ❌ 忘记设置font-display
5. ❌ 没有预加载关键字体

---

## 更多资源

- [完整API文档](./README.md)
- [架构设计](./ARCHITECTURE.md)
- [快速开始](./QUICKSTART.md)
- [示例项目](./examples/)

---

需要更多帮助？[提交Issue](https://github.com/yourusername/unplugin-webfont/issues)