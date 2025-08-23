# 🚀 部署指南

## GitHub 設定步驟

### 1. 建立 GitHub 儲存庫

1. 前往 GitHub 建立新儲存庫：`line-bot-pusher`
2. 不要初始化 README（因為我們已有代碼）
3. 複製儲存庫 URL

### 2. 推送代碼到 GitHub

```bash
# 在專案目錄執行
git remote add origin https://github.com/YOUR_USERNAME/line-bot-pusher.git
git push -u origin main
git push origin develop
```

### 3. 設定 GitHub Secrets

前往 GitHub 儲存庫 → Settings → Secrets and variables → Actions

**必要的 Secrets：**
```
CLOUDFLARE_API_TOKEN=WTm7PBcUyBHpyklgG1OLKpB1ww-DEWRGqISzrfkr
CLOUDFLARE_ACCOUNT_ID=你的Cloudflare帳戶ID
LINE_CHANNEL_ACCESS_TOKEN=6xjfTrjETtBA4195IgeiWjr6t6GaErPHk9eCNpVnoSiCUeDCFiuehAT0bz+rmNQBLFcVvNaoGyDeRJUdAJQ64fLNTn/rMiKPLJo1NTceBIAfap6bahOsvLiQPbiORrYomyegTYtskfghX/wdAqUagAdB04t89/1O/w1cDnyilFU=
LINE_CHANNEL_SECRET=3d1a1e897099fcdb1ed51435f23d306e
LINE_CHANNEL_ID=2007977300
API_SECRET_KEY=production-super-secret-key-2024
JWT_SECRET=production-jwt-secret-key-2024
```

## Cloudflare 設定步驟

### 1. 建立 Cloudflare Pages 專案

1. 登入 Cloudflare Dashboard
2. 前往 Pages → Create a project
3. 連接 GitHub 儲存庫：`line-bot-pusher`
4. 設定建置配置：
   - **Framework preset**: None
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist`

### 2. 環境變數設定

在 Cloudflare Pages 專案設定中加入：

**Production 環境變數：**
```
NODE_ENV=production
LINE_CHANNEL_ACCESS_TOKEN=6xjfTrjETtBA4195IgeiWjr6t6GaErPHk9eCNpVnoSiCUeDCFiuehAT0bz+rmNQBLFcVvNaoGyDeRJUdAJQ64fLNTn/rMiKPLJo1NTceBIAfap6bahOsvLiQPbiORrYomyegTYtskfghX/wdAqUagAdB04t89/1O/w1cDnyilFU=
LINE_CHANNEL_SECRET=3d1a1e897099fcdb1ed51435f23d306e
LINE_CHANNEL_ID=2007977300
API_SECRET_KEY=production-super-secret-key-2024
JWT_SECRET=production-jwt-secret-key-2024
```

### 3. 取得 Cloudflare 帳戶 ID

1. 在 Cloudflare Dashboard 右側找到帳戶 ID
2. 複製並加入到 GitHub Secrets

## 自動部署流程

### 分支策略
- **main** → 生產環境 (your-project.pages.dev)
- **develop** → 開發環境 (develop.your-project.pages.dev)

### 部署觸發
- 推送到 `main` 分支 → 自動部署生產環境
- 推送到 `develop` 分支 → 自動部署開發環境
- Pull Request → 預覽部署

## 部署後設定

### 1. 更新 LINE Webhook URL

部署完成後，更新 LINE Developers Console：
```
Webhook URL: https://your-project.pages.dev/webhook
```

### 2. 測試部署

1. 訪問管理後台：`https://your-project.pages.dev/admin/`
2. 測試 API：`https://your-project.pages.dev/api/`
3. 健康檢查：`https://your-project.pages.dev/health`

### 3. 驗證功能

- 將機器人重新加入群組
- 檢查歡迎訊息
- 測試推送功能

## 故障排除

### GitHub Actions 失敗
- 檢查 GitHub Secrets 是否正確設定
- 查看 Actions 日誌找出錯誤

### Cloudflare 部署失敗
- 確認環境變數設定正確
- 檢查建置日誌

### LINE Bot 無法連接
- 確認 Webhook URL 設定正確
- 驗證 LINE 憑證是否有效

---

**下一步：執行上述步驟完成部署！** 🚀