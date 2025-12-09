import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { extname } from 'path'

interface ServeOptions {
  port: string
  open: boolean
}

// MIME类型映射
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

export async function serveCommand(options: ServeOptions) {
  const chalk = (await import('chalk')).default
  
  console.log(chalk.cyan('\n🚀 启动可视化界面...\n'))
  
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const uiRoot = resolve(__dirname, '../../../dist/ui')
    const port = parseInt(options.port)
    
    const server = createServer(async (req, res) => {
      try {
        // 获取请求路径，默认为 index.html
        let filePath = req.url === '/' ? '/index.html' : req.url || '/index.html'
        
        // 移除查询参数
        filePath = filePath.split('?')[0]
        
        const fullPath = resolve(uiRoot, filePath.slice(1))
        
        // 读取文件
        const content = await readFile(fullPath)
        
        // 设置Content-Type
        const ext = extname(fullPath)
        const mimeType = mimeTypes[ext] || 'application/octet-stream'
        
        res.writeHead(200, { 'Content-Type': mimeType })
        res.end(content)
      } catch (error) {
        // 文件不存在，返回404
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404 Not Found')
      }
    })
    
    server.listen(port, () => {
      console.log(chalk.green(`  ➜  Local:   ${chalk.cyan(`http://localhost:${port}/`)}`))
      console.log(chalk.green('\n✨ 可视化界面已启动!'))
      console.log(chalk.gray('按 Ctrl+C 停止服务\n'))
      
      // 如果需要自动打开浏览器
      if (options.open) {
        const open = import('open')
        open.then(({ default: openUrl }) => {
          openUrl(`http://localhost:${port}`)
        })
      }
    })
    
  } catch (error) {
    console.error(chalk.red('启动失败:'), (error as Error).message)
    process.exit(1)
  }
}