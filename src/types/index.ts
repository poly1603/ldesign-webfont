/**
 * 类型定义模块
 * 
 * 提供字体处理相关的所有类型定义
 * 
 * @packageDocumentation
 */

// ============================================================================
// 品牌类型
// ============================================================================

/** 品牌类型符号 */
declare const __brand: unique symbol

/**
 * 品牌类型 - 提供名义类型安全
 * 
 * @typeParam T - 基础类型
 * @typeParam B - 品牌标识
 */
export type Brand<T, B extends string> = T & { readonly [__brand]: B }

/**
 * 字体文件 Buffer - 确保是有效的字体数据
 */
export type FontBuffer = Brand<Buffer, 'FontBuffer'>

/**
 * 字体文件路径
 */
export type FontPath = Brand<string, 'FontPath'>

/**
 * 字体家族名称
 */
export type FontFamilyName = Brand<string, 'FontFamilyName'>

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 字体格式类型
 * 
 * - `ttf`: TrueType Font
 * - `otf`: OpenType Font (CFF)
 * - `woff`: Web Open Font Format 1.0
 * - `woff2`: Web Open Font Format 2.0
 * - `unknown`: 未知格式
 */
export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2' | 'unknown'

/**
 * 输出格式类型
 * 
 * - `woff2`: 推荐，压缩率最高
 * - `woff`: 兼容性好
 * - `ttf`: 原始格式
 */
export type OutputFormat = 'woff' | 'woff2' | 'ttf'

/**
 * 字体显示策略
 * 
 * - `auto`: 浏览器默认行为
 * - `block`: 阻塞文本渲染直到字体加载
 * - `swap`: 立即显示后备字体，加载完成后切换
 * - `fallback`: 短暂阻塞后显示后备字体
 * - `optional`: 字体可选，可能不使用
 */
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

/**
 * 字体样式
 */
export type FontStyle = 'normal' | 'italic' | 'oblique'

/**
 * 字体粗细值
 */
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | number

// ============================================================================
// 字体信息接口
// ============================================================================

/**
 * 字体基本信息
 */
export interface FontInfo {
  /** 字体格式 */
  format: FontFormat
  
  /** 字体家族名 */
  family: string
  
  /** 字体样式（Regular, Bold, Italic 等） */
  style: string
  
  /** 字体粗细值 (100-900) */
  weight: number
  
  /** 字形数量 */
  glyphCount: number
  
  /** 字体版本 */
  version?: string
}

/**
 * 详细字体信息
 */
export interface FontInfoDetailed extends FontInfo {
  /** 字体全名 */
  fullName?: string
  
  /** PostScript 名称 */
  postScriptName?: string
  
  /** 设计师 */
  designer?: string
  
  /** 制造商 */
  manufacturer?: string
  
  /** 版权信息 */
  copyright?: string
  
  /** 许可证信息 */
  license?: string
  
  /** 设计日期 */
  created?: Date
  
  /** 修改日期 */
  modified?: Date
  
  /** 是否包含 CFF 轮廓 */
  isCFF?: boolean
  
  /** 是否为可变字体 */
  isVariable?: boolean
  
  /** 支持的 Unicode 范围 */
  unicodeRanges?: string[]
  
  /** 文件大小（字节） */
  fileSize?: number
}

/**
 * 字形信息
 */
export interface GlyphInfo {
  /** 字形 ID */
  id: number
  
  /** 字形名称 */
  name?: string
  
  /** Unicode 码点 */
  unicode?: number
  
  /** 字形宽度 */
  advanceWidth?: number
}

// ============================================================================
// 转换相关接口
// ============================================================================

/**
 * 转换选项
 */
export interface ConvertOptions {
  /** 输入字体 Buffer */
  inputBuffer: Buffer
  
  /** 输入格式 */
  inputFormat: FontFormat
  
  /** 输出格式列表 */
  outputFormats: OutputFormat[]
  
  /** 进度回调 */
  onProgress?: (progress: ConvertProgress) => void
}

