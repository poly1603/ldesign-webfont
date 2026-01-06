/**
 * 错误处理模块
 * 
 * 定义统一的错误类型和错误处理机制
 * 
 * @packageDocumentation
 */

import { ERROR_CODES } from '../constants/index.js'

// ============================================================================
// 基础错误类
// ============================================================================

/**
 * WebFont 错误基类
 * 
 * 所有自定义错误的基类，提供错误码和额外上下文信息
 */
export class WebFontError extends Error {
  /** 错误码 */
  readonly code: string
  
  /** 错误上下文信息 */
  readonly context?: Record<string, unknown>
  
  /** 原始错误 */
  readonly cause?: Error
  
  /** 错误发生时间 */
  readonly timestamp: number
  
  constructor(
    message: string,
    code: string,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'WebFontError'
    this.code = code
    this.cause = options?.cause
    this.context = options?.context
    this.timestamp = Date.now()
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, new.target.prototype)
    
    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
  
  /**
   * 获取完整错误信息
   */
  getFullMessage(): string {
    let msg = `[${this.code}] ${this.message}`
    if (this.cause) {
      msg += `\n  Caused by: ${this.cause.message}`
    }
    return msg
  }
  
  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      cause: this.cause?.message,
      stack: this.stack,
    }
  }
}

// ============================================================================
// 文件相关错误
// ============================================================================

/**
 * 文件未找到错误
 */
export class FileNotFoundError extends WebFontError {
  readonly filePath: string
  
  constructor(filePath: string, cause?: Error) {
    super(
      `文件未找到: ${filePath}`,
      ERROR_CODES.FILE_NOT_FOUND,
      { cause, context: { filePath } }
    )
    this.name = 'FileNotFoundError'
    this.filePath = filePath
  }
}

/**
 * 文件读取错误
 */
export class FileReadError extends WebFontError {
  readonly filePath: string
  
  constructor(filePath: string, cause?: Error) {
    super(
      `无法读取文件: ${filePath}`,
      ERROR_CODES.FILE_READ_ERROR,
      { cause, context: { filePath } }
    )
    this.name = 'FileReadError'
    this.filePath = filePath
  }
}

/**
 * 文件写入错误
 */
export class FileWriteError extends WebFontError {
  readonly filePath: string
  
  constructor(filePath: string, cause?: Error) {
    super(
      `无法写入文件: ${filePath}`,
      ERROR_CODES.FILE_WRITE_ERROR,
      { cause, context: { filePath } }
    )
    this.name = 'FileWriteError'
    this.filePath = filePath
  }
}

/**
 * 文件过大错误
 */
export class FileTooLargeError extends WebFontError {
  readonly filePath: string
  readonly fileSize: number
  readonly maxSize: number
  
  constructor(filePath: string, fileSize: number, maxSize: number) {
    super(
      `文件过大: ${filePath} (${formatBytes(fileSize)} > ${formatBytes(maxSize)})`,
      ERROR_CODES.FILE_TOO_LARGE,
      { context: { filePath, fileSize, maxSize } }
    )
    this.name = 'FileTooLargeError'
    this.filePath = filePath
    this.fileSize = fileSize
    this.maxSize = maxSize
  }
}

// ============================================================================
// 格式相关错误
// ============================================================================

/**
 * 无效格式错误
 */
export class InvalidFormatError extends WebFontError {
  readonly detectedFormat?: string
  
  constructor(message: string, detectedFormat?: string, cause?: Error) {
    super(
      message,
      ERROR_CODES.INVALID_FORMAT,
      { cause, context: { detectedFormat } }
    )
    this.name = 'InvalidFormatError'
    this.detectedFormat = detectedFormat
  }
}

/**
 * 不支持的格式错误
 */
export class UnsupportedFormatError extends WebFontError {
  readonly format: string
  readonly supportedFormats: string[]
  
  constructor(format: string, supportedFormats: string[]) {
    super(
      `不支持的格式: ${format}。支持的格式: ${supportedFormats.join(', ')}`,
      ERROR_CODES.UNSUPPORTED_FORMAT,
      { context: { format, supportedFormats } }
    )
    this.name = 'UnsupportedFormatError'
    this.format = format
    this.supportedFormats = supportedFormats
  }
}

/**
 * 字体文件损坏错误
 */
export class CorruptFontError extends WebFontError {
  constructor(message: string, cause?: Error) {
    super(
      `字体文件损坏: ${message}`,
      ERROR_CODES.CORRUPT_FONT,
      { cause }
    )
    this.name = 'CorruptFontError'
  }
}

// ============================================================================
// 转换相关错误
// ============================================================================

/**
 * 转换失败错误
 */
export class ConvertError extends WebFontError {
  readonly sourceFormat?: string
  readonly targetFormat?: string
  
  constructor(
    message: string,
    sourceFormat?: string,
    targetFormat?: string,
    cause?: Error
  ) {
    super(
      message,
      ERROR_CODES.CONVERT_FAILED,
      { cause, context: { sourceFormat, targetFormat } }
    )
    this.name = 'ConvertError'
    this.sourceFormat = sourceFormat
    this.targetFormat = targetFormat
  }
}

/**
 * 子集化失败错误
 */
export class SubsetError extends WebFontError {
  readonly text?: string
  readonly charCount?: number
  
