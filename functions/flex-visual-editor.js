// Flex Message 視覺化編輯器
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const templateId = url.searchParams.get('id');

  const flexVisualEditorHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flex Message 視覺化編輯器</title>
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
            z-index: 1000;
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

        /* 左側元件庫 */
        .component-panel {
            width: 280px;
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

        .component-list {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .component-category {
            margin-bottom: 25px;
        }

        .category-title {
            font-size: 14px;
            font-weight: bold;
            color: #666;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .component-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: grab;
            transition: all 0.2s;
            background: white;
        }

        .component-item:hover {
            border-color: #667eea;
            background: #f8f9ff;
            transform: translateY(-1px);
        }

        .component-item:active {
            cursor: grabbing;
        }

        .component-icon {
            font-size: 20px;
            margin-right: 12px;
            width: 24px;
            text-align: center;
        }

        .component-info {
            flex: 1;
        }

        .component-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
        }

        .component-desc {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }

        /* 中間視覺編輯區 */
        .visual-editor {
            flex: 1;
            background: #f0f2f5;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .editor-toolbar {
            background: white;
            padding: 15px 20px;
            border-bottom: 1px solid #e1e8ed;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .toolbar-group {
            display: flex;
            gap: 8px;
        }

        .toolbar-btn {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            color: #495057;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }

        .toolbar-btn:hover {
            background: #e9ecef;
        }

        .toolbar-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .phone-preview {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px;
        }

        .phone-frame {
            width: 375px;
            height: 600px;
            background: #000;
            border-radius: 25px;
            padding: 20px 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
        }

        .phone-screen {
            width: 100%;
            height: 100%;
            background: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
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
            background: #f0f0f0;
        }

        .message-bubble {
            background: white;
            border-radius: 15px;
            padding: 0;
            margin: 10px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-width: 280px;
            overflow: hidden;
        }

        /* 可編輯的 Flex 容器 */
        .flex-container {
            min-height: 200px;
            border: 2px dashed #ccc;
            background: rgba(255,255,255,0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 14px;
            transition: all 0.2s;
        }

        .flex-container.dragover {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }

        .flex-container:not(:empty) {
            background: white;
            border: none;
        }

        /* 右側屬性面板 */
        .properties-panel {
            width: 320px;
            background: white;
            border-left: 1px solid #e1e8ed;
            display: flex;
            flex-direction: column;
        }

        .properties-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .property-group {
            margin-bottom: 25px;
        }

        .property-label {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
            display: block;
        }

        .property-input {
            width: 100%;
            padding: 8px 12px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        .property-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .property-select {
            width: 100%;
            padding: 8px 12px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            font-size: 14px;
            background: white;
        }

        .color-picker {
            width: 100%;
            height: 40px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            cursor: pointer;
        }

        /* Flex 元件樣式 */
        .flex-element {
            position: relative;
            cursor: pointer;
            transition: all 0.2s;
        }

        .flex-element:hover {
            box-shadow: 0 0 0 2px #667eea;
        }

        .flex-element.selected {
            box-shadow: 0 0 0 2px #667eea;
        }

        .element-toolbar {
            position: absolute;
            top: -30px;
            right: 0;
            background: #667eea;
            border-radius: 4px;
            padding: 4px;
            display: none;
        }

        .flex-element.selected .element-toolbar {
            display: block;
        }

        .element-btn {
            background: none;
            border: none;
            color: white;
            padding: 4px 6px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 12px;
        }

        .element-btn:hover {
            background: rgba(255,255,255,0.2);
        }

        /* 拖拽指示器 */
        .drop-indicator {
            height: 2px;
            background: #667eea;
            margin: 2px 0;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .drop-indicator.show {
            opacity: 1;
        }

        /* 響應式設計 */
        @media (max-width: 1200px) {
            .component-panel {
                width: 250px;
            }
            .properties-panel {
                width: 280px;
            }
        }
    </style>
</head>
<body>
    <!-- 頭部工具列 -->
    <div class="editor-header">
        <div class="editor-title">📱 Flex Message 視覺化編輯器</div>
        <div class="editor-actions">
            <button class="btn" onclick="showJsonEditor()">📝 JSON</button>
            <button class="btn" onclick="previewTemplate()">👁️ 預覽</button>
            <button class="btn" onclick="saveTemplate()">💾 儲存</button>
            <button class="btn btn-primary" onclick="window.close()">✕ 關閉</button>
        </div>
    </div>

    <!-- 主要編輯區域 -->
    <div class="editor-main">
        <!-- 左側元件庫 -->
        <div class="component-panel">
            <div class="panel-header">
                <div class="panel-title">🧩 元件庫</div>
            </div>
            <div class="component-list">
                <div class="component-category">
                    <div class="category-title">基礎元件</div>
                    <div class="component-item" draggable="true" data-type="text">
                        <div class="component-icon">📝</div>
                        <div class="component-info">
                            <div class="component-name">文字</div>
                            <div class="component-desc">顯示文字內容</div>
                        </div>
                    </div>
                    <div class="component-item" draggable="true" data-type="image">
                        <div class="component-icon">🖼️</div>
                        <div class="component-info">
                            <div class="component-name">圖片</div>
                            <div class="component-desc">顯示圖片</div>
                        </div>
                    </div>
                    <div class="component-item" draggable="true" data-type="button">
                        <div class="component-icon">🔘</div>
                        <div class="component-info">
                            <div class="component-name">按鈕</div>
                            <div class="component-desc">可點擊按鈕</div>
                        </div>
                    </div>
                </div>
                
                <div class="component-category">
                    <div class="category-title">佈局元件</div>
                    <div class="component-item" draggable="true" data-type="box-vertical">
                        <div class="component-icon">⬇️</div>
                        <div class="component-info">
                            <div class="component-name">垂直容器</div>
                            <div class="component-desc">垂直排列元件</div>
                        </div>
                    </div>
                    <div class="component-item" draggable="true" data-type="box-horizontal">
                        <div class="component-icon">➡️</div>
                        <div class="component-info">
                            <div class="component-name">水平容器</div>
                            <div class="component-desc">水平排列元件</div>
                        </div>
                    </div>
                    <div class="component-item" draggable="true" data-type="separator">
                        <div class="component-icon">➖</div>
                        <div class="component-info">
                            <div class="component-name">分隔線</div>
                            <div class="component-desc">視覺分隔</div>
                        </div>
                    </div>
                    <div class="component-item" draggable="true" data-type="spacer">
                        <div class="component-icon">⬜</div>
                        <div class="component-info">
                            <div class="component-name">間距</div>
                            <div class="component-desc">增加空白間距</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 中間視覺編輯區 -->
        <div class="visual-editor">
            <div class="editor-toolbar">
                <div class="toolbar-group">
                    <button class="toolbar-btn active" data-view="bubble">🔵 氣泡</button>
                    <button class="toolbar-btn" data-view="carousel">🎠 輪播</button>
                </div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="undo()">↶ 復原</button>
                    <button class="toolbar-btn" onclick="redo()">↷ 重做</button>
                </div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="clearAll()">🗑️ 清空</button>
                </div>
            </div>

            <div class="phone-preview">
                <div class="phone-frame">
                    <div class="phone-screen">
                        <div class="chat-header">LINE Chat Preview</div>
                        <div class="chat-content">
                            <div class="message-bubble">
                                <div id="flex-canvas" class="flex-container" ondrop="drop(event)" ondragover="allowDrop(event)">
                                    <div>🎨 拖拽元件到這裡開始設計</div>
                                    <div style="font-size: 12px; margin-top: 5px; color: #999;">
                                        從左邊元件庫拖拽元件到此區域
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右側屬性面板 -->
        <div class="properties-panel">
            <div class="panel-header">
                <div class="panel-title">⚙️ 屬性設定</div>
            </div>
            <div class="properties-content" id="properties-content">
                <div style="text-align: center; color: #666; padding: 50px 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">⚙️</div>
                    <div>選擇元件以編輯屬性</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 全域變數
        let flexData = {
            type: 'bubble',
            body: null
        };
        let selectedElement = null;
        let elementCounter = 0;

        // 初始化編輯器
        async function initEditor() {
            console.log('視覺化編輯器初始化完成');
            
            // 工具列按鈕事件
            document.querySelectorAll('.toolbar-btn[data-view]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.toolbar-btn[data-view]').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    switchView(e.target.dataset.view);
                });
            });

            // 檢查是否有模板 ID 參數
            const urlParams = new URLSearchParams(window.location.search);
            const templateId = urlParams.get('id');
            
            if (templateId) {
                await loadTemplate(templateId);
            }
        }

        // 載入現有模板
        async function loadTemplate(templateId) {
            try {
                const response = await fetch('/api/flex-templates/' + templateId);
                const data = await response.json();
                
                if (data.success && data.template) {
                    const template = data.template;
                    document.querySelector('.editor-title').textContent = '📱 編輯模板: ' + template.template_name;
                    
                    // 解析 flex_content
                    const flexContent = JSON.parse(template.flex_content);
                    await loadFlexIntoEditor(flexContent);
                } else {
                    alert('載入模板失敗: ' + (data.error || '模板不存在'));
                }
            } catch (error) {
                console.error('載入模板錯誤:', error);
                alert('載入模板時發生錯誤');
            }
        }

        // 將 Flex JSON 載入到視覺化編輯器
        async function loadFlexIntoEditor(flexJson) {
            if (!flexJson || !flexJson.body || !flexJson.body.contents) {
                return;
            }

            const canvas = document.getElementById('flex-canvas');
            canvas.innerHTML = ''; // 清空畫布
            
            // 重置計數器和資料
            elementCounter = 0;
            window.elementsData = {};
            
            // 載入每個元件
            for (const content of flexJson.body.contents) {
                await addExistingComponent(content, canvas);
            }
        }

        // 添加現有元件（從 JSON 載入）
        async function addExistingComponent(contentData, container) {
            elementCounter++;
            const elementId = contentData.type + '_' + elementCounter;
            
            let elementHtml = '';

            switch(contentData.type) {
                case 'text':
                    elementHtml = \`<div class="flex-element text-element" data-id="\${elementId}" data-type="text" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <div style="padding: 8px; color: \${contentData.color || '#000'}; font-size: \${getSizePx(contentData.size || 'md')};">\${contentData.text || '文字內容'}</div>
                    </div>\`;
                    break;

                case 'image':
                    elementHtml = \`<div class="flex-element image-element" data-id="\${elementId}" data-type="image" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <img src="\${contentData.url || 'https://via.placeholder.com/300x200'}" style="width: 100%; height: 120px; object-fit: cover;">
                    </div>\`;
                    break;

                case 'button':
                    elementHtml = \`<div class="flex-element button-element" data-id="\${elementId}" data-type="button" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <button style="width: 100%; padding: 12px; background: \${contentData.style === 'primary' ? '#667eea' : '#f8f9fa'}; color: \${contentData.style === 'primary' ? 'white' : '#333'}; border: none; border-radius: 4px; cursor: pointer;">\${contentData.action?.label || '按鈕文字'}</button>
                    </div>\`;
                    break;

                case 'separator':
                    elementHtml = \`<div class="flex-element separator-element" data-id="\${elementId}" data-type="separator" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <hr style="border: none; height: 1px; background: #e1e8ed; margin: 10px 0;">
                    </div>\`;
                    break;

                default:
                    // 處理未知類型，顯示為文字
                    elementHtml = \`<div class="flex-element text-element" data-id="\${elementId}" data-type="text" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <div style="padding: 8px; color: #666;">未支援的元件類型: \${contentData.type}</div>
                    </div>\`;
                    contentData = { type: 'text', text: '未支援的元件類型: ' + contentData.type, color: '#666' };
                    break;
            }
            
            container.insertAdjacentHTML('beforeend', elementHtml);
            
            // 儲存元件資料
            if (!window.elementsData) window.elementsData = {};
            window.elementsData[elementId] = contentData;
        }

        // 輔助函數：尺寸轉換
        function getSizePx(size) {
            const sizes = { xs: '10px', sm: '12px', md: '14px', lg: '16px', xl: '18px', xxl: '20px' };
            return sizes[size] || '14px';
        }

        // 切換視圖模式
        function switchView(viewType) {
            flexData.type = viewType;
            console.log('切換到視圖模式:', viewType);
        }

        // 拖拽功能
        function allowDrop(ev) {
            ev.preventDefault();
            ev.currentTarget.classList.add('dragover');
        }

        function drop(ev) {
            ev.preventDefault();
            ev.currentTarget.classList.remove('dragover');
            
            const componentType = ev.dataTransfer.getData("text/plain");
            if (componentType) {
                addComponent(componentType, ev.currentTarget);
            }
        }

        // 拖拽開始
        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData("text/plain", e.currentTarget.dataset.type);
            });
        });

        // 拖拽離開
        document.getElementById('flex-canvas').addEventListener('dragleave', (e) => {
            e.currentTarget.classList.remove('dragover');
        });

        // 添加元件
        function addComponent(type, container) {
            elementCounter++;
            const elementId = type + '_' + elementCounter;
            
            let elementHtml = '';
            let elementData = {};

            switch(type) {
                case 'text':
                    elementData = {
                        type: 'text',
                        text: '文字內容',
                        size: 'md',
                        color: '#000000',
                        weight: 'regular'
                    };
                    elementHtml = \`<div class="flex-element text-element" data-id="\${elementId}" data-type="text" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <div style="padding: 8px;">\${elementData.text}</div>
                    </div>\`;
                    break;

                case 'image':
                    elementData = {
                        type: 'image',
                        url: 'https://via.placeholder.com/300x200',
                        size: 'full',
                        aspectRatio: '20:13'
                    };
                    elementHtml = \`<div class="flex-element image-element" data-id="\${elementId}" data-type="image" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <img src="\${elementData.url}" style="width: 100%; height: 120px; object-fit: cover;">
                    </div>\`;
                    break;

                case 'button':
                    elementData = {
                        type: 'button',
                        action: { type: 'uri', uri: 'https://example.com' },
                        style: 'primary',
                        height: 'sm'
                    };
                    elementHtml = \`<div class="flex-element button-element" data-id="\${elementId}" data-type="button" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <button style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">按鈕文字</button>
                    </div>\`;
                    break;

                case 'box-vertical':
                    elementData = {
                        type: 'box',
                        layout: 'vertical',
                        contents: []
                    };
                    elementHtml = \`<div class="flex-element box-element" data-id="\${elementId}" data-type="box" data-layout="vertical" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <div style="border: 2px dashed #ccc; padding: 20px; text-align: center; color: #666; min-height: 60px;" 
                             ondrop="dropInBox(event, '\${elementId}')" ondragover="allowDrop(event)">
                            垂直容器 - 拖拽元件到這裡
                        </div>
                    </div>\`;
                    break;

                case 'separator':
                    elementData = {
                        type: 'separator',
                        margin: 'md'
                    };
                    elementHtml = \`<div class="flex-element separator-element" data-id="\${elementId}" data-type="separator" onclick="selectElement('\${elementId}')">
                        <div class="element-toolbar">
                            <button class="element-btn" onclick="deleteElement('\${elementId}')">🗑️</button>
                        </div>
                        <hr style="border: none; height: 1px; background: #e1e8ed; margin: 10px 0;">
                    </div>\`;
                    break;
            }

            if (container.classList.contains('flex-container') && container.innerHTML.includes('拖拽元件到這裡')) {
                container.innerHTML = '';
            }
            
            container.insertAdjacentHTML('beforeend', elementHtml);
            
            // 儲存元件資料
            if (!window.elementsData) window.elementsData = {};
            window.elementsData[elementId] = elementData;
        }

        // 選擇元件
        function selectElement(elementId) {
            // 移除之前的選取狀態
            document.querySelectorAll('.flex-element').forEach(el => el.classList.remove('selected'));
            
            // 選取當前元件
            const element = document.querySelector(\`[data-id="\${elementId}"]\`);
            if (element) {
                element.classList.add('selected');
                selectedElement = elementId;
                showProperties(elementId);
            }
        }

        // 顯示屬性面板
        function showProperties(elementId) {
            const elementData = window.elementsData[elementId];
            if (!elementData) return;

            let propertiesHtml = \`<div class="property-group">
                <label class="property-label">元件 ID</label>
                <input type="text" class="property-input" value="\${elementId}" readonly>
            </div>\`;

            switch(elementData.type) {
                case 'text':
                    propertiesHtml += \`
                        <div class="property-group">
                            <label class="property-label">文字內容</label>
                            <textarea class="property-input" onchange="updateElementProperty('\${elementId}', 'text', this.value)">\${elementData.text}</textarea>
                        </div>
                        <div class="property-group">
                            <label class="property-label">字體大小</label>
                            <select class="property-select" onchange="updateElementProperty('\${elementId}', 'size', this.value)">
                                <option value="xs" \${elementData.size === 'xs' ? 'selected' : ''}>極小</option>
                                <option value="sm" \${elementData.size === 'sm' ? 'selected' : ''}>小</option>
                                <option value="md" \${elementData.size === 'md' ? 'selected' : ''}>中等</option>
                                <option value="lg" \${elementData.size === 'lg' ? 'selected' : ''}>大</option>
                                <option value="xl" \${elementData.size === 'xl' ? 'selected' : ''}>特大</option>
                            </select>
                        </div>
                        <div class="property-group">
                            <label class="property-label">文字顏色</label>
                            <input type="color" class="color-picker" value="\${elementData.color}" onchange="updateElementProperty('\${elementId}', 'color', this.value)">
                        </div>\`;
                    break;

                case 'image':
                    propertiesHtml += \`
                        <div class="property-group">
                            <label class="property-label">圖片網址</label>
                            <input type="url" class="property-input" value="\${elementData.url}" onchange="updateElementProperty('\${elementId}', 'url', this.value)">
                        </div>
                        <div class="property-group">
                            <label class="property-label">尺寸</label>
                            <select class="property-select" onchange="updateElementProperty('\${elementId}', 'size', this.value)">
                                <option value="full" \${elementData.size === 'full' ? 'selected' : ''}>滿版</option>
                                <option value="sm" \${elementData.size === 'sm' ? 'selected' : ''}>小</option>
                                <option value="md" \${elementData.size === 'md' ? 'selected' : ''}>中等</option>
                                <option value="lg" \${elementData.size === 'lg' ? 'selected' : ''}>大</option>
                            </select>
                        </div>\`;
                    break;
            }

            document.getElementById('properties-content').innerHTML = propertiesHtml;
        }

        // 更新元件屬性
        function updateElementProperty(elementId, property, value) {
            if (!window.elementsData[elementId]) return;
            
            window.elementsData[elementId][property] = value;
            
            // 更新視覺元素
            const element = document.querySelector(\`[data-id="\${elementId}"]\`);
            if (!element) return;

            switch(window.elementsData[elementId].type) {
                case 'text':
                    if (property === 'text') {
                        element.querySelector('div:last-child').textContent = value;
                    } else if (property === 'color') {
                        element.querySelector('div:last-child').style.color = value;
                    }
                    break;
                
                case 'image':
                    if (property === 'url') {
                        element.querySelector('img').src = value;
                    }
                    break;
            }
        }

        // 刪除元件
        function deleteElement(elementId) {
            const element = document.querySelector(\`[data-id="\${elementId}"]\`);
            if (element) {
                element.remove();
                delete window.elementsData[elementId];
                
                // 清空屬性面板
                if (selectedElement === elementId) {
                    document.getElementById('properties-content').innerHTML = \`
                        <div style="text-align: center; color: #666; padding: 50px 20px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">⚙️</div>
                            <div>選擇元件以編輯屬性</div>
                        </div>\`;
                    selectedElement = null;
                }
            }
        }

        // 工具列功能
        function showJsonEditor() {
            const flexJson = generateFlexJson();
            const jsonWindow = window.open('', '_blank', 'width=800,height=600');
            jsonWindow.document.write(\`
                <html>
                    <head><title>Flex JSON 預覽</title></head>
                    <body style="font-family: monospace; padding: 20px;">
                        <h3>生成的 Flex Message JSON</h3>
                        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto;">\${JSON.stringify(flexJson, null, 2)}</pre>
                        <br>
                        <button onclick="navigator.clipboard.writeText('\${JSON.stringify(flexJson).replace(/'/g, "\\\\'")}'); alert('已複製到剪貼簿!');">📋 複製 JSON</button>
                        <button onclick="window.close();" style="margin-left: 10px;">✕ 關閉</button>
                    </body>
                </html>
            \`);
        }

        function previewTemplate() {
            const flexJson = generateFlexJson();
            // 在新視窗開啟預覽
            const previewWindow = window.open('', '_blank', 'width=400,height=700');
            previewWindow.document.write(\`
                <html>
                    <head>
                        <title>Flex Message 預覽</title>
                        <style>
                            body { margin: 0; padding: 20px; background: #f0f0f0; font-family: sans-serif; }
                            .phone-preview { display: flex; justify-content: center; }
                            .phone-frame { width: 375px; background: #000; border-radius: 25px; padding: 20px 15px; }
                            .phone-screen { width: 100%; height: 600px; background: #f0f0f0; border-radius: 15px; overflow: hidden; }
                            .chat-header { background: #00b300; color: white; padding: 15px; text-align: center; font-weight: bold; }
                            .chat-content { padding: 20px; }
                            .message-bubble { background: white; border-radius: 15px; padding: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); overflow: hidden; }
                        </style>
                    </head>
                    <body>
                        <div class="phone-preview">
                            <div class="phone-frame">
                                <div class="phone-screen">
                                    <div class="chat-header">LINE Chat 預覽</div>
                                    <div class="chat-content">
                                        <div class="message-bubble">
                                            <div id="flex-preview"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <script>
                            const flexData = \${JSON.stringify(flexJson)};
                            document.getElementById('flex-preview').innerHTML = renderFlexMessage(flexData);
                            
                            function renderFlexMessage(flex) {
                                // 簡單的 Flex 渲染邏輯
                                if (flex.type === 'bubble' && flex.body) {
                                    return renderBox(flex.body);
                                }
                                return '<div style="padding: 20px; text-align: center; color: #666;">預覽載入中...</div>';
                            }
                            
                            function renderBox(box) {
                                if (!box.contents) return '';
                                return box.contents.map(content => {
                                    switch(content.type) {
                                        case 'text':
                                            return \`<div style="padding: 8px; color: \${content.color || '#000'}; font-size: \${getSizePixels(content.size || 'md')};">\${content.text || '文字'}</div>\`;
                                        case 'image':
                                            return \`<img src="\${content.url}" style="width: 100%; height: 120px; object-fit: cover;">\`;
                                        case 'separator':
                                            return '<hr style="border: none; height: 1px; background: #e1e8ed; margin: 10px 0;">';
                                        case 'button':
                                            return \`<button style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; margin: 5px 0;">按鈕</button>\`;
                                        default:
                                            return '';
                                    }
                                }).join('');
                            }
                            
                            function getSizePixels(size) {
                                const sizes = { xs: '10px', sm: '12px', md: '14px', lg: '16px', xl: '18px' };
                                return sizes[size] || '14px';
                            }
                        </script>
                    </body>
                </html>
            \`);
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
                        description: '視覺化編輯器建立',
                        template_type: flexData.type,
                        flex_content: JSON.stringify(flexJson),
                        category: 'custom'
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('模板儲存成功！模板 ID: ' + result.template_id);
                } else {
                    alert('儲存失敗：' + result.error);
                }
            } catch (error) {
                alert('儲存出錯：' + error.message);
            }
        }

        // 生成 Flex Message JSON
        function generateFlexJson() {
            const canvas = document.getElementById('flex-canvas');
            const elements = canvas.querySelectorAll('.flex-element');
            
            if (elements.length === 0) {
                return { type: 'bubble', body: { type: 'box', layout: 'vertical', contents: [] } };
            }
            
            const contents = Array.from(elements).map(element => {
                const elementId = element.dataset.id;
                const elementData = window.elementsData[elementId];
                return elementData || { type: 'text', text: 'Error' };
            });
            
            return {
                type: flexData.type,
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: contents
                }
            };
        }

        function undo() {
            alert('復原功能開發中...');
        }

        function redo() {
            alert('重做功能開發中...');
        }

        function clearAll() {
            if (confirm('確定要清空所有內容嗎？')) {
                document.getElementById('flex-canvas').innerHTML = \`
                    <div>🎨 拖拽元件到這裡開始設計</div>
                    <div style="font-size: 12px; margin-top: 5px; color: #999;">
                        從左邊元件庫拖拽元件到此區域
                    </div>\`;
                window.elementsData = {};
                selectedElement = null;
                document.getElementById('properties-content').innerHTML = \`
                    <div style="text-align: center; color: #666; padding: 50px 20px;">
                        <div style="font-size: 48px; margin-bottom: 15px;">⚙️</div>
                        <div>選擇元件以編輯屬性</div>
                    </div>\`;
            }
        }

        // 頁面載入完成後初始化
        document.addEventListener('DOMContentLoaded', initEditor);
    </script>
</body>
</html>`;

  return new Response(flexVisualEditorHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}