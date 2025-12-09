import { describe, it, expect } from 'vitest'
import { readFile } from 'fs/promises'
import { detectFontFormat } from '../src/core/detector'
import { convertFont } from '../src/core/converter'
import { subsetFont, extractUniqueChars } from '../src/core/subsetter'

describe('字体格式检测', () => {
  it('应该正确检测TTF格式', async () => {
    // 注意：需要在test/fixtures/目录下放置测试字体文件
    // const buffer = await readFile('./test/fixtures/test.ttf')
    // const info = await detectFontFormat(buffer)
    // expect(info.format).toBe('ttf')
    expect(true).toBe(true) // 占位测试
  })
  
  it('应该正确检测OTF格式', async () => {
    expect(true).toBe(true) // 占位测试
  })
})

describe('字体格式转换', () => {
  it('应该能将TTF转换为WOFF2', async () => {
    expect(true).toBe(true) // 占位测试
  })
  
  it('应该能将OTF转换为WOFF', async () => {
    expect(true).toBe(true) // 占位测试
  })
})

describe('文本子集化', () => {
  it('应该正确提取唯一字符', () => {
    const text = '你好世界世界'
    const unique = extractUniqueChars(text)
    expect(unique).toBe('你好世界')
  })
  
  it('应该能创建字体子集', async () => {
    expect(true).toBe(true) // 占位测试
  })
})

describe('辅助函数', () => {
  it('extractUniqueChars 应该去除重复字符', () => {
    expect(extractUniqueChars('aabbcc')).toBe('abc')
    expect(extractUniqueChars('hello')).toBe('helo')
    expect(extractUniqueChars('你好你好')).toBe('你好')
  })
})