/**
 * 转换进度
 */
export interface ConvertProgress {
  /** 当前阶段 */
  stage: 'parsing' | 'converting' | 'compressing' | 'complete'
  
  /** 进度百分比 (0-100) */
  percent: number
  
  /** 当前处理的格式 */
  currentFormat?: OutputFormat
  
  /** 消息 */
  message?: string
}

/**
 * 转换结果
 */
export interface ConvertResult {
  /** 输出格式 */
  format: OutputFormat
  
  /** 输出 Buffer */
  buffer: Buffer
  
  /** 文件大小（字节） */
  size: number
  
  /** 压缩率 */
  compressionRatio?: number
}

// ============================================================================
// 子集化相关接口
// ============================================================================

/**
 * 子集化选项
 */
export interface SubsetOptions {
  /** 字体 Buffer */
  fontBuffer: Buffer
  
  /** 要包含的文本 */
  text: string
  
  /** 是否保留 hinting 信息 */
  hinting?: boolean
  
  /** 是否保留 layout 特性 */
  layoutFeatures?: boolean
}

/**
 * 子集化结果
 */
export interface SubsetResult {
  /** 子集化后的 Buffer */
  buffer: Buffer
  
  /** 原始大小 */
  originalSize: number
  
  /** 子集化后大小 */
  subsetSize: number
  
  /** 减小的百分比 */
  reduction: number
  
  /** 包含的字符数 */
  charCount: number
  
  /** 包含的字形数 */
  glyphCount: number
}

// ============================================================================
// CSS 生成相关接口
// ============================================================================

/**
 * CSS 字体文件信息
 */
export interface CSSFontFile {
  /** 字体格式 */
  format: OutputFormat | string
  
  /** 文件路径（相对或绝对） */
  path: string
}

/**
 * CSS 生成选项
 */
export interface CSSOptions {
  /** 字体家族名 */
  fontFamily: string
  
  /** 字体文件列表 */
  fontFiles: CSSFontFile[]
  
  /** 字体粗细 */
  fontWeight?: FontWeight
  
  /** 字体样式 */
  fontStyle?: FontStyle | string
  
  /** 字体显示策略 */
  fontDisplay?: FontDisplay
  
  /** Unicode 范围 */
  unicodeRange?: string
  
  /** 自定义属性 */
  customProperties?: Record<string, string>
}

/**
 * CSS 生成结果
 */
export interface CSSGenerateResult {
  /** 生成的 CSS 内容 */
  css: string
  
  /** 包含的 @font-face 数量 */
  fontFaceCount: number
}

// ============================================================================
// 插件配置接口
// ============================================================================

/**
 * Web 字体插件选项
 */
export interface WebFontPluginOptions {
  /** 
   * 字体文件路径（支持 glob 模式）
   * 
   * @example
   * ```ts
   * include: './fonts/*.ttf'
   * include: ['./fonts/*.ttf', './fonts/*.otf']
   * ```
   */
  include?: string | string[]
  
  /** 
   * 要包含的文字
   * 
   * 用于字体子集化，只保留指定的字符
   */
  text?: string
  
  /** 
   * 从文件读取要包含的文字
   * 
   * 与 text 选项可同时使用，会合并
   */
  textFile?: string
  
  /** 
   * 输出格式
   * 
   * @default ['woff2', 'woff']
   */
  formats?: OutputFormat[]
  
  /** 
   * 输出目录
   * 
   * @default 'fonts'
   */
  outputDir?: string
  
  /** 
   * 是否生成 CSS 文件
   * 
   * - `true`: 生成同名 CSS 文件
   * - `string`: 指定 CSS 文件路径
   * - `false`: 不生成
   * 
   * @default true
   */
  cssOutput?: boolean | string
  
  /** 
   * 字体家族名称
   * 
   * 默认使用字体文件中的名称
   */
  fontFamily?: string
  
  /** 
   * 字体粗细
   * 
   * @default 400
   */
  fontWeight?: FontWeight
  
