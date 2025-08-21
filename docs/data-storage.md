# 📁 Commit Hero 数据存储说明

## 🏠 完全本地化存储

Commit Hero 采用**完全本地化**的数据存储方案，所有数据都保存在用户本地，确保数据安全和隐私保护。

## 📂 数据存储位置

### 默认存储位置
- **Windows**: `C:\Users\{用户名}\.commit-hero\commit-hero.db`
- **macOS**: `/Users/{用户名}/.commit-hero/commit-hero.db`
- **Linux**: `/home/{用户名}/.commit-hero/commit-hero.db`

### 自定义存储位置
可以通过配置指定自定义数据目录：
```typescript
const database = new CommitHeroDatabase('/path/to/custom/data/dir');
```

## 🗄️ 数据库结构

### SQLite 数据库文件
- **文件名**: `commit-hero.db`
- **格式**: SQLite 3.x
- **大小**: 通常 < 10MB（取决于数据量）

### 数据表结构

#### 1. 用户表 (users)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. 提交记录表 (commits)
```sql
CREATE TABLE commits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  repository TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  message TEXT,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  committed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

#### 3. 成就徽章表 (badges)
```sql
CREATE TABLE badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. 用户徽章表 (user_badges)
```sql
CREATE TABLE user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  badge_id INTEGER,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (badge_id) REFERENCES badges (id),
  UNIQUE(user_id, badge_id)
);
```

## ⚡ 性能优化

### SQLite 配置优化
```typescript
// 启用 WAL 模式提高并发性能
db.pragma('journal_mode = WAL');

// 优化同步模式
db.pragma('synchronous = NORMAL');

// 增加缓存大小
db.pragma('cache_size = 10000');

// 使用内存临时存储
db.pragma('temp_store = MEMORY');
```

### 数据量估算
- **1000 次提交**: ~1MB
- **10000 次提交**: ~5MB
- **100000 次提交**: ~20MB

## 🔄 数据管理功能

### 1. 数据导出
- **格式**: JSON
- **内容**: 所有用户数据、提交记录、成就徽章
- **用途**: 备份、迁移、数据分析

### 2. 数据导入
- **格式**: JSON
- **功能**: 恢复备份、数据迁移
- **注意**: 会覆盖现有数据

### 3. 数据库备份
- **格式**: SQLite 数据库文件
- **功能**: 完整数据库备份
- **用途**: 灾难恢复

### 4. 数据统计
- 用户数量
- 提交记录数
- 成就徽章数
- 数据库文件大小
- 存储位置信息

## 🛡️ 数据安全

### 隐私保护
- ✅ 数据完全存储在本地
- ✅ 不上传到任何云端服务
- ✅ 不收集个人信息
- ✅ 用户完全控制数据

### 数据完整性
- ✅ SQLite 事务支持
- ✅ 外键约束
- ✅ 数据验证
- ✅ 自动备份建议

## 📊 数据使用场景

### 开发场景
1. **个人开发**: 追踪个人代码提交
2. **团队协作**: 每个开发者独立存储
3. **项目分析**: 导出数据进行统计分析
4. **成就系统**: 本地成就解锁和展示

### 数据迁移
1. **设备更换**: 导出数据到新设备
2. **系统重装**: 备份数据后恢复
3. **多设备同步**: 手动同步数据文件

## 🔧 技术实现

### 数据库操作
```typescript
// 初始化数据库
const database = new CommitHeroDatabase();

// 添加提交记录
const commit = database.addCommit({
  email: 'user@example.com',
  repository: 'my-project',
  commit_hash: 'abc123',
  message: 'feat: add new feature',
  lines_added: 100,
  lines_deleted: 10
});

// 获取用户统计
const stats = database.getUserStats('user@example.com');

// 导出数据
const exportData = database.exportData();

// 导入数据
const success = database.importData(importData);
```

### 文件操作
```typescript
// 获取数据库路径
const dbPath = database.getDatabasePath();

// 获取数据目录
const dataDir = database.getDataDir();

// 备份数据库
const success = database.backup('/path/to/backup.db');

// 获取统计信息
const stats = database.getDatabaseStats();
```

## 📋 最佳实践

### 1. 定期备份
- 建议每周备份一次数据
- 使用 VSCode 插件的备份功能
- 将备份文件存储到安全位置

### 2. 数据清理
- 定期检查数据库大小
- 删除不需要的测试数据
- 优化数据库性能

### 3. 迁移策略
- 导出 JSON 格式便于跨平台迁移
- 使用数据库备份进行完整迁移
- 验证迁移后的数据完整性

## 🚀 轻量化特性

### 资源占用
- **内存**: < 50MB
- **磁盘**: < 10MB（典型使用）
- **CPU**: 极低占用
- **网络**: 无网络依赖

### 启动速度
- **冷启动**: < 1秒
- **热启动**: < 100ms
- **数据加载**: < 50ms

### 扩展性
- 支持大量提交记录
- 自动优化查询性能
- 模块化设计便于扩展

---

**总结**: Commit Hero 采用完全本地化的 SQLite 存储方案，确保数据安全、隐私保护和轻量化运行。所有数据都保存在用户本地，无需网络连接，提供完整的数据管理功能。
