import fontkit from 'fontkit'
import opentype from 'opentype.js'
import { compress as compressWoff2, decompress as decompressWoff2 } from 'wawoff2'
import pako from 'pako'
import type { ConvertOptions, ConvertResult } from '../types/index.js'

/**
 * 转换字体格式
 * @param options 转换选项
 * @returns 转换结果数组
 */
export async function convertFont(options: ConvertOptions): Promise<ConvertResult[]> {
  const { inputBuffer, inputFormat, outputFormats } = options
  
  // 步骤1: 统一转换为TTF格式（中间格式）
  let ttfBuffer: Buffer
  
  try {
    switch (inputFormat) {
      case 'ttf':
        ttfBuffer = inputBuffer
        break
      case 'otf':
        ttfBuffer = await convertOtfToTtf(inputBuffer)
        break
      case 'woff':
        ttfBuffer = await decompressWoff(inputBuffer)
        break
      case 'woff2':
        ttfBuffer = Buffer.from(await decompressWoff2(inputBuffer))
        break
      default:
        throw new Error(`不支持的输入格式: ${inputFormat}`)
    }
  } catch (error) {
    throw new Error(`格式转换失败: ${(error as Error).message}`)
  }
  
  // 步骤2: 从TTF生成目标格式
  const results: ConvertResult[] = []
  
  for (const format of outputFormats) {
    try {
      let buffer: Buffer
      
      switch (format) {
        case 'ttf':
          buffer = ttfBuffer
          break
        case 'woff':
          buffer = await compressWoff(ttfBuffer)
          break
        case 'woff2':
          buffer = Buffer.from(await compressWoff2(ttfBuffer))
          break
      }
      
      results.push({
        format,
        buffer,
        size: buffer.length
      })
    } catch (error) {
      console.error(`生成 ${format} 格式失败:`, error)
    }
  }
  
  return results
}

/**
 * OTF转TTF
 * @param otfBuffer OTF格式的Buffer
 * @returns TTF格式的Buffer
 */
async function convertOtfToTtf(otfBuffer: Buffer): Promise<Buffer> {
  try {
    const font = opentype.parse(otfBuffer.buffer as ArrayBuffer)
    const ttfArrayBuffer = font.toArrayBuffer()
    return Buffer.from(ttfArrayBuffer)
  } catch (error) {
    throw new Error(`OTF转TTF失败: ${(error as Error).message}`)
  }
}

/**
 * 解压WOFF格式为TTF
 * @param woffBuffer WOFF格式的Buffer
 * @returns TTF格式的Buffer
 */
