// Cloudflare Pages Function for admin interface
export async function onRequest(context) {
  const { request, env } = context;
  
  const adminHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LINE Bot 推送系統 - 管理後台</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .section h3 {
            color: #333;
            margin-bottom: 15px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        .form-control {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        .form-control:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea.form-control {
            resize: vertical;
            min-height: 100px;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn-success {
            background: linear-gradient(135deg, #00c851 0%, #007e33 100%);
        }
        .groups-grid {
            display: grid;
            gap: 15px;
            margin-top: 15px;
        }
        .group-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .group-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .group-info {
            color: #666;
            font-size: 12px;
        }
        .status {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: none;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 LINE Bot 推送系統</h1>
            <p>管理後台 - Cloudflare Pages</p>
        </div>
        
        <div class="content">
            <div id="status" class="status"></div>
            
            <div class="section">
                <h3>📊 群組管理</h3>
                <button class="btn" onclick="loadGroups()">🔄 重新載入群組</button>
                <div id="groups" class="groups-grid"></div>
            </div>
            
            <div class="section">
                <h3>📤 推送訊息測試</h3>
                <div class="form-group">
                    <label for="testGroupId">群組 ID/代號/名稱：</label>
                    <input type="text" id="testGroupId" class="form-control" placeholder="例如：GROUP_12345678">
                </div>
                <div class="form-group">
                    <label for="testMessage">訊息內容：</label>
                    <textarea id="testMessage" class="form-control" placeholder="輸入要發送的訊息..."></textarea>
                </div>
                <div class="form-group">
                    <label for="testApiKey">API Key：</label>
                    <input type="password" id="testApiKey" class="form-control" placeholder="輸入 API Key">
                </div>
                <button class="btn btn-success" onclick="sendTestMessage()">📤 發送測試訊息</button>
            </div>
        </div>
    </div>

    <script>
        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + type;
            status.style.display = 'block';
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }

        async function loadGroups() {
            try {
                const response = await fetch('/api/groups');
                const data = await response.json();
                
                if (data.groups) {
                    renderGroups(data.groups);
                    showStatus('群組載入成功！', 'success');
                } else {
                    showStatus('載入群組失敗', 'error');
                }
            } catch (error) {
                console.error('Load groups error:', error);
                showStatus('載入群組時發生錯誤', 'error');
            }
        }

        function renderGroups(groups) {
            const container = document.getElementById('groups');
            if (groups.length === 0) {
                container.innerHTML = '<p>目前沒有活躍的群組</p>';
                return;
            }
            
            container.innerHTML = groups.map(group => 
                '<div class="group-card">' +
                '<div class="group-name">' + (group.group_name || '未知群組') + '</div>' +
                '<div class="group-info">代號: ' + (group.group_alias || 'N/A') + '</div>' +
                '<div class="group-info">部門: ' + (group.department || '未設定') + '</div>' +
                '<div class="group-info">加入時間: ' + new Date(group.joined_at).toLocaleString('zh-TW') + '</div>' +
                '</div>'
            ).join('');
        }

        async function sendTestMessage() {
            const groupId = document.getElementById('testGroupId').value.trim();
            const message = document.getElementById('testMessage').value.trim();
            const apiKey = document.getElementById('testApiKey').value.trim();

            if (!groupId || !message || !apiKey) {
                showStatus('請填寫所有必要欄位', 'error');
                return;
            }

            try {
                const response = await fetch('/api/push', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    },
                    body: JSON.stringify({
                        groupId: groupId,
                        message: message
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showStatus('訊息發送成功！群組: ' + (data.groupName || groupId), 'success');
                    document.getElementById('testMessage').value = '';
                } else {
                    showStatus('發送失敗: ' + (data.error || '未知錯誤'), 'error');
                }
            } catch (error) {
                console.error('Send message error:', error);
                showStatus('發送訊息時發生錯誤', 'error');
            }
        }

        // 頁面載入時自動載入群組
        window.onload = function() {
            loadGroups();
        };
    </script>
</body>
</html>`;

  return new Response(adminHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}