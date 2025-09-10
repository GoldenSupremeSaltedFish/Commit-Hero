const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

/**
 * Figma 到 VSCode 扩展同步脚本
 * 
 * 功能：
 * 1. 将 figma-ALL 目录同步到 apps/vscode-extension/figma-frontend
 * 2. 自动处理依赖和资源
 * 3. 支持监听模式，实时同步
 * 4. 生成同步报告
 */

class FigmaSyncManager {
  constructor() {
    this.figmaSourcePath = path.join(__dirname, '..', 'figma-ALL');
    this.extensionTargetPath = path.join(__dirname, '..', 'apps', 'vscode-extension', 'figma-frontend');
    this.syncLog = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.syncLog.push(logEntry);
  }

  async ensureDirectories() {
    try {
      await fs.ensureDir(this.extensionTargetPath);
      this.log('目标目录已确保存在');
    } catch (error) {
      this.log(`创建目录失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async cleanTargetDirectory() {
    try {
      if (await fs.pathExists(this.extensionTargetPath)) {
        await fs.remove(this.extensionTargetPath);
        this.log('清理目标目录');
      }
    } catch (error) {
      this.log(`清理目录失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async copyFiles() {
    try {
      await fs.copy(this.figmaSourcePath, this.extensionTargetPath, {
        filter: (src, dest) => {
          // 排除不需要的文件
          const excludePatterns = [
            /\.DS_Store$/,
            /Thumbs\.db$/,
            /\.tmp$/,
            /\.log$/
          ];
          
          const shouldExclude = excludePatterns.some(pattern => pattern.test(src));
          if (shouldExclude) {
            this.log(`跳过文件: ${src}`, 'debug');
            return false;
          }
          
          return true;
        }
      });
      
      this.log(`文件复制完成: ${this.figmaSourcePath} -> ${this.extensionTargetPath}`);
    } catch (error) {
      this.log(`文件复制失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async processComponents() {
    try {
      const componentsPath = path.join(this.extensionTargetPath, 'components');
      if (!await fs.pathExists(componentsPath)) {
        this.log('components 目录不存在，跳过处理');
        return;
      }

      // 处理组件文件，移除外部依赖
      const componentFiles = await fs.readdir(componentsPath, { recursive: true });
      
      for (const file of componentFiles) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const filePath = path.join(componentsPath, file);
          await this.processComponentFile(filePath);
        }
      }
      
      this.log('组件处理完成');
    } catch (error) {
      this.log(`组件处理失败: ${error.message}`, 'error');
    }
  }

  async processComponentFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;

      // 移除外部依赖导入
      const externalDeps = [
        /import.*from\s+['"]lucide-react['"];?\s*\n/g,
        /import.*from\s+['"]motion\/react['"];?\s*\n/g,
        /import.*from\s+['"]@radix-ui\/react-.*['"];?\s*\n/g
      ];

      for (const pattern of externalDeps) {
        if (pattern.test(content)) {
          content = content.replace(pattern, '');
          modified = true;
        }
      }

      // 替换 motion 组件为普通 div
      content = content.replace(/<motion\.(\w+)/g, '<div');
      content = content.replace(/<\/motion\.(\w+)>/g, '</div>');

      // 移除 motion 属性
      content = content.replace(/\s+(initial|animate|transition|whileHover|whileTap)={[^}]*}/g, '');

      // 替换 Lucide 图标为简单图标
      content = this.replaceLucideIcons(content);

      if (modified) {
        await fs.writeFile(filePath, content);
        this.log(`处理组件文件: ${path.basename(filePath)}`);
      }
    } catch (error) {
      this.log(`处理组件文件失败 ${filePath}: ${error.message}`, 'error');
    }
  }

  replaceLucideIcons(content) {
    const iconReplacements = {
      'Settings': '<span className="text-gray-400">⚙️</span>',
      'Trophy': '<span className="text-yellow-400">🏆</span>',
      'Share': '<span className="text-blue-400">📤</span>',
      'Code': '<span className="text-green-400">💻</span>',
      'Bug': '<span className="text-red-400">🐛</span>',
      'Calendar': '<span className="text-purple-400">📅</span>',
      'X': '<span className="text-gray-400">✕</span>',
      'Plus': '<span className="text-green-400">+</span>'
    };

    for (const [icon, replacement] of Object.entries(iconReplacements)) {
      const pattern = new RegExp(`<${icon}[^>]*>`, 'g');
      content = content.replace(pattern, replacement);
    }

    return content;
  }

  async generateSyncReport() {
    const reportPath = path.join(__dirname, '..', 'sync-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      source: this.figmaSourcePath,
      target: this.extensionTargetPath,
      log: this.syncLog,
      stats: {
        totalFiles: await this.countFiles(this.extensionTargetPath),
        componentFiles: await this.countFiles(path.join(this.extensionTargetPath, 'components')),
        uiFiles: await this.countFiles(path.join(this.extensionTargetPath, 'components', 'ui'))
      }
    };

    await fs.writeJson(reportPath, report, { spaces: 2 });
    this.log(`同步报告已生成: ${reportPath}`);
  }

  async countFiles(dirPath) {
    try {
      if (!await fs.pathExists(dirPath)) return 0;
      const files = await fs.readdir(dirPath, { recursive: true });
      return files.filter(file => typeof file === 'string').length;
    } catch {
      return 0;
    }
  }

  async sync() {
    this.log('开始 Figma 到扩展同步...');
    
    try {
      await this.ensureDirectories();
      await this.cleanTargetDirectory();
      await this.copyFiles();
      await this.processComponents();
      await this.generateSyncReport();
      
      this.log('同步完成！', 'success');
    } catch (error) {
      this.log(`同步失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async watch() {
    this.log('启动监听模式...');
    
    // 先执行一次同步
    await this.sync();
    
    // 监听 figma-ALL 目录变化
    const watcher = chokidar.watch(this.figmaSourcePath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
      this.log(`文件变化: ${filePath}`);
      await this.sync();
    });

    watcher.on('add', async (filePath) => {
      this.log(`新文件: ${filePath}`);
      await this.sync();
    });

    watcher.on('unlink', async (filePath) => {
      this.log(`文件删除: ${filePath}`);
      await this.sync();
    });

    this.log('监听模式已启动，按 Ctrl+C 停止');
    
    // 优雅退出
    process.on('SIGINT', () => {
      this.log('停止监听模式');
      watcher.close();
      process.exit(0);
    });
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0] || 'sync';

const syncManager = new FigmaSyncManager();

switch (command) {
  case 'sync':
    syncManager.sync();
    break;
  case 'watch':
    syncManager.watch();
    break;
  case 'help':
    console.log(`
Figma 到 VSCode 扩展同步工具

用法:
  node scripts/sync-figma-to-extension.js [command]

命令:
  sync    执行一次同步 (默认)
  watch   启动监听模式，实时同步
  help    显示帮助信息

示例:
  npm run sync:figma           # 执行一次同步
  npm run sync:figma:watch     # 启动监听模式
    `);
    break;
  default:
    console.log(`未知命令: ${command}`);
    console.log('使用 "help" 查看可用命令');
    process.exit(1);
}
