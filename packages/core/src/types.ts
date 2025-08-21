// 用户相关类型
export interface User {
  id: number;
  email: string;
  created_at: string;
}

// 提交相关类型
export interface Commit {
  id: number;
  user_id: number;
  repository: string;
  commit_hash: string;
  message: string;
  lines_added: number;
  lines_deleted: number;
  committed_at: string;
}

export interface CommitData {
  email: string;
  repository: string;
  commit_hash: string;
  message: string;
  lines_added: number;
  lines_deleted: number;
}

// 徽章相关类型
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  criteria: string;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  unlocked_at: string;
}

// 统计相关类型
export interface UserStats {
  total_commits: number;
  total_lines_added: number;
  total_lines_deleted: number;
  repositories: string[];
  badges_earned: number;
}

// 成就检查结果
export interface AchievementCheck {
  badge: Badge;
  unlocked: boolean;
  progress?: number;
  max_progress?: number;
}
