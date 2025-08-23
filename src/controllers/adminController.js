const express = require('express');
const path = require('path');
const MessageService = require('../services/messageService');
const logger = require('../utils/logger');

const router = express.Router();

// 管理後台首頁
router.get('/', (req, res) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LINE Bot 管理後台</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

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
            background: linear-gradient(135deg, #00c851 0%, #00a845 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .main-content {
            padding: 40px;
        }

        .section {
            background: #f8f9ff;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #00c851;
        }

        .section h2 {
            color: #333;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }

        .section h2::before {
            content: "🔧";
            margin-right: 10px;
            font-size: 1.5rem;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }

        .form-control {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e6ed;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .form-control:focus {
            outline: none;
            border-color: #00c851;
        }

        textarea.form-control {
            min-height: 100px;
            resize: vertical;
        }

        .btn {
            background: linear-gradient(135deg, #00c851 0%, #00a845 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,200,81,0.4);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%);
        }

        .btn-secondary:hover {
            box-shadow: 0 5px 15px rgba(66,133,244,0.4);
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }

        .status-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            text-align: center;
        }

        .status-card h3 {
            color: #00c851;
            margin-bottom: 10px;
        }

        .status-value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }

        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }

        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #00c851;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .main-content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 LINE Bot 管理後台</h1>
            <p>公司內部推送系統管理介面</p>
        </div>

        <div class="main-content">
            <!-- 系統狀態 -->
            <div class="section">
                <h2>系統狀態</h2>
                <div class="grid">
                    <div class="status-card">
                        <h3>活躍群組</h3>
                        <div class="status-value" id="groupCount">載入中...</div>
                    </div>
                    <div class="status-card">
                        <h3>可用模版</h3>
                        <div class="status-value" id="templateCount">載入中...</div>
                    </div>
                </div>
            </div>

            <div class="grid">
                <!-- 群組管理 -->
                <div class="section">
                    <h2>群組列表</h2>
                    <div id="groupList">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>載入群組列表中...</p>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="loadGroups()">🔄 重新整理</button>
                </div>

                <!-- 快速推送測試 -->
                <div class="section">
                    <h2>快速推送測試</h2>
                    
                    <div class="alert alert-success" id="successAlert"></div>
                    <div class="alert alert-error" id="errorAlert"></div>

                    <form id="quickPushForm">
                        <div class="form-group">
                            <label>選擇群組</label>
                            <select class="form-control" id="targetGroup" required>
                                <option value="">請選擇群組...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>訊息內容</label>
                            <textarea class="form-control" id="messageContent" 
                                placeholder="輸入要推送的訊息內容..." required>🧪 管理後台測試訊息

這是從管理介面發送的測試訊息！

✅ 系統運作正常
⏰ 發送時間：剛剛</textarea>
                        </div>

                        <button type="submit" class="btn">📤 發送訊息</button>
                    </form>

                    <div class="loading" id="pushLoading">
                        <div class="spinner"></div>
                        <p>推送訊息中...</p>
                    </div>
                </div>
            </div>

            <!-- 模版推送測試 -->
            <div class="section">
                <h2>模版推送測試</h2>
                
                <form id="templatePushForm">
                    <div class="grid">
                        <div class="form-group">
                            <label>選擇模版</label>
                            <select class="form-control" id="templateSelect" required onchange="loadTemplateVariables()">
                                <option value="">請選擇模版...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>目標群組</label>
                            <select class="form-control" id="templateTargetGroup" required>
                                <option value="">請選擇群組...</option>
                            </select>
                        </div>
                    </div>

                    <div id="templateVariables"></div>

                    <button type="submit" class="btn">🚀 使用模版推送</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        const API_KEY = 'bot_7a40148f443b4e31be9d5769a5058283';
        const API_BASE = '/api';

        // API 請求輔助函數
        async function apiRequest(endpoint, options = {}) {
            console.log('API Request:', API_BASE + endpoint);
            
            const response = await fetch(API_BASE + endpoint, {
                ...options,
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    ...options.headers
                }
            });

            console.log('API Response:', response.status, response.statusText);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('API Error:', error);
                throw new Error(error.message || 'API request failed');
            }

            const result = await response.json();
            console.log('API Result:', result);
            return result;
        }

        // 載入群組列表
        async function loadGroups() {
            try {
                document.querySelector('#groupList .loading').style.display = 'block';
                
                const data = await apiRequest('/groups');
                const groupList = document.getElementById('groupList');
                
                if (data.groups.length === 0) {
                    groupList.innerHTML = '<p>目前沒有活躍的群組。請先將機器人加入群組。</p>';
                } else {
                    const groupsHtml = data.groups.map(group => \`
                        <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #00c851;">
                            <strong>\${group.group_alias}</strong>
                            <br><small>群組名稱: \${group.group_name || '未知'}</small>
                            <br><small>加入時間: \${new Date(group.joined_at).toLocaleString('zh-TW')}</small>
                        </div>
                    \`).join('');
                    
                    groupList.innerHTML = groupsHtml + '<button class="btn btn-secondary" onclick="loadGroups()">🔄 重新整理</button>';
                }

                // 更新群組下拉選單
                updateGroupSelects(data.groups);
                document.getElementById('groupCount').textContent = data.groups.length;

            } catch (error) {
                document.getElementById('groupList').innerHTML = \`<p style="color: red;">載入失敗: \${error.message}</p>\`;
            }
        }

        // 更新群組下拉選單
        function updateGroupSelects(groups) {
            const selects = ['targetGroup', 'templateTargetGroup'];
            
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                select.innerHTML = '<option value="">請選擇群組...</option>';
                
                groups.forEach(group => {
                    select.innerHTML += \`<option value="\${group.group_alias}">\${group.group_alias} - \${group.group_name || '未知群組'}</option>\`;
                });
            });
        }

        // 載入模版列表
        async function loadTemplates() {
            try {
                const data = await apiRequest('/templates');
                
                const select = document.getElementById('templateSelect');
                select.innerHTML = '<option value="">請選擇模版...</option>';
                
                data.templates.forEach(template => {
                    select.innerHTML += \`<option value="\${template.template_id}">\${template.template_name} - \${template.category}</option>\`;
                });

                document.getElementById('templateCount').textContent = data.templates.length;
                window.templateData = data.templates;

            } catch (error) {
                console.error('載入模版失敗:', error);
            }
        }

        // 載入模版變數輸入欄位
        function loadTemplateVariables() {
            const templateId = document.getElementById('templateSelect').value;
            const variablesDiv = document.getElementById('templateVariables');
            
            if (!templateId || !window.templateData) {
                variablesDiv.innerHTML = '';
                return;
            }

            const template = window.templateData.find(t => t.template_id === templateId);
            if (!template || !template.variables) {
                variablesDiv.innerHTML = '';
                return;
            }

            const variablesHtml = template.variables.map(variable => \`
                <div class="form-group">
                    <label>\${variable.description} \${variable.required ? '<span style="color: red;">*</span>' : ''}</label>
                    <input type="\${variable.type === 'number' ? 'number' : 'text'}" 
                           class="form-control" 
                           name="var_\${variable.name}"
                           placeholder="\${variable.example}"
                           \${variable.required ? 'required' : ''}>
                </div>
            \`).join('');

            variablesDiv.innerHTML = variablesHtml;
        }

        // 顯示提示訊息
        function showAlert(type, message) {
            const alert = document.getElementById(type === 'success' ? 'successAlert' : 'errorAlert');
            alert.textContent = message;
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }

        // 快速推送表單提交
        document.getElementById('quickPushForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const targetGroup = document.getElementById('targetGroup').value;
            const message = document.getElementById('messageContent').value;
            
            if (!targetGroup || !message) {
                showAlert('error', '請填寫所有必填欄位');
                return;
            }

            try {
                document.getElementById('pushLoading').style.display = 'block';
                
                const result = await apiRequest('/send', {
                    method: 'POST',
                    body: JSON.stringify({
                        message: message,
                        target_groups: [targetGroup]
                    })
                });

                if (result.success && result.success_count > 0) {
                    showAlert('success', '訊息推送成功！');
                } else {
                    showAlert('error', '推送失敗，請檢查群組狀態');
                }

            } catch (error) {
                showAlert('error', '推送失敗: ' + error.message);
            } finally {
                document.getElementById('pushLoading').style.display = 'none';
            }
        });

        // 模版推送表單提交
        document.getElementById('templatePushForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const templateId = document.getElementById('templateSelect').value;
            const targetGroup = document.getElementById('templateTargetGroup').value;
            
            if (!templateId || !targetGroup) {
                showAlert('error', '請選擇模版和目標群組');
                return;
            }

            // 收集變數
            const variables = {};
            const variableInputs = document.querySelectorAll('#templateVariables input');
            variableInputs.forEach(input => {
                const varName = input.name.replace('var_', '');
                variables[varName] = input.value;
            });

            try {
                const result = await apiRequest('/send/template', {
                    method: 'POST',
                    body: JSON.stringify({
                        template_id: templateId,
                        variables: variables,
                        target_groups: [targetGroup]
                    })
                });

                if (result.success && result.success_count > 0) {
                    showAlert('success', '模版訊息推送成功！');
                } else {
                    showAlert('error', '推送失敗，請檢查群組狀態');
                }

            } catch (error) {
                showAlert('error', '推送失敗: ' + error.message);
            }
        });

        // 頁面載入時初始化
        window.addEventListener('load', () => {
            loadGroups();
            loadTemplates();
        });
    </script>
</body>
</html>
  `;

  res.send(htmlContent);
});

module.exports = router;