import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  files: Array<{
    path: string;
    status: 'A' | 'M' | 'D' | 'R';
    linesAdded: number;
    linesDeleted: number;
  }>;
}

export interface GitStats {
  totalCommits: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  totalFilesChanged: number;
  streakDays: number;
  lastCommitDate: string;
  commitsByDay: { [date: string]: number };
  commitsByHour: { [hour: string]: number };
  topFiles: Array<{ path: string; commits: number }>;
  languages: { [lang: string]: number };
}

export class LocalGitAPI {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Check if the current workspace is a Git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: this.workspaceRoot });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current Git user configuration
   */
  async getGitUser(): Promise<{ name: string; email: string } | null> {
    try {
      const [nameResult, emailResult] = await Promise.all([
        execAsync('git config user.name', { cwd: this.workspaceRoot }),
        execAsync('git config user.email', { cwd: this.workspaceRoot }),
      ]);

      return {
        name: nameResult.stdout.trim(),
        email: emailResult.stdout.trim(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Get recent commits from the repository
   */
  async getRecentCommits(limit: number = 50, authorEmail?: string): Promise<GitCommit[]> {
    try {
      let command = `git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --numstat`;

      if (authorEmail) {
        command += ` --author="${authorEmail}"`;
      }

      command += ` -${limit}`;

      const { stdout } = await execAsync(command, { cwd: this.workspaceRoot });

      return this.parseGitLog(stdout);
    } catch (error) {
      console.error('Failed to get recent commits:', error);
      return [];
    }
  }

  /**
   * Get commits since a specific date
   */
  async getCommitsSince(date: Date, authorEmail?: string): Promise<GitCommit[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      let command = `git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --numstat --since="${dateStr}"`;

      if (authorEmail) {
        command += ` --author="${authorEmail}"`;
      }

      const { stdout } = await execAsync(command, { cwd: this.workspaceRoot });

      return this.parseGitLog(stdout);
    } catch (error) {
      console.error('Failed to get commits since date:', error);
      return [];
    }
  }

  /**
   * Get detailed statistics about the repository
   */
  async getRepositoryStats(authorEmail?: string): Promise<GitStats> {
    try {
      const commits = await this.getRecentCommits(1000, authorEmail);

      const stats: GitStats = {
        totalCommits: commits.length,
        totalLinesAdded: commits.reduce((sum, commit) => sum + commit.linesAdded, 0),
        totalLinesDeleted: commits.reduce((sum, commit) => sum + commit.linesDeleted, 0),
        totalFilesChanged: commits.reduce((sum, commit) => sum + commit.filesChanged, 0),
        streakDays: 0,
        lastCommitDate: '',
        commitsByDay: {},
        commitsByHour: {},
        topFiles: [],
        languages: {},
      };

      if (commits.length > 0) {
        // Calculate streak
        stats.streakDays = this.calculateStreak(commits);
        stats.lastCommitDate = commits[0].date;

        // Group commits by day and hour
        commits.forEach(commit => {
          const date = new Date(commit.date);
          const dayKey = date.toISOString().split('T')[0];
          const hourKey = date.getHours().toString();

          stats.commitsByDay[dayKey] = (stats.commitsByDay[dayKey] || 0) + 1;
          stats.commitsByHour[hourKey] = (stats.commitsByHour[hourKey] || 0) + 1;
        });

        // Get top files
        const fileStats: { [path: string]: number } = {};
        commits.forEach(commit => {
          commit.files.forEach(file => {
            fileStats[file.path] = (fileStats[file.path] || 0) + 1;
          });
        });

        stats.topFiles = Object.entries(fileStats)
          .map(([path, commits]) => ({ path, commits }))
          .sort((a, b) => b.commits - a.commits)
          .slice(0, 10);

        // Get language statistics
        stats.languages = this.analyzeLanguages(commits);
      }

      return stats;
    } catch (error) {
      console.error('Failed to get repository stats:', error);
      return {
        totalCommits: 0,
        totalLinesAdded: 0,
        totalLinesDeleted: 0,
        totalFilesChanged: 0,
        streakDays: 0,
        lastCommitDate: '',
        commitsByDay: {},
        commitsByHour: {},
        topFiles: [],
        languages: {},
      };
    }
  }

  /**
   * Parse Git log output into structured commit data
   */
  private parseGitLog(output: string): GitCommit[] {
    const commits: GitCommit[] = [];
    const lines = output.split('\n');

    let currentCommit: Partial<GitCommit> | null = null;
    let inStats = false;

    for (const line of lines) {
      if (line.includes('|')) {
        // This is a commit header line
        if (currentCommit) {
          commits.push(currentCommit as GitCommit);
        }

        const [hash, author, email, date, ...messageParts] = line.split('|');
        currentCommit = {
          hash: hash.trim(),
          author: author.trim(),
          email: email.trim(),
          date: date.trim(),
          message: messageParts.join('|').trim(),
          filesChanged: 0,
          linesAdded: 0,
          linesDeleted: 0,
          files: [],
        };
        inStats = true;
      } else if (inStats && line.trim() && currentCommit) {
        // This is a file stat line
        const parts = line.split('\t');
        if (parts.length >= 3) {
          const [added, deleted, path] = parts;
          const linesAdded = parseInt(added) || 0;
          const linesDeleted = parseInt(deleted) || 0;

          currentCommit.linesAdded += linesAdded;
          currentCommit.linesDeleted += linesDeleted;
          currentCommit.filesChanged++;

          currentCommit.files.push({
            path: path.trim(),
            status: this.getFileStatus(path),
            linesAdded,
            linesDeleted,
          });
        }
      }
    }

    if (currentCommit) {
      commits.push(currentCommit as GitCommit);
    }

    return commits;
  }

  /**
   * Determine file status from path
   */
  private getFileStatus(path: string): 'A' | 'M' | 'D' | 'R' {
    if (path.includes('=>')) return 'R'; // Renamed
    if (path.startsWith('A')) return 'A'; // Added
    if (path.startsWith('D')) return 'D'; // Deleted
    return 'M'; // Modified
  }

  /**
   * Calculate commit streak
   */
  private calculateStreak(commits: GitCommit[]): number {
    if (commits.length === 0) return 0;

    const commitDates = commits
      .map(commit => new Date(commit.date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    for (const dateStr of commitDates) {
      const commitDate = new Date(dateStr);
      const diffTime = Math.abs(currentDate.getTime() - commitDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = commitDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Analyze programming languages from file extensions
   */
  private analyzeLanguages(commits: GitCommit[]): { [lang: string]: number } {
    const languages: { [lang: string]: number } = {};
    const extensions: { [ext: string]: string } = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React',
      '.tsx': 'React',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'Sass',
      '.less': 'Less',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.sql': 'SQL',
      '.sh': 'Shell',
      '.bash': 'Bash',
      '.ps1': 'PowerShell',
      '.dockerfile': 'Docker',
      '.dockerignore': 'Docker',
    };

    commits.forEach(commit => {
      commit.files.forEach(file => {
        const ext = this.getFileExtension(file.path);
        const lang = extensions[ext] || 'Other';
        languages[lang] = (languages[lang] || 0) + 1;
      });
    });

    return languages;
  }

  /**
   * Get file extension from path
   */
  private getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    if (lastDot === -1) return '';
    return path.substring(lastDot).toLowerCase();
  }

  /**
   * Watch for new commits using Git hooks or file system watching
   */
  async watchForNewCommits(callback: (commit: GitCommit) => void): Promise<void> {
    // This would be implemented using Git hooks or file system watching
    // For now, we'll rely on the GitTracker's file system watcher
    console.log('Git commit watching is handled by GitTracker');
  }
}
