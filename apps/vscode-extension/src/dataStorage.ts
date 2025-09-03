import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface CommitData {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface UserStats {
  totalCommits: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  totalFilesChanged: number;
  streakDays: number;
  lastCommitDate: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'commit' | 'streak' | 'lines' | 'files';
}

export class DataStorage {
  private readonly storageKey = 'commitHeroData';
  private readonly context: vscode.ExtensionContext;
  private dataPath: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    // 使用 VSCode 扩展的全局存储路径
    this.dataPath = path.join(context.globalStorageUri.fsPath, 'commit-hero-data.json');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): UserStats {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }

    // 返回默认数据
    return {
      totalCommits: 0,
      totalLinesAdded: 0,
      totalLinesDeleted: 0,
      totalFilesChanged: 0,
      streakDays: 0,
      lastCommitDate: '',
      achievements: []
    };
  }

  private saveData(data: UserStats): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  public addCommit(commit: CommitData): void {
    const stats = this.loadData();
    
    // 更新统计数据
    stats.totalCommits++;
    stats.totalLinesAdded += commit.linesAdded;
    stats.totalLinesDeleted += commit.linesDeleted;
    stats.totalFilesChanged += commit.filesChanged;
    
    // 更新连续提交天数
    const commitDate = new Date(commit.date).toDateString();
    if (stats.lastCommitDate !== commitDate) {
      if (this.isConsecutiveDay(stats.lastCommitDate, commitDate)) {
        stats.streakDays++;
      } else {
        stats.streakDays = 1;
      }
      stats.lastCommitDate = commitDate;
    }

    // 检查成就
    this.checkAchievements(stats);
    
    this.saveData(stats);
  }

  private isConsecutiveDay(lastDate: string, currentDate: string): boolean {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  private checkAchievements(stats: UserStats): void {
    const existingAchievementIds = new Set(stats.achievements.map(a => a.id));
    
    // 提交次数成就
    if (stats.totalCommits >= 1 && !existingAchievementIds.has('first-commit')) {
      stats.achievements.push({
        id: 'first-commit',
        name: '第一次提交',
        description: '完成你的第一次代码提交',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        category: 'commit'
      });
    }
    
    if (stats.totalCommits >= 10 && !existingAchievementIds.has('commit-10')) {
      stats.achievements.push({
        id: 'commit-10',
        name: '提交达人',
        description: '完成10次代码提交',
        icon: '🚀',
        unlockedAt: new Date().toISOString(),
        category: 'commit'
      });
    }
    
    if (stats.totalCommits >= 100 && !existingAchievementIds.has('commit-100')) {
      stats.achievements.push({
        id: 'commit-100',
        name: '提交大师',
        description: '完成100次代码提交',
        icon: '👑',
        unlockedAt: new Date().toISOString(),
        category: 'commit'
      });
    }

    // 连续提交成就
    if (stats.streakDays >= 7 && !existingAchievementIds.has('streak-7')) {
      stats.achievements.push({
        id: 'streak-7',
        name: '一周坚持',
        description: '连续7天提交代码',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
        category: 'streak'
      });
    }

    if (stats.streakDays >= 30 && !existingAchievementIds.has('streak-30')) {
      stats.achievements.push({
        id: 'streak-30',
        name: '月度坚持',
        description: '连续30天提交代码',
        icon: '💪',
        unlockedAt: new Date().toISOString(),
        category: 'streak'
      });
    }

    // 代码行数成就
    if (stats.totalLinesAdded >= 1000 && !existingAchievementIds.has('lines-1000')) {
      stats.achievements.push({
        id: 'lines-1000',
        name: '代码贡献者',
        description: '添加超过1000行代码',
        icon: '📝',
        unlockedAt: new Date().toISOString(),
        category: 'lines'
      });
    }

    if (stats.totalLinesAdded >= 10000 && !existingAchievementIds.has('lines-10000')) {
      stats.achievements.push({
        id: 'lines-10000',
        name: '代码创造者',
        description: '添加超过10000行代码',
        icon: '🎨',
        unlockedAt: new Date().toISOString(),
        category: 'lines'
      });
    }
  }

  public getStats(): UserStats {
    return this.loadData();
  }

  public clearData(): void {
    const defaultStats: UserStats = {
      totalCommits: 0,
      totalLinesAdded: 0,
      totalLinesDeleted: 0,
      totalFilesChanged: 0,
      streakDays: 0,
      lastCommitDate: '',
      achievements: []
    };
    this.saveData(defaultStats);
  }

  public addMockCommit(): void {
    const mockCommit: CommitData = {
      id: Date.now().toString(),
      hash: `mock-${Math.random().toString(36).substr(2, 9)}`,
      message: '模拟提交 - 测试数据',
      author: 'Test User',
      date: new Date().toISOString(),
      filesChanged: Math.floor(Math.random() * 5) + 1,
      linesAdded: Math.floor(Math.random() * 50) + 10,
      linesDeleted: Math.floor(Math.random() * 20)
    };
    
    this.addCommit(mockCommit);
  }
}