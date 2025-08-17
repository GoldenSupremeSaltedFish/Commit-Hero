import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Commit Hero 插件已激活');

	let startTracking = vscode.commands.registerCommand('commit-hero.startTracking', () => {
		vscode.window.showInformationMessage('开始追踪开发效率');
	});

	let stopTracking = vscode.commands.registerCommand('commit-hero.stopTracking', () => {
		vscode.window.showInformationMessage('停止追踪开发效率');
	});

	context.subscriptions.push(startTracking);
	context.subscriptions.push(stopTracking);
}

export function deactivate() {}
