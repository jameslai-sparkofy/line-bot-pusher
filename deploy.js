// 簡單的部署腳本 - 建立 Pages 需要的檔案結構
const fs = require('fs');
const path = require('path');

const deployDir = 'deploy';

// 建立部署目錄
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// 複製必要檔案
const filesToCopy = [
  '.env.production'
];

const dirsToCopy = [
  'functions',
  'migrations'
];

// 複製檔案
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(deployDir, file));
    console.log(`✅ Copied ${file}`);
  }
});

// 複製目錄
dirsToCopy.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.cpSync(dir, path.join(deployDir, dir), { recursive: true });
    console.log(`✅ Copied ${dir}/`);
  }
});

// 建立簡單的 index.html 
const indexHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LINE Bot 推送系統</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #00c851 0%, #00a845 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 LINE Bot 推送系統</h1>
        <p>公司內部 LINE Bot 推送系統已部署到 Cloudflare Pages</p>
        <a href="/admin/" class="btn">📊 管理後台</a>
        <a href="/api/" class="btn">🔗 API 端點</a>
        <a href="/health" class="btn">❤️ 健康檢查</a>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(deployDir, 'index.html'), indexHtml);
console.log('✅ Created index.html');

// 建立 _redirects 檔案用於 Pages 路由
const redirects = `
/admin/* /functions/admin 200
/api/* /functions/api 200
/webhook /functions/webhook 200
/health /functions/health 200
`;

fs.writeFileSync(path.join(deployDir, '_redirects'), redirects.trim());
console.log('✅ Created _redirects');

// 建立簡單的 package.json 避免依賴問題
const minimalPackageJson = {
  "name": "line-bot-pusher",
  "version": "1.0.0",
  "description": "LINE Bot Push System for Cloudflare Pages",
  "type": "module",
  "scripts": {},
  "dependencies": {}
};

fs.writeFileSync(path.join(deployDir, 'package.json'), JSON.stringify(minimalPackageJson, null, 2));
console.log('✅ Created minimal package.json');

console.log('\n🚀 Deploy directory ready!');
console.log(`📁 Files in ${deployDir}:`);
console.log(fs.readdirSync(deployDir).map(f => `  - ${f}`).join('\n'));