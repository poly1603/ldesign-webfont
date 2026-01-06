/**
 * 字体分析模块
 * 
 * 提供字体优化建议、Unicode 范围分析等功能
 * 
 * @packageDocumentation
 */

import fontkit from 'fontkit'
import { UNICODE_RANGES, FILE_SIZE_LIMITS, FONT_WEIGHT_NAMES } from '../constants/index.js'
import { formatBytes } from '../utils/index.js'
import type { FontInfo, FontInfoDetailed, GlyphInfo } from '../types/index.js'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 字体分析结果
 */
export interface FontAnalysis {
  /** 基本信息 */
  info: FontInfoDetailed
  
  /** 支持的 Unicode 范围 */
  unicodeRanges: UnicodeRangeInfo[]
  
  /** 字符统计 */
  charStats: CharacterStats
  
  /** 优化建议 */
  suggestions: OptimizationSuggestion[]
  
  /** 分析时间 */
  analyzedAt: number
}

/**
 * Unicode 范围信息
 */
export interface UnicodeRangeInfo {
  /** 范围名称 */
  name: string
  
  /** 范围字符串 (U+XXXX-XXXX) */
  range: string
  
  /** 该范围内的字形数 */
  glyphCount: number
  
  /** 覆盖率 */
  coverage: number
}

/**
 * 字符统计
 */
export interface CharacterStats {
  /** 总字形数 */
  totalGlyphs: number
  
  /** ASCII 字符数 */
  asciiCount: number
  
  /** 拉丁扩展字符数 */
  latinExtendedCount: number
  
  /** CJK 字符数 */
  cjkCount: number
  
  /** 其他字符数 */
  otherCount: number
  
  /** 字符分布 */
  distribution: Record<string, number>
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 建议类型 */
  type: 'size' | 'format' | 'subset' | 'performance' | 'compatibility'
  
  /** 严重程度 */
  severity: 'info' | 'warning' | 'critical'
  
  /** 建议标题 */
  title: string
  
  /** 建议详情 */
  description: string
  
  /** 预计收益 */
  impact?: string
}

// ============================================================================
// 主分析函数
// ============================================================================

/**
 * 分析字体文件
 * 
 * @param buffer - 字体文件 Buffer
 * @returns 字体分析结果
 */
export async function analyzeFont(buffer: Buffer): Promise<FontAnalysis> {
  const font = fontkit.create(buffer) as any
  
  // 获取详细信息
  const info = extractDetailedInfo(font, buffer.length)
  
  // 分析 Unicode 范围
  const unicodeRanges = analyzeUnicodeRanges(font)
  
  // 统计字符
  const charStats = analyzeCharacters(font)
  
  // 生成优化建议
  const suggestions = generateSuggestions(info, charStats, buffer.length)
  
  return {
    info,
    unicodeRanges,
    charStats,
    suggestions,
    analyzedAt: Date.now(),
  }
}

// ============================================================================
// 信息提取
// ============================================================================

/**
 * 提取字体详细信息
 */
function extractDetailedInfo(font: any, fileSize: number): FontInfoDetailed {
  const format = detectFontType(font)
  
  return {
    format,
    family: font.familyName || 'Unknown',
    style: font.subfamilyName || 'Regular',
    weight: font['OS/2']?.usWeightClass || 400,
    glyphCount: font.numGlyphs || 0,
    version: font.version?.toString() || '1.0',
    fullName: font.fullName || undefined,
    postScriptName: font.postscriptName || undefined,
    designer: font.designer || undefined,
    manufacturer: font.manufacturer || undefined,
    copyright: font.copyright || undefined,
    license: font.licenseDescription || undefined,
    created: font.created ? new Date(font.created) : undefined,
    modified: font.modified ? new Date(font.modified) : undefined,
    isCFF: font.CFF != null,
    isVariable: font.fvar != null,
    fileSize,
  }
}

/**
 * 检测字体类型
 */
function detectFontType(font: any): 'ttf' | 'otf' | 'unknown' {
  if (font.CFF) return 'otf'
  if (font.glyf) return 'ttf'
  return 'unknown'
}

// ============================================================================
// Unicode 范围分析
// ============================================================================

