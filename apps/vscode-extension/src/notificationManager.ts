import * as vscode from 'vscode';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'commit' | 'streak' | 'lines' | 'files';
}

export class NotificationManager {
  private notificationsEnabled: boolean = true;
  private webviewProvider?: any;

  public setNotificationsEnabled(enabled: boolean): void {
    this.notificationsEnabled = enabled;
  }

  public setWebviewProvider(provider: any): void {
    this.webviewProvider = provider;
  }

  public showAchievement(achievement: Achievement): void {
    if (!this.notificationsEnabled) {
      return;
    }

    // 显示成就通知
    vscode.window
      .showInformationMessage(
        `${achievement.icon} 恭喜！你解锁了新成就：${achievement.name}`,
        '查看详情',
        '忽略'
      )
      .then(async action => {
        if (action === '查看详情') {
          // 可以打开成就详情页面或侧边栏
          await vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');
        }
      });

    // 发送成就通知到 webview
    if (this.webviewProvider) {
      this.webviewProvider.showAchievementNotification(achievement);
    }

    // 显示更详细的成就信息
    this.showAchievementDetails(achievement);
  }

  private showAchievementDetails(achievement: Achievement): void {
    const categoryEmojis = {
      commit: '📝',
      streak: '🔥',
      lines: '📊',
      files: '📁',
    };

    const message = `
${achievement.icon} **${achievement.name}** ${categoryEmojis[achievement.category]}

${achievement.description}

继续努力，解锁更多成就！
    `.trim();

    vscode.window.showInformationMessage(message);
  }

  public showCommitNotification(commitData: any): void {
    if (!this.notificationsEnabled) {
      return;
    }

    const message = `📝 提交已记录：${commitData.message}`;
    vscode.window.showInformationMessage(message, '查看统计', '忽略').then(async action => {
      if (action === '查看统计') {
        await vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');
      }
    });
  }

  public showError(message: string): void {
    vscode.window.showErrorMessage(`Commit Hero 错误：${message}`);
  }

  public showWarning(message: string): void {
    vscode.window.showWarningMessage(`Commit Hero 警告：${message}`);
  }

  public showInfo(message: string): void {
    vscode.window.showInformationMessage(`Commit Hero：${message}`);
  }
}
