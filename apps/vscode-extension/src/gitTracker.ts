import * as vscode from 'vscode';
import { LocalGitAPI } from './api';
import { CommitData, DataStorage } from './dataStorage';
import { NotificationManager } from './notificationManager';

export class GitTracker {
  private dataStorage: DataStorage;
  private gitAPI: LocalGitAPI;
  private notificationManager: NotificationManager;
  private isTrackingActive: boolean = false;
  private workspaceWatcher?: vscode.FileSystemWatcher;
  private lastCommitHash: string = '';
  private userEmail: string = '';

  constructor(context: vscode.ExtensionContext) {
    this.dataStorage = new DataStorage(context);
    this.notificationManager = new NotificationManager();

    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    this.gitAPI = new LocalGitAPI(workspaceRoot);

    // Initialize user email from config
    this.userEmail = vscode.workspace.getConfiguration('commitHero').get('userEmail', '');
  }

  public async startTracking(): Promise<void> {
    if (this.isTrackingActive) {
      return;
    }

    // Check if this is a Git repository
    const isGitRepo = await this.gitAPI.isGitRepository();
    if (!isGitRepo) {
      vscode.window.showWarningMessage('当前工作区不是 Git 仓库，无法追踪提交');
      return;
    }

    // Get Git user info
    const gitUser = await this.gitAPI.getGitUser();
    if (gitUser && !this.userEmail) {
      this.userEmail = gitUser.email;
      // Update config with detected email
      await vscode.workspace
        .getConfiguration('commitHero')
        .update('userEmail', gitUser.email, vscode.ConfigurationTarget.Workspace);
    }

    this.isTrackingActive = true;

    // Load existing commits and set up tracking
    await this.loadExistingCommits();

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

    vscode.window.showInformationMessage(
      `Git 追踪已启动${gitUser ? ` (用户: ${gitUser.name})` : ''}`
    );
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

  private async loadExistingCommits(): Promise<void> {
    try {
      const commits = await this.gitAPI.getRecentCommits(100, this.userEmail);

      if (commits.length > 0) {
        this.lastCommitHash = commits[0].hash;

        // Convert Git commits to our format and add to storage
        for (const gitCommit of commits) {
          const commitData: CommitData = {
            id: gitCommit.hash,
            hash: gitCommit.hash,
            message: gitCommit.message,
            author: gitCommit.author,
            date: gitCommit.date,
            filesChanged: gitCommit.filesChanged,
            linesAdded: gitCommit.linesAdded,
            linesDeleted: gitCommit.linesDeleted,
          };

          this.dataStorage.addCommit(commitData);
        }

        console.log(`已加载 ${commits.length} 个现有提交`);
      }
    } catch (error) {
      console.error('加载现有提交失败:', error);
    }
  }

  private async checkForNewCommits(): Promise<void> {
    try {
      if (!this.userEmail) {
        return;
      }

      // Get commits since the last known commit
      const commits = await this.gitAPI.getRecentCommits(10, this.userEmail);

      // Find new commits
      const newCommits = commits.filter(commit => commit.hash !== this.lastCommitHash);

      if (newCommits.length > 0) {
        console.log(`发现 ${newCommits.length} 个新提交`);

        // Process new commits in reverse order (oldest first)
        for (const gitCommit of newCommits.reverse()) {
          const commitData: CommitData = {
            id: gitCommit.hash,
            hash: gitCommit.hash,
            message: gitCommit.message,
            author: gitCommit.author,
            date: gitCommit.date,
            filesChanged: gitCommit.filesChanged,
            linesAdded: gitCommit.linesAdded,
            linesDeleted: gitCommit.linesDeleted,
          };

          await this.addRealCommit(commitData);
        }

        // Update last commit hash
        this.lastCommitHash = commits[0].hash;
      }
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
      id: Date.now().toString(),
    };

    // Get achievements before adding commit
    const statsBefore = this.dataStorage.getStats();
    const achievementsBefore = new Set(statsBefore.achievements.map(a => a.id));

    this.dataStorage.addCommit(commit);

    // Get achievements after adding commit
    const statsAfter = this.dataStorage.getStats();
    const newAchievements = statsAfter.achievements.filter(
      achievement => !achievementsBefore.has(achievement.id)
    );

    // Show achievement notifications
    if (newAchievements.length > 0) {
      newAchievements.forEach(achievement => {
        this.notificationManager.showAchievement(achievement);
      });
    }
  }

  public setWebviewProvider(provider: any): void {
    this.notificationManager.setWebviewProvider(provider);
  }
}
