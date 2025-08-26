import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface CommitData {
  hash: string;
  message: string;
  author: string;
  email: string;
  date: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface UserStats {
  totalCommits: number;
  todayCommits: number;
  currentStreak: number;
  bestStreak: number;
  lastCommitDate: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export class GitTracker {
  private context: vscode.ExtensionContext;
  private trackingActive: boolean = false;
  private localCommits: CommitData[] = [];
  private dataFile: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.dataFile = path.join(context.globalStorageUri.fsPath, 'commits.json');
    this.ensureDataDirectory();
    this.loadData();
  }

  private ensureDataDirectory(): void {
    try {
      if (!fs.existsSync(this.context.globalStorageUri.fsPath)) {
        fs.mkdirSync(this.context.globalStorageUri.fsPath, { recursive: true });
      }
    } catch (error) {
      console.error('创建数据目录失败:', error);
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.localCommits = data.commits || [];
        this.trackingActive = data.isTrackingActive || false;
      } else {
        this.localCommits = [];
        this.trackingActive = false;
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      this.localCommits = [];
      this.trackingActive = false;
    }
  }

  private saveData(): void {
    try {
      const data = {
        commits: this.localCommits,
        isTrackingActive: this.trackingActive
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  public startTracking(): void {
    this.trackingActive = true;
    this.saveData();
    console.log('开始追踪 Git 提交');
  }

  public stopTracking(): void {
    this.trackingActive = false;
    this.saveData();
    console.log('停止追踪 Git 提交');
  }

  public addMockCommit(message?: string, linesAdded?: number, linesDeleted?: number): void {
    const mockCommit: CommitData = {
      hash: `mock-${Date.now()}`,
      message: message || `模拟提交 #${this.localCommits.length + 1}`,
      author: '本地用户',
      email: 'local@example.com',
      date: new Date().toISOString(),
      filesChanged: Math.floor(Math.random() * 5) + 1,
      additions: linesAdded || Math.floor(Math.random() * 50) + 1,
      deletions: linesDeleted || Math.floor(Math.random() * 20)
    };

    this.localCommits.push(mockCommit);
    this.saveData();
    console.log('添加模拟提交:', mockCommit.message);
  }

  public getStats(): UserStats {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCommits = this.localCommits.filter(commit => {
      const commitDate = new Date(commit.date);
      commitDate.setHours(0, 0, 0, 0);
      return commitDate.getTime() === today.getTime();
    }).length;

    const totalCommits = this.localCommits.length;
    const streakInfo = this.calculateStreak();
    const achievements = this.calculateAchievements();

    return {
      totalCommits,
      todayCommits,
      currentStreak: streakInfo.current,
      bestStreak: streakInfo.best,
      lastCommitDate: this.localCommits.length > 0 ? this.localCommits[this.localCommits.length - 1].date : '',
      achievements
    };
  }

  private calculateStreak(): { current: number; best: number } {
    if (this.localCommits.length === 0) {
      return { current: 0, best: 0 };
    }

    const sortedCommits = [...this.localCommits].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let currentStreakCount = 0;
    let lastDate: Date | null = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const commit of sortedCommits) {
      const commitDate = new Date(commit.date);
      commitDate.setHours(0, 0, 0, 0);

      if (lastDate === null) {
        currentStreakCount = 1;
      } else {
        const diffTime = commitDate.getTime() - lastDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays === 1) {
          currentStreakCount++;
        } else if (diffDays > 1) {
          bestStreak = Math.max(bestStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      }

      lastDate = commitDate;
    }

    bestStreak = Math.max(bestStreak, currentStreakCount);

    // 检查当前是否在今天或昨天有提交
    if (lastDate) {
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      if (diffDays <= 1) {
        currentStreak = currentStreakCount;
      } else {
        currentStreak = 0;
      }
    }

    return { current: currentStreak, best: bestStreak };
  }

  private calculateAchievements(): Achievement[] {
    const stats = this.getStats();
    const achievements: Achievement[] = [];

    // 首次提交成就
    if (stats.totalCommits >= 1) {
      achievements.push({
        id: 'first-commit',
        name: '首次提交',
        description: '完成第一次提交',
        icon: '🎯',
        unlockedAt: this.localCommits[0]?.date || new Date().toISOString()
      });
    }

    // 连续提交成就
    if (stats.currentStreak >= 3) {
      achievements.push({
        id: 'streak-3',
        name: '连续3天',
        description: '连续3天有提交',
        icon: '🔥',
        unlockedAt: new Date().toISOString()
      });
    }

    if (stats.currentStreak >= 7) {
      achievements.push({
        id: 'streak-7',
        name: '连续7天',
        description: '连续7天有提交',
        icon: '⚡',
        unlockedAt: new Date().toISOString()
      });
    }

    // 总提交数成就
    if (stats.totalCommits >= 10) {
      achievements.push({
        id: 'commits-10',
        name: '提交达人',
        description: '累计10次提交',
        icon: '⭐',
        unlockedAt: new Date().toISOString()
      });
    }

    if (stats.totalCommits >= 50) {
      achievements.push({
        id: 'commits-50',
        name: '提交大师',
        description: '累计50次提交',
        icon: '🌟',
        unlockedAt: new Date().toISOString()
      });
    }

    return achievements;
  }

  public clearData(): void {
    this.localCommits = [];
    this.trackingActive = false;
    this.saveData();
    console.log('本地数据已清空');
  }

  public isTracking(): boolean {
    return this.trackingActive;
  }

  public getAllCommits(): CommitData[] {
    return [...this.localCommits];
  }
}
