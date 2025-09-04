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
    const assetsDir = path.join(__dirname, '..', 'apps', 'vscode-extension', 'react-assets');
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

downloadReactAssets();
