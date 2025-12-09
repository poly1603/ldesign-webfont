/**
 * 字体格式类型
 */
export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2' | 'unknown'

/**
 * 输出格式类型
 */
export type OutputFormat = 'woff' | 'woff2' | 'ttf'

/**
 * 字体信息接口
 */
export interface FontInfo {
  format: FontFormat
  family: string
  style: string
  weight: number
  glyphCount: number
  version?: string
}

/**
 * 转换选项接口
 */
export interface ConvertOptions {
  inputBuffer: Buffer
  inputFormat: FontFormat
  outputFormats: OutputFormat[]
}

/**
 * 转换结果接口
 */
export interface ConvertResult {
  format: OutputFormat
  buffer: Buffer
  size: number
}

/**
 * 子集化选项接口
 */
export interface SubsetOptions {
  fontBuffer: Buffer
  text: string
  hinting?: boolean
}

/**
 * CSS生成选项接口
 */
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

/**
 * Web字体插件选项接口
 */
export interface WebFontPluginOptions {
  /** 字体文件路径（支持glob模式） */
  include?: string | string[]
  /** 要包含的文字 */
  text?: string
  /** 从文件读取文字 */
  textFile?: string
  /** 输出格式 */
  formats?: OutputFormat[]
  /** 输出目录 */
  outputDir?: string
  /** 是否生成CSS文件 */
  cssOutput?: boolean | string
  /** 字体名称 */
  fontFamily?: string
  /** 字体粗细 */
  fontWeight?: number
  /** 字体样式 */
  fontStyle?: string
  /** 字体显示策略 */
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}