import * as vscode from 'vscode';
import { CommitHeroAPI } from '@commit-hero/api-client';

interface GitRepository {
  rootUri: vscode.Uri;
  state: {
    head?: {
      name?: string;
      commit?: string;
    };
  };
}

interface GitCommit {
  hash: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  parents: string[];
}

interface GitAPI {
  repositories: GitRepository[];
  onDidChangeState: vscode.Event<void>;
}

export class GitTracker {
  private api: CommitHeroAPI;
  private isTracking: boolean = false;
  private disposables: vscode.Disposable[] = [];
  private lastCommitHashes: Map<string, string> = new Map();
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('commitHero');
    const apiUrl = this.config.get<string>('apiUrl', 'http://localhost:3000');
    this.api = new CommitHeroAPI(apiUrl);
  }

  public startTracking(): void {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    console.log('开始追踪 Git 提交');

    // 获取 Git 扩展
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) {
      vscode.window.showWarningMessage('Git 扩展未安装或未启用');
      return;
    }

    const git = gitExtension.getAPI(1) as GitAPI;
    if (!git) {
      vscode.window.showWarningMessage('无法获取 Git API');
      return;
    }

    // 追踪现有仓库
    git.repositories.forEach(repo => {
      this.trackRepository(repo);
    });

    // 监听仓库状态变化
    const stateChangeDisposable = git.onDidChangeState(() => {
      git.repositories.forEach(repo => {
        this.trackRepository(repo);
      });
    });

    this.disposables.push(stateChangeDisposable);

    // 定期检查新提交
    const intervalDisposable = vscode.workspace.onDidSaveTextDocument(() => {
      // 当文件保存时，检查是否有新提交
      setTimeout(() => {
        this.checkForNewCommits();
      }, 1000);
    });

    this.disposables.push(intervalDisposable);

    vscode.window.showInformationMessage('Git 追踪已开始');
  }

  public stopTracking(): void {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;
    console.log('停止追踪 Git 提交');

    // 清理所有订阅
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
    this.lastCommitHashes.clear();

    vscode.window.showInformationMessage('Git 追踪已停止');
  }

  private trackRepository(repo: GitRepository): void {
    const repoPath = repo.rootUri.fsPath;
    const repoName = this.getRepositoryName(repoPath);

    // 获取当前 HEAD 提交
    if (repo.state.head?.commit) {
      const currentCommit = repo.state.head.commit;
      const lastCommit = this.lastCommitHashes.get(repoPath);

      if (lastCommit && lastCommit !== currentCommit) {
        // 检测到新提交
        this.handleNewCommit(repo, repoName, currentCommit);
      }

      this.lastCommitHashes.set(repoPath, currentCommit);
    }
  }

  private async handleNewCommit(repo: GitRepository, repoName: string, commitHash: string): Promise<void> {
    try {
      // 获取提交详情
      const commitDetails = await this.getCommitDetails(repo, commitHash);
      if (!commitDetails) {
        return;
      }

      // 获取用户邮箱
      const userEmail = this.config.get<string>('userEmail');
      if (!userEmail) {
        console.warn('用户邮箱未配置');
        return;
      }

      // 计算代码行数变化
      const linesChanged = await this.calculateLinesChanged(repo, commitHash);

      // 准备提交数据
      const commitData = {
        email: userEmail,
        repository: repoName,
        commit_hash: commitHash,
        message: commitDetails.message,
        lines_added: linesChanged.added,
        lines_deleted: linesChanged.deleted
      };

      // 发送到 API
      const response = await this.api.addCommit(commitData);
      
      if (response.success) {
        console.log('提交已记录:', commitData.message);
        
        // 显示通知
        vscode.window.showInformationMessage(
          `📝 提交已记录：${commitData.message}`,
          '查看统计'
        ).then(action => {
          if (action === '查看统计') {
            vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');
          }
        });

        // 检查是否有新成就
        if (response.data?.newBadges && response.data.newBadges.length > 0) {
          response.data.newBadges.forEach(badge => {
            vscode.window.showInformationMessage(
              `🎉 恭喜！你解锁了新成就：${badge.name}`,
              '查看详情'
            ).then(action => {
              if (action === '查看详情') {
                vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');
              }
            });
          });
        }
      } else {
        console.error('记录提交失败:', response.error);
      }

    } catch (error) {
      console.error('处理新提交时出错:', error);
    }
  }

  private async getCommitDetails(repo: GitRepository, commitHash: string): Promise<GitCommit | null> {
    try {
      // 使用 Git 命令获取提交详情
      const result = await vscode.workspace.fs.readFile(
        vscode.Uri.joinPath(repo.rootUri, '.git', 'objects', commitHash.substring(0, 2), commitHash.substring(2))
      );

      // 解析 Git 对象（简化版本）
      const content = Buffer.from(result).toString('utf8');
      const lines = content.split('\n');
      
      // 查找提交信息
      let message = '';
      let authorEmail = '';
      
      for (const line of lines) {
        if (line.startsWith('author ')) {
          const authorMatch = line.match(/author .* <(.+?)>/);
          if (authorMatch) {
            authorEmail = authorMatch[1];
          }
        } else if (line.startsWith('committer ')) {
          // 跳过 committer 行
        } else if (line === '') {
          // 空行后是提交消息
        } else if (message === '') {
          message = line;
          break;
        }
      }

      return {
        hash: commitHash,
        message: message || 'Unknown commit',
        authorEmail,
        parents: []
      };

    } catch (error) {
      console.error('获取提交详情失败:', error);
      return null;
    }
  }

  private async calculateLinesChanged(repo: GitRepository, commitHash: string): Promise<{ added: number; deleted: number }> {
    try {
      // 使用 Git 命令获取文件变化统计
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      const result = await execAsync(`git show --stat ${commitHash}`, {
        cwd: repo.rootUri.fsPath
      });

      // 解析统计信息
      const lines = result.stdout.split('\n');
      let added = 0;
      let deleted = 0;

      for (const line of lines) {
        const match = line.match(/(\d+) insertions?\(\+\), (\d+) deletions?\(-\)/);
        if (match) {
          added += parseInt(match[1]);
          deleted += parseInt(match[2]);
        }
      }

      return { added, deleted };

    } catch (error) {
      console.error('计算代码行数变化失败:', error);
      return { added: 0, deleted: 0 };
    }
  }

  private getRepositoryName(repoPath: string): string {
    // 从路径中提取仓库名称
    const pathParts = repoPath.split(/[\\/]/);
    return pathParts[pathParts.length - 1] || 'unknown-repo';
  }

  private async checkForNewCommits(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
      if (!gitExtension) {
        return;
      }

      const git = gitExtension.getAPI(1) as GitAPI;
      if (!git) {
        return;
      }

      git.repositories.forEach(repo => {
        this.trackRepository(repo);
      });

    } catch (error) {
      console.error('检查新提交时出错:', error);
    }
  }

  public getStatus(): boolean {
    return this.isTracking;
  }
}
