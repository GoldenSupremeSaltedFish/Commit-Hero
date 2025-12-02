# Webview 样式调试指南

## 🔍 当前状态检查

### ✅ 已完成的修复：
1. **样式文件同步** - 已同步最新的 Figma 样式到 `globals.css`
2. **构建成功** - CSS 文件大小 90KB，包含完整样式
3. **资源路径** - 已修复 webview 资源路径替换问题
4. **消息监听器** - 已修复重复注册问题

### 📊 构建结果：
- ✅ `index.html` - 0.43 kB
- ✅ `main-DU_MfpGy.css` - 90.17 kB (包含完整样式)
- ✅ `main-B4-f_iHh.js` - 307.66 kB (包含完整功能)

## 🐛 调试步骤

### 1. 检查 Webview 开发者工具
在扩展开发主机中：
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "开发人员: 打开 Webview 开发者工具"
3. 检查以下内容：

#### Console 标签页
应该看到：
- ✅ 没有 "Cannot load script" 错误
- ✅ 没有 "Uncaught ReferenceError" 错误
- ✅ React 应用正常初始化
- ✅ VSCode API 正常加载

#### Network 标签页
应该看到：
- ✅ `main-DU_MfpGy.css` 状态码 200 (成功加载)
- ✅ `main-B4-f_iHh.js` 状态码 200 (成功加载)
- ✅ 没有 404 或 500 错误

#### Elements 标签页
应该看到：
- ✅ `<div id="root">` 元素存在
- ✅ 内部有 React 渲染的内容
- ✅ 样式类名正确应用

### 2. 检查样式应用
在 Elements 标签页中：
1. 选择 `<div id="root">` 元素
2. 在右侧 Styles 面板中检查：
   - ✅ CSS 变量是否正确加载
   - ✅ Tailwind 类名是否生效
   - ✅ 自定义样式是否应用

### 3. 检查 VSCode 扩展日志
在扩展开发主机的输出面板中，应该看到：
```
resolveWebviewView 被调用，webview 类型: commit-hero-stats
成功读取 webview-assets/index.html
替换资源路径: ./assets/main-DU_MfpGy.css -> vscode-webview-resource://...
替换资源路径: ./assets/main-B4-f_iHh.js -> vscode-webview-resource://...
HTML 内容处理完成，长度: [大于 846]
webview 消息监听器已设置
```

## 🎯 预期结果

### 成功指标：
- ✅ Webview 显示完整的 Figma 设计界面
- ✅ 所有颜色、字体、间距完全匹配 Figma
- ✅ 按钮和交互元素正常显示
- ✅ 响应式布局正确
- ✅ 没有控制台错误

### 如果仍然显示空白：
1. **检查 React 挂载**：
   ```javascript
   // 在 Console 中运行
   document.getElementById('root').innerHTML
   ```

2. **检查样式加载**：
   ```javascript
   // 在 Console 中运行
   document.querySelector('link[rel="stylesheet"]').href
   ```

3. **检查脚本执行**：
   ```javascript
   // 在 Console 中运行
   window.React
   ```

## 🔧 常见问题解决

### 问题 1: 样式不显示
**原因**: CSS 文件路径错误或未加载
**解决**: 检查 Network 标签页，确认 CSS 文件状态码为 200

### 问题 2: React 应用不渲染
**原因**: JavaScript 文件未加载或执行错误
**解决**: 检查 Console 错误，确认 JS 文件状态码为 200

### 问题 3: 部分样式缺失
**原因**: Tailwind CSS 未正确构建
**解决**: 重新运行 `npm run sync`

### 问题 4: 布局错乱
**原因**: CSS 变量未正确应用
**解决**: 检查 Elements 面板中的 CSS 变量值

## 📝 下一步

如果按照以上步骤检查后仍有问题，请提供：
1. Webview 开发者工具的 Console 错误信息
2. Network 标签页的资源加载状态
3. Elements 标签页的 HTML 结构截图
4. 扩展开发主机的完整日志输出

这样我可以进一步诊断和解决问题。

