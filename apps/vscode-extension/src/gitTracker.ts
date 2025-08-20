import * as vscode from 'vscode';
import { CommitHeroAPI } from './api';

// 定义 Git 相关的类型
interface GitRepository {
    rootUri: vscode.Uri;
    onDidCommit: (callback: (commit: GitCommit) => void) => vscode.Disposable;
}

interface GitCommit {
    hash: string;
    message: string;
}

interface GitAPI {
    repositories: GitRepository[];
    onDidOpenRepository: (callback: (repo: GitRepository) => void) => vscode.Disposable;
}

export class GitTracker {
    private api: CommitHeroAPI;
    private isTracking: boolean = false;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.api = new CommitHeroAPI();
    }

    public startTracking() {
        if (this.isTracking) {
            return;
        }

        this.isTracking = true;
        console.log('开始追踪 Git 提交...');

        // 监听 Git 状态变化
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (gitExtension && gitExtension.isActive) {
            const git = gitExtension.exports.getAPI(1) as GitAPI;
            
            // 监听仓库变化
            git.repositories.forEach((repo: GitRepository) => {
                this.trackRepository(repo);
            });

            // 监听新仓库
            git.onDidOpenRepository((repo: GitRepository) => {
                this.trackRepository(repo);
            });
        }

        vscode.window.showInformationMessage('✅ Git 提交追踪已启动');
    }

    public stopTracking() {
        if (!this.isTracking) {
            return;
        }

        this.isTracking = false;
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];

        console.log('停止追踪 Git 提交');
        vscode.window.showInformationMessage('⏹️ Git 提交追踪已停止');
    }

    private trackRepository(repo: GitRepository) {
        // 监听提交事件
        const commitListener = repo.onDidCommit((commit: GitCommit) => {
            this.handleCommit(repo, commit);
        });

        this.disposables.push(commitListener);
    }

    private async handleCommit(repo: GitRepository, commit: GitCommit) {
        try {
            const config = vscode.workspace.getConfiguration('commitHero');
            const userEmail = config.get<string>('userEmail');
            const apiUrl = config.get<string>('apiUrl');

            if (!userEmail) {
                vscode.window.showWarningMessage('请先配置用户邮箱地址');
                return;
            }

            // 获取提交详情
            const commitData = {
                email: userEmail,
                repository: repo.rootUri.fsPath.split(/[\\/]/).pop() || 'unknown',
                commitHash: commit.hash,
                message: commit.message,
                linesAdded: 0, // 这里可以从 Git 日志中获取
                linesDeleted: 0
            };

            // 发送到本地 API
            const success = await this.api.addCommit(commitData);
            
            if (success) {
                console.log('提交记录已保存:', commitData);
                
                // 检查是否解锁新成就
                await this.checkAchievements(userEmail);
            } else {
                console.error('保存提交记录失败');
            }

        } catch (error) {
            console.error('处理提交时出错:', error);
        }
    }

    private async checkAchievements(userEmail: string) {
        try {
            // 获取用户徽章
            const { badges, userBadges } = await this.api.getBadges(userEmail);
            
            // 检查是否有新解锁的徽章
            const unlockedBadgeIds = userBadges.map((b: any) => b.id);
            const allBadgeIds = badges.map((b: any) => b.id);
            
            // 这里可以添加成就解锁逻辑
            // 例如：首次提交、连续提交等
            
            // 模拟成就解锁
            if (Math.random() > 0.8) {
                vscode.commands.executeCommand('commit-hero.showAchievement');
            }

        } catch (error) {
            console.error('检查成就时出错:', error);
        }
    }

    public getStatus(): boolean {
        return this.isTracking;
    }
}
