// Flex Message 編輯器
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const templateId = url.searchParams.get('id');

  const flexEditorHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flex Message 編輯器 - LINE Bot 推送系統</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            height: 100vh;
            overflow: hidden;
        }

        .editor-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .editor-title {
            font-size: 20px;
            font-weight: bold;
        }

        .editor-actions {
            display: flex;
            gap: 10px;
            margin-left: auto;
        }

        .btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .btn-primary {
            background: #4CAF50;
            border-color: #4CAF50;
        }

        .btn-primary:hover {
            background: #45a049;
        }

        .editor-container {
            display: flex;
            height: calc(100vh - 70px);
        }

        .sidebar {
            width: 300px;
            background: white;
            border-right: 1px solid #e0e0e0;
            overflow-y: auto;
        }

        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #fafafa;
        }

        .sidebar-content {
            padding: 20px;
        }

        .template-list {
            margin-bottom: 30px;
        }

        .template-list h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 16px;
        }

        .template-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .template-item:hover {
            background: #e9ecef;
            border-color: #667eea;
        }

        .template-item.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .template-name {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .template-desc {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }

        .template-item.active .template-desc {
            color: rgba(255,255,255,0.8);
        }

        .main-editor {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .editor-toolbar {
            background: white;
            border-bottom: 1px solid #e0e0e0;
            padding: 15px 20px;
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .editor-mode {
            display: flex;
            background: #f0f0f0;
            border-radius: 6px;
            overflow: hidden;
        }

        .mode-btn {
            background: none;
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }

        .mode-btn.active {
            background: #667eea;
            color: white;
        }

        .editor-content {
            flex: 1;
            display: flex;
        }

        .editor-area {
            flex: 1;
            background: white;
            position: relative;
        }

        .visual-editor, .json-editor {
            width: 100%;
            height: 100%;
            padding: 20px;
            display: none;
        }

        .visual-editor.active, .json-editor.active {
            display: block;
        }

        .json-textarea {
            width: 100%;
            height: calc(100% - 40px);
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            line-height: 1.6;
            resize: none;
            outline: none;
        }

        .json-textarea:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .preview-panel {
            width: 350px;
            background: #e5ddd5;
            border-left: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
        }

        .preview-header {
            background: #075e54;
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
        }

        .preview-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .message-bubble {
            background: white;
            border-radius: 15px;
            max-width: 280px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 20px;
        }

        .bubble-hero img {
            width: 100%;
            height: auto;
            display: block;
        }

        .bubble-body {
            padding: 15px;
        }

        .bubble-footer {
            padding: 0 15px 15px;
        }

        .bubble-button {
            display: block;
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
            transition: all 0.3s;
        }

        .bubble-button.primary {
            background: #667eea;
            color: white;
        }

        .bubble-button.secondary {
            background: #f0f0f0;
            color: #333;
        }

        .bubble-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .variables-panel {
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            padding: 15px;
            max-height: 200px;
            overflow-y: auto;
        }

        .variable-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 10px;
        }

        .variable-label {
            min-width: 120px;
            font-size: 12px;
            color: #666;
        }

        .variable-input {
            flex: 1;
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
        }

        .error-message {
            background: #ffebee;
            color: #c62828;
            padding: 10px 15px;
            border-left: 4px solid #c62828;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 14px;
        }

        .success-message {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 10px 15px;
            border-left: 4px solid #2e7d32;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 14px;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #666;
        }

        .visual-builder {
            border: 2px dashed #ddd;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            color: #999;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }

        .visual-builder h3 {
            margin-bottom: 10px;
            color: #666;
        }

        .component-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }

        .component-btn {
            background: white;
            border: 1px solid #ddd;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
        }

        .component-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="editor-header">
        <div class="editor-title">🎨 Flex Message 編輯器</div>
        <div class="editor-actions">
            <button class="btn" onclick="validateTemplate()">🔍 驗證</button>
            <button class="btn" onclick="previewTemplate()">👁️ 預覽</button>
            <button class="btn" onclick="saveTemplate()" id="saveBtn">💾 儲存</button>
            <button class="btn btn-primary" onclick="sendTest()">📤 測試發送</button>
            <a href="/management" class="btn">← 返回管理</a>
        </div>
    </div>

    <div class="editor-container">
        <!-- 側邊欄 -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h3>📋 預設模板</h3>
            </div>
            <div class="sidebar-content">
                <div class="template-list" id="templateList">
                    <!-- 動態載入 -->
                </div>
            </div>
        </div>

        <!-- 主編輯器 -->
        <div class="main-editor">
            <!-- 工具列 -->
            <div class="editor-toolbar">
                <div class="editor-mode">
                    <button class="mode-btn active" onclick="switchMode('visual')" id="visualModeBtn">
                        🎨 視覺化編輯
                    </button>
                    <button class="mode-btn" onclick="switchMode('json')" id="jsonModeBtn">
                        📝 JSON 編輯
                    </button>
                </div>
                
                <div style="margin-left: auto; display: flex; gap: 10px; align-items: center;">
                    <label for="templateName" style="font-size: 14px; color: #666;">模板名稱:</label>
                    <input type="text" id="templateName" placeholder="輸入模板名稱" 
                           style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; width: 200px;">
                </div>
            </div>

            <!-- 編輯區域 -->
            <div class="editor-content">
                <div class="editor-area">
                    <!-- 視覺化編輯器 -->
                    <div class="visual-editor active" id="visualEditor">
                        <div class="component-toolbar">
                            <button class="component-btn" onclick="addComponent('text')">📝 文字</button>
                            <button class="component-btn" onclick="addComponent('image')">🖼️ 圖片</button>
                            <button class="component-btn" onclick="addComponent('button')">🔘 按鈕</button>
                            <button class="component-btn" onclick="addComponent('separator')">➖ 分隔線</button>
                            <button class="component-btn" onclick="addComponent('box')">📦 容器</button>
                        </div>
                        <div class="visual-builder">
                            <h3>視覺化編輯器</h3>
                            <p>選擇左側的預設模板開始編輯<br>或使用上方工具列新增元件</p>
                        </div>
                    </div>

                    <!-- JSON編輯器 -->
                    <div class="json-editor" id="jsonEditor">
                        <div style="margin-bottom: 10px; display: flex; gap: 10px;">
                            <button class="btn" onclick="formatJson()" style="background: #f0f0f0; color: #333;">
                                🎯 格式化
                            </button>
                            <button class="btn" onclick="minifyJson()" style="background: #f0f0f0; color: #333;">
                                🗜️ 壓縮
                            </button>
                        </div>
                        <textarea class="json-textarea" id="jsonTextarea" 
                                  placeholder="在此輸入或編輯 Flex Message JSON..."></textarea>
                    </div>
                </div>

                <!-- 預覽面板 -->
                <div class="preview-panel">
                    <div class="preview-header">
                        📱 LINE 預覽
                    </div>
                    <div class="preview-content" id="previewContent">
                        <div style="text-align: center; color: #666; padding: 40px;">
                            選擇模板或輸入 JSON 以查看預覽
                        </div>
                    </div>
                    <div class="variables-panel" id="variablesPanel">
                        <!-- 變數輸入區域 -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 載入狀態 -->
    <div class="loading" id="loading">
        <div>載入中...</div>
    </div>

    <script>
        let currentTemplate = null;
        let currentMode = 'visual';
        let templates = [];
        let variables = {};

        // 頁面載入時初始化
        window.onload = function() {
            loadTemplates();
            
            // 如果有傳入模板ID，載入該模板
            const urlParams = new URLSearchParams(window.location.search);
            const templateId = urlParams.get('id');
            if (templateId) {
                loadTemplate(templateId);
            }
        };

        // 載入預設模板列表
        async function loadTemplates() {
            try {
                const response = await fetch('/api/flex-templates');
                const data = await response.json();
                
                if (data.success) {
                    templates = data.templates;
                    renderTemplateList(templates);
                }
            } catch (error) {
                console.error('載入模板失敗:', error);
            }
        }

        // 渲染模板列表
        function renderTemplateList(templates) {
            const container = document.getElementById('templateList');
            container.innerHTML = templates.map((template, index) => \`
                <div class="template-item" onclick="selectTemplate('\${template.template_id}', \${index})">
                    <div class="template-name">\${template.template_name}</div>
                    <div class="template-desc">\${template.description}</div>
                </div>
            \`).join('');
        }

        // 選擇模板
        function selectTemplate(templateId, index) {
            // 移除之前的active狀態
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 添加active狀態
            document.querySelectorAll('.template-item')[index].classList.add('active');
            
            // 載入模板
            const template = templates.find(t => t.template_id === templateId);
            if (template) {
                loadTemplateContent(template);
            }
        }

        // 載入模板內容
        function loadTemplateContent(template) {
            currentTemplate = template;
            
            // 更新模板名稱
            document.getElementById('templateName').value = template.template_name;
            
            // 載入JSON內容
            const flexContent = JSON.parse(template.flex_content);
            document.getElementById('jsonTextarea').value = JSON.stringify(flexContent, null, 2);
            
            // 載入變數
            const templateVariables = JSON.parse(template.variables || '[]');
            renderVariablesPanel(templateVariables);
            
            // 更新預覽
            updatePreview();
        }

        // 渲染變數面板
        function renderVariablesPanel(templateVariables) {
            const container = document.getElementById('variablesPanel');
            
            if (templateVariables.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #666; padding: 15px;">此模板無變數</div>';
                return;
            }
            
            container.innerHTML = \`
                <h4 style="margin-bottom: 15px; color: #333;">🔧 模板變數</h4>
                \${templateVariables.map(variable => \`
                    <div class="variable-item">
                        <div class="variable-label">\${variable.name}:</div>
                        <input type="text" class="variable-input" 
                               data-variable="\${variable.name}"
                               placeholder="\${variable.description || variable.name}"
                               onchange="updateVariable('\${variable.name}', this.value)">
                    </div>
                \`).join('')}
            \`;
        }

        // 更新變數值
        function updateVariable(name, value) {
            variables[name] = value;
            updatePreview();
        }

        // 切換編輯模式
        function switchMode(mode) {
            currentMode = mode;
            
            // 更新按鈕狀態
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(mode + 'ModeBtn').classList.add('active');
            
            // 切換編輯器
            document.querySelectorAll('.visual-editor, .json-editor').forEach(editor => {
                editor.classList.remove('active');
            });
            document.getElementById(mode + 'Editor').classList.add('active');
        }

        // 格式化JSON
        function formatJson() {
            try {
                const textarea = document.getElementById('jsonTextarea');
                const json = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(json, null, 2);
                updatePreview();
            } catch (error) {
                showError('JSON 格式錯誤: ' + error.message);
            }
        }

        // 壓縮JSON
        function minifyJson() {
            try {
                const textarea = document.getElementById('jsonTextarea');
                const json = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(json);
            } catch (error) {
                showError('JSON 格式錯誤: ' + error.message);
            }
        }

        // 更新預覽
        function updatePreview() {
            try {
                const jsonContent = document.getElementById('jsonTextarea').value;
                if (!jsonContent.trim()) {
                    document.getElementById('previewContent').innerHTML = 
                        '<div style="text-align: center; color: #666; padding: 40px;">輸入 JSON 以查看預覽</div>';
                    return;
                }
                
                let flexMessage = JSON.parse(jsonContent);
                
                // 替換變數
                let processedContent = JSON.stringify(flexMessage);
                Object.keys(variables).forEach(key => {
                    const regex = new RegExp(\`\\{\\{\${key}\\}\\}\`, 'g');
                    processedContent = processedContent.replace(regex, variables[key] || \`{{\${key}}}\`);
                });
                
                flexMessage = JSON.parse(processedContent);
                
                // 渲染預覽
                renderPreview(flexMessage);
                
            } catch (error) {
                showError('預覽錯誤: ' + error.message);
            }
        }

        // 渲染預覽
        function renderPreview(flexMessage) {
            const container = document.getElementById('previewContent');
            
            if (flexMessage.type === 'bubble') {
                container.innerHTML = renderBubble(flexMessage);
            } else if (flexMessage.type === 'carousel') {
                container.innerHTML = flexMessage.contents.map(bubble => renderBubble(bubble)).join('');
            } else {
                container.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">不支援的訊息類型</div>';
            }
        }

        // 渲染 Bubble
        function renderBubble(bubble) {
            let html = '<div class="message-bubble">';
            
            // Hero 區域
            if (bubble.hero && bubble.hero.type === 'image') {
                html += \`<div class="bubble-hero"><img src="\${bubble.hero.url}" alt="Hero Image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5ZyW54mH55Sh5oCl5byV</dGV4dD48L3N2Zz4='"></div>\`;
            }
            
            // Body 區域
            if (bubble.body) {
                html += '<div class="bubble-body">';
                html += renderBox(bubble.body);
                html += '</div>';
            }
            
            // Footer 區域
            if (bubble.footer) {
                html += '<div class="bubble-footer">';
                html += renderBox(bubble.footer);
                html += '</div>';
            }
            
            html += '</div>';
            return html;
        }

        // 渲染 Box
        function renderBox(box) {
            if (!box.contents) return '';
            
            return box.contents.map(content => {
                if (content.type === 'text') {
                    const style = \`
                        font-size: \${content.size === 'xs' ? '11px' : content.size === 'sm' ? '13px' : content.size === 'lg' ? '18px' : content.size === 'xl' ? '22px' : content.size === 'xxl' ? '26px' : '14px'};
                        color: \${content.color || '#333'};
                        font-weight: \${content.weight || 'normal'};
                        margin-bottom: 8px;
                        \${content.wrap ? 'word-wrap: break-word;' : ''}
                    \`;
                    return \`<div style="\${style}">\${content.text}</div>\`;
                } else if (content.type === 'button') {
                    const buttonClass = content.style === 'primary' ? 'primary' : 'secondary';
                    return \`<button class="bubble-button \${buttonClass}">\${content.action.label}</button>\`;
                } else if (content.type === 'separator') {
                    return '<div style="height: 1px; background: #e0e0e0; margin: 10px 0;"></div>';
                } else if (content.type === 'box') {
                    return renderBox(content);
                }
                return '';
            }).join('');
        }

        // 驗證模板
        function validateTemplate() {
            try {
                const jsonContent = document.getElementById('jsonTextarea').value;
                const parsed = JSON.parse(jsonContent);
                
                // 基本驗證
                if (!parsed.type) {
                    throw new Error('缺少 type 屬性');
                }
                
                if (parsed.type !== 'bubble' && parsed.type !== 'carousel') {
                    throw new Error('type 必須是 bubble 或 carousel');
                }
                
                showSuccess('✅ JSON 格式驗證通過！');
            } catch (error) {
                showError('❌ 驗證失敗: ' + error.message);
            }
        }

        // 儲存模板
        async function saveTemplate() {
            try {
                const templateName = document.getElementById('templateName').value.trim();
                const jsonContent = document.getElementById('jsonTextarea').value.trim();
                
                if (!templateName) {
                    showError('請輸入模板名稱');
                    return;
                }
                
                if (!jsonContent) {
                    showError('請輸入 JSON 內容');
                    return;
                }
                
                // 驗證JSON格式
                JSON.parse(jsonContent);
                
                const saveBtn = document.getElementById('saveBtn');
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '儲存中...';
                saveBtn.disabled = true;
                
                const templateData = {
                    template_name: templateName,
                    description: '使用 Flex 編輯器建立',
                    template_type: 'bubble',
                    flex_content: jsonContent,
                    variables: JSON.stringify([]),
                    category: 'custom'
                };
                
                const method = currentTemplate ? 'PUT' : 'POST';
                const url = currentTemplate ? 
                    \`/api/flex-templates/\${currentTemplate.template_id}\` : 
                    '/api/flex-templates';
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(templateData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess('✅ 模板儲存成功！');
                    loadTemplates(); // 重新載入模板列表
                } else {
                    showError('❌ 儲存失敗: ' + (result.error || '未知錯誤'));
                }
                
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                
            } catch (error) {
                showError('❌ 儲存失敗: ' + error.message);
                document.getElementById('saveBtn').textContent = '💾 儲存';
                document.getElementById('saveBtn').disabled = false;
            }
        }

        // 測試發送
        async function sendTest() {
            try {
                const jsonContent = document.getElementById('jsonTextarea').value;
                if (!jsonContent.trim()) {
                    showError('請先建立模板內容');
                    return;
                }
                
                // 這裡可以實作測試發送功能
                showSuccess('🚧 測試發送功能開發中...');
                
            } catch (error) {
                showError('❌ 測試發送失敗: ' + error.message);
            }
        }

        // 添加元件 (視覺化編輯器功能)
        function addComponent(type) {
            showSuccess(\`🚧 新增\${type}元件功能開發中...\`);
        }

        // 載入特定模板
        async function loadTemplate(templateId) {
            try {
                const response = await fetch(\`/api/flex-templates/\${templateId}\`);
                const data = await response.json();
                
                if (data.success) {
                    loadTemplateContent(data.template);
                }
            } catch (error) {
                console.error('載入模板失敗:', error);
            }
        }

        // 顯示錯誤訊息
        function showError(message) {
            removeMessages();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            document.querySelector('.editor-toolbar').appendChild(errorDiv);
            
            setTimeout(() => errorDiv.remove(), 5000);
        }

        // 顯示成功訊息
        function showSuccess(message) {
            removeMessages();
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = message;
            document.querySelector('.editor-toolbar').appendChild(successDiv);
            
            setTimeout(() => successDiv.remove(), 3000);
        }

        // 移除訊息
        function removeMessages() {
            document.querySelectorAll('.error-message, .success-message').forEach(msg => msg.remove());
        }

        // JSON編輯器變更事件
        document.getElementById('jsonTextarea').addEventListener('input', function() {
            updatePreview();
        });
    </script>
</body>
</html>`;

  return new Response(flexEditorHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}