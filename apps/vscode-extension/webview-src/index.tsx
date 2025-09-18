import { createRoot } from 'react-dom/client';
import App from './App';

// VSCode API 类型声明
declare global {
  interface Window {
    vscodeAPI: {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
    handleVSCodeMessage: (message: any) => void;
  }
}

// 初始化 VSCode API
const vscode = (window as any).acquireVsCodeApi?.() || {
  postMessage: (message: any) => console.log('VSCode API not available:', message),
  getState: () => null,
  setState: (state: any) => console.log('VSCode API not available:', state),
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
} else {
  console.log('DOM already loaded, sending ready message immediately');
  vscode.postMessage({ type: 'ready' });
}

// 渲染应用
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root element not found');
}
