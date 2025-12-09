# unplugin-webfont 实施指南

## 📚 详细实施步骤

### 第一步：项目初始化

#### 1.1 创建项目基础结构

```bash
# 初始化项目
npm init -y

# 创建目录结构
mkdir -p src/{core,unplugin,cli,ui/{components,worker},types}
mkdir -p test examples docs
```

#### 1.2 配置 TypeScript

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

#### 1.3 配置构建工具

**package.json**:
```json
{
  "name": "unplugin-webfont",
  "version": "0.1.0",
  "description": "通用字体转换工具，支持多种格式和文本子集化",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs"
    },
    "./vite": {
      "types": "./dist/vite.d.ts",
      "require": "./dist/vite.cjs",
      "import": "./dist/vite.mjs"
    },
    "./webpack": {
      "types": "./dist/webpack.d.ts",
      "require": "./dist/webpack.cjs",
      "import": "./dist/webpack.mjs"
    },
    "./rollup": {
      "types": "./dist/rollup.d.ts",
      "require": "./dist/rollup.cjs",
      "import": "./dist/rollup.mjs"
    }
  },
  "bin": {
    "webfont": "./dist/cli.mjs"
  },
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "build:ui": "cd src/ui && vite build",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "font",
    "webfont",
    "subset",
    "woff2",
    "woff",
    "unplugin",
    "vite",
    "webpack"
  ]
}
```

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/unplugin/index.ts',
    vite: 'src/unplugin/vite.ts',
    webpack: 'src/unplugin/webpack.ts',
    rollup: 'src/unplugin/rollup.ts',
    cli: 'src/cli/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  shims: true,
  splitting: false
})
```

---

### 第二步：安装核心依赖

```bash
# 核心依赖
npm install fontkit opentype.js fontmin wawoff2 pako

# unplugin框架
npm install unplugin

# CLI工具
npm install commander inquirer chalk ora cli-progress

# 类型定义
npm install -D @types/fontkit @types/opentype.js @types/inquirer

# 开发依赖
npm install -D typescript tsup vitest eslint prettier
```

**依赖说明**:
- `fontkit`: 字体文件解析
- `opentype.js`: OpenType字体操作
- `fontmin`: 字体子集化（基于fontmin-core）
- `wawoff2`: WOFF2格式转换
- `pako`: Zlib压缩（用于WOFF）
- `unplugin`: 统一插件接口
- `commander`: CLI命令解析
- `inquirer`: 交互式问答

---

### 第三步：实现核心转换模块

#### 3.1 格式检测器

**src/core/detector.ts**:
```typescript
import fontkit from 'fontkit'

export interface FontInfo {
  format: 'ttf' | 'otf' | 'woff' | 'woff2' | 'unknown'
  family: string
  style: string
  weight: number
  glyphCount: number
  version: string
}

export async function detectFontFormat(buffer: Buffer): Promise<FontInfo> {
  // 检查文件头魔数
  const signature = buffer.toString('utf8', 0, 4)
  
  let format: FontInfo['format'] = 'unknown'
  
  if (signature === 'wOFF') {
    format = 'woff'
  } else if (signature === 'wOF2') {
    format = 'woff2'
  } else if (signature === 'OTTO') {
    format = 'otf'
  } else if (buffer.readUInt32BE(0) === 0x00010000) {
    format = 'ttf'
  }
  
  // 解析字体信息
  try {
    const font = fontkit.create(buffer)
    
    return {
      format,
      family: font.familyName || 'Unknown',
      style: font.subfamilyName || 'Regular',
      weight: font['OS/2']?.usWeightClass || 400,
      glyphCount: font.numGlyphs,
      version: font.version || '1.0'
    }
  } catch (error) {
    throw new Error(`无法解析字体文件: ${error.message}`)
  }
}
```

#### 3.2 格式转换器

**src/core/converter.ts**:
```typescript
import fontkit from 'fontkit'
import opentype from 'opentype.js'
import { compress as compressWoff2, decompress as decompressWoff2 } from 'wawoff2'
import pako from 'pako'

export interface ConvertOptions {
  inputBuffer: Buffer
  inputFormat: string
  outputFormats: Array<'woff' | 'woff2' | 'ttf'>
}

export interface ConvertResult {
  format: string
  buffer: Buffer
  size: number
}

