import { CommitData, Badge, UserBadge } from '@commit-hero/core';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class CommitHeroAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * 添加提交记录
   */
  async addCommit(data: CommitData): Promise<ApiResponse<{ commit: any; newBadges: Badge[] }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/commits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json() as ApiResponse;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取用户提交记录
   */
  async getCommits(email: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/commits?email=${encodeURIComponent(email)}`);
      const result = await response.json() as ApiResponse;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取用户徽章
   */
  async getBadges(email: string): Promise<ApiResponse<{ badges: Badge[]; userBadges: UserBadge[] }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/badges?email=${encodeURIComponent(email)}`);
      const result = await response.json() as ApiResponse;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 解锁徽章
   */
  async unlockBadge(email: string, badgeId: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, badgeId }),
      });

      const result = await response.json() as ApiResponse;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats?email=${encodeURIComponent(email)}`);
      const result = await response.json() as ApiResponse;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default CommitHeroAPI;
