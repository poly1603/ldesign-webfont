import fontkit from 'fontkit'
import type { FontInfo, FontFormat } from '../types/index.js'

/**
 * 检测字体格式并返回字体信息
 * @param buffer 字体文件的Buffer
 * @returns 字体信息对象
 */
export async function detectFontFormat(buffer: Buffer): Promise<FontInfo> {
  // 检查文件头魔数
  const signature = buffer.toString('utf8', 0, 4)
  
  let format: FontFormat = 'unknown'
  
  // 通过文件头判断格式
  if (signature === 'wOFF') {
    format = 'woff'
  } else if (signature === 'wOF2') {
    format = 'woff2'
  } else if (signature === 'OTTO') {
    format = 'otf'
  } else if (buffer.readUInt32BE(0) === 0x00010000 || buffer.readUInt32BE(0) === 0x74727565) {
    format = 'ttf'
  }
  
  // 使用fontkit解析字体信息
  try {
    const font = fontkit.create(buffer) as any
    
    return {
      format,
      family: font.familyName || 'Unknown',
      style: font.subfamilyName || 'Regular',
      weight: font['OS/2']?.usWeightClass || 400,
      glyphCount: font.numGlyphs,
      version: font.version?.toString() || '1.0'
    }
  } catch (error) {
    throw new Error(`无法解析字体文件: ${(error as Error).message}`)
  }
}

/**
 * 检查是否为有效的字体文件
 * @param buffer 字体文件的Buffer
 * @returns 是否为有效字体
 */
export function isValidFont(buffer: Buffer): boolean {
  const signature = buffer.toString('utf8', 0, 4)
  const magic = buffer.readUInt32BE(0)
  
  return (
    signature === 'wOFF' ||
    signature === 'wOF2' ||
    signature === 'OTTO' ||
    magic === 0x00010000 ||
    magic === 0x74727565
  )
}