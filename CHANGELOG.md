# 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 初始项目结构
- 核心字体转换功能
- 文本子集化功能
- unplugin插件支持（Vite、Webpack、Rollup）
- CLI命令行工具
- Web可视化界面
- 完整的文档体系

## [0.1.0] - 2024-12-03

### 新增
- 🎉 项目首次发布
- ✨ 支持多种字体格式转换（TTF、OTF、WOFF、WOFF2）
- ✂️ 文本子集化功能，大幅减小字体文件体积
- 🔌 unplugin插件框架，支持多种构建工具
- 💻 功能完整的CLI工具
- 🎨 现代化的Web可视化界面
- 📚 详细的使用文档

### 功能特性

#### 核心功能
- 字体格式自动检测
- TTF ↔ OTF ↔ WOFF ↔ WOFF2 格式互转
- 基于fontmin的文本子集化
- 自动生成@font-face CSS

#### 构建工具集成
- Vite插件
- Webpack插件
- Rollup插件
- 支持glob模式匹配文件

#### CLI工具
- `webfont convert` - 转换字体格式
- `webfont subset` - 创建字体子集
- `webfont info` - 查看字体信息
- `webfont serve` - 启动Web UI

#### Web界面
- 拖拽上传字体文件
- 实时字体信息预览
- 批量下载转换结果
- 响应式设计

### 技术栈
- TypeScript
- unplugin
- fontkit & opentype.js
- fontmin
- Vue 3 & Element Plus
- Commander.js & Inquirer

### 文档
- README.md - 项目主文档
- QUICKSTART.md - 快速开始指南
- USAGE_GUIDE.md - 详细使用指南
- ARCHITECTURE.md - 架构设计文档
- IMPLEMENTATION_GUIDE.md - 实施指南

---

## [计划中]

### v0.2.0
- [ ] 完善单元测试覆盖
- [ ] 添加E2E测试
- [ ] 性能优化
- [ ] 支持更多字体格式（如SVG字体）
- [ ] Web Worker优化UI字体处理
- [ ] 添加字体预览功能
- [ ] 支持批量子集化

### v0.3.0
- [ ] 添加配置文件支持（webfont.config.js）
- [ ] 插件系统，支持自定义转换器
- [ ] 字体合并功能
- [ ] Unicode范围优化
- [ ] CDN部署支持

### 未来规划
- 字体编辑功能
- 在线字体商店集成
- 字体性能分析工具
- 更多语言的CLI支持
- VSCode扩展

---

## 版本说明

### 版本号格式
- **主版本号**：不兼容的API修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布周期
- 🐛 修复版本：随时发布
- ✨ 功能版本：每月一次
- 💥 重大版本：根据需要

---

## 贡献指南

欢迎提交Issue和Pull Request！

查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与贡献。

---

## 许可证

[MIT](./LICENSE) © 2024