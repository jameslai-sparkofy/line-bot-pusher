# LINE Bot 推送系統

公司內部使用的 LINE Bot 推送系統，支援多群組訊息推送和模版管理。

## 快速開始

### 1. 設定 LINE Bot

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立新的 Messaging API Channel
3. 取得以下憑證：
   - Channel Access Token
   - Channel Secret

### 2. 環境設定

```bash
# 複製環境變數範例檔
cp .env.example .env

# 編輯 .env 檔案，填入 LINE Bot 憑證
nano .env
```

### 3. 安裝與啟動

```bash
# 安裝相依套件
npm install

# 初始化資料庫 (第一次執行)
npm run db:init

# 開發模式啟動
npm run dev

# 正式環境啟動
npm start
```

### 4. 設定 Webhook URL

**開發環境：**
```bash
# 使用 ngrok 建立外部 URL
ngrok http 3000

# 複製 ngrok 提供的 https URL，例如：
# https://abc123.ngrok.io/webhook
```

**正式環境：**
```
https://your-domain.com/webhook
```

在 LINE Developers Console 中設定 Webhook URL。

## 系統架構

```
外部軟體 → REST API → 訊息處理器 → LINE Bot API → LINE群組
```

## API 端點

- `GET /health` - 健康檢查
- `POST /webhook` - LINE Bot Webhook
- `GET /api` - API 資訊

## 資料庫結構

- `groups` - 群組資訊
- `api_keys` - API 金鑰管理
- `push_logs` - 推送記錄
- `message_templates` - 訊息模版

## 使用流程

1. **機器人加入群組**
   - 群組管理員邀請機器人
   - 系統自動記錄群組資訊
   - 生成群組代碼

2. **外部軟體推送訊息**
   - 取得 API Key
   - 呼叫推送 API
   - 指定目標群組

3. **訊息模版使用**
   - 建立訊息模版
   - 定義變數欄位
   - 使用模版推送

## 開發模式指令

機器人支援以下指令（在群組中輸入）：

- `help` 或 `幫助` - 顯示說明
- `info` 或 `資訊` - 顯示群組資訊  
- `status` 或 `狀態` - 顯示機器人狀態

## 目錄結構

```
src/
├── config/          # 設定檔
├── controllers/     # 控制器
├── models/         # 資料模型
├── services/       # 業務邏輯
├── middleware/     # 中間件
└── utils/          # 工具函數
```

## 注意事項

1. 請妥善保管 LINE Bot 憑證
2. 正式環境請使用 HTTPS
3. 定期備份資料庫
4. 監控推送頻率避免超限

## 下一步開發

- [ ] API 金鑰管理系統
- [ ] 訊息模版編輯器
- [ ] Web 管理後台
- [ ] 批量推送功能
- [ ] 推送統計報表