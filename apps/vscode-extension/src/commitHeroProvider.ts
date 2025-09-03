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
        case 'getGitStats':
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