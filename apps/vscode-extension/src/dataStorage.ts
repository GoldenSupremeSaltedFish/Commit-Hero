import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface CommitData {
  id: string;
  email: string;
  repository: string;
  commit_hash: string;
  message: string;
  lines_added: number;
  lines_deleted: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  type: 'commits' | 'lines' | 'streak' | 'repository';
  unlocked: boolean;
  unlocked_at?: number;
}

export interface UserStats {
  total_commits: number;
  total_lines_added: number;
  total_lines_deleted: number;
  current_streak: number;
  longest_streak: number;
  repositories: string[];
  last_commit_date: number;
}

export class DataStorage {
  private static instance: DataStorage;
  private dataPath: string;
  private commits: CommitData[] = [];
  private achievements: Achievement[] = [];
  private stats: UserStats = {
    total_commits: 0,
    total_lines_added: 0,
    total_lines_deleted: 0,
    current_streak: 0,
    longest_streak: 0,
    repositories: [],
    last_commit_date: 0
  };

  private constructor() {
    this.dataPath = path.join(
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 
      path.join(require('os').homedir(), '.commit-hero'),
      '.commit-hero-data.json'
    );
    this.loadData();
    this.initializeAchievements();
  }

  public static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        this.commits = data.commits || [];
        this.achievements = data.achievements || [];
        this.stats = { ...this.stats, ...data.stats };
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }

  private saveData(): void {
    try {
      const data = {
        commits: this.commits,
        achievements: this.achievements,
        stats: this.stats
      };
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  private initializeAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_commit',
        name: '首次提交',
        description: '完成第一次代码提交',
        icon: '🎯',
        threshold: 1,
        type: 'commits',
        unlocked: false
      },
      {
        id: 'commit_novice',
        name: '提交新手',
        description: '累计完成10次提交',
        icon: '🌟',
        threshold: 10,
        type: 'commits',
        unlocked: false
      },
      {
        id: 'commit_master',
        name: '提交大师',
        description: '累计完成100次提交',
        icon: '👑',
        threshold: 100,
        type: 'commits',
        unlocked: false
      },
      {
        id: 'line_contributor',
        name: '代码贡献者',
        description: '累计贡献1000行代码',
        icon: '💻',
        threshold: 1000,
        type: 'lines',
        unlocked: false
      },
      {
        id: 'line_hero',
        name: '代码英雄',
        description: '累计贡献10000行代码',
        icon: '🚀',
        threshold: 10000,
        type: 'lines',
        unlocked: false
      },
      {
        id: 'three_day_streak',
        name: '连续3天',
        description: '连续3天都有代码提交',
        icon: '🔥',
        threshold: 3,
        type: 'streak',
        unlocked: false
      },
      {
        id: 'repository_explorer',
        name: '仓库探索者',
        description: '在3个不同仓库中提交代码',
        icon: '🏗️',
        threshold: 3,
        type: 'repository',
        unlocked: false
      }
    ];

    if (this.achievements.length === 0) {
      this.achievements = defaultAchievements;
      this.saveData();
    }
  }

  public addCommit(data: Omit<CommitData, 'id' | 'timestamp'>): Achievement[] {
    const commit: CommitData = {
      ...data,
      id: `${data.repository}_${data.commit_hash}`,
      timestamp: Date.now()
    };

    // 检查是否已存在
    const existing = this.commits.find(c => c.id === commit.id);
    if (existing) {
      return [];
    }

    this.commits.push(commit);
    
    // 更新统计
    this.updateStats(commit);
    
    // 检查成就
    const newAchievements = this.checkAchievements();
    
    this.saveData();
    
    return newAchievements;
  }

  private updateStats(commit: CommitData): void {
    this.stats.total_commits++;
    this.stats.total_lines_added += commit.lines_added;
    this.stats.total_lines_deleted += commit.lines_deleted;
    
    // 更新仓库列表
    if (!this.stats.repositories.includes(commit.repository)) {
      this.stats.repositories.push(commit.repository);
    }
    
    // 更新最后提交时间
    this.stats.last_commit_date = commit.timestamp;
    
    // 计算连续提交
    this.updateStreak(commit.timestamp);
  }

  private updateStreak(currentTimestamp: number): void {
    const oneDay = 24 * 60 * 60 * 1000;
    const today = new Date(currentTimestamp).toDateString();
    const lastCommitDate = new Date(this.stats.last_commit_date).toDateString();
    
    if (today === lastCommitDate) {
      // 同一天多次提交只算一次
      return;
    }
    
    const daysDiff = Math.floor((currentTimestamp - this.stats.last_commit_date) / oneDay);
    
    if (daysDiff === 1) {
      // 连续提交
      this.stats.current_streak++;
      this.stats.longest_streak = Math.max(this.stats.longest_streak, this.stats.current_streak);
    } else if (daysDiff > 1) {
      // 中断连续
      this.stats.current_streak = 1;
    } else {
      // 同一天，不做处理
      return;
    }
  }

  private checkAchievements(): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    for (const achievement of this.achievements) {
      if (achievement.unlocked) {
        continue;
      }
      
      let shouldUnlock = false;
      
      switch (achievement.type) {
        case 'commits':
          shouldUnlock = this.stats.total_commits >= achievement.threshold;
          break;
        case 'lines':
          shouldUnlock = (this.stats.total_lines_added + this.stats.total_lines_deleted) >= achievement.threshold;
          break;
        case 'streak':
          shouldUnlock = this.stats.current_streak >= achievement.threshold;
          break;
        case 'repository':
          shouldUnlock = this.stats.repositories.length >= achievement.threshold;
          break;
      }
      
      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlocked_at = Date.now();
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  }

  public getStats(): UserStats {
    return { ...this.stats };
  }

  public getCommits(limit: number = 100): CommitData[] {
    return [...this.commits]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  public getRecentRepositories(): string[] {
    const repoCount = new Map<string, number>();
    this.commits.forEach(commit => {
      repoCount.set(commit.repository, (repoCount.get(commit.repository) || 0) + 1);
    });
    
    return Array.from(repoCount.keys())
      .sort((a, b) => (repoCount.get(b) || 0) - (repoCount.get(a) || 0));
  }

  public getStatsByRepository(repository: string): UserStats {
    const repoCommits = this.commits.filter(c => c.repository === repository);
    
    return {
      total_commits: repoCommits.length,
      total_lines_added: repoCommits.reduce((sum, c) => sum + c.lines_added, 0),
      total_lines_deleted: repoCommits.reduce((sum, c) => sum + c.lines_deleted, 0),
      current_streak: 0, // 简化的仓库级别统计
      longest_streak: 0,
      repositories: [repository],
      last_commit_date: repoCommits.length > 0 ? Math.max(...repoCommits.map(c => c.timestamp)) : 0
    };
  }

  public clearData(): void {
    this.commits = [];
    this.stats = {
      total_commits: 0,
      total_lines_added: 0,
      total_lines_deleted: 0,
      current_streak: 0,
      longest_streak: 0,
      repositories: [],
      last_commit_date: 0
    };
    this.achievements.forEach(a => {
      a.unlocked = false;
      a.unlocked_at = undefined;
    });
    this.saveData();
  }

  public exportData(): string {
    return JSON.stringify({
      commits: this.commits,
      achievements: this.achievements,
      stats: this.stats
    }, null, 2);
  }

  public importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      this.commits = parsed.commits || [];
      this.achievements = parsed.achievements || [];
      this.stats = { ...this.stats, ...parsed.stats };
      this.saveData();
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}