  constructor(message: string, text?: string, cause?: Error) {
    super(
      message,
      ERROR_CODES.SUBSET_FAILED,
      { cause, context: { charCount: text?.length } }
    )
    this.name = 'SubsetError'
    this.text = text
    this.charCount = text?.length
  }
}

/**
 * 压缩失败错误
 */
export class CompressError extends WebFontError {
  readonly format?: string
  
  constructor(message: string, format?: string, cause?: Error) {
    super(
      message,
      ERROR_CODES.COMPRESS_FAILED,
      { cause, context: { format } }
    )
    this.name = 'CompressError'
    this.format = format
  }
}

/**
 * 解压失败错误
 */
export class DecompressError extends WebFontError {
  readonly format?: string
  
  constructor(message: string, format?: string, cause?: Error) {
    super(
      message,
      ERROR_CODES.DECOMPRESS_FAILED,
      { cause, context: { format } }
    )
    this.name = 'DecompressError'
    this.format = format
  }
}

// ============================================================================
// 配置相关错误
// ============================================================================

/**
 * 无效配置错误
 */
export class InvalidConfigError extends WebFontError {
  readonly configKey?: string
  readonly configValue?: unknown
  
  constructor(message: string, configKey?: string, configValue?: unknown) {
    super(
      message,
      ERROR_CODES.INVALID_CONFIG,
      { context: { configKey, configValue } }
    )
    this.name = 'InvalidConfigError'
    this.configKey = configKey
    this.configValue = configValue
  }
}

/**
 * 缺少必需参数错误
 */
export class MissingRequiredError extends WebFontError {
  readonly paramName: string
  
  constructor(paramName: string) {
    super(
      `缺少必需参数: ${paramName}`,
      ERROR_CODES.MISSING_REQUIRED,
      { context: { paramName } }
    )
    this.name = 'MissingRequiredError'
    this.paramName = paramName
  }
}

// ============================================================================
// 验证相关错误
// ============================================================================

/**
 * 验证失败错误
 */
export class ValidationError extends WebFontError {
  readonly validationErrors: string[]
  
  constructor(message: string, validationErrors: string[] = []) {
    super(
      message,
      ERROR_CODES.VALIDATION_FAILED,
      { context: { validationErrors } }
    )
    this.name = 'ValidationError'
    this.validationErrors = validationErrors
  }
}

/**
 * 空文本错误
 */
export class EmptyTextError extends WebFontError {
  constructor() {
    super(
      '子集化文本不能为空',
      ERROR_CODES.EMPTY_TEXT
    )
    this.name = 'EmptyTextError'
  }
}

// ============================================================================
// 错误处理工具函数
// ============================================================================

/**
 * 判断是否为 WebFontError
 */
export function isWebFontError(error: unknown): error is WebFontError {
  return error instanceof WebFontError
}

/**
 * 判断是否为文件相关错误
 */
export function isFileError(error: unknown): error is FileNotFoundError | FileReadError | FileWriteError | FileTooLargeError {
  return (
    error instanceof FileNotFoundError ||
    error instanceof FileReadError ||
    error instanceof FileWriteError ||
    error instanceof FileTooLargeError
  )
}

/**
 * 判断是否为格式相关错误
 */
export function isFormatError(error: unknown): error is InvalidFormatError | UnsupportedFormatError | CorruptFontError {
  return (
    error instanceof InvalidFormatError ||
    error instanceof UnsupportedFormatError ||
    error instanceof CorruptFontError
  )
}

/**
 * 判断是否为转换相关错误
 */
export function isConvertError(error: unknown): error is ConvertError | SubsetError | CompressError | DecompressError {
  return (
    error instanceof ConvertError ||
    error instanceof SubsetError ||
    error instanceof CompressError ||
    error instanceof DecompressError
  )
}

/**
 * 将未知错误包装为 WebFontError
 * 
 * @param error - 原始错误
 * @param defaultMessage - 默认错误消息
 * @returns WebFontError 实例
 */
export function wrapError(error: unknown, defaultMessage = '未知错误'): WebFontError {
  if (isWebFontError(error)) {
    return error
  }
  
  if (error instanceof Error) {
    return new WebFontError(error.message || defaultMessage, 'E0000', { cause: error })
  }
  
  return new WebFontError(
    typeof error === 'string' ? error : defaultMessage,
    'E0000'
  )
}

/**
 * 安全执行函数，捕获并包装错误
 * 
 * @param fn - 要执行的函数
 * @param errorHandler - 错误处理函数（可选）
 * @returns 函数执行结果
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: WebFontError) => void
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const wrappedError = wrapError(error)
    if (errorHandler) {
      errorHandler(wrappedError)
    }
    throw wrappedError
  }
}

/**
 * 创建错误处理器
 * 
 * @param options - 处理器选项
 * @returns 错误处理函数
 */
export function createErrorHandler(options: {
  onError?: (error: WebFontError) => void
  rethrow?: boolean
  defaultMessage?: string
}) {
  const { onError, rethrow = true, defaultMessage = '操作失败' } = options
  
  return (error: unknown): WebFontError => {
    const wrappedError = wrapError(error, defaultMessage)
    
    if (onError) {
      onError(wrappedError)
    }
    
    if (rethrow) {
      throw wrappedError
    }
    
    return wrappedError
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
