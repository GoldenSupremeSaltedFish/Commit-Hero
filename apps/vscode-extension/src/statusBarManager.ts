import * as vscode from 'vscode';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private isInitialized: boolean = false;

  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.name = 'Commit Hero Status';
    this.statusBarItem.tooltip = 'Commit Hero 追踪状态';
    this.statusBarItem.command = 'commit-hero.startTracking';
    
    this.updateStatus(false);
    this.statusBarItem.show();
    
    this.isInitialized = true;
  }

  public updateStatus(isTracking: boolean): void {
    if (!this.isInitialized) {
      return;
    }

    if (isTracking) {
      this.statusBarItem.text = '$(trophy) Commit Hero';
      this.statusBarItem.tooltip = 'Commit Hero 正在追踪中 - 点击停止';
      this.statusBarItem.command = 'commit-hero.stopTracking';
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    } else {
      this.statusBarItem.text = '$(trophy) Commit Hero';
      this.statusBarItem.tooltip = 'Commit Hero 未追踪 - 点击开始';
      this.statusBarItem.command = 'commit-hero.startTracking';
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  public showMessage(message: string, timeout: number = 3000): void {
    if (!this.isInitialized) {
      return;
    }

    const originalText = this.statusBarItem.text;
    this.statusBarItem.text = `$(trophy) ${message}`;
    
    setTimeout(() => {
      if (this.isInitialized) {
        this.statusBarItem.text = originalText;
      }
    }, timeout);
  }

  public dispose(): void {
    if (this.statusBarItem) {
      this.statusBarItem.dispose();
    }
    this.isInitialized = false;
  }
}
