/**
 * 字体子集化模块
 * 
 * 提供字体子集化、字符集管理等功能
 * 
 * @packageDocumentation
 */

import Fontmin from 'fontmin'
import { readFile } from 'fs/promises'
import { CHAR_PRESETS } from '../constants/index.js'
import { SubsetError, EmptyTextError } from '../errors/index.js'
import type { SubsetOptions, SubsetResult } from '../types/index.js'

// ============================================================================
// 子集化函数
// ============================================================================

/**
 * 对字体进行子集化处理
 * 
 * @param options - 子集化选项
 * @returns 子集化后的字体 Buffer
 * 
 * @example
 * ```ts
 * const subsetBuffer = await subsetFont({
 *   fontBuffer: originalBuffer,
 *   text: '你好世界Hello',
 * })
 * ```
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
        reject(new SubsetError(`字体子集化失败: ${err.message}`, text, err))
      } else if (files && files[0]) {
        resolve(files[0].contents as Buffer)
      } else {
        reject(new SubsetError('字体子集化失败: 未生成输出文件', text))
      }
    })
  })
}

/**
 * 子集化并返回详细结果
 * 
 * @param options - 子集化选项
 * @returns 子集化结果，包含大小比较等信息
 */
export async function subsetFontWithStats(options: SubsetOptions): Promise<SubsetResult> {
  const { fontBuffer, text } = options
  
  if (!text || text.length === 0) {
    throw new EmptyTextError()
  }
  
  const originalSize = fontBuffer.length
  const uniqueChars = extractUniqueChars(text)
  
  const subsetBuffer = await subsetFont({
    ...options,
    text: uniqueChars,
  })
  
  const subsetSize = subsetBuffer.length
  const reduction = ((1 - subsetSize / originalSize) * 100)
  
  return {
    buffer: subsetBuffer,
    originalSize,
    subsetSize,
    reduction,
    charCount: uniqueChars.length,
    glyphCount: uniqueChars.length + 1, // +1 for .notdef glyph
  }
}

// ============================================================================
// 文本处理
// ============================================================================

/**
 * 从文件读取文本内容
 * 
 * @param filePath - 文件路径
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
 * 
 * @param text - 输入文本
 * @returns 去重后的字符串
 */
export function extractUniqueChars(text: string): string {
  return [...new Set(text)].join('')
}

/**
 * 合并多个文本并提取唯一字符
 * 
 * @param texts - 文本数组
 * @returns 去重后的字符串
 */
export function mergeTexts(...texts: string[]): string {
  return extractUniqueChars(texts.join(''))
}

// ============================================================================
// 字符集预设
// ============================================================================

/**
 * 常用字符集（兼容旧版 API）
 * 
 * @deprecated 使用 CHAR_PRESETS 替代
 */
export const COMMON_CHARS = {
  /** 数字 */
  numbers: CHAR_PRESETS.DIGITS,
  /** 英文字母（大小写） */
  letters: CHAR_PRESETS.LETTERS,
  /** 基本标点符号 */
  punctuation: CHAR_PRESETS.ASCII_PUNCTUATION,
  /** 中文标点符号 */
  chinesePunctuation: CHAR_PRESETS.CJK_PUNCTUATION,
  /** 空格和换行 */
  whitespace: CHAR_PRESETS.WHITESPACE,
} as const

/**
 * 获取常用字符集的组合
 * 
 * @param types - 要包含的字符集类型
 * @returns 组合后的字符串
 * 
 * @example
 * ```ts
 * // 获取数字和字母
 * const chars = getCommonChars(['numbers', 'letters'])
 * ```
 */
export function getCommonChars(
  types: (keyof typeof COMMON_CHARS)[] = ['numbers', 'letters', 'punctuation']
): string {
  return types.map((type) => COMMON_CHARS[type]).join('')
}

/**
 * 获取预设字符集
 * 
 * @param presets - 预设名称数组
 * @returns 组合后的字符串
 * 
 * @example
 * ```ts
 * const chars = getCharPresets(['DIGITS', 'LETTERS', 'CJK_PUNCTUATION'])
 * ```
 */
export function getCharPresets(
  presets: (keyof typeof CHAR_PRESETS)[]
): string {
  return presets.map(name => CHAR_PRESETS[name]).join('')
}

/**
 * 获取基础 Latin 字符集（数字 + 字母 + 基本标点）
 */
export function getBasicLatinChars(): string {
  return CHAR_PRESETS.BASIC_LATIN
}

/**
 * 获取扩展 Latin 字符集（包含重音符号等）
 */
export function getExtendedLatinChars(): string {
  return CHAR_PRESETS.BASIC_LATIN + CHAR_PRESETS.EXTENDED_LATIN
}

/**
 * 获取常用的中文标点和符号
 */
export function getChinesePunctuation(): string {
  return CHAR_PRESETS.CJK_PUNCTUATION + '　' // 包含全角空格
}

// ============================================================================
// 字符分析
// ============================================================================

/**
 * 分析文本中的字符类型
 * 
 * @param text - 要分析的文本
 * @returns 字符分类结果
 */
export function categorizeChars(text: string): {
  ascii: string
  cjk: string
  latin: string
  other: string
} {
  const ascii: string[] = []
  const cjk: string[] = []
  const latin: string[] = []
  const other: string[] = []
  
  for (const char of new Set(text)) {
    const code = char.codePointAt(0) || 0
    
    if (code < 0x0080) {
      ascii.push(char)
    } else if (code >= 0x4E00 && code <= 0x9FFF) {
      cjk.push(char)
    } else if (code < 0x0250) {
      latin.push(char)
    } else {
      other.push(char)
    }
  }
  
  return {
    ascii: ascii.join(''),
    cjk: cjk.join(''),
    latin: latin.join(''),
    other: other.join(''),
  }
}

/**
 * 检查文本是否包含 CJK 字符
 * 
 * @param text - 要检查的文本
 * @returns 是否包含 CJK 字符
 */
export function containsCJK(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0) || 0
    if (code >= 0x4E00 && code <= 0x9FFF) {
      return true
    }
  }
  return false
}

/**
 * 估算子集化后的文件大小
 * 
 * 这是一个粗略估算，实际大小取决于字体和字形复杂度
 * 
 * @param originalSize - 原始文件大小
 * @param originalGlyphCount - 原始字形数
 * @param targetCharCount - 目标字符数
 * @returns 估算的文件大小
 */
export function estimateSubsetSize(
  originalSize: number,
  originalGlyphCount: number,
  targetCharCount: number
): number {
  if (originalGlyphCount === 0) return originalSize
  
  // 假设固定开销约为原始大小的 10%
  const overhead = originalSize * 0.1
  
  // 每个字形的平均大小
  const avgGlyphSize = (originalSize - overhead) / originalGlyphCount
  
  // 估算子集大小
  return Math.round(overhead + avgGlyphSize * targetCharCount)
}
