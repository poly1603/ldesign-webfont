/**
 * 工具函数模块
 * 
 * 提供缓存、验证、格式化等通用工具函数
 * 
 * @packageDocumentation
 */

import { createHash } from 'crypto'
import {
  FONT_SIGNATURES,
  SUPPORTED_INPUT_FORMATS,
  SUPPORTED_OUTPUT_FORMATS,
  FILE_SIZE_LIMITS,
} from '../constants/index.js'
import type { FontFormat, OutputFormat } from '../types/index.js'

// ============================================================================
// 字节格式化
// ============================================================================

/**
 * 格式化字节大小为人类可读格式
 * 
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 * 
 * @example
 * ```ts
 * formatBytes(1024)       // '1.0 KB'
 * formatBytes(1536, 2)    // '1.50 KB'
 * formatBytes(1048576)    // '1.0 MB'
 * ```
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  if (bytes < 0) return '-' + formatBytes(-bytes, decimals)
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

/**
 * 解析字节大小字符串
 * 
 * @param str - 大小字符串，如 '10MB', '1.5KB'
 * @returns 字节数
 */
export function parseBytes(str: string): number {
  const match = str.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = (match[2] || 'B').toUpperCase()
  
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  }
  
  return Math.round(value * (multipliers[unit] || 1))
}

/**
 * 计算压缩率
 * 
 * @param originalSize - 原始大小
 * @param compressedSize - 压缩后大小
 * @returns 压缩率百分比
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0
  return ((1 - compressedSize / originalSize) * 100)
}

// ============================================================================
// 时间格式化
// ============================================================================

/**
 * 格式化毫秒为人类可读格式
 * 
 * @param ms - 毫秒数
 * @returns 格式化后的字符串
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

// ============================================================================
// 哈希计算
// ============================================================================

/**
 * 计算 Buffer 的哈希值
 * 
 * @param buffer - 输入 Buffer
 * @param algorithm - 哈希算法
 * @returns 哈希值（十六进制）
 */
export function calculateHash(
  buffer: Buffer,
  algorithm: 'md5' | 'sha1' | 'sha256' = 'sha256'
): string {
  return createHash(algorithm).update(buffer).digest('hex')
}

/**
 * 计算 Buffer 的短哈希（用于缓存键）
 * 
 * @param buffer - 输入 Buffer
 * @returns 8 位短哈希
 */
export function calculateShortHash(buffer: Buffer): string {
  return calculateHash(buffer, 'md5').slice(0, 8)
}

// ============================================================================
// 字体格式验证
// ============================================================================

/**
 * 检测 Buffer 的字体格式
 * 
 * @param buffer - 字体文件 Buffer
 * @returns 检测到的格式
 */
export function detectFormat(buffer: Buffer): FontFormat {
  if (buffer.length < 4) return 'unknown'
  
  const signature = buffer.toString('utf8', 0, 4)
  const magic = buffer.readUInt32BE(0)
  
  if (signature === FONT_SIGNATURES.WOFF) return 'woff'
  if (signature === FONT_SIGNATURES.WOFF2) return 'woff2'
  if (signature === FONT_SIGNATURES.OTTO) return 'otf'
  if (magic === FONT_SIGNATURES.TTF_0100 || magic === FONT_SIGNATURES.TTF_TRUE) return 'ttf'
  
  return 'unknown'
}

/**
 * 检查是否为有效的字体 Buffer
 * 
 * @param buffer - 要检查的 Buffer
 * @returns 是否为有效字体
 */
export function isValidFontBuffer(buffer: Buffer): boolean {
  return detectFormat(buffer) !== 'unknown'
}

/**
 * 验证输入格式
 * 
 * @param format - 格式字符串
 * @returns 是否为支持的输入格式
 */
export function isValidInputFormat(format: string): format is FontFormat {
  return SUPPORTED_INPUT_FORMATS.includes(format as FontFormat)
}

/**
 * 验证输出格式
 * 
 * @param format - 格式字符串
 * @returns 是否为支持的输出格式
 */
export function isValidOutputFormat(format: string): format is OutputFormat {
  return SUPPORTED_OUTPUT_FORMATS.includes(format as OutputFormat)
}

/**
 * 解析格式字符串
 * 
 * @param formats - 逗号分隔的格式字符串
 * @returns 输出格式数组
 */
export function parseFormats(formats: string): OutputFormat[] {
  return formats
    .split(',')
    .map(f => f.trim().toLowerCase() as OutputFormat)
    .filter(isValidOutputFormat)
}

// ============================================================================
// 文件大小验证
// ============================================================================

/**
 * 检查文件大小是否在限制内
 * 
 * @param size - 文件大小
 * @param maxSize - 最大允许大小
 * @returns 是否在限制内
 */
export function isWithinSizeLimit(
  size: number,
  maxSize: number = FILE_SIZE_LIMITS.MAX_INPUT_SIZE
): boolean {
  return size <= maxSize
}

/**
 * 检查是否需要警告文件大小
 * 
 * @param size - 文件大小
 * @returns 是否需要警告
 */
export function shouldWarnSize(size: number): boolean {
  return size > FILE_SIZE_LIMITS.WARNING_SIZE
}

/**
 * 检查是否超过推荐的 Web 字体大小
 * 
 * @param size - 文件大小
 * @returns 是否超过推荐大小
 */
export function exceedsRecommendedSize(size: number): boolean {
  return size > FILE_SIZE_LIMITS.RECOMMENDED_WEB_SIZE
}

// ============================================================================
// 文本处理
// ============================================================================

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
 * 统计文本中的字符数
 * 
 * @param text - 输入文本
 * @returns 统计结果
 */
