import * as vscode from 'vscode';
import { CommitHeroProvider } from './commitHeroProvider';
import { GitTracker } from './gitTracker';
import { StatusBarManager } from './statusBarManager';
import { NotificationManager } from './notificationManager';
import * as fs from 'fs';
import * as path from 'path';

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

    // 数据管理命令
    const exportDataCommand = vscode.commands.registerCommand(
      'commit-hero.exportData',
      () => this.exportData()
    );

    const importDataCommand = vscode.commands.registerCommand(
      'commit-hero.importData',
      () => this.importData()
    );

    const backupDataCommand = vscode.commands.registerCommand(
      'commit-hero.backupData',
      () => this.backupData()
    );

    const showDataInfoCommand = vscode.commands.registerCommand(
      'commit-hero.showDataInfo',
      () => this.showDataInfo()
    );

    // 注册上下文订阅
    this.context.subscriptions.push(
      providerRegistration,
      startTrackingCommand,
      stopTrackingCommand,
      openDashboardCommand,
      showAchievementCommand,
      refreshStatsCommand,
      exportDataCommand,
      importDataCommand,
      backupDataCommand,
      showDataInfoCommand
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

  private async exportData(): Promise<void> {
    try {
      // 选择保存位置
      const uri = await vscode.window.showSaveDialog({
        title: '导出 Commit Hero 数据',
        filters: {
          'JSON 文件': ['json']
        },
        suggestedName: `commit-hero-data-${new Date().toISOString().split('T')[0]}.json`
      });

      if (!uri) {
        return;
      }

      // 调用 API 导出数据
      const config = vscode.workspace.getConfiguration('commitHero');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000');
      
      const response = await fetch(`${apiUrl}/api/export`);
      if (!response.ok) {
        throw new Error('导出数据失败');
      }

      const data = await response.json();
      
      // 写入文件
      const wsedit = new vscode.WorkspaceEdit();
      wsedit.createFile(uri, { overwrite: true });
      await vscode.workspace.applyEdit(wsedit);
      
      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 2)));
      
      vscode.window.showInformationMessage(`数据已导出到: ${uri.fsPath}`);
      
    } catch (error) {
      console.error('导出数据失败:', error);
      vscode.window.showErrorMessage('导出数据失败: ' + (error as Error).message);
    }
  }

  private async importData(): Promise<void> {
    try {
      // 选择导入文件
      const uris = await vscode.window.showOpenDialog({
        title: '导入 Commit Hero 数据',
        filters: {
          'JSON 文件': ['json']
        },
        canSelectMany: false
      });

      if (!uris || uris.length === 0) {
        return;
      }

      const uri = uris[0];
      
      // 确认导入
      const result = await vscode.window.showWarningMessage(
        '导入数据将覆盖现有数据，确定要继续吗？',
        '确定',
        '取消'
      );

      if (result !== '确定') {
        return;
      }

      // 读取文件
      const fileData = await vscode.workspace.fs.readFile(uri);
      const data = JSON.parse(fileData.toString());

      // 调用 API 导入数据
      const config = vscode.workspace.getConfiguration('commitHero');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000');
      
      const response = await fetch(`${apiUrl}/api/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('导入数据失败');
      }

      vscode.window.showInformationMessage('数据导入成功');
      
      // 刷新统计信息
      await this.refreshStats();
      
    } catch (error) {
      console.error('导入数据失败:', error);
      vscode.window.showErrorMessage('导入数据失败: ' + (error as Error).message);
    }
  }

  private async backupData(): Promise<void> {
    try {
      // 选择备份位置
      const uri = await vscode.window.showSaveDialog({
        title: '备份 Commit Hero 数据库',
        filters: {
          'SQLite 数据库': ['db', 'sqlite']
        },
        suggestedName: `commit-hero-backup-${new Date().toISOString().split('T')[0]}.db`
      });

      if (!uri) {
        return;
      }

      // 调用 API 备份数据
      const config = vscode.workspace.getConfiguration('commitHero');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000');
      
      const response = await fetch(`${apiUrl}/api/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupPath: uri.fsPath })
      });

      if (!response.ok) {
        throw new Error('备份数据失败');
      }

      vscode.window.showInformationMessage(`数据库已备份到: ${uri.fsPath}`);
      
    } catch (error) {
      console.error('备份数据失败:', error);
      vscode.window.showErrorMessage('备份数据失败: ' + (error as Error).message);
    }
  }

  private async showDataInfo(): Promise<void> {
    try {
      // 调用 API 获取数据库信息
      const config = vscode.workspace.getConfiguration('commitHero');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000');
      
      const response = await fetch(`${apiUrl}/api/stats`);
      if (!response.ok) {
        throw new Error('获取数据信息失败');
      }

      const stats = await response.json();
      
      // 显示信息
      const message = `
📊 **Commit Hero 数据统计**

👥 用户数量: ${stats.userCount}
📝 提交记录: ${stats.commitCount}
🏆 成就徽章: ${stats.badgeCount}
🎯 已解锁徽章: ${stats.userBadgeCount}
💾 数据库大小: ${stats.fileSizeMB} MB
📁 存储位置: ${stats.databasePath}

数据完全存储在本地，安全可靠！
      `.trim();

      vscode.window.showInformationMessage(message);
      
    } catch (error) {
      console.error('获取数据信息失败:', error);
      vscode.window.showErrorMessage('获取数据信息失败: ' + (error as Error).message);
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
