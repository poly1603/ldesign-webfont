# 🚀 快速开始指南

本指南将帮助你在5分钟内上手 unplugin-webfont。

## 📦 安装

```bash
npm install unplugin-webfont -D
```

## 🎯 三种使用方式

### 方式1: 构建工具插件（推荐）

**Vite项目**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import WebFont from 'unplugin-webfont/vite'

export default defineConfig({
  plugins: [
    WebFont({
      include: './fonts/*.ttf',        // 字体文件路径
      text: '你好世界',                // 要包含的文字
      formats: ['woff2', 'woff'],     // 输出格式
      outputDir: 'public/fonts',      // 输出目录
      cssOutput: true                 // 生成CSS
    })
  ]
})
```

**然后运行构建**：
```bash
npm run build
```

生成的文件：
```
public/fonts/
  ├── font.woff2      # 字体文件
  ├── font.woff       # 字体文件
  └── font.css        # CSS文件
```

### 方式2: CLI命令行

```bash
# 转换字体
webfont convert input.ttf -o output/

# 创建子集
webfont subset input.ttf -t "你好世界" -o output/

# 查看信息
webfont info input.ttf
```

### 方式3: 可视化界面

```bash
# 启动Web界面
webfont serve

# 浏览器访问 http://localhost:3000
# 拖拽上传字体 → 输入文字 → 点击转换 → 下载
```

## 💡 常见场景

### 场景1: 中文字体优化

**问题**：中文字体文件很大（5-20MB），网页加载慢

**解决**：使用子集化，只包含网站用到的文字

```typescript
WebFont({
  include: './fonts/SourceHanSans.ttf',
  // 只包含这些文字
  text: '欢迎访问我的网站，这里是关于我们的介绍页面...',
  formats: ['woff2'],  // 只用最小的格式
  outputDir: 'public/fonts'
})
```

**结果**：从5MB降到50KB，减少99%！

### 场景2: 英文字体转换

**问题**：设计师给的是TTF格式，需要Web格式

**解决**：直接转换

```bash
webfont convert font.ttf --formats woff2,woff -o dist/fonts/ -c
```

**结果**：自动生成WOFF2、WOFF和CSS文件

### 场景3: 批量处理

**问题**：有多个字体文件需要处理

**解决**：使用glob模式

```typescript
WebFont({
  include: './fonts/**/*.{ttf,otf}',  // 匹配所有TTF和OTF
  textFile: './common-chars.txt',     // 从文件读取常用字
  formats: ['woff2', 'woff'],
  outputDir: 'dist/fonts'
})
```

## 🎨 在网页中使用

### 1. 引入CSS

```html
<!-- 方式1: 链接生成的CSS -->
<link rel="stylesheet" href="/fonts/font.css">

<!-- 方式2: 手动写CSS -->
<style>
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/font.woff2') format('woff2'),
       url('/fonts/font.woff') format('woff');
  font-display: swap;
}

body {
  font-family: 'MyFont', sans-serif;
}
</style>
```

### 2. 使用字体

```css
.title {
  font-family: 'MyFont', sans-serif;
}
```

## 📊 效果对比

### 案例：思源黑体中文字体

| 操作 | 文件大小 | 说明 |
|------|----------|------|
| 原始TTF | 15.4 MB | 完整字体 |
| 子集化(100个常用字) | 38 KB | 减少99.75% |
| 转换为WOFF2 | 28 KB | 再减少26% |

### 案例：英文字体

| 操作 | 文件大小 | 说明 |
|------|----------|------|
| 原始TTF | 156 KB | 完整字体 |
| 转换为WOFF2 | 48 KB | 减少69% |

## ⚙️ 配置技巧

### 只要最小的格式

```typescript
WebFont({
  formats: ['woff2']  // 现代浏览器都支持
})
```

### 从多个文件收集文字

```typescript
WebFont({
  textFile: './chars.txt',  // 常用字符
  text: '额外的文字'         // 补充文字
})
```

### 自定义字体属性

```typescript
WebFont({
  fontFamily: 'MyCustomFont',
  fontWeight: 700,
  fontStyle: 'italic',
  fontDisplay: 'swap'
})
```

## 🔧 故障排查

### 问题1: 找不到字体文件

```bash
# 检查路径
webfont info ./fonts/font.ttf

# 使用绝对路径
include: '/path/to/fonts/*.ttf'
```

### 问题2: 子集化后显示方块

**原因**：文字没有包含在子集中

**解决**：确保包含所有需要的文字

```typescript
// 收集所有页面的文字
text: '首页：欢迎... 关于：介绍... 联系：邮箱...'
```

### 问题3: CSS没有生成

```typescript
// 确保开启CSS输出
cssOutput: true  // 或指定路径
```

## 📚 下一步

- 查看 [完整文档](./README.md)
- 浏览 [配置选项](./README.md#配置选项)
- 参考 [最佳实践](./README.md#最佳实践)
- 查看 [示例项目](./examples/)

## 💬 需要帮助？

- [提交Issue](https://github.com/yourusername/unplugin-webfont/issues)
- [查看FAQ](./README.md#常见问题)

---

开始优化你的字体吧！ 🎉