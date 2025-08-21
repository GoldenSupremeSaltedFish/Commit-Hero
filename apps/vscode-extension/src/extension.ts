import * as vscode from 'vscode';
import { CommitHeroProvider } from './commitHeroProvider';
import { GitTracker } from './gitTracker';
import { StatusBarManager } from './statusBarManager';
import { NotificationManager } from './notificationManager';

export class CommitHeroExtension {
  private static instance: CommitHeroExtension;
  private context: vscode.ExtensionContext;
  private provider: CommitHeroProvider;
  private gitTracker: GitTracker;
  private statusBarManager: StatusBarManager;
  private notificationManager: NotificationManager;
  private isTracking: boolean = false;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.provider = new CommitHeroProvider(context.extensionUri);
    this.gitTracker = new GitTracker();
    this.statusBarManager = new StatusBarManager();
    this.notificationManager = new NotificationManager();
  }

  public static getInstance(context?: vscode.ExtensionContext): CommitHeroExtension {
    if (!CommitHeroExtension.instance && context) {
      CommitHeroExtension.instance = new CommitHeroExtension(context);
    }
    return CommitHeroExtension.instance;
  }

  public async activate(): Promise<void> {
    console.log('Commit Hero 插件已激活');

    // 注册 Webview 提供者
    const providerRegistration = vscode.window.registerWebviewViewProvider(
      'commit-hero-stats',
      this.provider
    );

    // 注册命令
    const startTrackingCommand = vscode.commands.registerCommand(
      'commit-hero.startTracking',
      () => this.startTracking()
    );

    const stopTrackingCommand = vscode.commands.registerCommand(
      'commit-hero.stopTracking',
      () => this.stopTracking()
    );

    const openDashboardCommand = vscode.commands.registerCommand(
      'commit-hero.openDashboard',
      () => this.openDashboard()
    );

    const showAchievementCommand = vscode.commands.registerCommand(
      'commit-hero.showAchievement',
      () => this.showAchievement()
    );

    const refreshStatsCommand = vscode.commands.registerCommand(
      'commit-hero.refreshStats',
      () => this.refreshStats()
    );

    // 注册上下文订阅
    this.context.subscriptions.push(
      providerRegistration,
      startTrackingCommand,
      stopTrackingCommand,
      openDashboardCommand,
      showAchievementCommand,
      refreshStatsCommand
    );

    // 初始化状态栏
    this.statusBarManager.initialize();

    // 检查自动追踪设置
    const config = vscode.workspace.getConfiguration('commitHero');
    const autoTrack = config.get<boolean>('autoTrack', true);
    
    if (autoTrack) {
      // 延迟启动，确保 VSCode 完全加载
      setTimeout(() => {
        this.startTracking();
      }, 2000);
    }

    // 监听配置变化
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('commitHero')) {
        this.onConfigurationChanged();
      }
    });

    // 监听工作区变化
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      if (this.isTracking) {
        this.refreshStats();
      }
    });
  }

  private async startTracking(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('commitHero');
      const userEmail = config.get<string>('userEmail');

      if (!userEmail) {
        await vscode.window.showWarningMessage(
          '请先在设置中配置用户邮箱地址',
          '打开设置'
        ).then(async (action) => {
          if (action === '打开设置') {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'commitHero.userEmail');
          }
        });
        return;
      }

      this.isTracking = true;
      this.gitTracker.startTracking();
      this.statusBarManager.updateStatus(true);
      this.provider.updateTrackingStatus(true);
      
      // 更新上下文
      await vscode.commands.executeCommand('setContext', 'commitHero.isTracking', true);
      
      vscode.window.showInformationMessage('Commit Hero 追踪已开始');
      
      // 立即刷新统计信息
      await this.refreshStats();
      
    } catch (error) {
      console.error('启动追踪失败:', error);
      vscode.window.showErrorMessage('启动追踪失败: ' + (error as Error).message);
    }
  }

  private async stopTracking(): Promise<void> {
    try {
      this.isTracking = false;
      this.gitTracker.stopTracking();
      this.statusBarManager.updateStatus(false);
      this.provider.updateTrackingStatus(false);
      
      // 更新上下文
      await vscode.commands.executeCommand('setContext', 'commitHero.isTracking', false);
      
      vscode.window.showInformationMessage('Commit Hero 追踪已停止');
      
    } catch (error) {
      console.error('停止追踪失败:', error);
      vscode.window.showErrorMessage('停止追踪失败: ' + (error as Error).message);
    }
  }

  private async openDashboard(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('commitHero');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000');
      
      const uri = vscode.Uri.parse(apiUrl);
      await vscode.env.openExternal(uri);
      
    } catch (error) {
      console.error('打开仪表板失败:', error);
      vscode.window.showErrorMessage('打开仪表板失败: ' + (error as Error).message);
    }
  }

  private async showAchievement(): Promise<void> {
    try {
      // 显示测试成就
      this.notificationManager.showAchievement({
        name: '测试成就',
        description: '这是一个测试成就',
        icon_url: '🎯'
      });
      
    } catch (error) {
      console.error('显示成就失败:', error);
      vscode.window.showErrorMessage('显示成就失败: ' + (error as Error).message);
    }
  }

  private async refreshStats(): Promise<void> {
    try {
      await this.provider.refreshData();
      vscode.window.showInformationMessage('统计信息已刷新');
      
    } catch (error) {
      console.error('刷新统计失败:', error);
      vscode.window.showErrorMessage('刷新统计失败: ' + (error as Error).message);
    }
  }

  private async onConfigurationChanged(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('commitHero');
      const showNotifications = config.get<boolean>('showNotifications', true);
      
      this.notificationManager.setNotificationsEnabled(showNotifications);
      
      // 如果正在追踪，刷新数据
      if (this.isTracking) {
        await this.refreshStats();
      }
      
    } catch (error) {
      console.error('配置变化处理失败:', error);
    }
  }

  public deactivate(): void {
    console.log('Commit Hero 插件已停用');
    this.gitTracker.stopTracking();
    this.statusBarManager.dispose();
  }

  public getTrackingStatus(): boolean {
    return this.isTracking;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const extension = CommitHeroExtension.getInstance(context);
  extension.activate();
}

export function deactivate(): void {
  const extension = CommitHeroExtension.getInstance();
  if (extension) {
    extension.deactivate();
  }
}
