// 簡化版 Flex Message 編輯器
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const templateId = url.searchParams.get('id');

  const flexSimpleEditorHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flex Message 編輯器</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            height: 100vh;
            overflow: hidden;
        }

        /* 頭部工具列 */
        .editor-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
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
        }

        .btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .btn-primary {
            background: rgba(255,255,255,0.9);
            color: #667eea;
        }

        /* 主要編輯區域 */
        .editor-main {
            display: flex;
            height: calc(100vh - 70px);
        }

        /* 左側設定面板 */
        .settings-panel {
            width: 350px;
            background: white;
            border-right: 1px solid #e1e8ed;
            display: flex;
            flex-direction: column;
        }

        .panel-header {
            padding: 20px;
            border-bottom: 1px solid #e1e8ed;
            background: #f8f9fa;
        }

        .panel-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }

        .template-selector {
            padding: 20px;
            border-bottom: 1px solid #e1e8ed;
        }

        .template-type {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        .type-btn {
            flex: 1;
            padding: 15px 10px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
        }

        .type-btn:hover {
            border-color: #667eea;
        }

        .type-btn.active {
            border-color: #667eea;
            background: #f8f9ff;
        }

        .type-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .type-name {
            font-size: 14px;
            font-weight: 500;
        }

        .settings-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #333;
        }

        .form-input {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        .form-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .form-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
        }

        .form-select {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            font-size: 14px;
            background: white;
        }

        .color-input {
            width: 100%;
            height: 40px;
            padding: 0;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            cursor: pointer;
        }

        .button-list {
            margin-top: 10px;
        }

        .button-item {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            padding: 10px;
            border: 1px solid #e1e8ed;
            border-radius: 6px;
            background: #f8f9fa;
        }

        .button-item input {
            flex: 1;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
        }

        .remove-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        }

        .add-btn {
            width: 100%;
            padding: 10px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }

        /* 中間預覽區 */
        .preview-area {
            flex: 1;
            background: #f0f2f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px;
        }

        .phone-preview {
            width: 375px;
            height: 600px;
            background: #000;
            border-radius: 25px;
            padding: 20px 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .phone-screen {
            width: 100%;
            height: 100%;
            background: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .chat-header {
            background: #00b300;
            color: white;
            padding: 15px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        }

        .chat-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .message-bubble {
            background: white;
            border-radius: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .bubble-content {
            padding: 15px;
        }

        .bubble-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
        }

        .bubble-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }

        .bubble-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }

        .bubble-text {
            font-size: 14px;
            line-height: 1.4;
            color: #333;
        }

        .bubble-buttons {
            border-top: 1px solid #f0f0f0;
            padding: 10px 15px;
        }

        .bubble-button {
            display: block;
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            margin-bottom: 8px;
            cursor: pointer;
            font-size: 14px;
        }

        .bubble-button:last-child {
            margin-bottom: 0;
        }

        .bubble-button.secondary {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #dee2e6;
        }

        /* Carousel 樣式 */
        .carousel-container {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 10px 0;
        }

        .carousel-bubble {
            min-width: 250px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
        }
    </style>
