import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'commit-hero.db');
const db = new Database(dbPath);

// 初始化数据库表
export function initializeDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 提交记录表
  db.exec(`
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

  // 徽章表
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon_url TEXT,
      criteria TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 用户徽章关联表
  db.exec(`
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
      name: '首次提交',
      description: '完成你的第一次代码提交',
      icon_url: '/badges/first-commit.png',
      criteria: JSON.stringify({ type: 'first_commit' })
    },
    {
      name: '连续提交',
      description: '连续7天都有代码提交',
      icon_url: '/badges/streak.png',
      criteria: JSON.stringify({ type: 'streak', days: 7 })
    },
    {
      name: '高产开发者',
      description: '单日提交超过10次',
      icon_url: '/badges/productive.png',
      criteria: JSON.stringify({ type: 'daily_commits', count: 10 })
    }
  ];

  const insertBadge = db.prepare(`
    INSERT OR IGNORE INTO badges (name, description, icon_url, criteria)
    VALUES (?, ?, ?, ?)
  `);

  defaultBadges.forEach(badge => {
    insertBadge.run(badge.name, badge.description, badge.icon_url, badge.criteria);
  });

  console.log('数据库初始化完成');
}

// 数据库操作函数
export const dbOperations = {
  // 用户操作
  createUser: (email: string) => {
    const stmt = db.prepare('INSERT INTO users (email) VALUES (?)');
    return stmt.run(email);
  },

  getUser: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // 提交操作
  addCommit: (userId: number, repository: string, commitHash: string, message: string, linesAdded: number, linesDeleted: number) => {
    const stmt = db.prepare(`
      INSERT INTO commits (user_id, repository, commit_hash, message, lines_added, lines_deleted)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, repository, commitHash, message, linesAdded, linesDeleted);
  },

  getCommitsByUser: (userId: number, limit = 50) => {
    const stmt = db.prepare(`
      SELECT * FROM commits 
      WHERE user_id = ? 
      ORDER BY committed_at DESC 
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  },

  // 徽章操作
  getBadges: () => {
    const stmt = db.prepare('SELECT * FROM badges');
    return stmt.all();
  },

  getUserBadges: (userId: number) => {
    const stmt = db.prepare(`
      SELECT b.*, ub.unlocked_at 
      FROM badges b
      INNER JOIN user_badges ub ON b.id = ub.badge_id
      WHERE ub.user_id = ?
    `);
    return stmt.all(userId);
  },

  unlockBadge: (userId: number, badgeId: number) => {
    const stmt = db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)');
    return stmt.run(userId, badgeId);
  }
};

// 初始化数据库
initializeDatabase();

export default db;
