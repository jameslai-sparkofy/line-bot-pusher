export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    return new Response(`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>訊息模板管理</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft JhengHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            min-height: 90vh;
        }

        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header .actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #28a745;
            color: white;
        }

        .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .btn-sm {
            padding: 6px 12px;
            font-size: 14px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .content {
            padding: 30px;
        }

        .filters {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            align-items: center;
        }

        .form-control {
            padding: 8px 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
        }

        .search-box {
            min-width: 300px;
            flex: 1;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
        }

        .stat-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }

        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }

        .template-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 15px;
            padding: 20px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .template-card:hover {
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transform: translateY(-5px);
        }

        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .template-title {
            font-size: 18px;
            font-weight: 600;
            color: #2a5298;
            margin-bottom: 5px;
        }

        .template-category {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }

        .template-description {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 15px;
            line-height: 1.5;
        }

        .template-preview {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            font-family: Monaco, monospace;
            margin-bottom: 15px;
            border-left: 4px solid #2a5298;
            max-height: 100px;
            overflow: hidden;
            position: relative;
        }

        .template-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            font-size: 12px;
            color: #6c757d;
        }

        .template-variables {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .template-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .variable-count {
            background: #28a745;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
        }

        .loading {
            text-align: center;
            padding: 50px;
            color: #6c757d;
        }

        .empty-state {
            text-align: center;
            padding: 50px;
            color: #6c757d;
        }

        .empty-state img {
            width: 120px;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 30px;
            gap: 10px;
        }

        .pagination button {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            background: white;
            border-radius: 5px;
            cursor: pointer;
        }

        .pagination button.active {
            background: #2a5298;
            color: white;
            border-color: #2a5298;
        }

        @media (max-width: 768px) {
            .templates-grid {
                grid-template-columns: 1fr;
            }
            
            .filters {
                flex-direction: column;
                align-items: stretch;
            }
            
            .search-box {
                min-width: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 訊息模板管理</h1>
            <div class="actions">
                <a href="/management" class="btn btn-secondary">🏠 管理首頁</a>
                <a href="/template-editor" class="btn btn-primary">➕ 新增模板</a>
            </div>
        </div>

        <div class="content">
            <div class="filters">
                <input type="text" id="searchInput" class="form-control search-box" placeholder="🔍 搜尋模板名稱或描述...">
                <select id="categoryFilter" class="form-control">
                    <option value="">所有分類</option>
                    <option value="工程部">工程部</option>
                    <option value="IT部">IT部</option>
                    <option value="業務部">業務部</option>
                    <option value="人事部">人事部</option>
                    <option value="財務部">財務部</option>
                </select>
                <button class="btn btn-secondary" onclick="resetFilters()">🔄 重設</button>
            </div>

            <div class="stats" id="statsContainer">
                <div class="stat-card">
                    <div class="stat-number" id="totalTemplates">0</div>
                    <div class="stat-label">總模板數</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalVariables">0</div>
                    <div class="stat-label">總變數數</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalCategories">0</div>
                    <div class="stat-label">分類數</div>
                </div>
            </div>

            <div id="templatesContainer">
                <div class="loading">
                    <div>⏳ 載入模板中...</div>
                </div>
            </div>

            <div class="pagination" id="paginationContainer" style="display: none;">
            </div>
        </div>
    </div>

    <script>
        let currentPage = 1;
        let totalPages = 1;
        let templates = [];

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadTemplates();
            bindEvents();
        });

        function bindEvents() {
            document.getElementById('searchInput').addEventListener('input', debounce(loadTemplates, 500));
            document.getElementById('categoryFilter').addEventListener('change', loadTemplates);
        }

        async function loadTemplates() {
            const search = document.getElementById('searchInput').value;
            const category = document.getElementById('categoryFilter').value;
            
            try {
                const params = new URLSearchParams({
                    page: currentPage,
                    limit: 12,
                    ...(search && { search }),
                    ...(category && { category })
                });

                const response = await fetch('/api/templates?' + params);
                const result = await response.json();

                if (result.success) {
                    templates = result.data.templates;
                    totalPages = result.data.pagination.pages;
                    
                    renderTemplates();
                    renderStats();
                    renderPagination();
                } else {
                    showError('載入模板失敗：' + result.error);
                }
            } catch (error) {
                console.error('Load templates error:', error);
                showError('載入模板時發生錯誤');
            }
        }

        function renderTemplates() {
            const container = document.getElementById('templatesContainer');
            
            if (templates.length === 0) {
                container.innerHTML = \`
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                        <h3>尚未建立任何模板</h3>
                        <p>點擊右上角的「新增模板」開始建立您的第一個訊息模板</p>
                    </div>
                \`;
                return;
            }

            container.innerHTML = \`
                <div class="templates-grid">
                    \${templates.map(template => renderTemplateCard(template)).join('')}
                </div>
            \`;
        }

        function renderTemplateCard(template) {
            const variables = template.variables || [];
            const preview = template.content_preview || template.message_template.substring(0, 100);
            const updatedAt = new Date(template.updated_at).toLocaleDateString('zh-TW');
            
            return \`
                <div class="template-card">
                    <div class="template-header">
                        <div>
                            <div class="template-title">\${template.template_name}</div>
                            \${template.category ? \`<div class="template-category">\${template.category}</div>\` : ''}
                        </div>
                    </div>

                    <div class="template-description">
                        \${template.description || '無描述'}
                    </div>

                    <div class="template-preview">
                        \${preview}\${template.message_template.length > 100 ? '...' : ''}
                    </div>

                    <div class="template-meta">
                        <div class="template-variables">
                            🔢 變數: <span class="variable-count">\${variables.length}</span>
                        </div>
                        <div>📅 \${updatedAt}</div>
                    </div>

                    <div class="template-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editTemplate('\${template.template_id}')">
                            ✏️ 編輯
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="viewDocumentation('\${template.template_id}')">
                            📖 API文件
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="testTemplate('\${template.template_id}')">
                            🧪 測試
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="copyTemplate('\${template.template_id}')">
                            📋 複製
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteTemplate('\${template.template_id}', '\${template.template_name}')" style="color: #dc3545;">
                            🗑️ 刪除
                        </button>
                    </div>
                </div>
            \`;
        }

        function renderStats() {
            const totalVars = templates.reduce((sum, template) => sum + (template.variable_count || 0), 0);
            const categories = new Set(templates.map(t => t.category).filter(Boolean));
            
            document.getElementById('totalTemplates').textContent = templates.length;
            document.getElementById('totalVariables').textContent = totalVars;
            document.getElementById('totalCategories').textContent = categories.size;
        }

        function renderPagination() {
            const container = document.getElementById('paginationContainer');
            
            if (totalPages <= 1) {
                container.style.display = 'none';
                return;
            }

            container.style.display = 'flex';
            container.innerHTML = '';

            // 上一頁
            if (currentPage > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '上一頁';
                prevBtn.onclick = () => changePage(currentPage - 1);
                container.appendChild(prevBtn);
            }

            // 頁碼
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                btn.className = i === currentPage ? 'active' : '';
                btn.onclick = () => changePage(i);
                container.appendChild(btn);
            }

            // 下一頁
            if (currentPage < totalPages) {
                const nextBtn = document.createElement('button');
                nextBtn.textContent = '下一頁';
                nextBtn.onclick = () => changePage(currentPage + 1);
                container.appendChild(nextBtn);
            }
        }

        function changePage(page) {
            currentPage = page;
            loadTemplates();
        }

        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            currentPage = 1;
            loadTemplates();
        }

        function editTemplate(templateId) {
            window.location.href = '/template-editor?id=' + templateId;
        }

        async function viewDocumentation(templateId) {
            try {
                const response = await fetch('/api/templates/' + templateId + '/documentation');
                const result = await response.json();
                
                if (result.success) {
                    // 開啟新視窗顯示文件
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(\`
                        <html>
                            <head>
                                <title>API 文件 - \${result.data.template_name}</title>
                                <style>
                                    body { font-family: -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                                    pre { background: #f8f9fa; padding: 15px; border-radius: 8px; overflow-x: auto; }
                                    code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
                                    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
                                    th, td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; }
                                    th { background: #f8f9fa; }
                                </style>
                            </head>
                            <body>\${markdownToHtml(result.data.markdown)}</body>
                        </html>
                    \`);
                } else {
                    alert('載入文件失敗：' + result.error);
                }
            } catch (error) {
                alert('載入文件時發生錯誤');
            }
        }

        async function testTemplate(templateId) {
            try {
                // 先取得模板詳細資料
                const response = await fetch('/api/templates/' + templateId);
                const result = await response.json();
                
                if (!result.success) {
                    alert('載入模板失敗：' + result.error);
                    return;
                }
                
                const template = result.data;
                const variables = template.variables || [];
                
                // 如果有變數，顯示輸入表單
                let variablesInput = {};
                
                if (variables.length > 0) {
                    let formHtml = '請輸入測試變數：\\n\\n';
                    
                    for (const variable of variables) {
                        const value = prompt(formHtml + variable.name + ' (' + variable.type + ')' + 
                            (variable.required ? ' *必填' : '') + 
                            '\\n說明：' + variable.description + 
                            '\\n範例：' + (variable.example || ''), 
                            variable.example || '');
                        
                        if (value === null) return; // 用戶取消
                        
                        if (variable.required && !value.trim()) {
                            alert('必填變數「' + variable.name + '」不能為空');
                            return;
                        }
                        
                        variablesInput[variable.name] = value;
                    }
                }
                
                // 選擇發送方式
                const sendMode = confirm('點擊「確定」進行預覽，點擊「取消」實際發送到群組');
                
                let groupId = null;
                if (!sendMode) {
                    // 實際發送，需要選擇群組
                    const groupResponse = await fetch('/api/groups');
                    const groupResult = await groupResponse.json();
                    
                    if (groupResult.success && groupResult.data.groups.length > 0) {
                        const groupOptions = groupResult.data.groups
                            .map((group, index) => (index + 1) + '. ' + group.group_name + ' (' + group.group_id + ')')
                            .join('\\n');
                        
                        const groupChoice = prompt('請選擇發送群組：\\n\\n' + groupOptions, '1');
                        if (groupChoice === null) return;
                        
                        const groupIndex = parseInt(groupChoice) - 1;
                        if (groupIndex >= 0 && groupIndex < groupResult.data.groups.length) {
                            groupId = groupResult.data.groups[groupIndex].group_id;
                        } else {
                            alert('無效的群組選擇');
                            return;
                        }
                    } else {
                        alert('找不到可用的群組');
                        return;
                    }
                }
                
                // 發送測試請求
                const testResponse = await fetch('/api/templates/' + templateId + '/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-key'
                    },
                    body: JSON.stringify({
                        group_id: groupId,
                        variables: variablesInput
                    })
                });
                
                const testResult = await testResponse.json();
                
                if (testResult.success) {
                    if (groupId) {
                        alert('訊息發送成功！\\n\\n' +
                            '群組：' + testResult.data.group_name + '\\n' +
                            '使用變數：' + testResult.data.variables_used + '個\\n' +
                            '發送時間：' + new Date(testResult.data.sent_at).toLocaleString('zh-TW'));
                    } else {
                        // 顯示預覽結果
                        const previewWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
                        previewWindow.document.write(\`
                            <html>
                                <head>
                                    <title>訊息預覽 - \${template.template_name}</title>
                                    <style>
                                        body { 
                                            font-family: -apple-system, sans-serif; 
                                            padding: 20px; 
                                            background: #f5f5f5;
                                        }
                                        .phone {
                                            background: #000;
                                            border-radius: 25px;
                                            padding: 10px;
                                            width: 300px;
                                            margin: 0 auto;
                                        }
                                        .screen {
                                            background: white;
                                            border-radius: 20px;
                                            height: 500px;
                                            padding: 20px;
                                            overflow-y: auto;
                                        }
                                        .header {
                                            display: flex;
                                            align-items: center;
                                            gap: 10px;
                                            padding-bottom: 15px;
                                            border-bottom: 1px solid #eee;
                                            margin-bottom: 20px;
                                        }
                                        .avatar {
                                            width: 40px;
                                            height: 40px;
                                            background: #28a745;
                                            border-radius: 50%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-weight: bold;
                                        }
                                        .message {
                                            background: #e3f2fd;
                                            padding: 12px 15px;
                                            border-radius: 18px;
                                            white-space: pre-wrap;
                                            line-height: 1.4;
                                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                                        }
                                        .info {
                                            margin-top: 20px;
                                            font-size: 12px;
                                            color: #666;
                                            text-align: center;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="phone">
                                        <div class="screen">
                                            <div class="header">
                                                <div class="avatar">🤖</div>
                                                <div>
                                                    <div style="font-weight: 600;">LINE Bot</div>
                                                    <div style="font-size: 12px; color: #666;">現在</div>
                                                </div>
                                            </div>
                                            <div class="message">\${testResult.data.processed_message}</div>
                                            <div class="info">
                                                模板：\${template.template_name}<br>
                                                變數數量：\${testResult.data.variables_used}
                                            </div>
                                        </div>
                                    </div>
                                </body>
                            </html>
                        \`);
                    }
                } else {
                    alert('測試失敗：' + testResult.error);
                }
                
            } catch (error) {
                console.error('Test template error:', error);
                alert('測試時發生錯誤');
            }
        }

        function copyTemplate(templateId) {
            // 實作複製模板功能
            alert('複製功能開發中...');
        }

        async function deleteTemplate(templateId, templateName) {
            if (!confirm('確定要刪除模板「' + templateName + '」嗎？\\n此操作無法復原。')) {
                return;
            }

            try {
                const response = await fetch('/api/templates/' + templateId, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    alert('模板刪除成功');
                    loadTemplates(); // 重新載入列表
                } else {
                    alert('刪除失敗：' + result.error);
                }
            } catch (error) {
                alert('刪除時發生錯誤');
            }
        }

        function showError(message) {
            document.getElementById('templatesContainer').innerHTML = \`
                <div style="text-align: center; padding: 50px; color: #dc3545;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3>載入失敗</h3>
                    <p>\${message}</p>
                    <button class="btn btn-primary" onclick="loadTemplates()">重新載入</button>
                </div>
            \`;
        }

        // 簡單的 Markdown 轉 HTML 功能
        function markdownToHtml(markdown) {
            return markdown
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\`\`\`([\\s\\S]*?)\`\`\`/gim, '<pre><code>$1</code></pre>')
                .replace(/\`([^\\n\`]*)\`/gim, '<code>$1</code>')
                .replace(/^\\| (.*) \\|$/gim, '<tr><td>$1</td></tr>')
                .replace(/\\n/g, '<br>');
        }

        // 防抖函數
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    </script>
</body>
</html>
    `, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}