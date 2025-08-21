# Commit Hero VSCode 插件

一个强大的开发者效率分析插件，帮助你追踪代码提交、解锁成就徽章，提升开发体验。

## 🚀 功能特性

- **📊 实时统计**: 追踪代码提交数量、行数变化、仓库数量等关键指标
- **🏆 成就系统**: 通过完成各种开发任务解锁成就徽章
- **🎯 可视化界面**: 美观的侧边栏界面，实时显示开发进度
- **⚡ 自动追踪**: 自动检测 Git 提交，无需手动操作
- **🔔 智能通知**: 成就解锁时及时通知，激励持续开发

## 📦 安装

### 从 VSIX 文件安装

1. 下载最新的 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Extensions: Install from VSIX..."
4. 选择下载的 `.vsix` 文件
5. 重启 VSCode

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/commit-hero/vscode-extension.git
cd vscode-extension

# 安装依赖
npm install

# 编译插件
npm run compile

# 打包插件
npm run package
```

## ⚙️ 配置

在 VSCode 设置中配置以下选项：

### 必需配置

- **`commitHero.userEmail`**: 用户邮箱地址（用于识别用户）

### 可选配置

- **`commitHero.apiUrl`**: API 服务器地址（默认：`http://localhost:3000`）
- **`commitHero.autoTrack`**: 启动时自动开始追踪（默认：`true`）
- **`commitHero.showNotifications`**: 显示成就通知（默认：`true`）

## 🎮 使用方法

### 1. 基本使用

1. 安装插件后，在侧边栏会看到 "Commit Hero" 图标
2. 点击图标打开统计面板
3. 配置用户邮箱地址
4. 点击 "开始追踪" 按钮
5. 开始正常开发，插件会自动追踪你的 Git 提交

### 2. 查看统计

在侧边栏面板中，你可以看到：

- **总提交数**: 累计的代码提交次数
- **代码行数**: 添加和删除的代码行数总和
- **仓库数**: 参与开发的仓库数量
- **成就徽章**: 已解锁的成就徽章数量

### 3. 成就系统

插件包含多种成就徽章：

- 🎯 **初次提交**: 完成第一次代码提交
- 👨‍💻 **代码贡献者**: 提交超过10次代码
- 🏆 **代码大师**: 提交超过100次代码
- 🧹 **重构专家**: 删除超过1000行代码
- ⚡ **高产开发者**: 添加超过10000行代码

### 4. 命令面板

使用以下命令：

- `Commit Hero: 开始追踪` - 开始追踪 Git 提交
- `Commit Hero: 停止追踪` - 停止追踪
- `Commit Hero: 打开仪表板` - 在浏览器中打开 Web 仪表板
- `Commit Hero: 显示成就` - 显示测试成就
- `Commit Hero: 刷新统计` - 手动刷新统计数据

## 🔧 开发调试

### 环境要求

- Node.js 16+
- VSCode 1.74+
- Git 扩展（用于 Git 集成）

### 调试步骤

1. 克隆仓库并安装依赖
2. 按 `F5` 启动调试
3. 在新打开的 VSCode 窗口中测试插件
4. 查看输出面板中的日志信息

### 项目结构

```
src/
├── extension.ts          # 插件主入口
├── commitHeroProvider.ts # 侧边栏提供者
├── gitTracker.ts        # Git 追踪器
├── statusBarManager.ts  # 状态栏管理器
└── notificationManager.ts # 通知管理器
```

## 🐛 故障排除

### 常见问题

**Q: 插件没有显示在侧边栏？**
A: 确保你在 Git 仓库中打开 VSCode，并且已配置用户邮箱地址。

**Q: 提交没有被追踪？**
A: 检查 Git 扩展是否已启用，确保在 Git 仓库中进行提交。

**Q: 无法连接到 API 服务器？**
A: 确保 API 服务器正在运行，检查 `commitHero.apiUrl` 配置是否正确。

**Q: 成就徽章没有解锁？**
A: 检查是否满足成就条件，确保 API 服务器正常运行。

### 日志查看

1. 打开 VSCode 的输出面板
2. 选择 "Commit Hero" 输出
3. 查看详细的日志信息

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解贡献指南。

### 开发流程

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。

## 🔗 相关链接

- [Web 仪表板](https://github.com/commit-hero/web)
- [API 服务](https://github.com/commit-hero/api)
- [核心库](https://github.com/commit-hero/core)

## 📞 支持

如果你遇到问题或有建议，请：

1. 查看 [常见问题](#故障排除)
2. 搜索 [Issues](../../issues)
3. 创建新的 Issue

---

**Happy Coding! 🚀**
