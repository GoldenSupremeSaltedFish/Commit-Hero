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
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'resources', 'reset.css')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'resources', 'vscode.css')
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'resources', 'style.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'resources', 'script.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src data:;">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <title>Commit Hero</title>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>Commit Hero</h1>
            <div class="tracking-status">
              <span id="tracking-indicator" class="status-indicator">●</span>
              <span id="tracking-text">未开始追踪</span>
            </div>
          </header>

          <div class="controls">
            <button id="start-tracking" class="btn btn-primary">开始追踪</button>
            <button id="stop-tracking" class="btn btn-secondary" disabled>停止追踪</button>
          </div>

          <div class="stats-overview">
            <div class="stat-card">
              <div class="stat-value" id="total-commits">0</div>
              <div class="stat-label">总提交数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="today-commits">0</div>
              <div class="stat-label">今日提交</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="current-streak">0</div>
              <div class="stat-label">连续天数</div>
            </div>
          </div>

          <div class="achievements">
            <h3>成就徽章</h3>
            <div id="achievements-list" class="achievements-grid">
              <div class="achievement-placeholder">暂无成就</div>
            </div>
          </div>

          <div class="data-management">
            <h3>数据管理</h3>
            <div class="button-group">
              <button id="add-mock" class="btn btn-outline">添加模拟提交</button>
              <button id="clear-data" class="btn btn-danger">清空数据</button>
            </div>
          </div>

          <div class="loading" id="loading" style="display: none;">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        </div>

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}