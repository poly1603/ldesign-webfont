import { readFile } from 'fs/promises'
import chalk from 'chalk'
import { detectFontFormat } from '../../core/detector.js'

export async function infoCommand(input: string) {
  try {
    console.log(chalk.cyan('\n📋 字体信息:\n'))
    
    const fontBuffer = await readFile(input)
    const info = await detectFontFormat(fontBuffer)
    
    console.log(chalk.white('文件:'), chalk.green(input))
    console.log(chalk.white('格式:'), chalk.green(info.format.toUpperCase()))
    console.log(chalk.white('字体族:'), chalk.green(info.family))
    console.log(chalk.white('样式:'), chalk.green(info.style))
    console.log(chalk.white('粗细:'), chalk.green(info.weight.toString()))
    console.log(chalk.white('字形数:'), chalk.green(info.glyphCount.toString()))
    console.log(chalk.white('版本:'), chalk.green(info.version || 'N/A'))
    console.log(chalk.white('大小:'), chalk.green(formatBytes(fontBuffer.length)))
    console.log()
  } catch (error) {
    console.error(chalk.red('读取字体信息失败:'), (error as Error).message)
    process.exit(1)
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}