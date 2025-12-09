import type { CSSOptions } from '../types/index.js'

/**
 * 生成@font-face CSS声明
 * @param options CSS生成选项
 * @returns CSS字符串
 */
export function generateCSS(options: CSSOptions): string {
  const {
    fontFamily,
    fontFiles,
    fontWeight = 400,
    fontStyle = 'normal',
    fontDisplay = 'swap'
  } = options
  
  if (!fontFiles || fontFiles.length === 0) {
    throw new Error('必须提供至少一个字体文件')
  }
  
  // 格式优先级：woff2 > woff > ttf
  const formatOrder = ['woff2', 'woff', 'ttf']
  const sortedFiles = [...fontFiles].sort((a, b) => {
    return formatOrder.indexOf(a.format) - formatOrder.indexOf(b.format)
  })
  
  // 生成src属性
  const srcParts = sortedFiles.map(file => {
    return `url('${file.path}') format('${file.format}')`
  })
  
  return `@font-face {
  font-family: '${fontFamily}';
  src: ${srcParts.join(',\n       ')};
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: ${fontDisplay};
}
`
}

/**
 * 生成多个字体变体的CSS
 * @param fonts 字体配置数组
 * @returns 组合的CSS字符串
 */
export function generateMultipleCSS(fonts: CSSOptions[]): string {
  return fonts.map(font => generateCSS(font)).join('\n')
}

/**
 * 生成带有Unicode范围的CSS（用于优化加载）
 * @param options CSS生成选项
 * @param unicodeRange Unicode范围，如 'U+0000-00FF'
 * @returns CSS字符串
 */
export function generateCSSWithUnicodeRange(
  options: CSSOptions,
  unicodeRange: string
): string {
  const basicCSS = generateCSS(options)
  // 在最后的 } 前插入 unicode-range
  return basicCSS.replace(/}\s*$/, `  unicode-range: ${unicodeRange};\n}\n`)
}