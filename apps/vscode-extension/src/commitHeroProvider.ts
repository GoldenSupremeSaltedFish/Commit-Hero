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
  private messageListener?: vscode.Disposable;

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

    // 清理之前的监听器
    if (this.messageListener) {
      this.messageListener.dispose();
    }

    // 设置新的消息监听器
    this.messageListener = webviewView.webview.onDidReceiveMessage(async data => {
      console.log('收到 webview 消息:', data);
      switch (data.type) {
        case 'ready':
          console.log('webview 发送 ready 消息，设置 webviewReady = true');
          this.webviewReady = true;
          this.refreshData();
          break;
        case 'startTracking':
          await this.gitTracker.startTracking();
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

  public showAchievementNotification(achievement: any): void {
    if (this._view && this.webviewReady) {
      this._view.webview.postMessage({
        type: 'achievementUnlocked',
        achievement,
      });
    }
  }

  public dispose(): void {
    if (this.messageListener) {
      this.messageListener.dispose();
      this.messageListener = undefined;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // 检查 webview-dist 目录是否存在
    const webviewDistPath = path.join(__dirname, '..', 'webview-dist');

    if (!fs.existsSync(webviewDistPath)) {
      console.log('webview-dist 目录不存在，使用fallback HTML');
      return this._getFallbackHtml(webview);
    }

    try {
      // 读取构建后的 index.html
      const indexPath = path.join(webviewDistPath, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.log('webview-dist/index.html 不存在，使用fallback HTML');
        return this._getFallbackHtml(webview);
      }

      let htmlContent = fs.readFileSync(indexPath, 'utf8');
      console.log('成功读取 webview-dist/index.html');

      // 替换资源路径为 webview URI
      htmlContent = this._replaceResourcePaths(htmlContent, webview);

      console.log('HTML 内容处理完成，长度:', htmlContent.length);
      return htmlContent;
    } catch (error) {
      console.error('加载 webview 构建产物失败:', error);
      return this._getFallbackHtml(webview);
    }
  }

  private _replaceResourcePaths(htmlContent: string, webview: vscode.Webview): string {
    // 替换相对路径为 webview URI
    const assetRegex = /(src|href)="([^"]*\.(js|css|png|jpg|jpeg|gif|svg|ico))"/g;

    return htmlContent.replace(assetRegex, (match, attr, assetPath) => {
      // 跳过已经是完整 URL 的路径
      if (assetPath.startsWith('http') || assetPath.startsWith('data:') || assetPath.startsWith('vscode-webview-resource:')) {
        return match;
      }

      // 移除开头的 ./
      const cleanPath = assetPath.replace(/^\.\//, '');

      // 创建 webview URI
      const assetUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'webview-dist', cleanPath)
      );

      console.log(`替换资源路径: ${assetPath} -> ${assetUri}`);
      return `${attr}="${assetUri}"`;
    });
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
