import * as vscode from 'vscode';

export class CommitHeroProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'commit-hero-view';

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		webviewView.webview.options = {
			// 允许在 webview 中运行脚本
			enableScripts: true,
			// 限制 webview 只能访问扩展的资源
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// 处理来自 webview 的消息
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'openDashboard':
					vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
					break;
				case 'showAchievement':
					vscode.window.showInformationMessage('🎉 恭喜！你解锁了新成就！');
					break;
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
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
            background-color: var(--vscode-sideBar-background);
            color: var(--vscode-sideBar-foreground);
        }
        
        .header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-sideBar-border);
        }
        
        .header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: var(--vscode-sideBarSectionHeader-background);
            border: 1px solid var(--vscode-sideBar-border);
            border-radius: 6px;
            padding: 12px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        
        .stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        
        .badges-section {
            margin-bottom: 20px;
        }
        
        .badges-section h3 {
            font-size: 14px;
            margin: 0 0 12px 0;
            color: var(--vscode-sideBarSectionHeader-foreground);
        }
        
        .badge-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        
        .badge {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .badge:hover {
            transform: scale(1.1);
        }
        
        .badge.locked {
            background: var(--vscode-disabledForeground);
            opacity: 0.5;
        }
        
        .actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .btn.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .achievement-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .achievement-notification.show {
            transform: translateX(0);
        }
    </style>
</head>
<body>
    <div class="header">
        <span style="font-size: 20px;">🏆</span>
        <h2>Commit Hero</h2>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number" id="today-commits">0</div>
            <div class="stat-label">今日提交</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="total-commits">0</div>
            <div class="stat-label">总提交</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="streak-days">0</div>
            <div class="stat-label">连续天数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="badges-count">0</div>
            <div class="stat-label">获得徽章</div>
        </div>
    </div>
    
    <div class="badges-section">
        <h3>最近徽章</h3>
        <div class="badge-grid" id="badges-grid">
            <div class="badge" title="首次提交">🥇</div>
            <div class="badge locked" title="连续提交">🔥</div>
            <div class="badge locked" title="高产开发者">⚡</div>
        </div>
    </div>
    
    <div class="actions">
        <button class="btn" onclick="openDashboard()">打开仪表盘</button>
        <button class="btn secondary" onclick="refreshStats()">刷新数据</button>
    </div>
    
    <div class="achievement-notification" id="achievement-notification">
        <div style="font-weight: bold; margin-bottom: 4px;">🎉 成就解锁！</div>
        <div style="font-size: 12px;">Bug Buster - 修复了10个bug</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // 模拟数据更新
        function updateStats() {
            document.getElementById('today-commits').textContent = Math.floor(Math.random() * 10) + 1;
            document.getElementById('total-commits').textContent = Math.floor(Math.random() * 100) + 50;
            document.getElementById('streak-days').textContent = Math.floor(Math.random() * 7) + 1;
            document.getElementById('badges-count').textContent = Math.floor(Math.random() * 3) + 1;
        }
        
        function openDashboard() {
            vscode.postMessage({ type: 'openDashboard' });
        }
        
        function refreshStats() {
            updateStats();
            vscode.window.showInformationMessage('数据已刷新');
        }
        
        function showAchievement() {
            const notification = document.getElementById('achievement-notification');
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // 初始化
        updateStats();
        
        // 模拟成就解锁（每30秒）
        setInterval(() => {
            if (Math.random() > 0.7) {
                showAchievement();
            }
        }, 30000);
        
        // 徽章点击事件
        document.querySelectorAll('.badge').forEach(badge => {
            badge.addEventListener('click', () => {
                if (!badge.classList.contains('locked')) {
                    vscode.postMessage({ type: 'showAchievement' });
                }
            });
        });
    </script>
</body>
</html>`;
	}
}
