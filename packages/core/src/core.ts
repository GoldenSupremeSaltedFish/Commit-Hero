import { CommitData, Badge, UserBadge } from './types';
import { CommitHeroDatabase } from './database';
import { AchievementEngine } from './achievements';

export class CommitHeroCore {
  private database: CommitHeroDatabase;

  constructor(database?: CommitHeroDatabase) {
    this.database = database || new CommitHeroDatabase();
  }

  /**
   * 添加新的提交记录
   */
  async addCommit(data: CommitData) {
    const commit = this.database.addCommit(data);
    
    // 检查是否解锁新徽章
    const newBadges = await this.checkForNewAchievements(data.email);
    
    return {
      commit,
      newBadges
    };
  }

  /**
   * 获取用户统计信息
   */
  getUserStats(email: string) {
    return this.database.getUserStats(email);
  }

  /**
   * 获取用户徽章
   */
  getUserBadges(email: string) {
    return this.database.getUserBadges(email);
  }

  /**
   * 获取所有徽章
   */
  getAllBadges() {
    return this.database.getAllBadges();
  }

  /**
   * 检查新成就
   */
  private async checkForNewAchievements(email: string): Promise<Badge[]> {
    const commits = this.database.getCommits(email);
    const { badges, userBadges } = this.database.getUserBadges(email);
    
    const achievementChecks = AchievementEngine.checkAchievements(
      commits,
      badges,
      userBadges
    );

    const newBadges: Badge[] = [];
    
    for (const check of achievementChecks) {
      if (check.unlocked && !userBadges.some(ub => ub.badge_id === check.badge.id)) {
        // 解锁新徽章
        const unlocked = this.database.unlockBadge(email, check.badge.id);
        if (unlocked) {
          newBadges.push(check.badge);
        }
      }
    }

    return newBadges;
  }

  /**
   * 关闭数据库连接
   */
  close() {
    this.database.close();
  }
}

export default CommitHeroCore;
