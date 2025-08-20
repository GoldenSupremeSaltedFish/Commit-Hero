import * as vscode from 'vscode';
import { CommitHeroProvider } from './commitHeroProvider';
import { GitTracker } from './gitTracker';

let gitTracker: GitTracker;

export function activate(context: vscode.ExtensionContext) {
	console.log('Commit Hero 插件已激活');

	// 初始化 Git 追踪器
	gitTracker = new GitTracker();

	// 创建侧边栏提供者
	const commitHeroProvider = new CommitHeroProvider(context.extensionUri);
	
	// 注册侧边栏视图
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'commit-hero-view',
			commitHeroProvider
		)
	);

	// 注册命令
	let startTracking = vscode.commands.registerCommand('commit-hero.startTracking', () => {
		gitTracker.startTracking();
	});

	let stopTracking = vscode.commands.registerCommand('commit-hero.stopTracking', () => {
		gitTracker.stopTracking();
	});

	let openDashboard = vscode.commands.registerCommand('commit-hero.openDashboard', () => {
		// 打开 Web 仪表盘
		vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
	});

	let showAchievement = vscode.commands.registerCommand('commit-hero.showAchievement', () => {
		// 显示成就通知
		vscode.window.showInformationMessage('🎉 恭喜！你解锁了新成就！');
	});

	context.subscriptions.push(startTracking, stopTracking, openDashboard, showAchievement);

	// 检查配置并自动启动追踪
	const config = vscode.workspace.getConfiguration('commitHero');
	const autoTrack = config.get<boolean>('autoTrack', true);
	
	if (autoTrack) {
		// 延迟启动，确保 VSCode 完全加载
		setTimeout(() => {
			gitTracker.startTracking();
		}, 2000);
	}
}

export function deactivate() {
	if (gitTracker) {
		gitTracker.stopTracking();
	}
}
