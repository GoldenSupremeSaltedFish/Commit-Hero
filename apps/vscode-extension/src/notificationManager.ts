import * as vscode from 'vscode';

export interface Achievement {
  name: string;
  description: string;
  icon_url: string;
}

export class NotificationManager {
  private notificationsEnabled: boolean = true;

  public setNotificationsEnabled(enabled: boolean): void {
    this.notificationsEnabled = enabled;
  }

  public showAchievement(achievement: Achievement): void {
    if (!this.notificationsEnabled) {
      return;
    }

    // 显示成就通知
    vscode.window.showInformationMessage(
      `🎉 恭喜！你解锁了新成就：${achievement.name}`,
      '查看详情',
      '忽略'
    ).then(async (action) => {
      if (action === '查看详情') {
        // 可以打开成就详情页面或侧边栏
        await vscode.commands.executeCommand('workbench.view.extension.commit-hero-view');
      }
    });

    // 显示更详细的成就信息
    this.showAchievementDetails(achievement);
  }

  private showAchievementDetails(achievement: Achievement): void {
    const message = `
🎯 **${achievement.name}**

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
    vscode.window.showInformationMessage(message, '查看统计', '忽略')
      .then(async (action) => {
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
