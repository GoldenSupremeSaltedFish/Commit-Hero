import * as vscode from 'vscode';
import { CommitHeroProvider } from './commitHeroProvider';
import { GitTracker } from './gitTracker';

export function activate(context: vscode.ExtensionContext) {
  console.log('Commit Hero 插件已激活');

  // 初始化 GitTracker
  const gitTracker = new GitTracker(context);

  // 设置初始上下文
  vscode.commands.executeCommand('setContext', 'commitHero.isTracking', gitTracker.isTracking());

  // 注册 CommitHeroProvider
  const provider = new CommitHeroProvider(context.extensionUri, gitTracker);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('commit-hero-stats', provider)
  );

  // 注册命令
  const startTrackingCommand = vscode.commands.registerCommand('commitHero.startTracking', () => {
    gitTracker.startTracking();
    vscode.commands.executeCommand('setContext', 'commitHero.isTracking', true);
    provider.updateTrackingStatus(true);
    provider.refreshData();
    vscode.window.showInformationMessage('开始追踪 Git 提交');
  });

  const stopTrackingCommand = vscode.commands.registerCommand('commitHero.stopTracking', () => {
    gitTracker.stopTracking();
    vscode.commands.executeCommand('setContext', 'commitHero.isTracking', false);
    provider.updateTrackingStatus(false);
    vscode.window.showInformationMessage('停止追踪 Git 提交');
  });

  const addMockCommitCommand = vscode.commands.registerCommand('commitHero.addMockCommit', () => {
    gitTracker.addMockCommit();
    provider.refreshData();
    vscode.window.showInformationMessage('已添加模拟提交');
  });

  const openDashboardCommand = vscode.commands.registerCommand('commitHero.openDashboard', () => {
    vscode.env.openExternal(vscode.Uri.parse('https://commit-hero.example.com'));
  });

  // 激活时自动显示视图
  vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');

  // 注册所有命令
  context.subscriptions.push(
    startTrackingCommand,
    stopTrackingCommand,
    addMockCommitCommand,
    openDashboardCommand
  );

  // 初始化数据
  provider.refreshData();
}

export function deactivate() {
  console.log('Commit Hero 插件已停用');
}
