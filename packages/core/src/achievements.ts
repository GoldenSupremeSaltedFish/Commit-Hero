import { Badge, Commit, UserBadge, AchievementCheck } from './types';

export class AchievementEngine {
  /**
   * 检查用户是否解锁了新的徽章
   */
  static checkAchievements(
    commits: Commit[],
    badges: Badge[],
    userBadges: UserBadge[]
  ): AchievementCheck[] {
    const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    const results: AchievementCheck[] = [];

    for (const badge of badges) {
      const isUnlocked = unlockedBadgeIds.has(badge.id);
      const check = this.evaluateBadge(badge, commits, isUnlocked);
      results.push(check);
    }

    return results;
  }

  /**
   * 评估单个徽章的条件
   */
  private static evaluateBadge(
    badge: Badge,
    commits: Commit[],
    isUnlocked: boolean
  ): AchievementCheck {
    if (isUnlocked) {
      return { badge, unlocked: true };
    }

    const stats = this.calculateStats(commits);
    const unlocked = this.evaluateCriteria(badge.criteria, stats);

    return {
      badge,
      unlocked,
      progress: this.calculateProgress(badge.criteria, stats),
      max_progress: this.getMaxProgress(badge.criteria)
    };
  }

  /**
   * 计算用户统计信息
   */
  private static calculateStats(commits: Commit[]) {
    const total_commits = commits.length;
    const total_lines_added = commits.reduce((sum, commit) => sum + commit.lines_added, 0);
    const total_lines_deleted = commits.reduce((sum, commit) => sum + commit.lines_deleted, 0);
    const repositories = [...new Set(commits.map(commit => commit.repository))];

    return {
      commits: total_commits,
      lines_added: total_lines_added,
      lines_deleted: total_lines_deleted,
      repositories: repositories.length
    };
  }

  /**
   * 评估徽章条件
   */
  private static evaluateCriteria(criteria: string, stats: any): boolean {
    // 简单的条件解析器
    const conditions = criteria.split(' AND ');
    
    for (const condition of conditions) {
      if (!this.evaluateSingleCondition(condition.trim(), stats)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 评估单个条件
   */
  private static evaluateSingleCondition(condition: string, stats: any): boolean {
    // 支持格式: metric >= value, metric <= value, metric == value
    const match = condition.match(/(\w+)\s*(>=|<=|==)\s*(\d+)/);
    if (!match) return false;

    const [, metric, operator, value] = match;
    const statValue = stats[metric];
    const numValue = parseInt(value);

    switch (operator) {
      case '>=':
        return statValue >= numValue;
      case '<=':
        return statValue <= numValue;
      case '==':
        return statValue === numValue;
      default:
        return false;
    }
  }

  /**
   * 计算进度
   */
  private static calculateProgress(criteria: string, stats: any): number {
    const match = criteria.match(/(\w+)\s*(>=|<=|==)\s*(\d+)/);
    if (!match) return 0;

    const [, metric, operator, value] = match;
    const statValue = stats[metric];
    const maxValue = parseInt(value);

    if (operator === '>=') {
      return Math.min(100, (statValue / maxValue) * 100);
    }

    return 0;
  }

  /**
   * 获取最大进度值
   */
  private static getMaxProgress(criteria: string): number {
    const match = criteria.match(/(\w+)\s*(>=|<=|==)\s*(\d+)/);
    return match ? parseInt(match[3]) : 0;
  }

  /**
   * 获取新解锁的徽章
   */
  static getNewlyUnlocked(
    previousChecks: AchievementCheck[],
    currentChecks: AchievementCheck[]
  ): Badge[] {
    const newlyUnlocked: Badge[] = [];

    for (let i = 0; i < currentChecks.length; i++) {
      const previous = previousChecks[i];
      const current = currentChecks[i];

      if (!previous.unlocked && current.unlocked) {
        newlyUnlocked.push(current.badge);
      }
    }

    return newlyUnlocked;
  }
}
