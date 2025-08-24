// Cloudflare Pages Function for User & Group Management
export async function onRequest(context) {
  const { request, env } = context;
  
  const managementHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LINE Bot 用戶群組管理系統</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
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
        .nav-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
        }
        .nav-tab {
            flex: 1;
            padding: 15px 20px;
            background: #f8f9fa;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        .nav-tab.active {
            background: white;
            color: #667eea;
            border-bottom: 3px solid #667eea;
        }
        .nav-tab:hover {
            background: #e9ecef;
        }
        .content {
            padding: 30px;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h3 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .table th,
        .table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        .table tr:hover {
            background: #f8f9fa;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn-small {
            padding: 4px 8px;
            font-size: 11px;
        }
        .btn-danger {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
        .btn-success {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
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
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        .form-control:focus {
            outline: none;
            border-color: #667eea;
        }
        .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
            background-color: white;
            margin: 15% auto;
            padding: 20px;
            border-radius: 10px;
            width: 80%;
            max-width: 500px;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover {
            color: black;
        }
        .message-history {
            max-height: 300px;
            overflow-y: auto;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        .message-item {
            background: white;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .message-time {
            font-size: 11px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 LINE Bot 用戶群組管理系統</h1>
            <p>用戶管理 | 群組管理 | 訊息記錄</p>
        </div>
        
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('users')">👥 用戶管理</button>
            <button class="nav-tab" onclick="showTab('groups')">👨‍👩‍👧‍👦 群組管理</button>
            <button class="nav-tab" onclick="showTab('messages')">💬 訊息記錄</button>
            <button class="nav-tab" onclick="showTab('events')">📊 事件日誌</button>
            <button class="nav-tab" onclick="showTab('templates')">📝 模板管理</button>
            <button class="nav-tab" onclick="showTab('quota')">📈 用量監控</button>
        </div>
        
        <div class="content">
            <!-- 用戶管理 -->
            <div id="users-tab" class="tab-content active">
                <div class="section">
                    <h3>用戶管理</h3>
                    <button class="btn" onclick="loadUsers()">🔄 重新載入</button>
                    <table class="table" style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>頭像</th>
                                <th>用戶 ID</th>
                                <th>顯示名稱</th>
                                <th>備註名稱</th>
                                <th>狀態訊息</th>
                                <th>好友狀態</th>
                                <th>加入時間</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="users-table">
                            <!-- 動態載入 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 群組管理 -->
            <div id="groups-tab" class="tab-content">
                <div class="section">
                    <h3>群組管理</h3>
                    <button class="btn" onclick="loadGroups()">🔄 重新載入</button>
                    <table class="table" style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>頭像</th>
                                <th>群組 ID</th>
                                <th>群組名稱</th>
                                <th>群組代號</th>
                                <th>備註名稱</th>
                                <th>部門</th>
                                <th>狀態</th>
                                <th>加入時間</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="groups-table">
                            <!-- 動態載入 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 訊息記錄 -->
            <div id="messages-tab" class="tab-content">
                <div class="section">
                    <h3>推送訊息記錄</h3>
                    <button class="btn" onclick="loadMessages()">🔄 重新載入</button>
                    <table class="table" style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>時間</th>
                                <th>目標</th>
                                <th>訊息內容</th>
                                <th>狀態</th>
                                <th>API Key</th>
                                <th>錯誤訊息</th>
                            </tr>
                        </thead>
                        <tbody id="messages-table">
                            <!-- 動態載入 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 事件日誌 -->
            <div id="events-tab" class="tab-content">
                <div class="section">
                    <h3>Webhook 事件日誌</h3>
                    <button class="btn" onclick="loadEvents()">🔄 重新載入</button>
                    <table class="table" style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>時間</th>
                                <th>事件類型</th>
                                <th>來源類型</th>
                                <th>來源 ID</th>
                                <th>用戶 ID</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="events-table">
                            <!-- 動態載入 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 模板管理 -->
            <div id="templates-tab" class="tab-content">
                <div class="section">
                    <h3>Flex Message 模板管理</h3>
                    <button class="btn" onclick="loadFlexTemplates()">🔄 重新載入</button>
                    <button class="btn btn-success" onclick="window.open('/flex-editor', '_blank')" style="margin-left: 10px;">➕ 新增模板</button>
                    <table class="table" style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>模板名稱</th>
                                <th>類型</th>
                                <th>類別</th>
                                <th>使用次數</th>
                                <th>建立時間</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="flex-templates-table">
                            <!-- 動態載入 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 用量監控 -->
            <div id="quota-tab" class="tab-content">
                <div class="section">
                    <h3>📈 LINE API 用量監控</h3>
                    <button class="btn" onclick="loadQuota()">🔄 重新整理</button>
                    
                    <div style="margin-top: 30px;">
                        <div id="quota-info" style="display: none;">
                            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                                <div style="flex: 1; background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="color: #666; margin-bottom: 10px;">📊 方案類型</h4>
                                    <div id="plan-type" style="font-size: 18px; font-weight: bold; color: #333;"></div>
                                </div>
                                <div style="flex: 1; background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="color: #666; margin-bottom: 10px;">📈 總額度</h4>
                                    <div id="total-quota" style="font-size: 18px; font-weight: bold; color: #333;"></div>
                                </div>
                                <div style="flex: 1; background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="color: #666; margin-bottom: 10px;">✅ 已使用</h4>
                                    <div id="used-quota" style="font-size: 18px; font-weight: bold; color: #333;"></div>
                                </div>
                                <div style="flex: 1; background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="color: #666; margin-bottom: 10px;">🔋 剩餘</h4>
                                    <div id="remaining-quota" style="font-size: 18px; font-weight: bold; color: #333;"></div>
                                </div>
                            </div>
                            
                            <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h4 style="color: #333; margin-bottom: 15px;">使用率</h4>
                                <div style="background: #e9ecef; height: 30px; border-radius: 15px; overflow: hidden; position: relative;">
                                    <div id="usage-bar" style="height: 100%; border-radius: 15px; transition: all 0.3s ease;"></div>
                                    <div id="usage-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 14px; z-index: 10;"></div>
                                </div>
                                <div id="warning-message" style="margin-top: 15px; padding: 15px; border-radius: 8px; display: none;"></div>
                            </div>
                            
                            <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
                                <span>最後更新：</span><span id="last-updated"></span>
                            </div>
                        </div>
                        
                        <div id="quota-loading" style="text-align: center; padding: 50px; display: none;">
                            <div style="font-size: 18px; color: #666;">📊 載入用量數據中...</div>
                        </div>
                        
                        <div id="quota-error" style="text-align: center; padding: 50px; display: none;">
                            <div style="font-size: 18px; color: #dc3545;">❌ 載入失敗，請稍後再試</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 編輯備註的 Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3 id="modalTitle">編輯備註</h3>
            <form id="editForm">
                <div class="form-group">
                    <label for="noteName">備註名稱：</label>
                    <input type="text" id="noteName" class="form-control">
                </div>
                <div class="form-group">
                    <label for="department">部門：</label>
                    <input type="text" id="department" class="form-control">
                </div>
                <button type="submit" class="btn">💾 保存</button>
            </form>
        </div>
    </div>

    <script>
        let currentEditTarget = null;
        let currentEditType = null;

        // 切換頁籤
        function showTab(tabName) {
            // 隱藏所有頁籤內容
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 顯示選中的頁籤
            document.getElementById(tabName + '-tab').classList.add('active');
            event.target.classList.add('active');
            
            // 載入對應數據
            switch(tabName) {
                case 'users': loadUsers(); break;
                case 'groups': loadGroups(); break;
                case 'messages': loadMessages(); break;
                case 'events': loadEvents(); break;
                case 'templates': loadFlexTemplates(); break;
                case 'quota': loadQuota(); break;
            }
        }

        // 載入用戶列表
        async function loadUsers() {
            try {
                const response = await fetch('/api/management/users');
                const data = await response.json();
                
                const tbody = document.getElementById('users-table');
                tbody.innerHTML = data.users.map(user => \`
                    <tr>
                        <td><img src="\${user.picture_url || '/default-avatar.png'}" class="user-avatar" alt="頭像"></td>
                        <td><code>\${user.user_id.substring(0, 20)}...</code></td>
                        <td>\${user.display_name || '未知用戶'}</td>
                        <td>\${user.note_name || '<em>未設定</em>'}</td>
                        <td>\${user.status_message || '無'}</td>
                        <td><span class="status \${user.is_friend ? 'status-active' : 'status-inactive'}">\${user.is_friend ? '好友' : '已封鎖'}</span></td>
                        <td>\${new Date(user.created_at).toLocaleString('zh-TW')}</td>
                        <td>
                            <button class="btn btn-small" onclick="editUser('\${user.user_id}', '\${user.note_name || \"\"}', '')">✏️ 編輯</button>
                            <button class="btn btn-small btn-success" onclick="viewUserMessages('\${user.user_id}')">💬 訊息</button>
                        </td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('載入用戶失敗:', error);
            }
        }

        // 載入群組列表
        async function loadGroups() {
            try {
                const response = await fetch('/api/management/groups');
                const data = await response.json();
                
                const tbody = document.getElementById('groups-table');
                tbody.innerHTML = data.groups.map(group => \`
                    <tr>
                        <td><img src="\${group.picture_url || '/default-group.png'}" class="user-avatar" alt="群組頭像" onerror="this.src='/default-group.png'"></td>
                        <td><code>\${group.group_id.substring(0, 20)}...</code></td>
                        <td>\${group.group_name || '未知群組'}</td>
                        <td><strong>\${group.group_alias}</strong></td>
                        <td>\${group.note_name || '<em>未設定</em>'}</td>
                        <td>\${group.department || '未設定'}</td>
                        <td><span class="status \${group.is_active ? 'status-active' : 'status-inactive'}">\${group.is_active ? '活躍' : '已離開'}</span></td>
                        <td>\${new Date(group.joined_at).toLocaleString('zh-TW')}</td>
                        <td>
                            <button class="btn btn-small" onclick="editGroup('\${group.group_id}', '\${group.note_name || \"\"}', '\${group.department || \"\"}')">✏️ 編輯</button>
                            <button class="btn btn-small btn-success" onclick="viewGroupMessages('\${group.group_id}')">💬 訊息</button>
                        </td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('載入群組失敗:', error);
            }
        }

        // 載入訊息記錄
        async function loadMessages() {
            try {
                const response = await fetch('/api/management/messages');
                const data = await response.json();
                
                const tbody = document.getElementById('messages-table');
                tbody.innerHTML = data.messages.map(msg => \`
                    <tr>
                        <td>\${new Date(msg.sent_at).toLocaleString('zh-TW')}</td>
                        <td><code>\${(msg.group_id || '').substring(0, 15)}...</code></td>
                        <td>\${msg.message_content.substring(0, 50)}...\${msg.message_content.length > 50 ? '' : msg.message_content}</td>
                        <td><span class="status \${msg.status === 'sent' ? 'status-active' : 'status-inactive'}">\${msg.status}</span></td>
                        <td>\${msg.key_name || '未知'}</td>
                        <td>\${msg.error_message || ''}</td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('載入訊息記錄失敗:', error);
            }
        }

        // 載入事件日誌
        async function loadEvents() {
            try {
                const response = await fetch('/api/management/events');
                const data = await response.json();
                
                const tbody = document.getElementById('events-table');
                tbody.innerHTML = data.events.map(event => \`
                    <tr>
                        <td>\${new Date(event.received_at).toLocaleString('zh-TW')}</td>
                        <td><span class="status status-active">\${event.event_type}</span></td>
                        <td>\${event.source_type || '無'}</td>
                        <td><code>\${(event.source_id || '').substring(0, 15)}...</code></td>
                        <td><code>\${(event.user_id || '').substring(0, 15)}...</code></td>
                        <td><button class="btn btn-small" onclick="viewEventDetail('\${event.id}')">🔍 詳情</button></td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('載入事件日誌失敗:', error);
            }
        }

        // 載入用量監控
        async function loadQuota() {
            // 顯示載入狀態
            document.getElementById('quota-info').style.display = 'none';
            document.getElementById('quota-error').style.display = 'none';
            document.getElementById('quota-loading').style.display = 'block';
            
            try {
                const response = await fetch('/api/quota');
                const data = await response.json();
                
                if (data.success) {
                    // 隱藏載入狀態
                    document.getElementById('quota-loading').style.display = 'none';
                    document.getElementById('quota-info').style.display = 'block';
                    
                    // 更新數據
                    document.getElementById('plan-type').textContent = data.plan === 'limited' ? '免費方案' : data.plan;
                    document.getElementById('total-quota').textContent = data.totalQuota + ' 則/月';
                    document.getElementById('used-quota').textContent = data.usedQuota + ' 則';
                    document.getElementById('remaining-quota').textContent = data.remainingQuota + ' 則';
                    document.getElementById('last-updated').textContent = new Date(data.lastUpdated).toLocaleString('zh-TW');
                    
                    // 更新進度條
                    const usageBar = document.getElementById('usage-bar');
                    const usageText = document.getElementById('usage-text');
                    
                    usageBar.style.width = data.usagePercentage + '%';
                    usageText.textContent = data.usagePercentage + '%';
                    
                    // 根據使用率設定顏色
                    if (data.warningLevel === 'critical') {
                        usageBar.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                        usageText.style.color = 'white';
                    } else if (data.warningLevel === 'warning') {
                        usageBar.style.background = 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
                        usageText.style.color = 'black';
                    } else {
                        usageBar.style.background = 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)';
                        usageText.style.color = 'white';
                    }
                    
                    // 顯示警告訊息
                    const warningMessage = document.getElementById('warning-message');
                    if (data.warningLevel === 'critical') {
                        warningMessage.style.display = 'block';
                        warningMessage.style.background = '#f8d7da';
                        warningMessage.style.color = '#721c24';
                        warningMessage.style.border = '1px solid #f5c6cb';
                        warningMessage.innerHTML = '🚨 <strong>警告：</strong>用量已超過 95%，請注意額度限制！';
                    } else if (data.warningLevel === 'warning') {
                        warningMessage.style.display = 'block';
                        warningMessage.style.background = '#fff3cd';
                        warningMessage.style.color = '#856404';
                        warningMessage.style.border = '1px solid #ffeaa7';
                        warningMessage.innerHTML = '⚠️ <strong>提醒：</strong>用量已超過 80%，請留意剩餘額度。';
                    } else {
                        warningMessage.style.display = 'none';
                    }
                } else {
                    throw new Error(data.error || '載入失敗');
                }
            } catch (error) {
                console.error('載入用量監控失敗:', error);
                document.getElementById('quota-loading').style.display = 'none';
                document.getElementById('quota-error').style.display = 'block';
            }
        }

        // 編輯用戶備註
        function editUser(userId, currentNote, currentDept) {
            currentEditTarget = userId;
            currentEditType = 'user';
            document.getElementById('modalTitle').textContent = '編輯用戶備註';
            document.getElementById('noteName').value = currentNote;
            document.getElementById('department').value = currentDept;
            document.getElementById('editModal').style.display = 'block';
        }

        // 編輯群組備註
        function editGroup(groupId, currentNote, currentDept) {
            currentEditTarget = groupId;
            currentEditType = 'group';
            document.getElementById('modalTitle').textContent = '編輯群組備註';
            document.getElementById('noteName').value = currentNote;
            document.getElementById('department').value = currentDept;
            document.getElementById('editModal').style.display = 'block';
        }

        // Modal 相關事件
        document.querySelector('.close').onclick = function() {
            document.getElementById('editModal').style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target === document.getElementById('editModal')) {
                document.getElementById('editModal').style.display = 'none';
            }
        }

        // 保存編輯
        document.getElementById('editForm').onsubmit = async function(e) {
            e.preventDefault();
            
            const noteName = document.getElementById('noteName').value;
            const department = document.getElementById('department').value;
            
            try {
                const response = await fetch('/api/management/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: currentEditType,
                        id: currentEditTarget,
                        note_name: noteName,
                        department: department
                    })
                });
                
                if (response.ok) {
                    alert('保存成功！');
                    document.getElementById('editModal').style.display = 'none';
                    // 重新載入對應數據
                    if (currentEditType === 'user') loadUsers();
                    else loadGroups();
                } else {
                    alert('保存失敗！');
                }
            } catch (error) {
                alert('保存出錯：' + error.message);
            }
        }

        // 載入 Flex 模板列表
        async function loadFlexTemplates() {
            try {
                const response = await fetch('/api/flex-templates');
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error);
                }
                
                const tbody = document.getElementById('flex-templates-table');
                tbody.innerHTML = data.templates.map(template => \`
                    <tr>
                        <td><strong>\${template.template_name}</strong><br><small style="color: #666;">\${template.description || '無描述'}</small></td>
                        <td><span class="status status-active">\${template.template_type}</span></td>
                        <td>\${template.category}</td>
                        <td><span class="status status-active">\${template.usage_count || 0} 次</span></td>
                        <td>\${new Date(template.created_at).toLocaleString('zh-TW')}</td>
                        <td>
                            <button class="btn btn-small" onclick="window.open('/flex-editor?id=\${template.template_id}', '_blank')">✏️ 編輯</button>
                            <button class="btn btn-small btn-success" onclick="previewFlexTemplate('\${template.template_id}')">👁️ 預覽</button>
                            <button class="btn btn-small btn-danger" onclick="deleteFlexTemplate('\${template.template_id}')">🗑️ 刪除</button>
                        </td>
                    </tr>
                \`).join('');
            } catch (error) {
                console.error('載入 Flex 模板失敗:', error);
                const tbody = document.getElementById('flex-templates-table');
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">載入失敗：' + error.message + '</td></tr>';
            }
        }

        // 預覽 Flex 模板
        function previewFlexTemplate(templateId) {
            window.open('/flex-editor?id=' + templateId + '&preview=true', '_blank');
        }

        // 刪除 Flex 模板
        async function deleteFlexTemplate(templateId) {
            if (!confirm('確定要刪除此模板嗎？此操作無法恢復！')) {
                return;
            }

            try {
                const response = await fetch('/api/flex-templates/' + templateId, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    alert('模板刪除成功！');
                    loadFlexTemplates(); // 重新載入列表
                } else {
                    alert('刪除失敗：' + data.error);
                }
            } catch (error) {
                alert('刪除出錯：' + error.message);
            }
        }

        // 頁面載入時初始化
        window.onload = function() {
            loadUsers();
        }
    </script>
</body>
</html>`;

  return new Response(managementHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}