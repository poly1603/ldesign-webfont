/**
 * 常量定义模块
 * 
 * 集中管理所有常量、默认配置、魔数映射等
 * 
 * @packageDocumentation
 */

import type { FontFormat, OutputFormat } from '../types/index.js'

// ============================================================================
// 字体格式魔数
// ============================================================================

/**
 * 字体文件魔数（文件头签名）
 */
export const FONT_SIGNATURES = {
  /** WOFF 格式签名 */
  WOFF: 'wOFF',
  /** WOFF2 格式签名 */
  WOFF2: 'wOF2',
  /** OpenType/CFF 格式签名 */
  OTTO: 'OTTO',
  /** TrueType 格式魔数 */
  TTF_TRUE: 0x74727565, // 'true'
  /** TrueType 格式魔数（Windows） */
  TTF_0100: 0x00010000,
} as const

/**
 * 字体格式 MIME 类型映射
 */
export const FONT_MIME_TYPES: Record<FontFormat, string> = {
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  unknown: 'application/octet-stream',
} as const

/**
 * 字体格式文件扩展名映射
 */
export const FONT_EXTENSIONS: Record<FontFormat, string> = {
  ttf: '.ttf',
  otf: '.otf',
  woff: '.woff',
  woff2: '.woff2',
  unknown: '',
} as const

/**
 * CSS format() 值映射
 */
export const CSS_FORMAT_VALUES: Record<OutputFormat, string> = {
  ttf: 'truetype',
  woff: 'woff',
  woff2: 'woff2',
} as const

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认插件配置
 */
export const DEFAULT_PLUGIN_OPTIONS = {
  /** 默认匹配模式 */
  include: '**/*.{ttf,otf,woff,woff2}',
  /** 默认输出格式 */
  formats: ['woff2', 'woff'] as OutputFormat[],
  /** 默认输出目录 */
  outputDir: 'fonts',
  /** 默认生成 CSS */
  cssOutput: true,
  /** 默认字体显示策略 */
  fontDisplay: 'swap' as const,
  /** 默认字体粗细 */
  fontWeight: 400,
  /** 默认字体样式 */
  fontStyle: 'normal',
} as const

/**
 * 默认 CLI 配置
 */
export const DEFAULT_CLI_OPTIONS = {
  /** 默认输出目录 */
  output: 'output',
  /** 默认输出格式 */
  formats: 'woff2,woff',
  /** 默认端口号 */
  port: 3333,
} as const

/**
 * 转换配置
 */
export const CONVERT_CONFIG = {
  /** WOFF 头大小 */
  WOFF_HEADER_SIZE: 44,
  /** TTF 头大小 */
  TTF_HEADER_SIZE: 12,
  /** 表目录条目大小 */
  TABLE_DIRECTORY_ENTRY_SIZE: 16,
  /** WOFF 表目录条目大小 */
  WOFF_TABLE_DIRECTORY_ENTRY_SIZE: 20,
  /** 字节对齐 */
  BYTE_ALIGNMENT: 4,
} as const

// ============================================================================
// 字符集预设
// ============================================================================

/**
 * 常用字符集预设
 */
export const CHAR_PRESETS = {
  /** ASCII 数字 */
  DIGITS: '0123456789',
  
  /** ASCII 大写字母 */
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  
  /** ASCII 小写字母 */
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  
  /** ASCII 字母（大小写） */
  LETTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  
  /** ASCII 标点符号 */
  ASCII_PUNCTUATION: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
  
  /** 中文标点符号 */
  CJK_PUNCTUATION: '\uFF0C\u3002\uFF01\uFF1F\uFF1B\uFF1A\u201C\u201D\u2018\u2019\uFF08\uFF09\u3010\u3011\u300A\u300B\u3001\u2026\u2014\u00B7',
  
  /** 空白字符 */
  WHITESPACE: ' \t\n\r',
  
  /** 基础拉丁字符（ASCII 可打印字符） */
  BASIC_LATIN: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
  
  /** 扩展拉丁字符（含重音符号） */
  EXTENDED_LATIN: 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
  
  /** 货币符号 */
  CURRENCY: '$€£¥₹₽¢',
  
  /** 数学符号 */
  MATH_SYMBOLS: '+-×÷=≠<>≤≥±∞√∑∏∫',
  
  /** 箭头符号 */
  ARROWS: '←↑→↓↔↕⇐⇑⇒⇓⇔',
} as const

/**
 * Unicode 范围预设
 */
