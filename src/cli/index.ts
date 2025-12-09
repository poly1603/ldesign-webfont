#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import { convertCommand } from './commands/convert.js'
import { subsetCommand } from './commands/subset.js'
import { infoCommand } from './commands/info.js'
import { serveCommand } from './commands/serve.js'

const program = new Command()

program
  .name('webfont')
  .description('通用字体转换工具，支持多种格式和文本子集化')
  .version('0.1.0')

// 转换命令
program
  .command('convert <input>')
  .description('转换字体格式')
  .option('-o, --output <dir>', '输出目录', 'output')
  .option('--formats <formats>', '输出格式 (woff,woff2,ttf)', 'woff2,woff')
  .option('--font-family <name>', '字体名称')
  .option('-c, --css', '生成CSS文件', false)
  .action(convertCommand)

// 子集化命令
program
  .command('subset <input>')
  .description('创建字体子集')
  .option('-t, --text <text>', '要包含的文字')
  .option('-f, --text-file <file>', '从文件读取文字')
  .option('-o, --output <dir>', '输出目录', 'output')
  .option('--formats <formats>', '输出格式 (woff,woff2,ttf)', 'woff2,woff')
  .option('--font-family <name>', '字体名称')
  .option('-c, --css', '生成CSS文件', false)
  .action(subsetCommand)

// 信息命令
program
  .command('info <input>')
  .description('查看字体信息')
  .action(infoCommand)

// 启动可视化界面
program
  .command('serve')
  .description('启动可视化界面')
  .option('-p, --port <port>', '端口号', '3333')
  .option('--open', '自动打开浏览器', false)
  .action(serveCommand)

// 解析参数
program.parse()

// 如果没有参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}