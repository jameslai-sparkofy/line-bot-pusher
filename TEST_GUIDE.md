# LINE Bot API 測試指南

## 🎉 系統已完成！

你的 LINE Bot 推送系統已經完全建立完成，包含：

### ✅ 已完成功能
- **LINE Bot 基礎系統** - Webhook 處理、群組管理
- **API 推送系統** - 支援單群組和批量推送
- **訊息模版系統** - 3個預設模版、變數替換
- **API 認證系統** - API Key 管理、權限控制
- **資料庫系統** - 群組、模版、推送記錄管理

### 🔑 測試用 API Key
```
bot_7a40148f443b4e31be9d5769a5058283
```

---

## 📋 測試步驟

### 1. 測試 LINE Bot 基本功能

**首先，將機器人加入一個測試群組：**
1. 在 LINE Console 掃描機器人 QR Code
2. 將機器人邀請到群組
3. 機器人會自動發送歡迎訊息並記錄群組資訊

**測試基本指令：**
- 在群組中輸入 `help` - 查看說明
- 輸入 `info` - 查看群組資訊
- 輸入 `status` - 查看機器人狀態

### 2. 測試 API 系統

#### A. 查看 API 資訊
```bash
curl -X GET https://522630496c19.ngrok-free.app/api \
  -H "ngrok-skip-browser-warning: true"
```

#### B. 查看群組列表
```bash
curl -X GET https://522630496c19.ngrok-free.app/api/groups \
  -H "X-API-Key: bot_7a40148f443b4e31be9d5769a5058283" \
  -H "ngrok-skip-browser-warning: true"
```

#### C. 查看可用模版
```bash
curl -X GET https://522630496c19.ngrok-free.app/api/templates \
  -H "X-API-Key: bot_7a40148f443b4e31be9d5769a5058283" \
  -H "ngrok-skip-browser-warning: true"
```

### 3. 測試訊息推送

**先確保機器人已加入群組，然後取得群組代碼（類似 GROUP_12345678）**

#### A. 推送簡單文字訊息
```bash
curl -X POST https://522630496c19.ngrok-free.app/api/send \
  -H "X-API-Key: bot_7a40148f443b4e31be9d5769a5058283" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "message": "🧪 這是一個測試訊息！\n\n系統運作正常 ✅",
    "target_groups": ["YOUR_GROUP_ALIAS_HERE"]
  }'
```

#### B. 使用工地進度模版推送
```bash
curl -X POST https://522630496c19.ngrok-free.app/api/send/template \
  -H "X-API-Key: bot_7a40148f443b4e31be9d5769a5058283" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "template_id": "construction_progress",
    "variables": {
      "project_name": "台北101大樓整修工程",
      "progress_percentage": 75,
      "current_phase": "基礎工程"
    },
    "target_groups": ["YOUR_GROUP_ALIAS_HERE"]
  }'
```

#### C. 使用系統警報模版推送
```bash
curl -X POST https://522630496c19.ngrok-free.app/api/send/template \
  -H "X-API-Key: bot_7a40148f443b4e31be9d5769a5058283" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "template_id": "system_alert",
    "variables": {
      "alert_level": "HIGH",
      "system_name": "Web服務器",
      "alert_message": "CPU使用率超過90%"
    },
    "target_groups": ["YOUR_GROUP_ALIAS_HERE"]
  }'
```

---

## 🔧 開發者整合範例

### Node.js 範例
```javascript
const axios = require('axios');

const botApi = axios.create({
  baseURL: 'https://522630496c19.ngrok-free.app/api',
  headers: {
    'X-API-Key': 'bot_7a40148f443b4e31be9d5769a5058283',
    'ngrok-skip-browser-warning': 'true'
  }
});

// 推送工地進度
async function pushConstructionProgress(groupAlias, projectData) {
  try {
    const response = await botApi.post('/send/template', {
      template_id: 'construction_progress',
      variables: projectData,
      target_groups: [groupAlias]
    });
    
    console.log('推送成功:', response.data);
  } catch (error) {
    console.error('推送失敗:', error.response?.data || error.message);
  }
}

// 使用範例
pushConstructionProgress('GROUP_12345678', {
  project_name: '台北101大樓整修工程',
  progress_percentage: 85,
  current_phase: '裝修工程'
});
```

### Python 範例
```python
import requests

API_BASE = 'https://522630496c19.ngrok-free.app/api'
API_KEY = 'bot_7a40148f443b4e31be9d5769a5058283'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
}

# 推送系統警報
def push_system_alert(group_alias, alert_data):
    payload = {
        'template_id': 'system_alert',
        'variables': alert_data,
        'target_groups': [group_alias]
    }
    
    response = requests.post(f'{API_BASE}/send/template', 
                           json=payload, headers=headers)
    
    if response.status_code == 200:
        print('推送成功:', response.json())
    else:
        print('推送失敗:', response.json())

# 使用範例
push_system_alert('GROUP_12345678', {
    'alert_level': 'CRITICAL',
    'system_name': '資料庫服務器',
    'alert_message': '連線中斷'
})
```

---

## 📊 監控和管理

### 查看推送記錄
```bash
sqlite3 data/bot.sqlite "SELECT * FROM push_logs ORDER BY sent_at DESC LIMIT 10;"
```

### 查看群組狀態
```bash
sqlite3 data/bot.sqlite "SELECT group_alias, group_name, is_active, joined_at FROM groups;"
```

### 查看 API Key 使用情況
```bash
sqlite3 data/bot.sqlite "SELECT key_name, department, last_used_at FROM api_keys WHERE is_active = 1;"
```

---

## 🎯 下一步擴展

現在系統已經完整可用，你可以考慮：

1. **建立更多模版** - 根據各部門需求
2. **Web 管理後台** - 圖形化管理介面
3. **更多 API Key** - 為不同部門建立專用金鑰
4. **正式部署** - 部署到正式服務器
5. **監控儀表板** - 推送統計和狀態監控

系統已經準備好給公司各部門使用了！🚀