/**
 * 分析字体支持的 Unicode 范围
 */
function analyzeUnicodeRanges(font: any): UnicodeRangeInfo[] {
  const results: UnicodeRangeInfo[] = []
  const cmap = font.characterSet
  
  if (!cmap || cmap.size === 0) return results
  
  // 预定义的 Unicode 范围
  const ranges: Array<{ name: string; range: string; start: number; end: number }> = [
    { name: '基础拉丁', range: UNICODE_RANGES.BASIC_LATIN, start: 0x0000, end: 0x007F },
    { name: '拉丁补充', range: UNICODE_RANGES.LATIN_SUPPLEMENT, start: 0x0080, end: 0x00FF },
    { name: '拉丁扩展 A', range: UNICODE_RANGES.LATIN_EXTENDED_A, start: 0x0100, end: 0x017F },
    { name: '拉丁扩展 B', range: UNICODE_RANGES.LATIN_EXTENDED_B, start: 0x0180, end: 0x024F },
    { name: '希腊字母', range: UNICODE_RANGES.GREEK, start: 0x0370, end: 0x03FF },
    { name: '西里尔字母', range: UNICODE_RANGES.CYRILLIC, start: 0x0400, end: 0x04FF },
    { name: 'CJK 标点', range: UNICODE_RANGES.CJK_PUNCTUATION, start: 0x3000, end: 0x303F },
    { name: '平假名', range: UNICODE_RANGES.HIRAGANA, start: 0x3040, end: 0x309F },
    { name: '片假名', range: UNICODE_RANGES.KATAKANA, start: 0x30A0, end: 0x30FF },
    { name: 'CJK 统一表意文字', range: UNICODE_RANGES.CJK_UNIFIED, start: 0x4E00, end: 0x9FFF },
    { name: '韩文音节', range: UNICODE_RANGES.HANGUL, start: 0xAC00, end: 0xD7AF },
    { name: '全角形式', range: UNICODE_RANGES.FULLWIDTH_FORMS, start: 0xFF00, end: 0xFFEF },
  ]
  
  for (const { name, range, start, end } of ranges) {
    let count = 0
    const totalInRange = end - start + 1
    
    for (const codePoint of cmap) {
      if (codePoint >= start && codePoint <= end) {
        count++
      }
    }
    
    if (count > 0) {
      results.push({
        name,
        range,
        glyphCount: count,
        coverage: (count / totalInRange) * 100,
      })
    }
  }
  
  // 按字形数量排序
  results.sort((a, b) => b.glyphCount - a.glyphCount)
  
  return results
}

/**
 * 从字符集检测 Unicode 范围字符串
 * 
 * @param chars - 字符数组或字符串
 * @returns Unicode 范围字符串
 */
export function detectUnicodeRange(chars: string | string[]): string {
  const charArray = typeof chars === 'string' ? [...chars] : chars
  const codePoints = charArray
    .map(c => c.codePointAt(0) || 0)
    .filter(cp => cp > 0)
    .sort((a, b) => a - b)
  
  if (codePoints.length === 0) return ''
  
  const ranges: string[] = []
  let rangeStart = codePoints[0]
  let rangeEnd = codePoints[0]
  
  for (let i = 1; i < codePoints.length; i++) {
    if (codePoints[i] === rangeEnd + 1) {
      rangeEnd = codePoints[i]
    } else {
      ranges.push(formatRange(rangeStart, rangeEnd))
      rangeStart = codePoints[i]
      rangeEnd = codePoints[i]
    }
  }
  ranges.push(formatRange(rangeStart, rangeEnd))
  
  return ranges.join(', ')
}

/**
 * 格式化 Unicode 范围
 */
function formatRange(start: number, end: number): string {
  const startStr = `U+${start.toString(16).toUpperCase().padStart(4, '0')}`
  if (start === end) {
    return startStr
  }
  const endStr = end.toString(16).toUpperCase().padStart(4, '0')
  return `${startStr}-${endStr}`
}

// ============================================================================
// 字符统计
// ============================================================================

/**
 * 分析字体中的字符
 */
