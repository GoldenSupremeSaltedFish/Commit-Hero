// VS Code Webview 脚本
(function() {
    const vscode = acquireVsCodeApi();

    let isTracking = false;
    let currentData = null;

    // 初始化
    function initialize() {
        setupEventListeners();
        // 初始加载数据将由扩展触发
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 刷新按钮
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'refresh' });
            });
        }

        // 开始追踪按钮
        const startBtn = document.getElementById('start-tracking');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'startTracking' });
            });
        }

        // 停止追踪按钮
        const stopBtn = document.getElementById('stop-tracking');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'stopTracking' });
            });
        }

        // 打开仪表板按钮
        const dashboardBtn = document.getElementById('open-dashboard');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'openDashboard' });
            });
        }
    }

    // 更新UI
    function updateUI(data) {
        if (data.error) {
            showError(data.error);
            return;
        }

        hideError();
        updateStats(data.stats);
        updateBadges(data.badges, data.userBadges);
    }

    // 显示错误
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // 隐藏错误
    function hideError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    // 更新统计信息
  function updateStats(stats) {
    if (!stats) {
      showEmptyState('暂无统计信息，开始追踪后查看');
      return;
    }

    const commitsEl = document.getElementById('commits-count');
    const addedEl = document.getElementById('lines-added');
    const deletedEl = document.getElementById('lines-deleted');
    const filesEl = document.getElementById('files-changed');

    if (commitsEl) commitsEl.textContent = stats.commits || 0;
    if (addedEl) addedEl.textContent = stats.linesAdded || 0;
    if (deletedEl) deletedEl.textContent = stats.linesDeleted || 0;
    if (filesEl) filesEl.textContent = stats.repositories || 0;

    hideEmptyState();
  }

    // 更新徽章
    function updateBadges(allBadges, userBadges) {
        const badgesGrid = document.getElementById('badges-grid');
        if (!badgesGrid) return;

        badgesGrid.innerHTML = '';

        if (!allBadges || allBadges.length === 0) {
            badgesGrid.innerHTML = '<div class="empty-state-text">暂无可用徽章</div>';
            return;
        }

        const userBadgeIds = userBadges ? userBadges.map(b => b.id) : [];

        allBadges.forEach(badge => {
            const badgeEl = createBadgeElement(badge, userBadgeIds.includes(badge.id));
            badgesGrid.appendChild(badgeEl);
        });
    }

    // 创建徽章元素
    function createBadgeElement(badge, isUnlocked) {
        const div = document.createElement('div');
        div.className = `badge ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        div.innerHTML = `
            <div class="badge-icon">${badge.icon || '🏆'}</div>
            <div class="badge-name">${badge.name}</div>
        `;

        if (isUnlocked) {
            div.title = `${badge.name}: ${badge.description || ''}`;
        } else {
            div.title = '未解锁';
        }

        return div;
    }

    // 更新追踪状态
    function updateTrackingStatus(isTracking) {
        window.isTracking = isTracking;
        
        const statusIndicator = document.getElementById('status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${isTracking ? 'tracking' : ''}`;
        }

        const startBtn = document.getElementById('start-tracking');
        const stopBtn = document.getElementById('stop-tracking');

        if (startBtn) startBtn.style.display = isTracking ? 'none' : 'block';
        if (stopBtn) stopBtn.style.display = isTracking ? 'block' : 'none';
    }

    // 显示空状态
    function showEmptyState(message) {
        const statsSection = document.getElementById('stats-section');
        if (statsSection) {
            statsSection.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">${message}</div>
                </div>
            `;
        }
    }

    // 隐藏空状态
    function hideEmptyState() {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    // 显示加载状态
    function showLoading() {
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = '<div class="loading">加载中...</div>';
        }
    }

    // 监听来自扩展的消息
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'updateData':
                currentData = message.data;
                updateUI(message.data);
                break;
            case 'updateTrackingStatus':
                updateTrackingStatus(message.isTracking);
                break;
        }
    });

    // 初始化应用
    initialize();
})();