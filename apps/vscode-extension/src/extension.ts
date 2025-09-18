import * as vscode from 'vscode';
import { CommitHeroProvider } from './commitHeroProvider';
import { GitTracker } from './gitTracker';
import { StatusBarManager } from './statusBarManager';

export function activate(context: vscode.ExtensionContext) {
  console.log('Commit Hero 插件已激活');

  // 初始化 GitTracker
  const gitTracker = new GitTracker(context);

  // 初始化状态栏管理器
  const statusBarManager = new StatusBarManager();
  statusBarManager.initialize();

  // 设置初始上下文
  vscode.commands.executeCommand('setContext', 'commitHero.isTracking', gitTracker.isTracking());

  // 注册 CommitHeroProvider
  const provider = new CommitHeroProvider(context.extensionUri, gitTracker);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('commit-hero-stats', provider)
  );

  // Connect notification manager with webview provider
  gitTracker.setWebviewProvider(provider);

  // 注册命令
  const startTrackingCommand = vscode.commands.registerCommand(
    'commitHero.startTracking',
    async () => {
      await gitTracker.startTracking();
      vscode.commands.executeCommand('setContext', 'commitHero.isTracking', true);
      provider.updateTrackingStatus(true);
      provider.refreshData();

      // Update status bar
      const stats = gitTracker.getStats();
      statusBarManager.updateStatus(true, {
        totalCommits: stats.totalCommits,
        streakDays: stats.streakDays,
      });
    }
  );

  const stopTrackingCommand = vscode.commands.registerCommand('commitHero.stopTracking', () => {
    gitTracker.stopTracking();
    vscode.commands.executeCommand('setContext', 'commitHero.isTracking', false);
    provider.updateTrackingStatus(false);
    statusBarManager.updateStatus(false);
    vscode.window.showInformationMessage('停止追踪 Git 提交');
  });

  const addMockCommitCommand = vscode.commands.registerCommand('commitHero.addMockCommit', () => {
    gitTracker.addMockCommit();
    provider.refreshData();

    // Update status bar
    const stats = gitTracker.getStats();
    statusBarManager.updateStatus(gitTracker.isTracking(), {
      totalCommits: stats.totalCommits,
      streakDays: stats.streakDays,
    });

    vscode.window.showInformationMessage('已添加模拟提交');
  });

  // 移除外部仪表板命令，改为本地功能
  const showLocalStatsCommand = vscode.commands.registerCommand('commitHero.showLocalStats', () => {
    // 显示本地统计信息
    const stats = gitTracker.getStats();
    vscode.window.showInformationMessage(
      `本地统计: ${stats.totalCommits} 次提交, ${stats.streakDays} 天连续, ${stats.achievements.length} 个成就`
    );
  });

  // 添加显示视图命令
  const showViewCommand = vscode.commands.registerCommand('commitHero.showView', () => {
    // 激活 Commit Hero 视图
    vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');
    // 显示 webview 视图
    vscode.commands.executeCommand('commit-hero-stats.focus');
    vscode.window.showInformationMessage('Commit Hero 视图已激活');
  });

  // 注册所有命令
  context.subscriptions.push(
    startTrackingCommand,
    stopTrackingCommand,
    addMockCommitCommand,
    showLocalStatsCommand,
    showViewCommand,
    statusBarManager
  );

  // 延迟初始化数据，确保 webview 已准备好
  setTimeout(() => {
    provider.refreshData();
  }, 1000);

  console.log('Commit Hero 扩展已完全激活，webview 提供者已注册');
}

export function deactivate() {
  console.log('Commit Hero 插件已停用');
}
