import { defineConfig } from 'vite'
import WebFont from 'unplugin-webfont/vite'

export default defineConfig({
  plugins: [
    WebFont({
      // 字体文件路径
      include: './fonts/*.ttf',
      
      // 要包含的文字
      text: '你好世界 Hello World 0123456789',
      
      // 输出格式
      formats: ['woff2', 'woff'],
      
      // 输出目录
      outputDir: 'public/fonts',
      
      // 生成CSS文件
      cssOutput: true,
      
      // 字体配置
      fontFamily: 'CustomFont',
      fontDisplay: 'swap'
    })
  ]
})