export const UNICODE_RANGES = {
  /** 基础拉丁 */
  BASIC_LATIN: 'U+0000-007F',
  /** 拉丁补充 */
  LATIN_SUPPLEMENT: 'U+0080-00FF',
  /** 拉丁扩展 A */
  LATIN_EXTENDED_A: 'U+0100-017F',
  /** 拉丁扩展 B */
  LATIN_EXTENDED_B: 'U+0180-024F',
  /** CJK 统一表意文字（基本区） */
  CJK_UNIFIED: 'U+4E00-9FFF',
  /** CJK 统一表意文字扩展 A */
  CJK_EXTENSION_A: 'U+3400-4DBF',
  /** CJK 标点符号 */
  CJK_PUNCTUATION: 'U+3000-303F',
  /** 全角形式 */
  FULLWIDTH_FORMS: 'U+FF00-FFEF',
  /** 希腊字母 */
  GREEK: 'U+0370-03FF',
  /** 西里尔字母 */
  CYRILLIC: 'U+0400-04FF',
  /** 阿拉伯字母 */
  ARABIC: 'U+0600-06FF',
  /** 平假名 */
  HIRAGANA: 'U+3040-309F',
  /** 片假名 */
  KATAKANA: 'U+30A0-30FF',
  /** 韩文音节 */
  HANGUL: 'U+AC00-D7AF',
  /** Emoji */
  EMOJI: 'U+1F300-1F9FF',
} as const

// ============================================================================
// 字体相关常量
// ============================================================================

/**
 * 常见字体粗细值
 */
export const FONT_WEIGHTS = {
  THIN: 100,
  EXTRA_LIGHT: 200,
  LIGHT: 300,
  NORMAL: 400,
  MEDIUM: 500,
  SEMI_BOLD: 600,
  BOLD: 700,
  EXTRA_BOLD: 800,
  BLACK: 900,
} as const

/**
 * 字体粗细名称映射
 */
export const FONT_WEIGHT_NAMES: Record<number, string> = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black',
} as const

/**
 * 字体显示策略
 */
export const FONT_DISPLAY_VALUES = ['auto', 'block', 'swap', 'fallback', 'optional'] as const

/**
 * 支持的输入格式
 */
export const SUPPORTED_INPUT_FORMATS: FontFormat[] = ['ttf', 'otf', 'woff', 'woff2']

/**
 * 支持的输出格式
 */
export const SUPPORTED_OUTPUT_FORMATS: OutputFormat[] = ['ttf', 'woff', 'woff2']

// ============================================================================
// 文件大小限制
// ============================================================================

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  /** 最大输入文件大小（100MB） */
  MAX_INPUT_SIZE: 100 * 1024 * 1024,
  /** 警告阈值（10MB） */
  WARNING_SIZE: 10 * 1024 * 1024,
  /** 推荐的 Web 字体大小（500KB） */
  RECOMMENDED_WEB_SIZE: 500 * 1024,
} as const

// ============================================================================
// 错误代码
// ============================================================================

/**
 * 错误代码
 */
export const ERROR_CODES = {
  // 文件相关错误 (1xxx)
  FILE_NOT_FOUND: 'E1001',
  FILE_READ_ERROR: 'E1002',
  FILE_WRITE_ERROR: 'E1003',
  FILE_TOO_LARGE: 'E1004',
  
  // 格式相关错误 (2xxx)
  INVALID_FORMAT: 'E2001',
  UNSUPPORTED_FORMAT: 'E2002',
  CORRUPT_FONT: 'E2003',
  
  // 转换相关错误 (3xxx)
  CONVERT_FAILED: 'E3001',
  SUBSET_FAILED: 'E3002',
  COMPRESS_FAILED: 'E3003',
  DECOMPRESS_FAILED: 'E3004',
  
  // 配置相关错误 (4xxx)
  INVALID_CONFIG: 'E4001',
  MISSING_REQUIRED: 'E4002',
  
  // 验证相关错误 (5xxx)
  VALIDATION_FAILED: 'E5001',
  EMPTY_TEXT: 'E5002',
} as const

// ============================================================================
// 日志级别
// ============================================================================

/**
 * 日志级别
 */
export const LOG_LEVELS = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5,
} as const

// ============================================================================
// 插件名称
// ============================================================================

/**
 * 插件名称
 */
export const PLUGIN_NAME = 'unplugin-webfont'

/**
 * CLI 名称
 */
export const CLI_NAME = 'webfont'

/**
 * 版本号
 */
export const VERSION = '0.1.0'