function analyzeCharacters(font: any): CharacterStats {
  const cmap = font.characterSet
  const distribution: Record<string, number> = {}
  
  let asciiCount = 0
  let latinExtendedCount = 0
  let cjkCount = 0
  let otherCount = 0
  
  if (cmap) {
    for (const codePoint of cmap) {
      if (codePoint < 0x0080) {
        asciiCount++
        distribution['ASCII'] = (distribution['ASCII'] || 0) + 1
      } else if (codePoint < 0x0250) {
        latinExtendedCount++
        distribution['拉丁扩展'] = (distribution['拉丁扩展'] || 0) + 1
      } else if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
        cjkCount++
        distribution['CJK'] = (distribution['CJK'] || 0) + 1
      } else if (codePoint >= 0x3040 && codePoint <= 0x30FF) {
        distribution['日文假名'] = (distribution['日文假名'] || 0) + 1
        otherCount++
      } else if (codePoint >= 0xAC00 && codePoint <= 0xD7AF) {
        distribution['韩文'] = (distribution['韩文'] || 0) + 1
        otherCount++
      } else {
        distribution['其他'] = (distribution['其他'] || 0) + 1
        otherCount++
      }
    }
  }
  
  return {
    totalGlyphs: font.numGlyphs || 0,
    asciiCount,
    latinExtendedCount,
    cjkCount,
    otherCount,
    distribution,
  }
}

// ============================================================================
// 优化建议
// ============================================================================

/**
 * 生成优化建议
 */
function generateSuggestions(
  info: FontInfoDetailed,
  stats: CharacterStats,
  fileSize: number
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  
  // 文件大小建议
  if (fileSize > FILE_SIZE_LIMITS.WARNING_SIZE) {
    suggestions.push({
      type: 'size',
      severity: 'critical',
      title: '字体文件过大',
      description: `当前文件大小 ${formatBytes(fileSize)}，超过推荐的 ${formatBytes(FILE_SIZE_LIMITS.RECOMMENDED_WEB_SIZE)}`,
      impact: '建议使用子集化减小文件体积',
    })
  } else if (fileSize > FILE_SIZE_LIMITS.RECOMMENDED_WEB_SIZE) {
    suggestions.push({
      type: 'size',
      severity: 'warning',
      title: '字体文件较大',
      description: `当前文件大小 ${formatBytes(fileSize)}，可能影响网页加载速度`,
      impact: '考虑使用子集化或 WOFF2 格式',
    })
  }
  
  // CJK 字体优化建议
  if (stats.cjkCount > 1000) {
    suggestions.push({
      type: 'subset',
      severity: 'warning',
      title: '包含大量 CJK 字符',
      description: `检测到 ${stats.cjkCount} 个 CJK 字符，这是文件大小的主要来源`,
      impact: '强烈建议只保留实际使用的字符',
    })
  }
  
  // 格式建议
  if (info.format === 'ttf' || info.format === 'otf') {
    suggestions.push({
      type: 'format',
      severity: 'info',
      title: '建议转换为 WOFF2',
      description: 'WOFF2 格式通常比原格式小 30%-50%',
      impact: '可显著减少加载时间',
    })
  }
  
  // 可变字体建议
  if (info.isVariable) {
    suggestions.push({
      type: 'performance',
      severity: 'info',
      title: '检测到可变字体',
      description: '可变字体可以替代多个字重版本，减少总体文件数量',
      impact: '单个文件支持多种字重变化',
    })
  }
  
  // 字重建议
  const weightName = FONT_WEIGHT_NAMES[info.weight] || info.weight.toString()
  suggestions.push({
    type: 'compatibility',
    severity: 'info',
    title: `字体字重: ${weightName} (${info.weight})`,
    description: '请确保在 CSS 中使用正确的 font-weight 值',
  })
  
  return suggestions
}

// ============================================================================
// 字形信息
// ============================================================================

/**
 * 获取字体中的所有字形信息
 * 
 * @param buffer - 字体文件 Buffer
 * @returns 字形信息数组
 */
