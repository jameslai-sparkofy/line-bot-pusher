# LINE Bot 設定指南

## 🎉 恭喜！基本系統已經建立完成

你的 LINE Bot 系統已經成功啟動：
- ✅ 伺服器運行在 http://localhost:3000
- ✅ 資料庫已初始化
- ✅ LINE Bot 憑證已設定
- ✅ Webhook 端點：http://localhost:3000/webhook

## 📋 下一步設定

### 1. 安裝 ngrok（建立外部 URL）

**選項A：使用 snap 安裝**
```bash
sudo snap install ngrok
```

**選項B：手動下載安裝**
```bash
# 下載 ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### 2. 啟動 ngrok 隧道

```bash
# 在新的終端機中執行
ngrok http 3000
```

你會看到類似這樣的輸出：
```
ngrok                                                                    
                                                                         
Session Status                online                                     
Account                      your-account                                
Version                      3.x.x                                      
Region                       Asia Pacific (ap)                          
Latency                      -                                           
Web Interface                http://127.0.0.1:4040                     
Forwarding                   https://abc123.ngrok.io -> http://localhost:3000
```

**重要：複製 https://abc123.ngrok.io 這個 URL！**

### 3. 設定 LINE Developers Console

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 選擇你的 Channel (ID: 2007595676)
3. 前往 "Messaging API" 標籤
4. 找到 "Webhook settings"
5. 設定 Webhook URL：`https://your-ngrok-url.ngrok.io/webhook`
6. 啟用 "Use webhook"
7. 點擊 "Verify" 驗證連接

### 4. LINE Bot 基本設定

在 LINE Console 中確認以下設定：
- ✅ 關閉 "Auto-reply messages"
- ✅ 關閉 "Greeting messages" 
- ✅ 開啟 "Webhooks"
- ✅ 允許機器人加入群組

### 5. 測試機器人

1. **掃描 QR Code**：在 LINE Console 中找到機器人的 QR Code
2. **加入群組**：將機器人邀請到測試群組
3. **測試指令**：
   - 輸入 `help` 查看說明
   - 輸入 `info` 查看群組資訊
   - 輸入 `status` 查看機器人狀態

## 🔍 監控和測試

### 查看即時日誌
系統已在背景執行，你可以查看即時日誌：
```bash
# 查看應用程式日誌
tail -f logs/app.log

# 或在開發模式中查看 console 輸出
```

### 健康檢查
```bash
curl http://localhost:3000/health
```

### 測試 Webhook（ngrok 啟動後）
```bash
curl -X POST https://your-ngrok-url.ngrok.io/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[]}'
```

## 🚨 常見問題

### Q: Webhook 驗證失敗
- 檢查 ngrok 是否正常運行
- 確認 Webhook URL 格式正確（包含 /webhook）
- 檢查 Channel Secret 是否正確

### Q: 機器人沒有回應
- 檢查伺服器日誌是否有錯誤
- 確認 Channel Access Token 是否有效
- 檢查群組是否成功加入（查看資料庫）

### Q: ngrok 連線不穩定
- 免費版 ngrok 會定期重新分配 URL
- 考慮升級到付費版取得固定 URL
- 或部署到正式的雲端服務

## 📊 資料庫查詢

查看已加入的群組：
```bash
sqlite3 data/bot.sqlite "SELECT * FROM groups WHERE is_active = 1;"
```

## 🎯 下一階段開發

系統準備就緒後，我們將開發：
1. **API 金鑰管理系統**
2. **外部軟體推送 API**
3. **訊息模版系統**
4. **Web 管理後台**

---

**目前狀態：** 
- 🟢 伺服器運行中 (localhost:3000)
- 🟡 等待 ngrok 設定
- 🔴 等待 LINE Console Webhook 設定

完成設定後請回報，我們就可以進入下一階段！