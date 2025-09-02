import * as vscode from 'vscode';
import { GitTracker } from './gitTracker';
import * as path from 'path';
import * as fs from 'fs';

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
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'ready':
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
          // 处理来自React应用的统计请求
          const stats = this.gitTracker?.getStats();
          webviewView.webview.postMessage({
            type: 'gitStatsResponse',
            data: stats
          });
          break;
      }
    });
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
        data: stats
      });
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }

  public updateTrackingStatus(isTracking: boolean): void {
    if (this._view && this.webviewReady) {
      this._view.webview.postMessage({
        type: 'updateTrackingStatus',
        isTracking
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // 构建产物的路径
    const buildPath = path.join(this._extensionUri.fsPath, '..', '..', 'build');
    
    // 检查构建产物是否存在
    if (!fs.existsSync(buildPath)) {
      return this._getFallbackHtml(webview);
    }

    try {
      // 读取构建后的HTML文件
      const htmlPath = path.join(buildPath, 'index.html');
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // 读取CSS和JS文件
      const cssFiles = fs.readdirSync(path.join(buildPath, 'assets')).filter(file => file.endsWith('.css'));
      const jsFiles = fs.readdirSync(path.join(buildPath, 'assets')).filter(file => file.endsWith('.js'));
      
      if (cssFiles.length === 0 || jsFiles.length === 0) {
        return this._getFallbackHtml(webview);
      }

      // 替换资源路径为webview URI
      const cssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, '..', '..', 'build', 'assets', cssFiles[0])
      );
      const jsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, '..', '..', 'build', 'assets', jsFiles[0])
      );

      // 注入VS Code API和通信脚本
      const vscodeScript = `
        <script>
          // VS Code API
          const vscode = acquireVsCodeApi();
          
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
          
          // 请求Git统计信息
          if (window.vscodeAPI) {
            window.vscodeAPI.postMessage({ type: 'getGitStats' });
          }
        </script>
      `;

      // 在</body>标签前插入VS Code脚本
      htmlContent = htmlContent.replace('</body>', `${vscodeScript}</body>`);
      
      // 替换CSS和JS引用
      htmlContent = htmlContent.replace(
        /href="[^"]*\.css"/g, 
        `href="${cssUri}"`
      );
      htmlContent = htmlContent.replace(
        /src="[^"]*\.js"/g, 
        `src="${jsUri}"`
      );

      return htmlContent;
    } catch (error) {
      console.error('加载构建产物失败:', error);
      return this._getFallbackHtml(webview);
    }
  }

  private _getFallbackHtml(webview: vscode.Webview) {
    // 如果构建产物不存在，返回简单的fallback界面
    return `<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commit Hero - 构建中</title>
        <style>
          body { 
            font-family: var(--vscode-font-family); 
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 20px;
            text-align: center;
          }
          .error { color: var(--vscode-errorForeground); }
          .info { color: var(--vscode-descriptionForeground); }
        </style>
      </head>
      <body>
        <h2>Commit Hero</h2>
        <p class="error">构建产物未找到</p>
        <p class="info">请先运行 npm run build 构建React应用</p>
        <p class="info">或者检查构建路径是否正确</p>
      </body>
      </html>`;
  }
}