import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { User, Commit, Badge, UserBadge, CommitData } from './types';

export class CommitHeroDatabase {
  private db: Database.Database;
  private dataDir: string;
  private dbPath: string;

  constructor(dataDir?: string) {
    // 优先使用用户指定的数据目录，否则使用默认位置
    this.dataDir = dataDir || this.getDefaultDataDir();
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.dbPath = path.join(this.dataDir, 'commit-hero.db');
    this.db = new Database(this.dbPath);
    
    // 启用 WAL 模式以提高性能
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 10000');
    this.db.pragma('temp_store = MEMORY');
    
    this.initializeDatabase();
  }

  /**
   * 获取默认数据目录
   * 优先使用用户主目录下的 .commit-hero 文件夹
   */
  private getDefaultDataDir(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();
    return path.join(homeDir, '.commit-hero');
  }

  /**
   * 获取数据库文件路径
   */
  public getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * 获取数据目录路径
   */
  public getDataDir(): string {
    return this.dataDir;
  }

  /**
   * 导出所有数据为 JSON 格式
   */
  public exportData(): any {
    const users = this.db.prepare('SELECT * FROM users').all();
    const commits = this.db.prepare('SELECT * FROM commits').all();
    const badges = this.db.prepare('SELECT * FROM badges').all();
    const userBadges = this.db.prepare('SELECT * FROM user_badges').all();

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        users,
        commits,
        badges,
        userBadges
      }
    };
  }

  /**
   * 导入数据（会清空现有数据）
   */
  public importData(data: any): boolean {
    try {
      // 开始事务
      this.db.exec('BEGIN TRANSACTION');

      // 清空现有数据
      this.db.exec('DELETE FROM user_badges');
      this.db.exec('DELETE FROM commits');
      this.db.exec('DELETE FROM users');
      this.db.exec('DELETE FROM badges');

      // 重置自增ID
      this.db.exec('DELETE FROM sqlite_sequence');

      // 导入数据
      if (data.data.users) {
        const insertUser = this.db.prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)');
        data.data.users.forEach((user: User) => {
          insertUser.run(user.id, user.email, user.created_at);
        });
      }

      if (data.data.badges) {
        const insertBadge = this.db.prepare('INSERT INTO badges (id, name, description, icon_url, criteria, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        data.data.badges.forEach((badge: Badge) => {
          insertBadge.run(badge.id, badge.name, badge.description, badge.icon_url, badge.criteria, badge.created_at);
        });
      }

      if (data.data.commits) {
        const insertCommit = this.db.prepare('INSERT INTO commits (id, user_id, repository, commit_hash, message, lines_added, lines_deleted, committed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        data.data.commits.forEach((commit: Commit) => {
          insertCommit.run(commit.id, commit.user_id, commit.repository, commit.commit_hash, commit.message, commit.lines_added, commit.lines_deleted, commit.committed_at);
        });
      }

      if (data.data.userBadges) {
        const insertUserBadge = this.db.prepare('INSERT INTO user_badges (id, user_id, badge_id, unlocked_at) VALUES (?, ?, ?, ?)');
        data.data.userBadges.forEach((userBadge: UserBadge) => {
          insertUserBadge.run(userBadge.id, userBadge.user_id, userBadge.badge_id, userBadge.unlocked_at);
        });
      }

      // 提交事务
      this.db.exec('COMMIT');
      return true;
    } catch (error) {
      // 回滚事务
      this.db.exec('ROLLBACK');
      console.error('导入数据失败:', error);
      return false;
    }
  }

  /**
   * 备份数据库
   */
  public backup(backupPath: string): boolean {
    try {
      const backupDb = new Database(backupPath);
      this.db.backup(backupDb);
      backupDb.close();
      return true;
    } catch (error) {
      console.error('备份数据库失败:', error);
      return false;
    }
  }

  /**
   * 获取数据库统计信息
   */
  public getDatabaseStats(): any {
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const commitCount = this.db.prepare('SELECT COUNT(*) as count FROM commits').get().count;
    const badgeCount = this.db.prepare('SELECT COUNT(*) as count FROM badges').get().count;
    const userBadgeCount = this.db.prepare('SELECT COUNT(*) as count FROM user_badges').get().count;

    // 获取数据库文件大小
    const stats = fs.statSync(this.dbPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    return {
      userCount,
      commitCount,
      badgeCount,
      userBadgeCount,
      fileSizeMB: fileSizeInMB,
      databasePath: this.dbPath
    };
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

    console.log('数据库初始化完成，数据存储位置:', this.dbPath);
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
