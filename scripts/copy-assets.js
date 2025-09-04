const fs = require('fs-extra');
const path = require('path');

async function copyAssets() {
  try {
    // 复制构建产物
    const buildSourceDir = path.join(__dirname, '..', 'build');
    const buildTargetDir = path.join(__dirname, '..', 'apps', 'vscode-extension', 'webview-assets');
    
    // 确保目标目录存在
    await fs.ensureDir(buildTargetDir);
    
    // 复制构建产物
    await fs.copy(buildSourceDir, buildTargetDir, {
      overwrite: true,
      filter: (src) => {
        return !src.includes('node_modules') && !src.includes('.git');
      }
    });
    
    console.log('✅ 构建产物已复制到 VSCode 扩展目录');
    console.log(`构建产物: ${buildSourceDir} → ${buildTargetDir}`);
    
    // 列出复制的文件
    const buildFiles = await fs.readdir(buildTargetDir);
    console.log('构建产物文件:', buildFiles);
    
  } catch (error) {
    console.error('❌ 复制文件失败:', error);
    process.exit(1);
  }
}

copyAssets();
