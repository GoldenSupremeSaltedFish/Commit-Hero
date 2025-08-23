import * as vscode from 'vscode';
import { DataStorage } from './dataStorage';

export class CommitHeroProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'commit-hero-stats';
  private _view?: vscode.WebviewView;
  private isTracking: boolean = false;
  private dataStorage: DataStorage;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.dataStorage = DataStorage.getInstance();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 处理来自 webview 的消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'refresh':
          await this.refreshData();
          break;
        case 'openDashboard':
          await vscode.commands.executeCommand('commit-hero.openDashboard');
          break;
        case 'startTracking':
          await vscode.commands.executeCommand('commit-hero.startTracking');
          break;
        case 'stopTracking':
          await vscode.commands.executeCommand('commit-hero.stopTracking');
          break;
      }
    });

    // 初始加载数据
    this.refreshData();
  }

  public async refreshData(): Promise<void> {
    if (!this._view) {
      return;
    }

    try {
      const config = vscode.workspace.getConfiguration('commitHero');
      const userEmail = config.get<string>('userEmail');

      if (!userEmail) {
        this._view.webview.postMessage({
          type: 'updateData',
          data: {
            error: '请先配置用户邮箱地址',
            stats: null,
            badges: []
          }
        });
        return;
      }

      // 使用本地数据存储
      const stats = this.dataStorage.getStats();
      const achievements = this.dataStorage.getAchievements();
      const unlockedAchievements = this.dataStorage.getUnlockedAchievements();

      this._view.webview.postMessage({
        type: 'updateData',
        data: {
          stats: {
            commits: stats.total_commits,
            linesAdded: stats.total_lines_added,
            linesDeleted: stats.total_lines_deleted,
            currentStreak: stats.current_streak,
            longestStreak: stats.longest_streak,
            repositories: stats.repositories.length
          },
          badges: achievements,
          userBadges: unlockedAchievements,
          error: null
        }
      });
    } catch (error) {
      this._view.webview.postMessage({
        type: 'updateData',
        data: {
          error: '获取数据失败：' + (error as Error).message,
          stats: null,
          badges: []
        }
      });
    }
  }

  public updateTrackingStatus(isTracking: boolean): void {
    this.isTracking = isTracking;
    if (this._view) {
      this._view.webview.postMessage({
        type: 'updateTrackingStatus',
        isTracking
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'style.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'script.js'));
    const nonce = this.getNonce();

    return [
      '<!DOCTYPE html>',
      '<html lang="zh-CN">',
      '<head>',
      '    <meta charset="UTF-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">`,
      '    <title>Commit Hero</title>',
      `    <link href="${styleUri}" rel="stylesheet">`,
      '</head>',
      '<body>',
      '    <div class="container">',
      '        <div class="header">',
      '            <h2>Commit Hero</h2>',
      `            <div id="status-indicator" class="status-indicator ${this.isTracking ? 'tracking' : ''}"></div>`,
      '        </div>',
      '',
      '        <div id="error-message" class="error-message" style="display: none;"></div>',
      '',
      '        <div id="content">',
      '            <div id="stats-section">',
      '                <div class="stats-grid">',
      '                    <div class="stat-card">',
      '                        <div id="commits-count" class="stat-value">0</div>',
      '                        <div class="stat-label">提交次数</div>',
      '                    </div>',
      '                    <div class="stat-card">',
      '                        <div id="lines-added" class="stat-value">0</div>',
      '                        <div class="stat-label">新增行数</div>',
      '                    </div>',
      '                    <div class="stat-card">',
      '                        <div id="lines-deleted" class="stat-value">0</div>',
      '                        <div class="stat-label">删除行数</div>',
      '                    </div>',
      '                    <div class="stat-card">',
      '                        <div id="files-changed" class="stat-value">0</div>',
      '                        <div class="stat-label">修改文件</div>',
      '                    </div>',
      '                </div>',
      '            </div>',
      '',
      '            <div class="badges-section">',
      '                <h3>成就徽章</h3>',
      '                <div id="badges-grid" class="badges-grid">',
      '                    <div class="empty-state-text">暂无可用徽章</div>',
      '                </div>',
      '            </div>',
      '',
      '            <div class="controls">',
      `                <button id="start-tracking" class="button" style="display: ${this.isTracking ? 'none' : 'block'};">`,
      '                    开始追踪',
      '                </button>',
      `                <button id="stop-tracking" class="button" style="display: ${this.isTracking ? 'block' : 'none'};">`,
      '                    停止追踪',
      '                </button>',
      '                <button id="open-dashboard" class="button">',
      '                    打开仪表板',
      '                </button>',
      '                <button id="refresh-btn" class="button">',
      '                    刷新',
      '                </button>',
      '            </div>',
      '        </div>',
      '    </div>',
      '',
      `    <script nonce="${nonce}" src="${scriptUri}"></script>`,
      '</body>',
      '</html>'
    ].join('\n');
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