export function analyzeText(text: string): {
  total: number
  unique: number
  ascii: number
  cjk: number
  other: number
} {
  const chars = [...text]
  const unique = new Set(chars)
  
  let ascii = 0
  let cjk = 0
  let other = 0
  
  for (const char of unique) {
    const code = char.codePointAt(0) || 0
    if (code < 128) {
      ascii++
    } else if (code >= 0x4E00 && code <= 0x9FFF) {
      cjk++
    } else {
      other++
    }
  }
  
  return {
    total: chars.length,
    unique: unique.size,
    ascii,
    cjk,
    other,
  }
}

/**
 * 获取字符的 Unicode 码点
 * 
 * @param char - 单个字符
 * @returns Unicode 码点
 */
export function getCodePoint(char: string): number {
  return char.codePointAt(0) || 0
}

/**
 * 将 Unicode 码点转换为 U+XXXX 格式
 * 
 * @param codePoint - Unicode 码点
 * @returns U+XXXX 格式字符串
 */
export function formatCodePoint(codePoint: number): string {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
}

// ============================================================================
// 缓存
// ============================================================================

/**
 * 简单的内存缓存
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number }>()
  private maxSize: number
  
  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }
  
  /**
   * 设置缓存项
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒）
   */
  set(key: string, value: T, ttl = 60000): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    })
  }
  
  /**
   * 获取缓存项
   * 
   * @param key - 缓存键
   * @returns 缓存值或 undefined
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.value
  }
  
  /**
   * 检查缓存项是否存在
   * 
   * @param key - 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }
  
  /**
   * 删除缓存项
   * 
   * @param key - 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }
}

/**
 * 字体处理结果缓存
 */
export const fontCache = new MemoryCache<Buffer>(50)

// ============================================================================
// 路径处理
// ============================================================================

/**
 * 获取文件扩展名（不含点）
 * 
 * @param filePath - 文件路径
 * @returns 扩展名
 */
export function getExtension(filePath: string): string {
  const match = filePath.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * 替换文件扩展名
 * 
 * @param filePath - 文件路径
 * @param newExt - 新扩展名
 * @returns 新路径
 */
export function replaceExtension(filePath: string, newExt: string): string {
  return filePath.replace(/\.[^.]+$/, `.${newExt}`)
}

/**
 * 从路径获取文件名（不含扩展名）
 * 
 * @param filePath - 文件路径
 * @returns 文件名
 */
export function getBaseName(filePath: string): string {
  const name = filePath.split(/[/\\]/).pop() || ''
  return name.replace(/\.[^.]+$/, '')
}

// ============================================================================
// 异步工具
// ============================================================================

/**
 * 延迟执行
 * 
 * @param ms - 延迟时间（毫秒）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 带超时的 Promise
 * 
 * @param promise - 原始 Promise
 * @param ms - 超时时间（毫秒）
 * @param message - 超时错误消息
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms)
  })
  
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId!)
  }
}

/**
 * 批量执行并发任务
 * 
 * @param items - 要处理的项
 * @param fn - 处理函数
 * @param concurrency - 并发数
 */
export async function batchProcess<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = []
  const executing: Promise<void>[] = []
  
  for (let i = 0; i < items.length; i++) {
    const promise = fn(items[i], i).then(result => {
      results[i] = result
    })
    
    executing.push(promise as Promise<void>)
    
    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      )
    }
  }
  
  await Promise.all(executing)
  return results
}

// ============================================================================
// 进度追踪
// ============================================================================

/**
 * 进度追踪器
 */
export class ProgressTracker {
  private total: number
  private current = 0
  private startTime: number
  private onProgress?: (progress: ProgressInfo) => void
  
  constructor(
    total: number,
    onProgress?: (progress: ProgressInfo) => void
  ) {
    this.total = total
    this.startTime = Date.now()
    this.onProgress = onProgress
  }
  
  /**
   * 更新进度
   */
  update(increment = 1, message?: string): void {
    this.current = Math.min(this.current + increment, this.total)
    this.notify(message)
  }
  
  /**
   * 设置当前进度
   */
  setCurrent(current: number, message?: string): void {
    this.current = Math.min(current, this.total)
    this.notify(message)
  }
  
  /**
   * 完成进度
   */
  complete(message?: string): void {
    this.current = this.total
    this.notify(message)
  }
  
  private notify(message?: string): void {
    if (!this.onProgress) return
    
    const elapsed = Date.now() - this.startTime
    const percent = this.total > 0 ? (this.current / this.total) * 100 : 0
    const eta = percent > 0 ? (elapsed / percent) * (100 - percent) : 0
    
    this.onProgress({
      current: this.current,
      total: this.total,
      percent,
      elapsed,
      eta,
      message,
    })
  }
}

/**
 * 进度信息
 */
export interface ProgressInfo {
  current: number
  total: number
  percent: number
  elapsed: number
  eta: number
  message?: string
}

// ============================================================================
// 验证工具
// ============================================================================

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 创建验证器
 */
export function createValidator<T>() {
  const rules: Array<{
    check: (value: T) => boolean
    message: string
    isWarning?: boolean
  }> = []
  
  return {
    addRule(
      check: (value: T) => boolean,
      message: string,
      isWarning = false
    ) {
      rules.push({ check, message, isWarning })
      return this
    },
    
    validate(value: T): ValidationResult {
      const errors: string[] = []
      const warnings: string[] = []
      
      for (const rule of rules) {
        if (!rule.check(value)) {
          if (rule.isWarning) {
            warnings.push(rule.message)
          } else {
            errors.push(rule.message)
          }
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
      }
    },
  }
}
