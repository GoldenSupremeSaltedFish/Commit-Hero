import * as vscode from 'vscode';
import { DataStorage, CommitData } from './dataStorage';

export class GitTracker {
  private dataStorage: DataStorage;
  private isTrackingActive: boolean = false;
  private workspaceWatcher?: vscode.FileSystemWatcher;

  constructor(context: vscode.ExtensionContext) {
    this.dataStorage = new DataStorage(context);
  }

  public startTracking(): void {
    if (this.isTrackingActive) {
      return;
    }

    this.isTrackingActive = true;
    
    // 监听工作区文件变化
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      const workspaceFolder = vscode.workspace.workspaceFolders[0];
      
      // 监听 .git 目录变化（提交、分支切换等）
      this.workspaceWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceFolder, '.git/**/*')
      );

      this.workspaceWatcher.onDidChange(() => {
        this.checkForNewCommits();
      });

      this.workspaceWatcher.onDidCreate(() => {
        this.checkForNewCommits();
      });
    }

    vscode.window.showInformationMessage('Git 追踪已启动');
  }

  public stopTracking(): void {
    if (!this.isTrackingActive) {
      return;
    }

    this.isTrackingActive = false;
    
    if (this.workspaceWatcher) {
      this.workspaceWatcher.dispose();
      this.workspaceWatcher = undefined;
    }

    vscode.window.showInformationMessage('Git 追踪已停止');
  }

  public isTracking(): boolean {
    return this.isTrackingActive;
  }

  private async checkForNewCommits(): Promise<void> {
    try {
      // 这里可以添加实际的 Git 命令执行逻辑
      // 目前使用模拟数据
      console.log('检查新的 Git 提交...');
    } catch (error) {
      console.error('检查 Git 提交失败:', error);
    }
  }

  public addMockCommit(): void {
    this.dataStorage.addMockCommit();
    vscode.window.showInformationMessage('已添加模拟提交数据');
  }

  public getStats() {
    return this.dataStorage.getStats();
  }

  public clearData(): void {
    this.dataStorage.clearData();
    vscode.window.showInformationMessage('数据已清除');
  }

  public async addRealCommit(commitData: Omit<CommitData, 'id'>): Promise<void> {
    const commit: CommitData = {
      ...commitData,
      id: Date.now().toString()
    };
    
    this.dataStorage.addCommit(commit);
    
    // 显示成就通知
    const stats = this.dataStorage.getStats();
    const newAchievements = stats.achievements.filter(
      achievement => new Date(achievement.unlockedAt).getTime() > Date.now() - 5000
    );
    
    if (newAchievements.length > 0) {
      newAchievements.forEach(achievement => {
        vscode.window.showInformationMessage(
          `🎉 解锁成就: ${achievement.name} - ${achievement.description}`,
          { modal: false }
        );
      });
    }
  }
}