export async function convertFont(
  options: ConvertOptions
): Promise<ConvertResult[]> {
  const { inputBuffer, inputFormat, outputFormats } = options
  
  // 步骤1: 统一转换为TTF格式
  let ttfBuffer: Buffer
  
  switch (inputFormat) {
    case 'ttf':
      ttfBuffer = inputBuffer
      break
    case 'otf':
      ttfBuffer = await convertOtfToTtf(inputBuffer)
      break
    case 'woff':
      ttfBuffer = await decompressWoff(inputBuffer)
      break
    case 'woff2':
      ttfBuffer = Buffer.from(await decompressWoff2(inputBuffer))
      break
    default:
      throw new Error(`不支持的输入格式: ${inputFormat}`)
  }
  
  // 步骤2: 从TTF生成目标格式
  const results: ConvertResult[] = []
  
  for (const format of outputFormats) {
    let buffer: Buffer
    
    switch (format) {
      case 'ttf':
        buffer = ttfBuffer
        break
      case 'woff':
        buffer = await compressWoff(ttfBuffer)
        break
      case 'woff2':
        buffer = Buffer.from(await compressWoff2(ttfBuffer))
        break
    }
    
    results.push({
      format,
      buffer,
      size: buffer.length
    })
  }
  
  return results
}

// OTF转TTF
async function convertOtfToTtf(otfBuffer: Buffer): Promise<Buffer> {
  const font = opentype.parse(otfBuffer.buffer)
  const ttfArrayBuffer = font.toArrayBuffer()
  return Buffer.from(ttfArrayBuffer)
}

// 解压WOFF
async function decompressWoff(woffBuffer: Buffer): Promise<Buffer> {
  // WOFF格式规范: https://www.w3.org/TR/WOFF/
  const signature = woffBuffer.toString('utf8', 0, 4)
  if (signature !== 'wOFF') {
    throw new Error('不是有效的WOFF文件')
  }
  
  // 读取WOFF头信息
  const length = woffBuffer.readUInt32BE(8)
  const compressed = woffBuffer.slice(44)
  
  // 使用zlib解压
  const decompressed = pako.inflate(compressed)
  return Buffer.from(decompressed)
}

// 压缩为WOFF
async function compressWoff(ttfBuffer: Buffer): Promise<Buffer> {
  const compressed = pako.deflate(ttfBuffer)
  
  // 构建WOFF头
  const header = Buffer.alloc(44)
  header.write('wOFF', 0)
  header.writeUInt32BE(0x00010000, 4) // flavor
  header.writeUInt32BE(header.length + compressed.length, 8) // length
  header.writeUInt16BE(0, 12) // numTables
  
  return Buffer.concat([header, Buffer.from(compressed)])
}
```

#### 3.3 文本子集化

**src/core/subsetter.ts**:
```typescript
import Fontmin from 'fontmin'

export interface SubsetOptions {
  fontBuffer: Buffer
  text: string
  hinting?: boolean
}

export async function subsetFont(
  options: SubsetOptions
): Promise<Buffer> {
  const { fontBuffer, text, hinting = false } = options
  
  return new Promise((resolve, reject) => {
    const fontmin = new Fontmin()
      .src(fontBuffer)
      .use(Fontmin.glyph({
        text,
        hinting
      }))
    
    fontmin.run((err, files) => {
      if (err) {
        reject(new Error(`字体子集化失败: ${err.message}`))
      } else {
        resolve(files[0].contents)
      }
    })
  })
}

// 从文件读取文本
export async function readTextFile(filePath: string): Promise<string> {
  const fs = await import('fs/promises')
  const content = await fs.readFile(filePath, 'utf-8')
  return content
}

// 提取唯一字符
export function extractUniqueChars(text: string): string {
  return Array.from(new Set(text)).join('')
}
```

#### 3.4 CSS生成器

**src/core/generator.ts**:
```typescript
export interface CSSOptions {
  fontFamily: string
  fontFiles: Array<{
    format: string
    path: string
  }>
  fontWeight?: number
  fontStyle?: string
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}

export function generateCSS(options: CSSOptions): string {
  const {
    fontFamily,
    fontFiles,
    fontWeight = 400,
    fontStyle = 'normal',
    fontDisplay = 'swap'
  } = options
  
  const srcParts = fontFiles.map(file => {
    return `url('${file.path}') format('${file.format}')`
  })
  
  return `@font-face {
  font-family: '${fontFamily}';
  src: ${srcParts.join(',\n       ')};
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: ${fontDisplay};
}
`
}
```

---

### 第四步：开发 unplugin 插件

**src/unplugin/index.ts**:
```typescript
import { createUnplugin } from 'unplugin'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { resolve, dirname, basename, extname } from 'path'
import { glob } from 'glob'
import { detectFontFormat } from '../core/detector'
import { convertFont } from '../core/converter'
import { subsetFont, readTextFile, extractUniqueChars } from '../core/subsetter'
import { generateCSS } from '../core/generator'