export async function getGlyphInfos(buffer: Buffer): Promise<GlyphInfo[]> {
  const font = fontkit.create(buffer) as any
  const glyphs: GlyphInfo[] = []
  
  const numGlyphs = font.numGlyphs || 0
  
  for (let i = 0; i < numGlyphs; i++) {
    try {
      const glyph = font.getGlyph(i)
      glyphs.push({
        id: i,
        name: glyph.name || undefined,
        unicode: glyph.codePoints?.[0] || undefined,
        advanceWidth: glyph.advanceWidth || undefined,
      })
    } catch {
      // 跳过无法获取的字形
    }
  }
  
  return glyphs
}

/**
 * 检查字体是否包含指定字符
 * 
 * @param buffer - 字体文件 Buffer
 * @param chars - 要检查的字符
 * @returns 检查结果
 */
export async function checkCharSupport(
  buffer: Buffer,
  chars: string
): Promise<{
  supported: string[]
  missing: string[]
  supportRate: number
}> {
  const font = fontkit.create(buffer) as any
  const charSet = font.characterSet
  
  const supported: string[] = []
  const missing: string[] = []
  
  for (const char of chars) {
    const codePoint = char.codePointAt(0) || 0
    if (charSet.has(codePoint)) {
      supported.push(char)
    } else {
      missing.push(char)
    }
  }
  
  return {
    supported,
    missing,
    supportRate: (supported.length / chars.length) * 100,
  }
}

// ============================================================================
// 生成分析报告
// ============================================================================

/**
 * 生成字体分析报告
 * 
 * @param analysis - 分析结果
 * @returns 报告字符串
 */
export function generateReport(analysis: FontAnalysis): string {
  const { info, unicodeRanges, charStats, suggestions } = analysis
  const lines: string[] = []
  
  lines.push('╔══════════════════════════════════════════════════════════════╗')
  lines.push('║                    字体分析报告                              ║')
  lines.push('╚══════════════════════════════════════════════════════════════╝')
  lines.push('')
  
  // 基本信息
  lines.push('📋 基本信息')
  lines.push('─'.repeat(60))
  lines.push(`  字体名称: ${info.family}`)
  lines.push(`  样式: ${info.style}`)
  lines.push(`  字重: ${info.weight} (${FONT_WEIGHT_NAMES[info.weight] || 'Custom'})`)
  lines.push(`  格式: ${info.format.toUpperCase()}`)
  lines.push(`  版本: ${info.version}`)
  lines.push(`  字形数: ${info.glyphCount.toLocaleString()}`)
  lines.push(`  文件大小: ${formatBytes(info.fileSize || 0)}`)
  if (info.isVariable) lines.push(`  可变字体: 是`)
  lines.push('')
  
  // 字符统计
  lines.push('📊 字符统计')
  lines.push('─'.repeat(60))
  lines.push(`  总字形数: ${charStats.totalGlyphs.toLocaleString()}`)
  lines.push(`  ASCII: ${charStats.asciiCount}`)
  lines.push(`  拉丁扩展: ${charStats.latinExtendedCount}`)
  lines.push(`  CJK: ${charStats.cjkCount}`)
  lines.push(`  其他: ${charStats.otherCount}`)
  lines.push('')
  
  // Unicode 范围
  if (unicodeRanges.length > 0) {
    lines.push('🌐 Unicode 范围')
    lines.push('─'.repeat(60))
    for (const range of unicodeRanges.slice(0, 8)) {
      const bar = '█'.repeat(Math.round(range.coverage / 10))
      lines.push(`  ${range.name.padEnd(20)} ${range.glyphCount.toString().padStart(6)} ${bar} ${range.coverage.toFixed(1)}%`)
    }
    if (unicodeRanges.length > 8) {
      lines.push(`  ... 还有 ${unicodeRanges.length - 8} 个范围`)
    }
    lines.push('')
  }
  
  // 优化建议
  if (suggestions.length > 0) {
    lines.push('💡 优化建议')
    lines.push('─'.repeat(60))
    for (const suggestion of suggestions) {
      const icon = suggestion.severity === 'critical' ? '🔴' :
                   suggestion.severity === 'warning' ? '🟡' : 'ℹ️'
      lines.push(`  ${icon} ${suggestion.title}`)
      lines.push(`     ${suggestion.description}`)
      if (suggestion.impact) {
        lines.push(`     → ${suggestion.impact}`)
      }
      lines.push('')
    }
  }
  
  return lines.join('\n')
}