  /** 
   * 字体样式
   * 
   * @default 'normal'
   */
  fontStyle?: FontStyle | string
  
  /** 
   * 字体显示策略
   * 
   * @default 'swap'
   */
  fontDisplay?: FontDisplay
  
  /**
   * 日志级别
   * 
   * @default 'info'
   */
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug'
  
  /**
   * 构建前回调
   */
  onBuildStart?: () => void | Promise<void>
  
  /**
   * 构建后回调
   */
  onBuildEnd?: (result: BuildResult) => void | Promise<void>
}

/**
 * 构建结果
 */
export interface BuildResult {
  /** 处理的字体文件数 */
  fontCount: number
  
  /** 生成的文件数 */
  outputCount: number
  
  /** 总耗时（毫秒） */
  duration: number
  
  /** 各字体的处理结果 */
  results: FontProcessResult[]
}

/**
 * 单个字体处理结果
 */
export interface FontProcessResult {
  /** 源文件路径 */
  source: string
  
  /** 字体信息 */
  fontInfo: FontInfo
  
  /** 输出文件 */
  outputs: OutputFile[]
  
  /** CSS 文件路径 */
  cssFile?: string
  
  /** 原始大小 */
  originalSize: number
  
  /** 子集化后大小 */
  subsetSize?: number
}

/**
 * 输出文件信息
 */
export interface OutputFile {
  /** 文件路径 */
  path: string
  
  /** 文件格式 */
  format: OutputFormat
  
  /** 文件大小 */
  size: number
}

// ============================================================================
// CLI 相关接口
// ============================================================================

/**
 * CLI 转换命令选项
 */
export interface CLIConvertOptions {
  /** 输出目录 */
  output: string
  
  /** 输出格式 */
  formats: string
  
  /** 字体家族名 */
  fontFamily?: string
  
  /** 是否生成 CSS */
  css: boolean
}

/**
 * CLI 子集化命令选项
 */
export interface CLISubsetOptions extends CLIConvertOptions {
  /** 要包含的文字 */
  text?: string
  
  /** 文字文件路径 */
  textFile?: string
}

/**
 * CLI 服务命令选项
 */
export interface CLIServeOptions {
  /** 端口号 */
  port: string
  
  /** 是否自动打开浏览器 */
  open: boolean
}

// ============================================================================
// 类型守卫函数
// ============================================================================

/**
 * 检查是否为有效的字体格式
 */
export function isFontFormat(value: unknown): value is FontFormat {
  return (
    typeof value === 'string' &&
    ['ttf', 'otf', 'woff', 'woff2', 'unknown'].includes(value)
  )
}

/**
 * 检查是否为有效的输出格式
 */
export function isOutputFormat(value: unknown): value is OutputFormat {
  return (
    typeof value === 'string' &&
    ['ttf', 'woff', 'woff2'].includes(value)
  )
}

/**
 * 检查是否为有效的字体显示策略
 */
export function isFontDisplay(value: unknown): value is FontDisplay {
  return (
    typeof value === 'string' &&
    ['auto', 'block', 'swap', 'fallback', 'optional'].includes(value)
  )
}

/**
 * 检查是否为有效的字体粗细值
 */
export function isValidFontWeight(value: unknown): value is FontWeight {
  if (typeof value !== 'number') return false
  return value >= 1 && value <= 1000
}

/**
 * 检查是否为 FontInfo 对象
 */
export function isFontInfo(value: unknown): value is FontInfo {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    isFontFormat(obj.format) &&
    typeof obj.family === 'string' &&
    typeof obj.style === 'string' &&
    typeof obj.weight === 'number' &&
    typeof obj.glyphCount === 'number'
  )
}

// ============================================================================
// 实用类型
// ============================================================================

/**
 * 深度部分化
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * 深度只读
 */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 可选类型
 */
export type Maybe<T> = T | null | undefined

/**
 * 确保类型为数组
 */
export type Arrayable<T> = T | T[]

/**
 * 确保类型为 Promise
 */
export type Promisable<T> = T | Promise<T>
