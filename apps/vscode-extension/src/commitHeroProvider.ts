import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { GitTracker } from './gitTracker';

export class CommitHeroProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'commit-hero-stats';

  private _view?: vscode.WebviewView;
  private readonly _extensionUri: vscode.Uri;
  private gitTracker: GitTracker;
  private webviewReady = false;

  constructor(extensionUri: vscode.Uri, gitTracker: GitTracker) {
    this._extensionUri = extensionUri;
    this.gitTracker = gitTracker;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    console.log('resolveWebviewView 被调用，webview 类型:', webviewView.viewType);
    console.log('webview 标题:', webviewView.title);
    console.log('webview 可见性:', webviewView.visible);

    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    console.log('设置 webview HTML 内容...');
    const htmlContent = this._getHtmlForWebview(webviewView.webview);
    console.log('HTML 内容长度:', htmlContent.length);
    console.log('HTML 内容前100字符:', htmlContent.substring(0, 100));

    webviewView.webview.html = htmlContent;
    console.log('webview HTML 内容已设置');

    webviewView.webview.onDidReceiveMessage(async data => {
      console.log('收到 webview 消息:', data);
      switch (data.type) {
        case 'ready':
          console.log('webview 发送 ready 消息，设置 webviewReady = true');
          this.webviewReady = true;
          this.refreshData();
          break;
        case 'startTracking':
          this.gitTracker.startTracking();
          vscode.commands.executeCommand('setContext', 'commitHero.isTracking', true);
          this.updateTrackingStatus(true);
          this.refreshData();
          break;
        case 'stopTracking':
          this.gitTracker.stopTracking();
          vscode.commands.executeCommand('setContext', 'commitHero.isTracking', false);
          this.updateTrackingStatus(false);
          break;
        case 'addMockCommit':
          this.gitTracker.addMockCommit();
          this.refreshData();
          break;
        case 'clearData':
          this.gitTracker.clearData();
          this.refreshData();
          break;
        case 'getGitStats':
          const stats = this.gitTracker?.getStats();
          webviewView.webview.postMessage({
            type: 'gitStatsResponse',
            data: stats,
          });
          break;
      }
    });

    console.log('webview 消息监听器已设置');
  }

  public async refreshData(): Promise<void> {
    if (!this.webviewReady || !this._view) {
      console.log('webview not ready, skipping refresh');
      return;
    }

    try {
      const stats = this.gitTracker?.getStats();

      this._view.webview.postMessage({
        type: 'updateData',
        data: stats,
      });
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }

  public updateTrackingStatus(isTracking: boolean): void {
    if (this._view && this.webviewReady) {
      this._view.webview.postMessage({
        type: 'updateTrackingStatus',
        isTracking,
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // 使用本地 figma-frontend 路径
    const figmaSourcePath = path.join(__dirname, '..', 'figma-frontend');

    // 检查本地 figma-frontend 是否存在
    if (!fs.existsSync(figmaSourcePath)) {
      console.log('本地 figma-frontend 目录不存在，使用fallback HTML');
      return this._getFallbackHtml(webview);
    }

    try {
      // 读取 Figma 源码文件 - 使用完整版本
      const appTsxPath = path.join(figmaSourcePath, 'App.tsx');
      const globalsCssPath = path.join(figmaSourcePath, 'globals.css');

      // 使用完整版本
      const finalAppTsxPath = appTsxPath;

      if (!fs.existsSync(finalAppTsxPath) || !fs.existsSync(globalsCssPath)) {
        console.log('本地 Figma 源码文件未找到，使用fallback HTML');
        return this._getFallbackHtml(webview);
      }

      // 读取 App.tsx 和 globals.css
      const appTsxContent = fs.readFileSync(finalAppTsxPath, 'utf8');
      const globalsCssContent = fs.readFileSync(globalsCssPath, 'utf8');

      console.log('成功读取本地 Figma 源码文件');
      console.log('App.tsx 长度:', appTsxContent.length);
      console.log('globals.css 长度:', globalsCssContent.length);

      // 检查本地 React 资源是否存在
      const reactAssetsPath = path.join(this._extensionUri.fsPath, 'react-assets');
      const reactJsPath = path.join(reactAssetsPath, 'react.production.min.js');
      const reactDomJsPath = path.join(reactAssetsPath, 'react-dom.production.min.js');
      const babelJsPath = path.join(reactAssetsPath, 'babel.min.js');
      const lucideJsPath = path.join(reactAssetsPath, 'lucide-react.js');
      const motionJsPath = path.join(reactAssetsPath, 'motion.js');

      if (
        !fs.existsSync(reactJsPath) ||
        !fs.existsSync(reactDomJsPath) ||
        !fs.existsSync(babelJsPath) ||
        !fs.existsSync(lucideJsPath)
      ) {
        console.log('本地 React 核心资源不存在，使用fallback HTML');
        return this._getFallbackHtml(webview);
      }

      // motion.js 是可选的，如果不存在就跳过
      const motionExists = fs.existsSync(motionJsPath) && fs.statSync(motionJsPath).size > 0;

      // 生成本地资源的 webview URI
      const reactJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'react-assets', 'react.production.min.js')
      );
      const reactDomJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'react-assets', 'react-dom.production.min.js')
      );
      const babelJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'react-assets', 'babel.min.js')
      );
      const lucideJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'react-assets', 'lucide-react.js')
      );
      const motionJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'react-assets', 'motion.js')
      );

      console.log('使用本地 React 资源');
      console.log('React JS URI:', reactJsUri);
      console.log('ReactDOM JS URI:', reactDomJsUri);
      console.log('Babel JS URI:', babelJsUri);
      console.log('Lucide JS URI:', lucideJsUri);
      console.log('Motion JS URI:', motionJsUri);
      console.log('Motion 是否存在:', motionExists);

      // 创建完整的 HTML 内容，直接包含 Figma 源码
      const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commit Hero - Figma 设计</title>
  <style>
    ${globalsCssContent}

    /* VSCode 主题适配 */
    body {
      background: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      margin: 0;
      padding: 0;
    }

    /* 确保组件在 VSCode 中正确显示 */
    #root {
      min-height: 100vh;
      background: var(--vscode-editor-background);
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- React 和 ReactDOM 本地资源 -->
  <script src="${reactJsUri}" onload="console.log('React 加载成功')" onerror="console.error('React 加载失败')"></script>
  <script src="${reactDomJsUri}" onload="console.log('ReactDOM 加载成功')" onerror="console.error('ReactDOM 加载失败')"></script>

  <!-- Babel 用于 JSX 转换 -->
  <script src="${babelJsUri}" onload="console.log('Babel 加载成功')" onerror="console.error('Babel 加载失败')"></script>

  <!-- Lucide React 图标库 -->
  <script src="${lucideJsUri}" onload="console.log('Lucide 加载成功')" onerror="console.error('Lucide 加载失败')"></script>

  ${
    motionExists
      ? `<!-- Motion 动画库 -->
  <script src="${motionJsUri}"></script>`
      : '<!-- Motion 动画库不可用，跳过 -->'
  }

  <!-- VS Code API 脚本 -->
  <script>
    console.log('开始初始化 VSCode API...');
    
    // VS Code API
    const vscode = acquireVsCodeApi();
    console.log('VSCode API 获取成功:', !!vscode);

    // 通信函数
    window.vscodeAPI = {
      postMessage: (message) => vscode.postMessage(message),
      getState: () => vscode.getState(),
      setState: (state) => vscode.setState(state)
    };

    // 监听来自VS Code的消息
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (window.handleVSCodeMessage) {
        window.handleVSCodeMessage(message);
      }
    });

    // 页面加载完成后发送ready消息
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, sending ready message');
      vscode.postMessage({ type: 'ready' });
      vscode.postMessage({ type: 'getGitStats' });
    });

    // 如果DOM已经加载完成，立即发送ready消息
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loading, sending ready message');
        vscode.postMessage({ type: 'ready' });
      });
    } else {
      console.log('DOM already loaded, sending ready message immediately');
      vscode.postMessage({ type: 'ready' });
    }
  </script>

  <!-- Figma 组件脚本 -->
  <script type="text/babel" data-type="module">
    console.log('开始加载 Figma 组件...');
    console.log('React 可用:', typeof React !== 'undefined');
    console.log('ReactDOM 可用:', typeof ReactDOM !== 'undefined');
    console.log('Babel 可用:', typeof Babel !== 'undefined');
    
    try {
      ${appTsxContent}
      
      console.log('App 组件定义完成');
      console.log('App 组件类型:', typeof App);
      
      // 渲染应用
      const rootElement = document.getElementById('root');
      console.log('Root 元素:', rootElement);
      
      if (rootElement && typeof ReactDOM !== 'undefined' && typeof React !== 'undefined') {
        const root = ReactDOM.createRoot(rootElement);
        console.log('React Root 创建成功');
        
        if (typeof App !== 'undefined') {
          root.render(React.createElement(App));
          console.log('App 组件渲染完成');
        } else {
          console.error('App 组件未定义');
          root.render(React.createElement('div', null, 'App 组件加载失败'));
        }
      } else {
        console.error('渲染条件不满足:', {
          rootElement: !!rootElement,
          ReactDOM: typeof ReactDOM,
          React: typeof React
        });
      }
    } catch (error) {
      console.error('渲染过程中发生错误:', error);
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = '<div style="color: red; padding: 20px;">渲染错误: ' + error.message + '</div>';
      }
    }
  </script>
