export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    return new Response(`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>訊息模板編輯器</title>
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
            max-width: 1400px;
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
            justify-content: between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            margin-right: auto;
        }

        .header .actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
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

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .editor-container {
            display: grid;
            grid-template-columns: 300px 1fr 350px;
            height: calc(90vh - 80px);
        }

        .sidebar {
            background: #f8f9fa;
            border-right: 1px solid #dee2e6;
            padding: 20px;
            overflow-y: auto;
        }

        .sidebar h3 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #495057;
        }

        .form-control {
            width: 100%;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        .form-control:focus {
            outline: none;
            border-color: #2a5298;
            box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .editor-main {
            padding: 20px;
            display: flex;
            flex-direction: column;
        }

        .editor-toolbar {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #dee2e6;
        }

        .editor-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .editor-textarea {
            flex: 1;
            resize: none;
            border: 1px solid #ced4da;
            border-radius: 8px;
            padding: 15px;
            font-size: 14px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            line-height: 1.6;
        }

        .preview-panel {
            background: #f8f9fa;
            border-left: 1px solid #dee2e6;
            padding: 20px;
            overflow-y: auto;
        }

        .preview-phone {
            background: #000;
            border-radius: 25px;
            padding: 10px;
            margin: 0 auto;
            width: 300px;
        }

        .preview-screen {
            background: white;
            border-radius: 20px;
            height: 500px;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        .preview-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
        }

        .preview-avatar {
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

        .preview-message {
            background: #e3f2fd;
            padding: 12px 15px;
            border-radius: 18px;
            max-width: 80%;
            margin-bottom: 10px;
            white-space: pre-wrap;
            line-height: 1.4;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .variables-section {
            margin-top: 30px;
        }

        .variable-item {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            transition: all 0.3s;
        }

        .variable-item:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .variable-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
        }

        .variable-name {
            font-weight: 600;
            color: #2a5298;
        }

        .variable-type {
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            color: #495057;
        }

        .variable-details {
            font-size: 13px;
            color: #6c757d;
        }

        .btn-add {
            width: 100%;
            background: #28a745;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .btn-add:hover {
            background: #218838;
        }

        .emoji-picker {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 5px;
            margin-bottom: 10px;
        }

        .emoji {
            padding: 8px;
            text-align: center;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .emoji:hover {
            background: #e9ecef;
        }

        .help-text {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
        }

        @media (max-width: 1200px) {
            .editor-container {
                grid-template-columns: 250px 1fr 300px;
            }
        }

        @media (max-width: 768px) {
            .editor-container {
                grid-template-columns: 1fr;
                grid-template-rows: auto auto auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 訊息模板編輯器</h1>
            <div class="actions">
                <a href="/templates" class="btn btn-secondary">📋 模板列表</a>
                <button class="btn btn-primary" onclick="saveTemplate()">💾 儲存模板</button>
            </div>
        </div>

        <div class="editor-container">
            <!-- 左側邊欄 - 基本資訊與變數 -->
            <div class="sidebar">
                <h3>📋 基本資訊</h3>
                <div class="form-group">
                    <label for="templateName">模板名稱</label>
                    <input type="text" id="templateName" class="form-control" placeholder="例：工地進度通知">
                </div>

                <div class="form-group">
                    <label for="templateDescription">描述</label>
                    <textarea id="templateDescription" class="form-control" rows="3" placeholder="簡述此模板的用途..."></textarea>
                </div>

                <div class="form-group">
                    <label for="templateCategory">分類</label>
                    <select id="templateCategory" class="form-control">
                        <option value="">請選擇分類</option>
                        <option value="工程部">工程部</option>
                        <option value="IT部">IT部</option>
                        <option value="業務部">業務部</option>
                        <option value="人事部">人事部</option>
                        <option value="財務部">財務部</option>
                    </select>
                </div>

                <div class="variables-section">
                    <h3>🔢 變數管理</h3>
                    <button class="btn-add" onclick="showAddVariableModal()">+ 新增變數</button>
                    <div id="variablesList">
                        <!-- 變數列表將動態載入 -->
                    </div>
                </div>
            </div>

            <!-- 中間編輯區 -->
            <div class="editor-main">
                <div class="editor-toolbar">
                    <button class="btn btn-secondary" onclick="insertEmoji()">😀 表情符號</button>
                    <button class="btn btn-secondary" onclick="insertVariable()">🔢 插入變數</button>
                    <button class="btn btn-secondary" onclick="previewTemplate()">👁️ 預覽</button>
                </div>

                <div class="editor-content">
                    <textarea id="templateContent" class="editor-textarea" placeholder="在此輸入訊息模板內容...

提示：
• 使用 {{變數名稱}} 來插入變數
• 支援多行文字和表情符號
• 範例：專案 {{project_name}} 進度已達 {{progress}}%"></textarea>
                    
                    <div class="help-text">
                        💡 <strong>變數語法：</strong>使用 {{變數名稱}} 來插入變數值<br>
                        📝 <strong>支援格式：</strong>多行文字、表情符號、特殊字符
                    </div>
                </div>
            </div>

            <!-- 右側預覽 -->
            <div class="preview-panel">
                <h3>📱 訊息預覽</h3>
                <div class="preview-phone">
                    <div class="preview-screen">
                        <div class="preview-header">
                            <div class="preview-avatar">🤖</div>
                            <div>
                                <div style="font-weight: 600;">LINE Bot</div>
                                <div style="font-size: 12px; color: #666;">現在</div>
                            </div>
                        </div>
                        <div id="previewContent" class="preview-message">
                            請開始編輯您的模板...
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4>📊 統計資訊</h4>
                    <div style="font-size: 14px; color: #666;">
                        <div>字元數：<span id="charCount">0</span></div>
                        <div>變數數量：<span id="varCount">0</span></div>
                        <div>行數：<span id="lineCount">1</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 新增變數彈窗 -->
    <div id="addVariableModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
        <div style="background: white; border-radius: 15px; padding: 30px; width: 500px; max-width: 90vw;">
            <h3 style="margin-bottom: 20px;">🔢 新增變數</h3>
            
            <div class="form-group">
                <label>變數名稱</label>
                <input type="text" id="varName" class="form-control" placeholder="例：project_name">
            </div>

            <div class="form-group">
                <label>資料類型</label>
                <select id="varType" class="form-control">
                    <option value="string">文字 (string)</option>
                    <option value="number">數字 (number)</option>
                    <option value="date">日期 (date)</option>
                    <option value="boolean">是/否 (boolean)</option>
                    <option value="select">選項 (select)</option>
                </select>
            </div>

            <div class="form-group">
                <label>描述說明</label>
                <input type="text" id="varDescription" class="form-control" placeholder="例：專案名稱">
            </div>

            <div class="form-group">
                <label>範例值</label>
                <input type="text" id="varExample" class="form-control" placeholder="例：台北101大樓">
            </div>

            <div class="form-group">
                <label>
                    <input type="checkbox" id="varRequired"> 必填欄位
                </label>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeAddVariableModal()">取消</button>
                <button class="btn btn-primary" onclick="addVariable()">新增</button>
            </div>
        </div>
    </div>

    <script>
        let variables = [];
        let currentTemplateId = null;

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadDefaultTemplate();
            bindEvents();
        });

        function bindEvents() {
            const textarea = document.getElementById('templateContent');
            textarea.addEventListener('input', updatePreview);
            textarea.addEventListener('input', updateStats);
        }

        function loadDefaultTemplate() {
            // 載入預設模板
            document.getElementById('templateName').value = '';
            document.getElementById('templateDescription').value = '';
            document.getElementById('templateCategory').value = '';
            document.getElementById('templateContent').value = '';
            
            updatePreview();
            updateStats();
            renderVariables();
        }

        function updatePreview() {
            const content = document.getElementById('templateContent').value;
            let preview = content || '請開始編輸您的模板...';
            
            // 替換變數為範例值
            variables.forEach(variable => {
                const regex = new RegExp('\\{\\{' + variable.name + '\\}\\}', 'g');
                preview = preview.replace(regex, variable.example || '(' + variable.name + ')');
            });

            document.getElementById('previewContent').textContent = preview;
        }

        function updateStats() {
            const content = document.getElementById('templateContent').value;
            document.getElementById('charCount').textContent = content.length;
            document.getElementById('lineCount').textContent = content.split('\\n').length;
            document.getElementById('varCount').textContent = variables.length;
        }

        function showAddVariableModal() {
            document.getElementById('addVariableModal').style.display = 'flex';
        }

        function closeAddVariableModal() {
            document.getElementById('addVariableModal').style.display = 'none';
            // 清空表單
            document.getElementById('varName').value = '';
            document.getElementById('varType').value = 'string';
            document.getElementById('varDescription').value = '';
            document.getElementById('varExample').value = '';
            document.getElementById('varRequired').checked = false;
        }

        function addVariable() {
            const name = document.getElementById('varName').value.trim();
            const type = document.getElementById('varType').value;
            const description = document.getElementById('varDescription').value.trim();
            const example = document.getElementById('varExample').value.trim();
            const required = document.getElementById('varRequired').checked;

            if (!name) {
                alert('請輸入變數名稱');
                return;
            }

            if (variables.some(v => v.name === name)) {
                alert('變數名稱已存在');
                return;
            }

            variables.push({
                name,
                type,
                description,
                example,
                required
            });

            renderVariables();
            updatePreview();
            updateStats();
            closeAddVariableModal();
        }

        function renderVariables() {
            const container = document.getElementById('variablesList');
            
            if (variables.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">尚未新增任何變數</div>';
                return;
            }

            container.innerHTML = variables.map((variable, index) => \`
                <div class="variable-item">
                    <div class="variable-header">
                        <span class="variable-name">\${variable.name}</span>
                        <span class="variable-type">\${variable.type}</span>
                    </div>
                    <div class="variable-details">
                        <div>\${variable.description}</div>
                        <div style="margin-top: 5px;">
                            範例：<code>\${variable.example}</code>
                            \${variable.required ? '<span style="color: #dc3545;">*必填</span>' : ''}
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="insertVariableByName('\${variable.name}')">插入</button>
                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; margin-left: 5px;" onclick="removeVariable(\${index})">刪除</button>
                    </div>
                </div>
            \`).join('');
        }

        function removeVariable(index) {
            if (confirm('確定要刪除此變數嗎？')) {
                variables.splice(index, 1);
                renderVariables();
                updatePreview();
                updateStats();
            }
        }

        function insertVariableByName(varName) {
            const textarea = document.getElementById('templateContent');
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(textarea.selectionEnd);
            
            textarea.value = textBefore + '{{' + varName + '}}' + textAfter;
            textarea.setSelectionRange(cursorPos + varName.length + 4, cursorPos + varName.length + 4);
            textarea.focus();
            
            updatePreview();
            updateStats();
        }

        function insertEmoji() {
            const emojis = ['😀', '😊', '🎉', '👍', '❤️', '🔥', '💪', '🏗️', '📊', '⚠️', '✅', '❌', '📝', '📱', '💼', '🎯'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            const textarea = document.getElementById('templateContent');
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(textarea.selectionEnd);
            
            textarea.value = textBefore + emoji + textAfter;
            textarea.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
            textarea.focus();
            
            updatePreview();
            updateStats();
        }

        function insertVariable() {
            if (variables.length === 0) {
                alert('請先新增變數');
                return;
            }
            
            const variableNames = variables.map(v => v.name);
            const selected = prompt('請選擇要插入的變數：\\n' + variableNames.map((name, i) => (i+1) + '. ' + name).join('\\n'));
            
            if (selected) {
                const index = parseInt(selected) - 1;
                if (index >= 0 && index < variableNames.length) {
                    insertVariableByName(variableNames[index]);
                }
            }
        }

        function previewTemplate() {
            updatePreview();
            alert('預覽已更新！請查看右側預覽面板');
        }

        async function saveTemplate() {
            const templateName = document.getElementById('templateName').value.trim();
            const templateDescription = document.getElementById('templateDescription').value.trim();
            const templateCategory = document.getElementById('templateCategory').value;
            const templateContent = document.getElementById('templateContent').value.trim();

            if (!templateName || !templateContent) {
                alert('請填寫模板名稱和內容');
                return;
            }

            const templateData = {
                template_name: templateName,
                description: templateDescription,
                category: templateCategory,
                variables: JSON.stringify(variables),
                message_template: templateContent,
                is_active: 1
            };

            try {
                const response = await fetch('/api/templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(templateData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('模板儲存成功！');
                    // 可以選擇跳轉到模板列表或清空表單
                    if (confirm('是否查看模板列表？')) {
                        window.location.href = '/templates';
                    }
                } else {
                    alert('儲存失敗：' + result.error);
                }
            } catch (error) {
                console.error('保存錯誤：', error);
                alert('儲存時發生錯誤，請稍後再試');
            }
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