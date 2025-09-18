"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./App"));
// 初始化 VSCode API
const vscode = window.acquireVsCodeApi?.() || {
    postMessage: (message) => console.log('VSCode API not available:', message),
    getState: () => null,
    setState: (state) => console.log('VSCode API not available:', state),
};
// 设置全局 VSCode API
window.vscodeAPI = {
    postMessage: message => vscode.postMessage(message),
    getState: () => vscode.getState(),
    setState: state => vscode.setState(state),
};
// 监听来自 VSCode 的消息
window.addEventListener('message', event => {
    const message = event.data;
    if (window.handleVSCodeMessage) {
        window.handleVSCodeMessage(message);
    }
});
// 页面加载完成后发送 ready 消息
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, sending ready message');
    vscode.postMessage({ type: 'ready' });
    vscode.postMessage({ type: 'getGitStats' });
});
// 如果 DOM 已经加载完成，立即发送 ready 消息
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loading, sending ready message');
        vscode.postMessage({ type: 'ready' });
    });
}
else {
    console.log('DOM already loaded, sending ready message immediately');
    vscode.postMessage({ type: 'ready' });
}
// 渲染应用
const container = document.getElementById('root');
if (container) {
    const root = (0, client_1.createRoot)(container);
    root.render(<App_1.default />);
}
else {
    console.error('Root element not found');
}
//# sourceMappingURL=index.js.map