# Figma 到 VSCode 扩展同步指南

## 📋 概述

本指南说明如何将 `figma-ALL` 目录中的前端代码同步到 VSCode 扩展中，确保扩展能够使用最新的 Figma 设计。

## 🚀 快速开始

### 1. 一次性同步
```bash
npm run sync:figma
```

### 2. 监听模式（实时同步）
```bash
npm run sync:figma:watch
```

### 3. 完整构建（包含同步）
```bash
npm run build:extension
```

## 📁 目录结构

```
Commit-Hero/
├── figma-ALL/                    # Figma 设计源码
│   ├── App.tsx                   # 主应用组件
│   ├── globals.css               # 全局样式
│   └── components/               # UI 组件
│       ├── CommitHero.tsx
│       ├── AchievementModal.tsx
│       └── ui/                   # 基础 UI 组件
├── apps/vscode-extension/
│   ├── figma-frontend/           # 同步后的前端代码
│   ├── react-assets/             # React 运行时资源
│   └── src/                      # 扩展源码
└── scripts/
    └── sync-figma-to-extension.js # 同步脚本
```

## 🔧 同步脚本功能

### 核心功能
1. **文件同步**：将 `figma-ALL` 完整复制到 `apps/vscode-extension/figma-frontend`
2. **依赖处理**：自动移除外部依赖（lucide-react, motion/react 等）
3. **组件优化**：将复杂组件替换为简化版本
4. **实时监听**：支持文件变化时自动同步
5. **同步报告**：生成详细的同步日志和统计

### 处理的外部依赖
- `lucide-react` → 替换为 emoji 图标
- `motion/react` → 移除动画，使用普通 div
- `@radix-ui/*` → 移除复杂 UI 组件

## 📝 使用场景

### 场景 1：开发新功能
1. 在 `figma-ALL` 中修改组件
2. 运行 `npm run sync:figma:watch` 启动监听
3. 修改文件时自动同步到扩展
4. 在 VSCode 中按 F5 测试扩展

### 场景 2：发布新版本
1. 完成 `figma-ALL` 的所有修改
2. 运行 `npm run build:extension` 完整构建
3. 测试扩展功能
4. 使用 `vsce package` 打包发布

### 场景 3：团队协作
1. 团队成员修改 `figma-ALL`
2. 提交代码到版本控制
3. 其他成员拉取代码后运行 `npm run sync:figma`
4. 确保所有人使用相同的前端代码

## 🛠️ 高级配置

### 自定义同步规则

编辑 `scripts/sync-figma-to-extension.js`：

```javascript
// 添加自定义文件过滤规则
const excludePatterns = [
  /\.DS_Store$/,
  /Thumbs\.db$/,
  /\.tmp$/,
  /\.log$/,
  /\.test\.tsx$/,        // 排除测试文件
  /\.stories\.tsx$/      // 排除 Storybook 文件
];

// 添加自定义组件处理
const customReplacements = {
  'CustomIcon': '<span className="custom-icon">🎯</span>',
  'SpecialButton': '<button className="special-btn">Click Me</button>'
};
```

### 监听模式配置

```javascript
const watcher = chokidar.watch(this.figmaSourcePath, {
  ignored: /(^|[\/\\])\../,     // 忽略隐藏文件
  persistent: true,             // 持续监听
  ignoreInitial: true,          // 忽略初始扫描
  debounce: 1000               // 防抖延迟
});
```

## 📊 同步报告

每次同步后会在根目录生成 `sync-report.json`：

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "/path/to/figma-ALL",
  "target": "/path/to/apps/vscode-extension/figma-frontend",
  "log": ["[INFO] 开始同步...", "[SUCCESS] 同步完成"],
  "stats": {
    "totalFiles": 45,
    "componentFiles": 12,
    "uiFiles": 33
  }
}
```

## 🐛 故障排除

### 问题 1：同步失败
**症状**：`npm run sync:figma` 报错
**解决方案**：
1. 检查 `figma-ALL` 目录是否存在
2. 确保有足够的磁盘空间
3. 检查文件权限

### 问题 2：组件显示异常
**症状**：扩展中组件显示不正确
**解决方案**：
1. 检查 `figma-frontend` 目录是否完整
2. 运行 `npm run sync:figma` 重新同步
3. 查看同步报告中的错误日志

### 问题 3：监听模式不工作
**症状**：文件修改后没有自动同步
**解决方案**：
1. 确保 `chokidar` 依赖已安装
2. 检查文件路径是否正确
3. 重启监听模式

### 问题 4：外部依赖错误
**症状**：组件中仍有外部依赖引用
**解决方案**：
1. 检查 `processComponentFile` 方法
2. 添加新的依赖替换规则
3. 手动创建简化版本组件

## 🔄 工作流程建议

### 开发阶段
1. 使用监听模式：`npm run sync:figma:watch`
2. 在 `figma-ALL` 中快速迭代
3. 实时查看扩展效果

### 测试阶段
1. 停止监听模式
2. 运行完整同步：`npm run sync:figma`
3. 构建扩展：`npm run build:extension`
4. 全面测试功能

### 发布阶段
1. 确保所有修改已同步
2. 运行完整构建流程
3. 生成发布包：`vsce package`
4. 测试安装包

## 📚 相关文档

- [VSCode 扩展开发指南](./VSCODE_EXTENSION_GUIDE.md)
- [Figma 设计规范](./FIGMA_DESIGN_GUIDE.md)
- [组件开发指南](./COMPONENT_DEVELOPMENT.md)

## 🤝 贡献

如果您发现同步脚本的问题或有改进建议，请：

1. 在 GitHub 上创建 Issue
2. 提交 Pull Request
3. 更新相关文档

---

**注意**：同步脚本会完全替换目标目录，请确保重要文件已备份。
