import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

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
      achievements: [],
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
        category: 'commit',
      });
    }

    if (stats.totalCommits >= 5 && !existingAchievementIds.has('commit-5')) {
      stats.achievements.push({
        id: 'commit-5',
        name: '初出茅庐',
        description: '完成5次代码提交',
        icon: '🌱',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    if (stats.totalCommits >= 10 && !existingAchievementIds.has('commit-10')) {
      stats.achievements.push({
        id: 'commit-10',
        name: '提交达人',
        description: '完成10次代码提交',
        icon: '🚀',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    if (stats.totalCommits >= 25 && !existingAchievementIds.has('commit-25')) {
      stats.achievements.push({
        id: 'commit-25',
        name: '代码工匠',
        description: '完成25次代码提交',
        icon: '⚒️',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    if (stats.totalCommits >= 50 && !existingAchievementIds.has('commit-50')) {
      stats.achievements.push({
        id: 'commit-50',
        name: '提交专家',
        description: '完成50次代码提交',
        icon: '🎖️',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    if (stats.totalCommits >= 100 && !existingAchievementIds.has('commit-100')) {
      stats.achievements.push({
        id: 'commit-100',
        name: '提交大师',
        description: '完成100次代码提交',
        icon: '👑',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    if (stats.totalCommits >= 500 && !existingAchievementIds.has('commit-500')) {
      stats.achievements.push({
        id: 'commit-500',
        name: '代码传奇',
        description: '完成500次代码提交',
        icon: '🏆',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    // 连续提交成就
    if (stats.streakDays >= 3 && !existingAchievementIds.has('streak-3')) {
      stats.achievements.push({
        id: 'streak-3',
        name: '三日坚持',
        description: '连续3天提交代码',
        icon: '⭐',
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    if (stats.streakDays >= 7 && !existingAchievementIds.has('streak-7')) {
      stats.achievements.push({
        id: 'streak-7',
        name: '一周坚持',
        description: '连续7天提交代码',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    if (stats.streakDays >= 14 && !existingAchievementIds.has('streak-14')) {
      stats.achievements.push({
        id: 'streak-14',
        name: '双周坚持',
        description: '连续14天提交代码',
        icon: '💎',
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    if (stats.streakDays >= 30 && !existingAchievementIds.has('streak-30')) {
      stats.achievements.push({
        id: 'streak-30',
        name: '月度坚持',
        description: '连续30天提交代码',
        icon: '💪',
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    if (stats.streakDays >= 100 && !existingAchievementIds.has('streak-100')) {
      stats.achievements.push({
        id: 'streak-100',
        name: '百日坚持',
        description: '连续100天提交代码',
        icon: '🌟',
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    // 代码行数成就
    if (stats.totalLinesAdded >= 100 && !existingAchievementIds.has('lines-100')) {
      stats.achievements.push({
        id: 'lines-100',
        name: '代码新手',
        description: '添加超过100行代码',
        icon: '📝',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    if (stats.totalLinesAdded >= 500 && !existingAchievementIds.has('lines-500')) {
      stats.achievements.push({
        id: 'lines-500',
        name: '代码学徒',
        description: '添加超过500行代码',
        icon: '📚',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    if (stats.totalLinesAdded >= 1000 && !existingAchievementIds.has('lines-1000')) {
      stats.achievements.push({
        id: 'lines-1000',
        name: '代码贡献者',
        description: '添加超过1000行代码',
        icon: '📝',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    if (stats.totalLinesAdded >= 5000 && !existingAchievementIds.has('lines-5000')) {
      stats.achievements.push({
        id: 'lines-5000',
        name: '代码建筑师',
        description: '添加超过5000行代码',
        icon: '🏗️',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    if (stats.totalLinesAdded >= 10000 && !existingAchievementIds.has('lines-10000')) {
      stats.achievements.push({
        id: 'lines-10000',
        name: '代码创造者',
        description: '添加超过10000行代码',
        icon: '🎨',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    if (stats.totalLinesAdded >= 50000 && !existingAchievementIds.has('lines-50000')) {
      stats.achievements.push({
        id: 'lines-50000',
        name: '代码巨匠',
        description: '添加超过50000行代码',
        icon: '🎭',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    // 文件修改成就
    if (stats.totalFilesChanged >= 10 && !existingAchievementIds.has('files-10')) {
      stats.achievements.push({
        id: 'files-10',
        name: '多文件修改者',
        description: '修改超过10个文件',
        icon: '📁',
        unlockedAt: new Date().toISOString(),
        category: 'files',
      });
    }

    if (stats.totalFilesChanged >= 50 && !existingAchievementIds.has('files-50')) {
      stats.achievements.push({
        id: 'files-50',
        name: '文件管理专家',
        description: '修改超过50个文件',
        icon: '🗂️',
        unlockedAt: new Date().toISOString(),
        category: 'files',
      });
    }

    if (stats.totalFilesChanged >= 100 && !existingAchievementIds.has('files-100')) {
      stats.achievements.push({
        id: 'files-100',
        name: '项目架构师',
        description: '修改超过100个文件',
        icon: '🏛️',
        unlockedAt: new Date().toISOString(),
        category: 'files',
      });
    }

    // 特殊成就
    if (stats.totalLinesDeleted >= 1000 && !existingAchievementIds.has('cleanup-master')) {
      stats.achievements.push({
        id: 'cleanup-master',
        name: '代码清理大师',
        description: '删除超过1000行代码',
        icon: '🧹',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
      });
    }

    if (
      stats.totalCommits >= 10 &&
      stats.streakDays >= 7 &&
      !existingAchievementIds.has('consistent-coder')
    ) {
      stats.achievements.push({
        id: 'consistent-coder',
        name: '持续编码者',
        description: '完成10次提交且连续7天提交',
        icon: '🎪',
        unlockedAt: new Date().toISOString(),
        category: 'commit',
      });
    }

    if (
      stats.totalLinesAdded >= 1000 &&
      stats.totalLinesDeleted >= 500 &&
      !existingAchievementIds.has('refactor-expert')
    ) {
      stats.achievements.push({
        id: 'refactor-expert',
        name: '重构专家',
        description: '添加1000行代码并删除500行代码',
        icon: '🔄',
        unlockedAt: new Date().toISOString(),
        category: 'lines',
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
      achievements: [],
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
      linesDeleted: Math.floor(Math.random() * 20),
    };

    this.addCommit(mockCommit);
  }
}