</head>
<body>
    <!-- 頭部工具列 -->
    <div class="editor-header">
        <div class="editor-title">📱 Flex Message 編輯器</div>
        <div class="editor-actions">
            <button class="btn" onclick="showJsonPreview()">📝 檢視 JSON</button>
            <button class="btn" onclick="previewInNewWindow()">👁️ 預覽</button>
            <button class="btn" onclick="saveTemplate()">💾 儲存</button>
            <button class="btn btn-primary" onclick="window.close()">✕ 關閉</button>
        </div>
    </div>

    <!-- 主要編輯區域 -->
    <div class="editor-main">
        <!-- 左側設定面板 -->
        <div class="settings-panel">
            <div class="panel-header">
                <div class="panel-title">⚙️ 模板設定</div>
            </div>
            
            <!-- 模板類型選擇 -->
            <div class="template-selector">
                <label class="form-label">選擇模板類型</label>
                <div class="template-type">
                    <div class="type-btn active" onclick="selectTemplate('text')" data-type="text">
                        <div class="type-icon">📝</div>
                        <div class="type-name">純文字</div>
                    </div>
                    <div class="type-btn" onclick="selectTemplate('card')" data-type="card">
                        <div class="type-icon">🖼️</div>
                        <div class="type-name">圖文卡片</div>
                    </div>
                </div>
                
                <label class="form-label">顯示方式</label>
                <select class="form-select" id="displayType" onchange="updateDisplay()">
                    <option value="single">單一氣泡</option>
                    <option value="carousel">多個氣泡 (輪播)</option>
                </select>
                
                <div id="bubbleCount" style="display: none;">
                    <label class="form-label">氣泡數量</label>
                    <select class="form-select" id="bubbleCountSelect" onchange="updateBubbleCount()">
                        <option value="2">2 個</option>
                        <option value="3">3 個</option>
                        <option value="4">4 個</option>
                        <option value="5">5 個</option>
                    </select>
                </div>
            </div>

            <!-- 設定內容區 -->
            <div class="settings-content" id="settings-content">
                <!-- 動態載入設定表單 -->
            </div>
        </div>

        <!-- 中間預覽區 -->
        <div class="preview-area">
            <div class="phone-preview">
                <div class="phone-screen">
                    <div class="chat-header">LINE Chat 預覽</div>
                    <div class="chat-content" id="preview-content">
                        <!-- 動態產生預覽內容 -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 全域變數
        let currentTemplate = 'text';
        let currentDisplay = 'single';
        let bubbleCount = 1;
        let templateData = {
            text: {
                bubbles: [{
                    text: '這是一段文字訊息',
                    size: 'md',
                    color: '#000000',
                    buttons: []
                }]
            },
            card: {
                bubbles: [{
                    image: 'https://via.placeholder.com/300x180',
                    title: '卡片標題',
                    subtitle: '副標題',
                    text: '這裡是卡片的詳細描述內容...',
                    buttons: []
                }]
            }
        };

        // 初始化
        async function init() {
            // 檢查是否有模板 ID 參數
            const urlParams = new URLSearchParams(window.location.search);
            const templateId = urlParams.get('id');
            
            if (templateId) {
                await loadExistingTemplate(templateId);
            } else {
                selectTemplate('text');
                loadSettingsForm();
                updatePreview();
            }
        }

        // 載入現有模板
        async function loadExistingTemplate(templateId) {
            try {
                const response = await fetch('/api/flex-templates/' + templateId);
                const data = await response.json();
                
                if (data.success && data.template) {
                    const template = data.template;
                    document.querySelector('.editor-title').textContent = '📱 編輯模板: ' + template.template_name;
                    
                    // 解析 flex_content
                    const flexContent = JSON.parse(template.flex_content);
                    parseFlexJson(flexContent);
                    
                    loadSettingsForm();
                    updatePreview();
                } else {
                    alert('載入模板失敗: ' + (data.error || '模板不存在'));
                    // 載入失敗時使用預設模板
                    selectTemplate('text');
                    loadSettingsForm();
                    updatePreview();
                }
            } catch (error) {
                console.error('載入模板錯誤:', error);
                alert('載入模板時發生錯誤，使用預設模板');
                selectTemplate('text');
                loadSettingsForm();
                updatePreview();
            }
        }

        // 解析 Flex JSON 並載入到編輯器
        function parseFlexJson(flexJson) {
            if (flexJson.type === 'carousel') {
                // 輪播模式
                currentDisplay = 'carousel';
                document.getElementById('displayType').value = 'carousel';
                document.getElementById('bubbleCount').style.display = 'block';
                
                const bubbles = flexJson.contents || [];
                bubbleCount = bubbles.length;
                document.getElementById('bubbleCountSelect').value = bubbleCount.toString();
                
                // 判斷模板類型（檢查第一個氣泡）
                const firstBubble = bubbles[0];
                if (firstBubble && firstBubble.hero) {
                    currentTemplate = 'card';
                    document.querySelector('[data-type="card"]').classList.add('active');
                    document.querySelector('[data-type="text"]').classList.remove('active');
                } else {
                    currentTemplate = 'text';
                    document.querySelector('[data-type="text"]').classList.add('active');
                    document.querySelector('[data-type="card"]').classList.remove('active');
                }
                
                // 解析每個氣泡
                templateData[currentTemplate].bubbles = bubbles.map(bubble => parseBubbleData(bubble));
                
            } else {
                // 單一氣泡模式
                currentDisplay = 'single';
                document.getElementById('displayType').value = 'single';
                document.getElementById('bubbleCount').style.display = 'none';
                bubbleCount = 1;
                
                // 判斷模板類型
                if (flexJson.hero) {
                    currentTemplate = 'card';
                    document.querySelector('[data-type="card"]').classList.add('active');
                    document.querySelector('[data-type="text"]').classList.remove('active');
                } else {
                    currentTemplate = 'text';
                    document.querySelector('[data-type="text"]').classList.add('active');
                    document.querySelector('[data-type="card"]').classList.remove('active');
                }
                
                // 解析氣泡資料
                templateData[currentTemplate].bubbles = [parseBubbleData(flexJson)];
            }
        }

        // 解析單一氣泡資料
        function parseBubbleData(bubbleJson) {
            const bubbleData = {
                buttons: []
            };
            
            if (currentTemplate === 'text') {
                // 純文字模式
                const textContent = bubbleJson.body?.contents?.find(c => c.type === 'text');
                bubbleData.text = textContent?.text || '文字內容';
                bubbleData.size = textContent?.size || 'md';
                bubbleData.color = textContent?.color || '#000000';
            } else if (currentTemplate === 'card') {
                // 圖文卡片模式
                bubbleData.image = bubbleJson.hero?.url || 'https://via.placeholder.com/300x180';
                
                const contents = bubbleJson.body?.contents || [];
                bubbleData.title = contents.find(c => c.weight === 'bold')?.text || '卡片標題';
                bubbleData.subtitle = contents.find(c => c.size === 'sm' && c.color === '#666666')?.text || '副標題';
                bubbleData.text = contents.find(c => c.size === 'md' && c.wrap)?.text || '內容文字';
            }
            
            // 解析按鈕
            if (bubbleJson.footer && bubbleJson.footer.contents) {
                bubbleData.buttons = bubbleJson.footer.contents
                    .filter(c => c.type === 'button')
                    .map(btn => ({
                        label: btn.action?.label || '按鈕',
                        uri: btn.action?.uri || 'https://example.com'
                    }));
            }
            
            return bubbleData;
        }

        // 選擇模板類型
        function selectTemplate(type) {
            currentTemplate = type;
            
            // 更新按鈕狀態
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`[data-type="\${type}"]\`).classList.add('active');
            
            loadSettingsForm();
            updatePreview();
        }

        // 更新顯示方式
        function updateDisplay() {
            currentDisplay = document.getElementById('displayType').value;
            const bubbleCountDiv = document.getElementById('bubbleCount');
            
            if (currentDisplay === 'carousel') {
                bubbleCountDiv.style.display = 'block';
                updateBubbleCount();
            } else {
                bubbleCountDiv.style.display = 'none';
                bubbleCount = 1;
                // 保留第一個氣泡，移除其他
                templateData[currentTemplate].bubbles = [templateData[currentTemplate].bubbles[0]];
            }
            
            loadSettingsForm();
            updatePreview();
        }

        // 更新氣泡數量
        function updateBubbleCount() {
            const newCount = parseInt(document.getElementById('bubbleCountSelect').value);
            const currentBubbles = templateData[currentTemplate].bubbles;
            
            if (newCount > currentBubbles.length) {
                // 增加氣泡
                for (let i = currentBubbles.length; i < newCount; i++) {
                    currentBubbles.push(JSON.parse(JSON.stringify(currentBubbles[0])));
                }
            } else if (newCount < currentBubbles.length) {
                // 減少氣泡
                templateData[currentTemplate].bubbles = currentBubbles.slice(0, newCount);
            }
            
            bubbleCount = newCount;
            loadSettingsForm();
            updatePreview();
        }

        // 載入設定表單
        function loadSettingsForm() {
            const settingsContent = document.getElementById('settings-content');
            const bubbles = templateData[currentTemplate].bubbles;
            
            let formHtml = '';
            
            bubbles.forEach((bubble, bubbleIndex) => {
                const bubbleTitle = bubbles.length > 1 ? \`氣泡 \${bubbleIndex + 1}\` : '內容設定';
                
                formHtml += \`<div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px; color: #667eea;">\${bubbleTitle}</h4>\`;

                if (currentTemplate === 'text') {
                    formHtml += \`
                        <div class="form-group">
                            <label class="form-label">文字內容</label>
                            <textarea class="form-textarea" onchange="updateBubbleData(\${bubbleIndex}, 'text', this.value)">\${bubble.text}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">文字大小</label>
                            <select class="form-select" onchange="updateBubbleData(\${bubbleIndex}, 'size', this.value)">
                                <option value="xs" \${bubble.size === 'xs' ? 'selected' : ''}>極小</option>
                                <option value="sm" \${bubble.size === 'sm' ? 'selected' : ''}>小</option>
                                <option value="md" \${bubble.size === 'md' ? 'selected' : ''}>中等</option>
                                <option value="lg" \${bubble.size === 'lg' ? 'selected' : ''}>大</option>
                                <option value="xl" \${bubble.size === 'xl' ? 'selected' : ''}>特大</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">文字顏色</label>
                            <input type="color" class="color-input" value="\${bubble.color}" onchange="updateBubbleData(\${bubbleIndex}, 'color', this.value)">
                        </div>\`;
                } else if (currentTemplate === 'card') {
                    formHtml += \`
                        <div class="form-group">
                            <label class="form-label">圖片網址</label>
                            <input type="url" class="form-input" value="\${bubble.image}" onchange="updateBubbleData(\${bubbleIndex}, 'image', this.value)" placeholder="https://example.com/image.jpg">
                        </div>
                        <div class="form-group">
                            <label class="form-label">標題</label>
                            <input type="text" class="form-input" value="\${bubble.title}" onchange="updateBubbleData(\${bubbleIndex}, 'title', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">副標題</label>
                            <input type="text" class="form-input" value="\${bubble.subtitle}" onchange="updateBubbleData(\${bubbleIndex}, 'subtitle', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">內容文字</label>
                            <textarea class="form-textarea" onchange="updateBubbleData(\${bubbleIndex}, 'text', this.value)">\${bubble.text}</textarea>
                        </div>\`;
                }

                // 按鈕設定
                formHtml += \`
                    <div class="form-group">
                        <label class="form-label">按鈕設定</label>
                        <div class="button-list" id="buttons-\${bubbleIndex}">
                \`;

                bubble.buttons.forEach((button, buttonIndex) => {
                    formHtml += \`
                        <div class="button-item">
                            <input type="text" placeholder="按鈕文字" value="\${button.label}" onchange="updateButtonData(\${bubbleIndex}, \${buttonIndex}, 'label', this.value)">
                            <input type="url" placeholder="連結網址" value="\${button.uri}" onchange="updateButtonData(\${bubbleIndex}, \${buttonIndex}, 'uri', this.value)">
                            <button class="remove-btn" onclick="removeButton(\${bubbleIndex}, \${buttonIndex})">刪除</button>
                        </div>
                    \`;
                });

                formHtml += \`
                        </div>
                        <button class="add-btn" onclick="addButton(\${bubbleIndex})">➕ 新增按鈕</button>
                    </div>
                </div>\`;
            });

            settingsContent.innerHTML = formHtml;
        }

        // 更新氣泡資料
        function updateBubbleData(bubbleIndex, field, value) {
            templateData[currentTemplate].bubbles[bubbleIndex][field] = value;
            updatePreview();
        }

        // 更新按鈕資料
        function updateButtonData(bubbleIndex, buttonIndex, field, value) {
            templateData[currentTemplate].bubbles[bubbleIndex].buttons[buttonIndex][field] = value;
            updatePreview();
        }

        // 新增按鈕
        function addButton(bubbleIndex) {
            templateData[currentTemplate].bubbles[bubbleIndex].buttons.push({
                label: '新按鈕',
                uri: 'https://example.com'
            });
            loadSettingsForm();
            updatePreview();
        }

        // 移除按鈕
        function removeButton(bubbleIndex, buttonIndex) {
            templateData[currentTemplate].bubbles[bubbleIndex].buttons.splice(buttonIndex, 1);
            loadSettingsForm();
            updatePreview();
        }

        // 更新預覽
        function updatePreview() {
            const previewContent = document.getElementById('preview-content');
            const bubbles = templateData[currentTemplate].bubbles;
            
            if (currentDisplay === 'carousel' && bubbles.length > 1) {
                // 輪播顯示
                let carouselHtml = '<div class="carousel-container">';
                bubbles.forEach((bubble, index) => {
                    carouselHtml += \`<div class="carousel-bubble">\${renderBubble(bubble)}</div>\`;
                });
                carouselHtml += '</div>';
                previewContent.innerHTML = carouselHtml;
            } else {
                // 單一氣泡顯示
                previewContent.innerHTML = bubbles.map(bubble => 
                    \`<div class="message-bubble">\${renderBubble(bubble)}</div>\`
                ).join('');
            }
        }

        // 渲染氣泡內容
        function renderBubble(bubble) {
            let bubbleHtml = '';
            
            if (currentTemplate === 'text') {
                const fontSize = getSizePixels(bubble.size);
                bubbleHtml = \`
                    <div class="bubble-content">
                        <div class="bubble-text" style="font-size: \${fontSize}; color: \${bubble.color};">
                            \${bubble.text.replace(/\\n/g, '<br>')}
                        </div>
                    </div>
                \`;
            } else if (currentTemplate === 'card') {
                bubbleHtml = \`
                    <img src="\${bubble.image}" class="bubble-image" alt="卡片圖片">
                    <div class="bubble-content">
                        <div class="bubble-title">\${bubble.title}</div>
                        <div class="bubble-subtitle">\${bubble.subtitle}</div>
                        <div class="bubble-text">\${bubble.text.replace(/\\n/g, '<br>')}</div>
                    </div>
                \`;
            }
            
            // 新增按鈕
            if (bubble.buttons && bubble.buttons.length > 0) {
                bubbleHtml += '<div class="bubble-buttons">';
                bubble.buttons.forEach((button, index) => {
                    const buttonClass = index === 0 ? 'bubble-button' : 'bubble-button secondary';
                    bubbleHtml += \`<button class="\${buttonClass}">\${button.label}</button>\`;
                });
                bubbleHtml += '</div>';
            }
            
            return bubbleHtml;
        }

        // 輔助函數：尺寸轉像素
        function getSizePixels(size) {
            const sizeMap = {
                'xs': '12px',
                'sm': '14px', 
                'md': '16px',
                'lg': '18px',
                'xl': '20px'
            };
            return sizeMap[size] || '16px';
        }

        // 生成 Flex JSON
        function generateFlexJson() {
            const bubbles = templateData[currentTemplate].bubbles;
            
            if (currentDisplay === 'carousel' && bubbles.length > 1) {
                // Carousel 格式
                return {
                    type: 'carousel',
                    contents: bubbles.map(bubble => generateBubbleJson(bubble))
                };
            } else {
                // 單一 Bubble 格式
                return generateBubbleJson(bubbles[0]);
            }
        }

        // 生成單一氣泡 JSON
        function generateBubbleJson(bubble) {
            const bubbleJson = {
                type: 'bubble'
            };

            if (currentTemplate === 'card') {
                // 圖片區域
                bubbleJson.hero = {
                    type: 'image',
                    url: bubble.image,
                    size: 'full',
                    aspectRatio: '20:13',
                    aspectMode: 'cover'
                };
            }

            // 內容區域
            const contents = [];
            
            if (currentTemplate === 'text') {
                contents.push({
                    type: 'text',
                    text: bubble.text,
                    size: bubble.size,
                    color: bubble.color,
                    wrap: true
                });
            } else if (currentTemplate === 'card') {
                contents.push({
                    type: 'text',
                    text: bubble.title,
                    weight: 'bold',
                    size: 'lg'
                });
                
                if (bubble.subtitle) {
                    contents.push({
                        type: 'text',
                        text: bubble.subtitle,
                        size: 'sm',
                        color: '#666666',
                        margin: 'md'
                    });
                }
                
                contents.push({
                    type: 'text',
                    text: bubble.text,
                    size: 'md',
                    color: '#333333',
                    margin: 'md',
                    wrap: true
                });
            }

            bubbleJson.body = {
                type: 'box',
                layout: 'vertical',
                contents: contents
            };

            // 按鈕區域
            if (bubble.buttons && bubble.buttons.length > 0) {
                bubbleJson.footer = {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: bubble.buttons.map((button, index) => ({
                        type: 'button',
                        style: index === 0 ? 'primary' : 'secondary',
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: button.label,
                            uri: button.uri
                        }
                    }))
                };
            }

            return bubbleJson;
        }

        // 工具列功能
        function showJsonPreview() {
            const flexJson = generateFlexJson();
            const jsonWindow = window.open('', '_blank', 'width=800,height=600');
            jsonWindow.document.write(\`
                <html>
                    <head><title>Flex Message JSON</title></head>
                    <body style="font-family: monospace; padding: 20px;">
                        <h3>生成的 Flex Message JSON</h3>
                        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto; white-space: pre-wrap;">\${JSON.stringify(flexJson, null, 2)}</pre>
                        <br>
                        <button onclick="navigator.clipboard.writeText('\${JSON.stringify(flexJson).replace(/'/g, "\\\\'")}'); alert('JSON 已複製到剪貼簿!');" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 複製 JSON</button>
                        <button onclick="window.close();" style="margin-left: 10px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">✕ 關閉</button>
                    </body>
                </html>
            \`);
        }

        function previewInNewWindow() {
            alert('預覽功能開發中...');
        }

        async function saveTemplate() {
            const flexJson = generateFlexJson();
            const templateName = prompt('請輸入模板名稱:');
            
            if (!templateName) return;
            
            try {
                const response = await fetch('/api/flex-templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_name: templateName,
                        description: \`\${currentTemplate === 'text' ? '純文字' : '圖文卡片'}模板\`,
                        template_type: currentDisplay === 'carousel' ? 'carousel' : 'bubble',
                        flex_content: JSON.stringify(flexJson),
                        category: 'custom'
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('模板儲存成功！\\n模板 ID: ' + result.template_id);
                } else {
                    alert('儲存失敗：' + result.error);
                }
            } catch (error) {
                alert('儲存出錯：' + error.message);
            }
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;

  return new Response(flexSimpleEditorHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}