export interface WebFontPluginOptions {
  include?: string | string[]
  text?: string
  textFile?: string
  formats?: Array<'woff' | 'woff2' | 'ttf'>
  outputDir?: string
  cssOutput?: boolean | string
  fontFamily?: string
  fontWeight?: number
  fontStyle?: string
}

export default createUnplugin<WebFontPluginOptions>((options = {}) => {
  const {
    include = '**/*.{ttf,otf,woff,woff2}',
    text,
    textFile,
    formats = ['woff2', 'woff'],
    outputDir = 'fonts',
    cssOutput = true,
    fontFamily,
    fontWeight,
    fontStyle
  } = options
  
  return {
    name: 'unplugin-webfont',
    
    async buildStart() {
      console.log('🔤 unplugin-webfont: 开始处理字体文件...')
      
      // 查找字体文件
      const patterns = Array.isArray(include) ? include : [include]
      const fontFiles: string[] = []
      
      for (const pattern of patterns) {
        const files = await glob(pattern)
        fontFiles.push(...files)
      }
      
      if (fontFiles.length === 0) {
        console.warn('⚠️  未找到字体文件')
        return
      }
      
      // 读取文本内容
      let textContent = text || ''
      if (textFile) {
        const fileText = await readTextFile(textFile)
        textContent += fileText
      }
      textContent = extractUniqueChars(textContent)
      
      // 处理每个字体文件
      for (const fontFile of fontFiles) {
        await processFontFile({
          fontFile,
          text: textContent,
          formats,
          outputDir,
          cssOutput,
          fontFamily,
          fontWeight,
          fontStyle
        })
      }
      
      console.log('✅ unplugin-webfont: 字体处理完成')
    }
  }
})

async function processFontFile(options: {
  fontFile: string
  text: string
  formats: string[]
  outputDir: string
  cssOutput: boolean | string
  fontFamily?: string
  fontWeight?: number
  fontStyle?: string
}) {
  const {
    fontFile,
    text,
    formats,
    outputDir,
    cssOutput,
    fontFamily,
    fontWeight,
    fontStyle
  } = options
  
  // 读取字体文件
  const fontBuffer = await readFile(fontFile)
  
  // 检测字体格式
  const fontInfo = await detectFontFormat(fontBuffer)
  console.log(`  处理: ${basename(fontFile)} (${fontInfo.format})`)
  
  // 子集化(如果提供了文本)
  let processedBuffer = fontBuffer
  if (text) {
    processedBuffer = await subsetFont({
      fontBuffer,
      text
    })
    console.log(`  子集化: ${fontBuffer.length} → ${processedBuffer.length} bytes`)
  }
  
  // 转换格式
  const results = await convertFont({
    inputBuffer: processedBuffer,
    inputFormat: fontInfo.format,
    outputFormats: formats as any
  })
  
  // 创建输出目录
  await mkdir(outputDir, { recursive: true })
  
  // 保存文件
  const baseName = basename(fontFile, extname(fontFile))
  const fontFiles: Array<{ format: string; path: string }> = []
  
  for (const result of results) {
    const outputPath = resolve(outputDir, `${baseName}.${result.format}`)
    await writeFile(outputPath, result.buffer)
    console.log(`  生成: ${basename(outputPath)} (${result.size} bytes)`)
    
    fontFiles.push({
      format: result.format,
      path: `./${basename(outputPath)}`
    })
  }
  
  // 生成CSS
  if (cssOutput) {
    const css = generateCSS({
      fontFamily: fontFamily || fontInfo.family,
      fontFiles,
      fontWeight: fontWeight || fontInfo.weight,
      fontStyle: fontStyle || fontInfo.style
    })
    
    const cssPath = typeof cssOutput === 'string'
      ? cssOutput
      : resolve(outputDir, `${baseName}.css`)
    
    await writeFile(cssPath, css)
    console.log(`  生成: ${basename(cssPath)}`)
  }
}
```

**src/unplugin/vite.ts**:
```typescript
import unplugin from './index'

export default unplugin.vite
```

**src/unplugin/webpack.ts**:
```typescript
import unplugin from './index'

export default unplugin.webpack
```

**src/unplugin/rollup.ts**:
```typescript
import unplugin from './index'

export default unplugin.rollup
```

---

### 第五步：开发 CLI 工具

**src/cli/index.ts**:
```typescript
#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { convertCommand } from './commands/convert'
import { subsetCommand } from './commands/subset'
import { infoCommand } from './commands/info'
import 