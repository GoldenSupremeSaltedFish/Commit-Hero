import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { User, Commit, Badge, UserBadge, CommitData } from './types';

export class CommitHeroDatabase {
  private db: Database.Database;
  private dataDir: string;
  private dbPath: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.dbPath = path.join(this.dataDir, 'commit-hero.db');
    this.db = new Database(this.dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // 创建用户表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建提交表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        repository TEXT NOT NULL,
        commit_hash TEXT NOT NULL,
        message TEXT,
        lines_added INTEGER DEFAULT 0,
        lines_deleted INTEGER DEFAULT 0,
        committed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // 创建徽章表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        criteria TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建用户徽章表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        badge_id INTEGER,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (badge_id) REFERENCES badges (id),
        UNIQUE(user_id, badge_id)
      )
    `);

    // 插入默认徽章
    const defaultBadges = [
      {
        name: '初次提交',
        description: '完成你的第一次代码提交',
        icon_url: '🎯',
        criteria: 'commits >= 1'
      },
      {
        name: '代码贡献者',
        description: '提交超过10次代码',
        icon_url: '👨‍💻',
        criteria: 'commits >= 10'
      },
      {
        name: '代码大师',
        description: '提交超过100次代码',
        icon_url: '🏆',
        criteria: 'commits >= 100'
      },
      {
        name: '重构专家',
        description: '删除超过1000行代码',
        icon_url: '🧹',
        criteria: 'lines_deleted >= 1000'
      },
      {
        name: '高产开发者',
        description: '添加超过10000行代码',
        icon_url: '⚡',
        criteria: 'lines_added >= 10000'
      }
    ];

    const insertBadge = this.db.prepare(
      `INSERT OR IGNORE INTO badges (name, description, icon_url, criteria) VALUES (?, ?, ?, ?)`
    );
    
    defaultBadges.forEach(badge => {
      insertBadge.run(badge.name, badge.description, badge.icon_url, badge.criteria);
    });

    console.log('数据库初始化完成');
  }

  // 用户相关操作
  getUser(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  createUser(email: string): User {
    const stmt = this.db.prepare('INSERT INTO users (email) VALUES (?)');
    const result = stmt.run(email);
    return { id: result.lastInsertRowid as number, email, created_at: new Date().toISOString() };
  }

  getOrCreateUser(email: string): User {
    const user = this.getUser(email);
    if (user) return user;
    return this.createUser(email);
  }

  // 提交相关操作
  addCommit(data: CommitData): Commit {
    const user = this.getOrCreateUser(data.email);
    const stmt = this.db.prepare(`
      INSERT INTO commits (user_id, repository, commit_hash, message, lines_added, lines_deleted)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      user.id,
      data.repository,
      data.commit_hash,
      data.message,
      data.lines_added,
      data.lines_deleted
    );
    
    return {
      id: result.lastInsertRowid as number,
      user_id: user.id,
      repository: data.repository,
      commit_hash: data.commit_hash,
      message: data.message,
      lines_added: data.lines_added,
      lines_deleted: data.lines_deleted,
      committed_at: new Date().toISOString()
    };
  }

  getCommits(email: string): Commit[] {
    const user = this.getUser(email);
    if (!user) return [];
    
    const stmt = this.db.prepare(`
      SELECT * FROM commits WHERE user_id = ? ORDER BY committed_at DESC
    `);
    return stmt.all(user.id) as Commit[];
  }

  // 徽章相关操作
  getAllBadges(): Badge[] {
    const stmt = this.db.prepare('SELECT * FROM badges ORDER BY id');
    return stmt.all() as Badge[];
  }

  getUserBadges(email: string): { badges: Badge[], userBadges: UserBadge[] } {
    const user = this.getUser(email);
    if (!user) return { badges: [], userBadges: [] };

    const badges = this.getAllBadges();
    const stmt = this.db.prepare('SELECT * FROM user_badges WHERE user_id = ?');
    const userBadges = stmt.all(user.id) as UserBadge[];

    return { badges, userBadges };
  }

  unlockBadge(email: string, badgeId: number): boolean {
    const user = this.getUser(email);
    if (!user) return false;

    try {
      const stmt = this.db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)');
      stmt.run(user.id, badgeId);
      return true;
    } catch (error) {
      // 徽章可能已经解锁
      return false;
    }
  }

  // 统计相关操作
  getUserStats(email: string): any {
    const user = this.getUser(email);
    if (!user) return null;

    const commits = this.getCommits(email);
    const { userBadges } = this.getUserBadges(email);

    const total_commits = commits.length;
    const total_lines_added = commits.reduce((sum, commit) => sum + commit.lines_added, 0);
    const total_lines_deleted = commits.reduce((sum, commit) => sum + commit.lines_deleted, 0);
    const repositories = [...new Set(commits.map(commit => commit.repository))];
    const badges_earned = userBadges.length;

    return {
      total_commits,
      total_lines_added,
      total_lines_deleted,
      repositories,
      badges_earned
    };
  }

  close() {
    this.db.close();
  }
}

// 导出单例实例
export const database = new CommitHeroDatabase();
