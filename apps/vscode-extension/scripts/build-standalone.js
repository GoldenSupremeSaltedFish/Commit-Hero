const fs = require('fs-extra');
const path = require('path');
const https = require('https');

async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    const request = https.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const newUrl = response.headers.location;
        console.log(`重定向到: ${newUrl}`);
        file.close();
        fs.unlink(filePath, () => {}); // 删除不完整的文件
        downloadFile(newUrl, filePath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // 删除不完整的文件
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    // 设置超时
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('下载超时'));
    });
  });
}

async function downloadReactAssets() {
  try {
    // 创建资源目录
    const assetsDir = path.join(__dirname, '..', 'react-assets');
    await fs.ensureDir(assetsDir);
    
    // 需要下载的资源列表 - 使用直接下载链接
    const assets = [
      {
        url: 'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
        filename: 'react.production.min.js'
      },
      {
        url: 'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
        filename: 'react-dom.production.min.js'
      },
      {
        url: 'https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.0/babel.min.js',
        filename: 'babel.min.js'
      },
      {
        url: 'https://cdn.jsdelivr.net/npm/lucide-react@0.487.0/dist/umd/lucide-react.js',
        filename: 'lucide-react.js'
      },
      {
        url: 'https://cdn.jsdelivr.net/npm/motion@12.23.12/dist/motion.umd.js',
        filename: 'motion.js'
      }
    ];
    
    console.log('开始下载 React 资源...');
    
    // 下载所有资源
    for (const asset of assets) {
      const filePath = path.join(assetsDir, asset.filename);
      console.log(`下载 ${asset.filename}...`);
      
      try {
        await downloadFile(asset.url, filePath);
        console.log(`✅ ${asset.filename} 下载完成`);
      } catch (error) {
        console.error(`❌ ${asset.filename} 下载失败:`, error.message);
        // 继续下载其他文件
      }
    }
    
    // 列出下载的文件
    const files = await fs.readdir(assetsDir);
    console.log('下载的资源文件:', files);
    console.log(`资源目录: ${assetsDir}`);
    
  } catch (error) {
    console.error('下载 React 资源失败:', error);
    process.exit(1);
  }
}

async function buildStandalone() {
  console.log('🚀 开始构建独立的 VSCode 扩展...');
  
  try {
    // 1. 下载 React 资源
    console.log('\n📦 步骤 1: 下载 React 资源');
    await downloadReactAssets();
    
    // 2. 编译 TypeScript
    console.log('\n🔨 步骤 2: 编译 TypeScript');
    const { execSync } = require('child_process');
    execSync('npm run compile', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    
    console.log('\n✅ 独立扩展构建完成！');
    console.log('\n📁 扩展目录结构:');
    console.log('├── out/                    # 编译后的 JavaScript 文件');
    console.log('├── figma-frontend/         # Figma 前端源码');
    console.log('├── react-assets/           # React 运行时资源');
    console.log('├── webview-assets/         # Webview 资源');
    console.log('├── package.json            # 扩展配置');
    console.log('└── README.md               # 扩展说明');
    
    console.log('\n🎯 现在您可以:');
    console.log('1. 在 VSCode 中按 F5 调试扩展');
    console.log('2. 使用 "vsce package" 打包扩展');
    console.log('3. 独立分发这个扩展目录');
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

buildStandalone();
