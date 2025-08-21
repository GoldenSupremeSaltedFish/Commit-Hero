import * as vscode from 'vscode';
// import { CommitHeroAPI } from '@commit-hero/api-client';

export class CommitHeroProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'commit-hero-stats';
  private _view?: vscode.WebviewView;
  // private api: CommitHeroAPI;
  private isTracking: boolean = false;

  constructor(private readonly _extensionUri: vscode.Uri) {
    // const config = vscode.workspace.getConfiguration('commitHero');
    // const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000');
    // this.api = new CommitHeroAPI(apiUrl);
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

      // 获取用户统计信息 (调试模式 - 模拟数据)
      // const statsResponse = await this.api.getUserStats(userEmail);
      // const badgesResponse = await this.api.getBadges(userEmail);

      // 模拟成功响应用于调试
      const statsResponse = { success: true, data: { commits: 0, linesAdded: 0, linesDeleted: 0 } };
      const badgesResponse = { success: true, data: { badges: [], userBadges: [] } };

      if (statsResponse.success && badgesResponse.success) {
        this._view.webview.postMessage({
          type: 'updateData',
          data: {
            stats: statsResponse.data,
            badges: badgesResponse.data?.badges || [],
            userBadges: badgesResponse.data?.userBadges || [],
            error: null
          }
        });
      } else {
        this._view.webview.postMessage({
          type: 'updateData',
          data: {
            error: '获取数据失败，请检查 API 服务器是否运行',
            stats: null,
            badges: []
          }
        });
      }
    } catch (error) {
      this._view.webview.postMessage({
        type: 'updateData',
        data: {
          error: '网络错误：' + (error as Error).message,
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
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'style.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'script.js'));

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commit Hero</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--vscode-editor-foreground);
        }

        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--vscode-errorForeground);
        }

        .status-indicator.tracking {
            background: var(--vscode-testing-iconPassed);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            text-align: center;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: var(--vscode-editor-foreground);
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badges-section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-editor-foreground);
        }

        .badges-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 8px;
        }

        .badge-item {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .badge-item:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
        }

        .badge-item.unlocked {
            background: var(--vscode-testing-iconPassed);
            border-color: var(--vscode-testing-iconPassed);
        }

        .badge-icon {
            font-size: 24px;
            margin-bottom: 4px;
        }

        .badge-name {
            font-size: 10px;
            color: var(--vscode-editor-foreground);
            line-height: 1.2;
        }

        .actions {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }

        .btn {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-button-border);
            border-radius: 4px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
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

        .error-message {
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 16px;
            color: var(--vscode-inputValidation-errorForeground);
            font-size: 12px;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Commit Hero</h2>
        <div class="status-indicator" id="statusIndicator"></div>
    </div>

    <div class="actions">
        <button class="btn" id="startBtn">开始追踪</button>
        <button class="btn" id="stopBtn">停止追踪</button>
        <button class="btn primary" id="dashboardBtn">仪表板</button>
    </div>

    <div id="errorMessage" class="error-message" style="display: none;"></div>

    <div id="loadingMessage" class="loading">
        <div>加载中...</div>
    </div>

    <div id="content" style="display: none;">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="totalCommits">0</div>
                <div class="stat-label">总提交</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalLines">0</div>
                <div class="stat-label">代码行数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="repositories">0</div>
                <div class="stat-label">仓库数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="badgesEarned">0</div>
                <div class="stat-label">成就徽章</div>
            </div>
        </div>

        <div class="badges-section">
            <div class="section-title">成就徽章</div>
            <div class="badges-grid" id="badgesGrid">
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <div>暂无成就徽章</div>
                    <div style="font-size: 11px; margin-top: 8px;">开始提交代码来解锁成就吧！</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // 状态管理
        let isTracking = false;
        let currentData = null;

        // DOM 元素
        const statusIndicator = document.getElementById('statusIndicator');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const errorMessage = document.getElementById('errorMessage');
        const loadingMessage = document.getElementById('loadingMessage');
        const content = document.getElementById('content');

        // 事件监听
        startBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'startTracking' });
        });

        stopBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'stopTracking' });
        });

        dashboardBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'openDashboard' });
        });

        // 消息处理
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'updateData':
                    updateData(message.data);
                    break;
                case 'updateTrackingStatus':
                    updateTrackingStatus(message.isTracking);
                    break;
            }
        });

        function updateTrackingStatus(tracking) {
            isTracking = tracking;
            statusIndicator.classList.toggle('tracking', tracking);
            startBtn.style.display = tracking ? 'none' : 'block';
            stopBtn.style.display = tracking ? 'block' : 'none';
        }

        function updateData(data) {
            currentData = data;
            
            if (data.error) {
                showError(data.error);
                return;
            }

            hideError();
            showContent();
            updateStats(data.stats);
            updateBadges(data.badges, data.userBadges);
        }

        function updateStats(stats) {
            if (!stats) return;

            document.getElementById('totalCommits').textContent = stats.total_commits || 0;
            document.getElementById('totalLines').textContent = (stats.total_lines_added || 0) + (stats.total_lines_deleted || 0);
            document.getElementById('repositories').textContent = stats.repositories?.length || 0;
            document.getElementById('badgesEarned').textContent = stats.badges_earned || 0;
        }

        function updateBadges(badges, userBadges) {
            const badgesGrid = document.getElementById('badgesGrid');
            
            if (!badges || badges.length === 0) {
                badgesGrid.innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-state-icon">🏆</div>
                        <div>暂无成就徽章</div>
                        <div style="font-size: 11px; margin-top: 8px;">开始提交代码来解锁成就吧！</div>
                    </div>
                \`;
                return;
            }

            const unlockedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
            
            badgesGrid.innerHTML = badges.map(badge => {
                const isUnlocked = unlockedBadgeIds.has(badge.id);
                return \`
                    <div class="badge-item \${isUnlocked ? 'unlocked' : ''}" title="\${badge.description}">
                        <div class="badge-icon">\${badge.icon_url}</div>
                        <div class="badge-name">\${badge.name}</div>
                    </div>
                \`;
            }).join('');
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            loadingMessage.style.display = 'none';
            content.style.display = 'none';
        }

        function hideError() {
            errorMessage.style.display = 'none';
        }

        function showContent() {
            loadingMessage.style.display = 'none';
            content.style.display = 'block';
        }

        // 初始化
        updateTrackingStatus(false);
    </script>
</body>
</html>`;
  }
}