</body>
</html>`;

      console.log('生成的 HTML 内容长度:', htmlContent.length);
      console.log('HTML 内容前200字符:', htmlContent.substring(0, 200));

      return htmlContent;
    } catch (error) {
      console.error('加载构建产物失败:', error);
      return this._getFallbackHtml(webview);
    }
  }

  private _getFallbackHtml(webview: vscode.Webview) {
    return `<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commit Hero - 本地统计</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
          }
          .stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
          }
          .achievements {
            margin-top: 20px;
          }
          .achievement {
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 10px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
          }
          .achievement-icon {
            font-size: 20px;
            margin-right: 10px;
          }
          .achievement-info {
            flex: 1;
          }
          .achievement-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          .achievement-desc {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
          }
          .controls {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }
          .btn {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-panel-border);
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          .btn:hover {
            background: var(--vscode-button-hoverBackground);
          }
          .btn.primary {
            background: var(--vscode-button-prominentBackground);
            color: var(--vscode-button-prominentForeground);
          }
          .btn.primary:hover {
            background: var(--vscode-button-prominentHoverBackground);
          }
          .status {
            text-align: center;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 12px;
          }
          .status.tracking {
            background: var(--vscode-textBlockQuote-background);
            color: var(--vscode-textBlockQuote-foreground);
          }
          .status.not-tracking {
            background: var(--vscode-inputValidation-warningBackground);
            color: var(--vscode-inputValidation-warningForeground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎯 Commit Hero</h2>
            <p>本地 Git 提交统计</p>
          </div>

          <div id="status" class="status not-tracking">
            未在追踪
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value" id="total-commits">0</div>
              <div class="stat-label">总提交</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="streak-days">0</div>
              <div class="stat-label">连续天数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="lines-added">0</div>
              <div class="stat-label">添加行数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="achievements-count">0</div>
              <div class="stat-label">成就数量</div>
            </div>
          </div>

          <div class="achievements" id="achievements">
            <h3>🏆 成就</h3>
            <div id="achievements-list">
              <p style="text-align: center; color: var(--vscode-descriptionForeground);">
                暂无成就，开始提交代码来解锁吧！
              </p>
            </div>
          </div>

          <div class="controls">
            <button class="btn primary" id="start-tracking">开始追踪</button>
            <button class="btn" id="stop-tracking">停止追踪</button>
            <button class="btn" id="add-mock">添加模拟</button>
            <button class="btn" id="clear-data">清除数据</button>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          function updateStats(stats) {
            document.getElementById('total-commits').textContent = stats.totalCommits || 0;
            document.getElementById('streak-days').textContent = stats.streakDays || 0;
            document.getElementById('lines-added').textContent = stats.totalLinesAdded || 0;
            document.getElementById('achievements-count').textContent = stats.achievements?.length || 0;

            const achievementsList = document.getElementById('achievements-list');
            if (stats.achievements && stats.achievements.length > 0) {
              achievementsList.innerHTML = stats.achievements.map(achievement => \`
                <div class="achievement">
                  <div class="achievement-icon">\${achievement.icon}</div>
                  <div class="achievement-info">
                    <div class="achievement-name">\${achievement.name}</div>
                    <div class="achievement-desc">\${achievement.description}</div>
                  </div>
                </div>
              \`).join('');
            } else {
              achievementsList.innerHTML = '<p style="text-align: center; color: var(--vscode-descriptionForeground);">暂无成就，开始提交代码来解锁吧！</p>';
            }
          }

          function updateTrackingStatus(isTracking) {
            const statusEl = document.getElementById('status');
            if (isTracking) {
              statusEl.textContent = '正在追踪 Git 提交';
              statusEl.className = 'status tracking';
            } else {
              statusEl.textContent = '未在追踪';
              statusEl.className = 'status not-tracking';
            }
          }

          document.getElementById('start-tracking').addEventListener('click', () => {
            vscode.postMessage({ type: 'startTracking' });
          });

          document.getElementById('stop-tracking').addEventListener('click', () => {
            vscode.postMessage({ type: 'stopTracking' });
          });

          document.getElementById('add-mock').addEventListener('click', () => {
            vscode.postMessage({ type: 'addMockCommit' });
          });

          document.getElementById('clear-data').addEventListener('click', () => {
            if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
              vscode.postMessage({ type: 'clearData' });
            }
          });

          window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
              case 'updateData':
                updateStats(message.data);
                break;
              case 'updateTrackingStatus':
                updateTrackingStatus(message.isTracking);
                break;
            }
          });

          document.addEventListener('DOMContentLoaded', () => {
            vscode.postMessage({ type: 'getGitStats' });
          });
        </script>
      </body>
      </html>`;
  }
}
