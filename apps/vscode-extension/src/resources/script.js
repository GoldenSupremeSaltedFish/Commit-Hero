// Commit Hero - Webview 脚本
(function() {
    const vscode = acquireVsCodeApi();
    
    // DOM 元素缓存
    const elements = {
        trackingStatus: document.getElementById('tracking-status'),
        totalCommits: document.getElementById('total-commits'),
        todayCommits: document.getElementById('today-commits'),
        streakDays: document.getElementById('streak-days'),
        bestStreak: document.getElementById('best-streak'),
        achievements: document.getElementById('achievements'),
        startBtn: document.getElementById('start-tracking'),
        stopBtn: document.getElementById('stop-tracking'),
        mockBtn: document.getElementById('add-mock'),
        clearBtn: document.getElementById('clear-data'),
        loading: document.getElementById('loading')
    };

    // 初始化
    function initialize() {
        setupEventListeners();
        showLoading();
        
        // 通知扩展 webview 已就绪
        vscode.postMessage({ type: 'ready' });
    }

    // 设置事件监听器
    function setupEventListeners() {
        elements.startBtn?.addEventListener('click', () => {
            vscode.postMessage({ type: 'startTracking' });
        });

        elements.stopBtn?.addEventListener('click', () => {
            vscode.postMessage({ type: 'stopTracking' });
        });

        elements.mockBtn?.addEventListener('click', () => {
            vscode.postMessage({ type: 'addMockCommit' });
        });

        elements.clearBtn?.addEventListener('click', () => {
            if (confirm('确定要清空所有本地数据吗？此操作不可恢复。')) {
                vscode.postMessage({ type: 'clearData' });
            }
        });

        // 监听来自扩展的消息
        window.addEventListener('message', handleMessage);
    }

    // 处理来自扩展的消息
    function handleMessage(event) {
        const message = event.data;
        
        switch (message.type) {
            case 'updateTrackingStatus':
                updateTrackingStatus(message.isTracking);
                break;
            case 'updateData':
                updateData(message.data);
                break;
            case 'showError':
                showError(message.error);
                break;
        }
    }

    // 更新追踪状态
    function updateTrackingStatus(isTracking) {
        if (elements.trackingStatus) {
            elements.trackingStatus.textContent = isTracking ? '正在追踪' : '未追踪';
            elements.trackingStatus.className = isTracking ? 'status-active' : 'status-inactive';
        }

        // 更新按钮状态
        if (elements.startBtn) elements.startBtn.style.display = isTracking ? 'none' : 'inline-block';
        if (elements.stopBtn) elements.stopBtn.style.display = isTracking ? 'inline-block' : 'none';
    }

    // 更新数据
    function updateData(data) {
        hideLoading();
        
        if (!data) return;

        // 更新统计数字
        if (elements.totalCommits) elements.totalCommits.textContent = data.totalCommits || 0;
        if (elements.todayCommits) elements.todayCommits.textContent = data.todayCommits || 0;
        if (elements.streakDays) elements.streakDays.textContent = data.currentStreak || 0;
        if (elements.bestStreak) elements.bestStreak.textContent = data.bestStreak || 0;

        // 更新成就
        updateAchievements(data.achievements || []);
    }

    // 更新成就列表
    function updateAchievements(achievements) {
        if (!elements.achievements) return;

        if (achievements.length === 0) {
            elements.achievements.innerHTML = '<div class="no-achievements">暂无成就</div>';
            return;
        }

        elements.achievements.innerHTML = achievements.map(achievement => `
            <div class="achievement-item" title="${achievement.description}">
                <span class="achievement-icon">${achievement.icon || '🏆'}</span>
                <span>${achievement.name}</span>
            </div>
        `).join('');
    }

    // 显示加载状态
    function showLoading() {
        if (elements.loading) {
            elements.loading.style.display = 'block';
        }
    }

    // 隐藏加载状态
    function hideLoading() {
        if (elements.loading) {
            elements.loading.style.display = 'none';
        }
    }

    // 显示错误信息
    function showError(error) {
        hideLoading();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `错误: ${error}`;
        
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initialize);

    // 导出一些函数供调试使用
    window.CommitHero = {
        refresh: () => vscode.postMessage({ type: 'ready' }),
        debug: () => console.log('Commit Hero Webview 已加载')
    };

})();