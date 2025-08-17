interface CommitData {
  email: string;
  repository: string;
  commitHash: string;
  message: string;
  linesAdded?: number;
  linesDeleted?: number;
}

interface ApiResponse {
  success?: boolean;
  commits?: any[];
  badges?: any[];
  userBadges?: any[];
  error?: string;
}

export class CommitHeroAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async addCommit(data: CommitData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/commits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse;
      return result.success || false;
    } catch (error) {
      console.error('添加提交记录失败:', error);
      return false;
    }
  }

  async getCommits(email: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/commits?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse;
      return result.commits || [];
    } catch (error) {
      console.error('获取提交记录失败:', error);
      return [];
    }
  }

  async getBadges(email: string): Promise<{ badges: any[], userBadges: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/badges?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse;
      return {
        badges: result.badges || [],
        userBadges: result.userBadges || []
      };
    } catch (error) {
      console.error('获取徽章失败:', error);
      return { badges: [], userBadges: [] };
    }
  }

  async unlockBadge(email: string, badgeId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, badgeId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse;
      return result.success || false;
    } catch (error) {
      console.error('解锁徽章失败:', error);
      return false;
    }
  }
}
