import { createUnplugin } from 'unplugin'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { resolve, dirname, basename, extname } from 'path'
import { glob } from 'glob'
import { detectFontFormat } from '../core/detector.js'
import { convertFont } from '../core/converter.js'
import { subsetFont, readTextFile, extractUniqueChars } from '../core/subsetter.js'
import { generateCSS } from '../core/generator.js'
import type { WebFontPluginOptions } from '../types/index.js'

const PLUGIN_NAME = 'unplugin-webfont'

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
    fontStyle,
    fontDisplay = 'swap'
  } = options
  
  return {
    name: PLUGIN_NAME,
    
    async buildStart() {
      console.log(`\n🔤 ${PLUGIN_NAME}: 开始处理字体文件...`)
      
      try {
        // 查找字体文件
        const patterns = Array.isArray(include) ? include : [include]
        const fontFiles: string[] = []
        
        for (const pattern of patterns) {
          const files = await glob(pattern, { absolute: false })
          fontFiles.push(...files)
        }
        
        if (fontFiles.length === 0) {
          console.warn(`⚠️  未找到匹配的字体文件: ${patterns.join(', ')}`)
          return
        }
        
        console.log(`📁 找到 ${fontFiles.length} 个字体文件`)
        
        // 读取文本内容
        let textContent = text || ''
        if (textFile) {
          try {
            const fileText = await readTextFile(textFile)
            textContent += fileText
          } catch (error) {
            console.warn(`⚠️  无法读取文本文件 ${textFile}:`, (error as Error).message)
          }
        }
        
        if (textContent) {
          textContent = extractUniqueChars(textContent)
          console.log(`✏️  子集化文本: ${textContent.length} 个唯一字符`)
        }
        
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
            fontStyle,
            fontDisplay
          })
        }
        
        console.log(`✅ ${PLUGIN_NAME}: 字体处理完成\n`)
      } catch (error) {
        console.error(`❌ ${PLUGIN_NAME}: 处理失败:`, error)
        throw error
      }
    }
  }
})

/**
 * 处理单个字体文件
 */
async function processFontFile(options: {
  fontFile: string
  text: string
  formats: string[]
  outputDir: string
  cssOutput: boolean | string
  fontFamily?: string
  fontWeight?: number
  fontStyle?: string
  fontDisplay?: string
}) {
  const {
    fontFile,
    text,
    formats,
    outputDir,
    cssOutput,
    fontFamily,
    fontWeight,
    fontStyle,
    fontDisplay
  } = options
  
  try {
    // 读取字体文件
    const fontBuffer = await readFile(fontFile)
    const originalSize = fontBuffer.length
    
    // 检测字体格式
    const fontInfo = await detectFontFormat(fontBuffer)
    console.log(`  📄 ${basename(fontFile)} (${fontInfo.format}, ${fontInfo.family})`)
    
    // 子集化(如果提供了文本)
    let processedBuffer: Buffer = fontBuffer
    if (text && text.length > 0) {
      try {
        processedBuffer = (await subsetFont({
          fontBuffer: fontBuffer as any,
          text
        })) as any
        const reduction = ((1 - processedBuffer.length / originalSize) * 100).toFixed(1)
        console.log(`     💾 子集化: ${formatBytes(originalSize)} → ${formatBytes(processedBuffer.length)} (减少 ${reduction}%)`)
      } catch (error) {
        console.warn(`     ⚠️  子集化失败，使用原始字体:`, (error as Error).message)
      }
    }
    
    // 转换格式
    const results = await convertFont({
      inputBuffer: processedBuffer,
      inputFormat: fontInfo.format,
      outputFormats: formats as any
    })
    
    if (results.length === 0) {
      console.warn(`     ⚠️  未能生成任何输出格式`)
      return
    }
    
    // 创建输出目录
    await mkdir(outputDir, { recursive: true })
    
    // 保存文件
    const baseName = basename(fontFile, extname(fontFile))
    const fontFiles: Array<{ format: string; path: string }> = []
    
    for (const result of results) {
      const outputPath = resolve(outputDir, `${baseName}.${result.format}`)
      await writeFile(outputPath, result.buffer)
      console.log(`     ✨ 生成: ${basename(outputPath)} (${formatBytes(result.size)})`)
      
      fontFiles.push({
        format: result.format,
        path: `./${basename(outputPath)}`
      })
    }
    
    // 生成CSS
    if (cssOutput && fontFiles.length > 0) {
      const css = generateCSS({
        fontFamily: fontFamily || fontInfo.family,
        fontFiles,
        fontWeight: fontWeight || fontInfo.weight,
        fontStyle: fontStyle || fontInfo.style,
        fontDisplay: fontDisplay as any
      })
      
      const cssPath = typeof cssOutput === 'string'
        ? cssOutput
        : resolve(outputDir, `${baseName}.css`)
      
      await writeFile(cssPath, css)
      console.log(`     📝 CSS: ${basename(cssPath)}`)
    }
  } catch (error) {
    console.error(`  ❌ 处理 ${fontFile} 失败:`, error)
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}