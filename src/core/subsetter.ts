import Fontmin from 'fontmin'
import { readFile } from 'fs/promises'
import type { SubsetOptions } from '../types/index.js'

/**
 * 对字体进行子集化处理
 * @param options 子集化选项
 * @returns 子集化后的字体Buffer
 */
export async function subsetFont(options: SubsetOptions): Promise<Buffer> {
  const { fontBuffer, text, hinting = false } = options
  
  if (!text || text.length === 0) {
    return fontBuffer
  }
  
  return new Promise((resolve, reject) => {
    const fontmin = new Fontmin()
      .src(fontBuffer)
      .use(
        Fontmin.glyph({
          text,
          hinting
        })
      )
    
    fontmin.run((err: Error | null, files: any[]) => {
      if (err) {
        reject(new Error(`字体子集化失败: ${err.message}`))
      } else if (files && files[0]) {
        resolve(files[0].contents as Buffer)
      } else {
        reject(new Error('字体子集化失败: 未生成输出文件'))
      }
    })
  })
}

/**
 * 从文件读取文本内容
 * @param filePath 文件路径
 * @returns 文本内容
 */
export async function readTextFile(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    throw new Error(`读取文本文件失败: ${(error as Error).message}`)
  }
}

/**
 * 提取文本中的唯一字符
 * @param text 输入文本
 * @returns 去重后的字符串
 */
export function extractUniqueChars(text: string): string {
  return Array.from(new Set(text)).join('')
}

/**
 * 常用字符集
 */
export const COMMON_CHARS = {
  /** 数字 */
  numbers: '0123456789',
  /** 英文字母（大小写） */
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  /** 基本标点符号 */
  punctuation: ',.!?;:\'"()[]{}~@#$%^&*-_+=|\\/<>`',
  /** 中文标点符号 */
  chinesePunctuation: '，。！？；：""\'\'（）【】《》、…—·',
  /** 空格和换行 */
  whitespace: ' \t\n\r',
}

/**
 * 获取常用字符集的组合
 * @param types 要包含的字符集类型
 * @returns 组合后的字符串
 */
export function getCommonChars(
  types: (keyof typeof COMMON_CHARS)[] = ['numbers', 'letters', 'punctuation']
): string {
  return types.map((type) => COMMON_CHARS[type]).join('')
}