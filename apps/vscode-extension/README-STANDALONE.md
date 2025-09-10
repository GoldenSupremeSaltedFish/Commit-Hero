# Commit Hero - 独立 VSCode 扩展

这是一个完全独立的 VSCode 扩展，包含所有必要的资源和依赖。

## 🚀 快速开始

### 1. 构建扩展
```bash
npm run build:standalone
```

### 2. 调试扩展
1. 在 VSCode 中打开这个目录
2. 按 `F5` 启动调试
3. 在新窗口中测试扩展

### 3. 打包扩展
```bash
npm install -g vsce
vsce package
```

## 📁 目录结构

```
apps/vscode-extension/
├── out/                    # 编译后的 JavaScript 文件
├── figma-frontend/         # Figma 前端源码
│   ├── App.tsx            # 主应用组件
│   ├── globals.css        # 全局样式
│   └── components/        # UI 组件
├── react-assets/          # React 运行时资源
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   └── babel.min.js
├── webview-assets/        # Webview 资源
├── scripts/               # 构建脚本
│   └── build-standalone.js
├── src/                   # TypeScript 源码
├── package.json           # 扩展配置
└── README-STANDALONE.md   # 本文件
```

## 🎯 功能特性

- ✅ **完全本地化**：不依赖外部 CDN 或网络
- ✅ **独立运行**：包含所有必要的 React 资源
- ✅ **Figma 设计**：使用完整的 Figma 前端设计
- ✅ **本地存储**：数据存储在本地，无需服务器
- ✅ **Git 追踪**：自动追踪本地 Git 提交
- ✅ **成就系统**：游戏化的提交奖励机制

## 🔧 开发说明

### 修改前端代码
1. 编辑 `figma-frontend/` 目录中的文件
2. 重新构建扩展：`npm run build:standalone`
3. 重新加载扩展进行测试

### 修改扩展逻辑
1. 编辑 `src/` 目录中的 TypeScript 文件
2. 运行 `npm run compile` 编译
3. 按 `F5` 调试

## 📦 分发

### 打包为 .vsix 文件
```bash
vsce package
```

### 安装扩展
```bash
code --install-extension commit-hero-1.0.0.vsix
```

## 🐛 故障排除

### 扩展无法加载
1. 确保所有资源文件都存在
2. 检查 `out/` 目录是否有编译后的文件
3. 重新运行 `npm run build:standalone`

### 前端显示异常
1. 检查 `figma-frontend/` 目录是否完整
2. 确保 `react-assets/` 中有 React 资源
3. 查看 VSCode 开发者控制台的错误信息

### 数据存储问题
1. 检查 VSCode 的全局存储目录权限
2. 确保扩展有文件系统访问权限

## 📝 版本信息

- **版本**: 1.0.0
- **VSCode 要求**: ^1.74.0
- **React 版本**: 18.3.1
- **TypeScript 版本**: ^4.9.4

## 🤝 贡献

1. Fork 这个项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License
