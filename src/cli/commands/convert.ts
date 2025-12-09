import { readFile, writeFile, mkdir } from 'fs/promises'
import { resolve, basename, extname } from 'path'
import { glob } from 'glob'
import chalk from 'chalk'
import ora from 'ora'
import { detectFontFormat } from '../../core/detector.js'
import { convertFont } from '../../core/converter.js'
import { generateCSS } from '../../core/generator.js'

interface ConvertOptions {
  output: string
  formats: string
  fontFamily?: string
  css: boolean
}

export async function convertCommand(input: string, options: ConvertOptions) {
  const spinner = ora('正在处理字体文件...').start()
  
  try {
    // 查找字体文件
    const files = await glob(input)
    
    if (files.length === 0) {
      spinner.fail(chalk.red(`未找到匹配的文件: ${input}`))
      process.exit(1)
    }
    
    spinner.text = `找到 ${files.length} 个字体文件`
    
    const formats = options.formats.split(',').map(f => f.trim()) as any[]
    const outputDir = options.output
    
    // 创建输出目录
    await mkdir(outputDir, { recursive: true })
    
    // 处理每个文件
    for (const file of files) {
      spinner.text = `处理: ${basename(file)}`
      
      const fontBuffer = await readFile(file)
      const fontInfo = await detectFontFormat(fontBuffer)
      
      // 转换格式
      const results = await convertFont({
        inputBuffer: fontBuffer,
        inputFormat: fontInfo.format,
        outputFormats: formats
      })
      
      // 保存文件
      const baseName = basename(file, extname(file))
      const fontFiles: Array<{ format: string; path: string }> = []
      
      for (const result of results) {
        const outputPath = resolve(outputDir, `${baseName}.${result.format}`)
        await writeFile(outputPath, result.buffer)
        
        fontFiles.push({
          format: result.format,
          path: `./${basename(outputPath)}`
        })
        
        spinner.succeed(chalk.green(`生成: ${basename(outputPath)} (${formatBytes(result.size)})`))
        spinner.start()
      }
      
      // 生成CSS
      if (options.css && fontFiles.length > 0) {
        const css = generateCSS({
          fontFamily: options.fontFamily || fontInfo.family,
          fontFiles,
          fontWeight: fontInfo.weight,
          fontStyle: fontInfo.style
        })
        
        const cssPath = resolve(outputDir, `${baseName}.css`)
        await writeFile(cssPath, css)
        
        spinner.succeed(chalk.green(`生成CSS: ${basename(cssPath)}`))
        spinner.start()
      }
    }
    
    spinner.succeed(chalk.green('✨ 转换完成!'))
  } catch (error) {
    spinner.fail(chalk.red('转换失败'))
    console.error(chalk.red((error as Error).message))
    process.exit(1)
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}