async function decompressWoff(woffBuffer: Buffer): Promise<Buffer> {
  // WOFF格式规范: https://www.w3.org/TR/WOFF/
  const signature = woffBuffer.toString('utf8', 0, 4)
  if (signature !== 'wOFF') {
    throw new Error('不是有效的WOFF文件')
  }
  
  try {
    // 读取WOFF头信息（44字节）
    const sfntSize = woffBuffer.readUInt32BE(8)
    const numTables = woffBuffer.readUInt16BE(12)
    
    // 构建TTF头
    const searchRange = Math.floor(Math.log2(numTables)) * 16
    const entrySelector = Math.floor(Math.log2(numTables))
    const rangeShift = numTables * 16 - searchRange
    
    const ttfHeader = Buffer.alloc(12)
    ttfHeader.writeUInt32BE(0x00010000, 0) // sfnt version
    ttfHeader.writeUInt16BE(numTables, 4)
    ttfHeader.writeUInt16BE(searchRange, 6)
    ttfHeader.writeUInt16BE(entrySelector, 8)
    ttfHeader.writeUInt16BE(rangeShift, 10)
    
    // 读取表目录
    const tables: Buffer[] = []
    const tableDirectory = Buffer.alloc(numTables * 16)
    
    let offset = 44 // WOFF头大小
    let ttfOffset = 12 + numTables * 16 // TTF数据开始位置
    
    for (let i = 0; i < numTables; i++) {
      const tag = woffBuffer.slice(offset, offset + 4)
      const compLength = woffBuffer.readUInt32BE(offset + 8)
      const origLength = woffBuffer.readUInt32BE(offset + 12)
      const compData = woffBuffer.slice(offset + 20, offset + 20 + compLength)
      
      // 解压表数据
      let tableData: Buffer
      if (compLength < origLength) {
        tableData = Buffer.from(pako.inflate(compData))
      } else {
        tableData = compData
      }
      
      // 写入表目录条目
      tag.copy(tableDirectory, i * 16)
      tableDirectory.writeUInt32BE(0, i * 16 + 4) // checksum (稍后计算)
      tableDirectory.writeUInt32BE(ttfOffset, i * 16 + 8)
      tableDirectory.writeUInt32BE(origLength, i * 16 + 12)
      
      tables.push(tableData)
      ttfOffset += origLength
      
      // 4字节对齐
      if (origLength % 4 !== 0) {
        ttfOffset += 4 - (origLength % 4)
      }
      
      offset += 20 + compLength
    }
    
    // 组装TTF文件
    const ttfParts = [ttfHeader, tableDirectory]
    for (const table of tables) {
      ttfParts.push(table as any)
      // 添加填充以保持4字节对齐
      const padding = (4 - (table.length % 4)) % 4
      if (padding > 0) {
        ttfParts.push(Buffer.alloc(padding))
      }
    }
    
    return Buffer.concat(ttfParts)
  } catch (error) {
    throw new Error(`WOFF解压失败: ${(error as Error).message}`)
  }
}

/**
 * 压缩TTF为WOFF格式
 * @param ttfBuffer TTF格式的Buffer
 * @returns WOFF格式的Buffer
 */
async function compressWoff(ttfBuffer: Buffer): Promise<Buffer> {
  try {
    // 读取TTF头
    const numTables = ttfBuffer.readUInt16BE(4)
    
    const woffParts: Buffer[] = []
    
    // 构建WOFF头（44字节）
    const woffHeader = Buffer.alloc(44)
    woffHeader.write('wOFF', 0)
    woffHeader.writeUInt32BE(ttfBuffer.readUInt32BE(0), 4) // flavor
    woffHeader.writeUInt16BE(numTables, 12)
    
    woffParts.push(woffHeader)
    
    // 读取并压缩每个表
    let tableOffset = 12 + numTables * 16
    const tableDirEntries: Buffer[] = []
    
    for (let i = 0; i < numTables; i++) {
      const entryOffset = 12 + i * 16
      const tag = ttfBuffer.slice(entryOffset, entryOffset + 4)
      const checksum = ttfBuffer.readUInt32BE(entryOffset + 4)
      const offset = ttfBuffer.readUInt32BE(entryOffset + 8)
      const length = ttfBuffer.readUInt32BE(entryOffset + 12)
      
      const tableData = ttfBuffer.slice(offset, offset + length)
      const compressed = Buffer.from(pako.deflate(tableData))
      
      // 如果压缩后更大，使用原始数据
      const finalData = compressed.length < tableData.length ? compressed : tableData
      const compLength = finalData.length
      
      // WOFF表目录条目（20字节）
      const entry = Buffer.alloc(20)
      tag.copy(entry, 0)
      entry.writeUInt32BE(tableOffset, 4)
      entry.writeUInt32BE(compLength, 8)
      entry.writeUInt32BE(length, 12)
      entry.writeUInt32BE(checksum, 16)
      
      tableDirEntries.push(entry)
      woffParts.push(finalData)
      
      tableOffset += compLength
    }
    
    // 插入表目录
    woffParts.splice(1, 0, ...tableDirEntries)
    
    const woffBuffer = Buffer.concat(woffParts)
    
    // 更新WOFF头中的文件大小
    woffBuffer.writeUInt32BE(woffBuffer.length, 8)
    woffBuffer.writeUInt32BE(ttfBuffer.length, 16) // 原始大小
    
    return woffBuffer
  } catch (error) {
    throw new Error(`WOFF压缩失败: ${(error as Error).message}`)
  }
}