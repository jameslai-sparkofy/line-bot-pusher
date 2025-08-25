// Flex Carousel 專業編輯器 - 房地產專用
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const templateId = url.searchParams.get('id');
  const categoryId = url.searchParams.get('category') || 'construction_progress';

  const flexCarouselEditorHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flex Carousel 編輯器 - 房地產專用</title>
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
            font-size: 14px;
        }

        .btn:hover {
            background: rgba(255,255,255,0.3);
        }

        .btn-primary {
            background: rgba(255,255,255,0.9);
            color: #667eea;
            font-weight: 500;
        }

        /* 主要編輯區域 */
        .editor-main {
            display: flex;
            height: calc(100vh - 70px);
        }

        /* 左側模板選擇面板 */
        .template-panel {
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
            margin-bottom: 10px;
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .template-list {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
        }

        .template-item {
            padding: 12px 15px;
            margin-bottom: 8px;
            background: white;
            border: 1px solid #e1e8ed;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }

        .template-item:hover {
            background: #f8f9ff;
            border-color: #667eea;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .template-item.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .template-item-title {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .template-item-info {
            font-size: 12px;
            color: #666;
        }

        .template-item.active .template-item-info {
            color: rgba(255,255,255,0.8);
        }

        .template-item-actions {
            display: flex;
            gap: 5px;
            margin-top: 8px;
        }

        .template-delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            cursor: pointer;
        }

        .template-delete-btn:hover {
            background: #c82333;
        }

        /* 中間內容編輯區 */
        .content-editor {
            flex: 1;
            background: white;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #e1e8ed;
        }

        .tabs-header {
            padding: 15px 20px;
            border-bottom: 1px solid #e1e8ed;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .carousel-tabs {
            display: flex;
            gap: 8px;
            flex: 1;
        }

        .tab-item {
            background: #e9ecef;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .tab-item:hover {
            background: #dee2e6;
        }

        .tab-item.active {
            background: #667eea;
            color: white;
        }

        .tab-close {
            margin-left: 8px;
            font-weight: bold;
            opacity: 0.7;
        }

        .tab-close:hover {
            opacity: 1;
        }

        .add-tab {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
        }

        .content-form {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .form-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f0f0f0;
        }

        .form-section:last-child {
            border-bottom: none;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }

        .section-icon {
            margin-right: 8px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
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
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

        /* 右側預覽區 */
        .preview-area {
            width: 400px;
            background: #f0f2f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 20px;
        }

        .phone-preview {
            width: 320px;
            height: 580px;
            background: #000;
            border-radius: 25px;
            padding: 15px 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
        }

        .phone-screen {
            width: 100%;
            height: 100%;
            background: #f0f0f0;
            border-radius: 18px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .chat-header {
            background: #00b300;
            color: white;
            padding: 12px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
        }

        .chat-content {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
        }

        .carousel-preview {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 10px 0;
        }

        .bubble-preview {
            min-width: 200px;
            max-width: 200px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .bubble-image {
            width: 100%;
            height: 100px;
            object-fit: cover;
            background: #f0f0f0;
        }

        .bubble-content {
            padding: 12px;
        }

        .bubble-title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
        }

        .bubble-buttons {
            padding: 8px 12px;
            border-top: 1px solid #f0f0f0;
        }

        .bubble-button {
            display: block;
            width: 100%;
            padding: 8px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 4px;
            margin-bottom: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .bubble-button:last-child {
            margin-bottom: 0;
        }

        .bubble-button.secondary {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #dee2e6;
        }

        .bubble-button.share {
            background: #1db446;
        }
    </style>
</head>
<body>
    <!-- 頭部工具列 -->
    <div class="editor-header">
        <div class="editor-title" id="editor-title" onclick="editTemplateTitle()" style="cursor: pointer;">🏗️ Flex Carousel 編輯器</div>
        <div class="editor-actions">
            <button class="btn" onclick="showJsonPreview()">📝 檢視 JSON</button>
            <button class="btn btn-primary" onclick="window.close()">✕ 關閉</button>
        </div>
    </div>

    <!-- 主要編輯區域 -->
    <div class="editor-main">
        <!-- 左側模板面板 -->
        <div class="template-panel">
            <div class="panel-header">
                <div class="panel-title">📋 模板</div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn" onclick="addNewTemplate()" style="background: #28a745; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px;">+ 新增</button>
                    <button class="btn" onclick="saveTemplate()" style="background: #007bff; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px;">💾 儲存</button>
                </div>
            </div>
            <div class="template-list" id="template-list">
                <!-- 動態載入模板列表 -->
            </div>
        </div>

        <!-- 中間內容編輯區 -->
        <div class="content-editor">
            <!-- 模板標題 -->
            <div style="padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #e1e8ed;">
                <input type="text" id="template-title" class="form-input" placeholder="模板標題" style="font-size: 16px; font-weight: bold; border: 1px solid #ddd; padding: 8px 12px;" onchange="updateCurrentTemplateTitle(this.value)">
            </div>
            <div class="tabs-header">
                <div class="carousel-tabs" id="carousel-tabs">
                    <!-- 動態載入分頁標籤 -->
                </div>
                <button class="add-tab" onclick="addNewTab()">+ 新增分頁</button>
            </div>

            <div class="content-form" id="content-form">
                <!-- 動態載入表單內容 -->
            </div>
        </div>

        <!-- 右側預覽區 -->
        <div class="preview-area">
            <div class="phone-preview">
                <div class="phone-screen">
                    <div class="chat-header">LINE Chat 預覽</div>
                    <div class="chat-content">
                        <div class="carousel-preview" id="carousel-preview">
                            <!-- 動態產生預覽內容 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 全域變數
        let currentTemplateIndex = 0;
        let currentTabIndex = 0;
        let templates = [];
        let carouselData = {
            type: 'carousel',
            contents: []
        };

        // 預設模板
        const defaultBubbleTemplate = {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": "https://developers-resource.landpress.line.me/fx/img/01_2_restaurant.png",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover",
                "action": {
                    "type": "uri",
                    "uri": "https://line.me/"
                }
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "action": {
                    "type": "uri",
                    "uri": "https://line.me/"
                },
                "contents": [
                    {
                        "type": "text",
                        "text": "勝美 - 建功段",
                        "size": "xl",
                        "weight": "bold"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "baseline",
                                "contents": [
                                    {
                                        "type": "icon",
                                        "url": "https://developers-resource.landpress.line.me/fx/img/restaurant_regular_32.png"
                                    },
                                    {
                                        "type": "text",
                                        "text": "A棟",
                                        "weight": "bold",
                                        "margin": "sm",
                                        "flex": 0
                                    },
                                    {
                                        "type": "text",
                                        "text": "95%",
                                        "size": "sm",
                                        "align": "end",
                                        "color": "#aaaaaa"
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "contents": [
                                    {
                                        "type": "icon",
                                        "url": "https://developers-resource.landpress.line.me/fx/img/restaurant_large_32.png"
                                    },
                                    {
                                        "type": "text",
                                        "text": "B棟",
                                        "weight": "bold",
                                        "margin": "sm",
                                        "flex": 0
                                    },
                                    {
                                        "type": "text",
                                        "text": "80%",
                                        "size": "sm",
                                        "align": "end",
                                        "color": "#aaaaaa"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "text",
                        "text": "2025-08-24 進度報告",
                        "wrap": true,
                        "color": "#aaaaaa",
                        "size": "xs"
                    }
                ],
                "paddingBottom": "xs"
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "style": "secondary",
                        "color": "#84C7D0",
                        "margin": "lg",
                        "action": {
                            "type": "uri",
                            "label": "了解更多",
                            "uri": "https://line.me/"
                        },
                        "offsetTop": "none",
                        "offsetEnd": "none",
                        "offsetStart": "none",
                        "offsetBottom": "xs"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "分享",
                            "uri": "http://linecorp.com/"
                        },
                        "offsetTop": "none",
                        "offsetEnd": "none",
                        "offsetBottom": "none",
                        "offsetStart": "none",
                        "adjustMode": "shrink-to-fit",
                        "margin": "md",
                        "style": "secondary"
                    }
                ],
                "paddingAll": "md",
                "paddingTop": "none"
            }
        };

        // 初始化編輯器
        async function init() {
            console.log('Carousel 編輯器初始化...');
            
            // 載入已儲存的模板
            await loadTemplates();
            
            // 如果沒有模板，建立第一個預設模板
            if (templates.length === 0) {
                addNewTemplate();
            } else {
                selectTemplate(0);
            }
            
            updateTabs();
            updatePreview();
        }

        // 編輯模板標題
        function editTemplateTitle() {
            if (templates.length === 0) return;
            
            const currentTemplate = templates[currentTemplateIndex];
            const newName = prompt('請輸入新的模板名稱:', currentTemplate.name);
            
            if (newName && newName !== currentTemplate.name) {
                currentTemplate.name = newName;
                document.getElementById('editor-title').textContent = '📝 ' + newName;
                renderTemplateList();
            }
        }

        // 載入已儲存的模板
        async function loadTemplates() {
            try {
                const response = await fetch('/api/flex-templates');
                const data = await response.json();
                
                if (data.success && data.templates) {
                    templates = data.templates.map(t => ({
                        id: t.template_id,
                        name: t.template_name,
                        carouselData: JSON.parse(t.flex_content)
                    }));
                }
            } catch (error) {
                console.error('載入模板失敗:', error);
                templates = [];
            }
            
            renderTemplateList();
        }

        // 渲染模板列表
        function renderTemplateList() {
            const container = document.getElementById('template-list');
            let html = '';
            
            templates.forEach((template, index) => {
                const isActive = index === currentTemplateIndex;
                const bubbleCount = template.carouselData?.contents?.length || 0;
                
                html += '<div class="template-item' + (isActive ? ' active' : '') + '" onclick="selectTemplate(' + index + ')">';
                html += '<div class="template-item-title">' + template.name + '</div>';
                html += '<div class="template-item-info">' + bubbleCount + ' 個分頁</div>';
                html += '<div class="template-item-actions">';
                html += '<button class="template-delete-btn" onclick="event.stopPropagation(); deleteTemplate(' + index + ')">刪除</button>';
                html += '</div>';
                html += '</div>';
            });
            
            container.innerHTML = html;
        }

        // 更新當前模板標題
        function updateCurrentTemplateTitle(title) {
            if (templates.length > 0 && title) {
                templates[currentTemplateIndex].name = title;
                document.getElementById('editor-title').textContent = '📝 ' + title;
                renderTemplateList();
            }
        }

        // 選擇模板
        function selectTemplate(index) {
            if (index >= 0 && index < templates.length) {
                currentTemplateIndex = index;
                carouselData = templates[index].carouselData;
                currentTabIndex = 0;
                
                document.querySelector('.editor-title').textContent = '📝 ' + templates[index].name;
                document.getElementById('template-title').value = templates[index].name;
                
                renderTemplateList();
                updateTabs();
                updatePreview();
            }
        }

        // 新增模板
        function addNewTemplate() {
            const templateName = prompt('請輸入模板名稱:', '新模板 ' + (templates.length + 1));
            if (!templateName) return;
            
            const newTemplate = {
                id: 'temp_' + Date.now(),
                name: templateName,
                carouselData: {
                    type: 'carousel',
                    contents: [JSON.parse(JSON.stringify(defaultBubbleTemplate))]
                }
            };
            
            templates.push(newTemplate);
            currentTemplateIndex = templates.length - 1;
            carouselData = newTemplate.carouselData;
            currentTabIndex = 0;
            
            document.querySelector('.editor-title').textContent = '📝 ' + templateName;
            
            renderTemplateList();
            updateTabs();
            updatePreview();
        }

        // 刪除模板
        async function deleteTemplate(index) {
            if (templates.length <= 1) {
                alert('至少需要保留一個模板');
                return;
            }
            
            if (!confirm('確定要刪除模板 "' + templates[index].name + '" 嗎？')) {
                return;
            }

            const templateToDelete = templates[index];
            
            // 如果有 template_id，從資料庫刪除
            if (templateToDelete.id && !templateToDelete.id.startsWith('temp_')) {
                try {
                    const response = await fetch('/api/flex-templates/' + templateToDelete.id, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (!result.success) {
                        console.error('Delete template failed:', result.error);
                    }
                } catch (error) {
                    console.error('Delete template error:', error);
                }
            }
            
            templates.splice(index, 1);
            
            // 調整當前選中的模板索引
            if (currentTemplateIndex >= templates.length) {
                currentTemplateIndex = templates.length - 1;
            } else if (currentTemplateIndex >= index && currentTemplateIndex > 0) {
                currentTemplateIndex--;
            }
            
            // 切換到調整後的模板
            if (templates.length > 0) {
                carouselData = templates[currentTemplateIndex].carouselData;
                document.querySelector('.editor-title').textContent = '📝 ' + templates[currentTemplateIndex].name;
                document.getElementById('template-title').value = templates[currentTemplateIndex].name;
            }
            
            renderTemplateList();
            updateTabs();
            updatePreview();
        }

        // 載入預設模板（保留向後兼容）
        function loadDefaultTemplate() {
            // 這個函數現在主要用於向後兼容
            // 實際的模板載入在 init() 中處理
        }

        // 更新分頁標籤
        function updateTabs() {
            const tabsContainer = document.getElementById('carousel-tabs');
            let html = '';
            
            carouselData.contents.forEach((bubble, index) => {
                const isActive = index === currentTabIndex;
                const title = getBubbleTitle(bubble, index);
                html += '<button class="tab-item' + (isActive ? ' active' : '') + '" onclick="selectTab('+index+')">';
                html += title;
                if (carouselData.contents.length > 1) {
                    html += '<span class="tab-close" onclick="event.stopPropagation(); removeTab('+index+')">×</span>';
                }
                html += '</button>';
            });
            
            tabsContainer.innerHTML = html;
            loadTabContent();
        }

        // 取得氣泡標題
        function getBubbleTitle(bubble, index) {
            // 查找主標題（第一個 text 元素且 weight 為 bold）
            const titleContent = bubble.body?.contents?.find(c => 
                c.type === 'text' && c.weight === 'bold'
            );
            
            if (titleContent?.text) {
                return titleContent.text.length > 8 ? 
                    titleContent.text.substring(0, 8) + '...' : 
                    titleContent.text;
            }
            
            return '分頁 ' + (index + 1);
        }

        // 選擇分頁
        function selectTab(index) {
            if (index >= 0 && index < carouselData.contents.length) {
                currentTabIndex = index;
                updateTabs();
            }
        }

        // 新增分頁
        function addNewTab() {
            const newBubble = JSON.parse(JSON.stringify(defaultBubbleTemplate));
            // 修改標題為新的分頁編號
            newBubble.body.contents[0].text = '分頁 ' + (carouselData.contents.length + 1);
            
            carouselData.contents.push(newBubble);
            currentTabIndex = carouselData.contents.length - 1;
            
            // 更新對應的模板
            templates[currentTemplateIndex].carouselData = carouselData;
            
            renderTemplateList();
            updateTabs();
            updatePreview();
        }

        // 移除分頁
        function removeTab(index) {
            if (carouselData.contents.length > 1) {
                carouselData.contents.splice(index, 1);
                if (currentTabIndex >= carouselData.contents.length) {
                    currentTabIndex = carouselData.contents.length - 1;
                }
                if (currentTabIndex >= index && currentTabIndex > 0) {
                    currentTabIndex--;
                }
                
                // 更新對應的模板
                templates[currentTemplateIndex].carouselData = carouselData;
                
                renderTemplateList();
                updateTabs();
                updatePreview();
            } else {
                alert('至少需要保留一個分頁');
            }
        }

        // 載入分頁內容表單
        function loadTabContent() {
            const form = document.getElementById('content-form');
            const bubble = carouselData.contents[currentTabIndex];
            
            if (!bubble) return;
            
            let html = '';
            
            // 主圖設定
            html += '<div class="form-section">';
            html += '<div class="section-title"><span class="section-icon">🖼️</span>主圖設定</div>';
            html += '<div class="form-group">';
            html += '<label class="form-label">圖片上傳</label>';
            html += '<input type="file" class="form-input hero-upload" accept="image/*" onchange="uploadHeroImage(this)" style="margin-bottom: 5px;">';
            html += '<div class="upload-status" style="font-size: 12px; color: #666; margin-bottom: 5px;"></div>';
            html += '<img class="hero-preview" src="' + (bubble.hero?.url || '') + '" style="max-width: 100%; height: 100px; object-fit: cover; border-radius: 4px; display: ' + (bubble.hero?.url ? 'block' : 'none') + ';">';
            html += '</div>';
            html += '</div>';
            
            // 內容設定 - 按順序定義內容元素
            const body = bubble.body?.contents || [];
            const titleContent = body[0]; // 主標題（第一個元素）
            const subtitleContent = body.find(c => c.type === 'text' && c !== titleContent && c.color !== '#aaaaaa' && c.size !== 'xs' && !c.wrap); // 副標題（普通文字）
            const buildingBox = body.find(c => c.type === 'box' && c.layout === 'vertical' && c.spacing === 'sm'); // 棟別box
            const bottomContent = body.find(c => c.type === 'text' && c !== titleContent && c !== subtitleContent && c.wrap === true); // 下方內容（有wrap的文字）
            const dateContent = body.find(c => c.type === 'text' && c.color === '#aaaaaa' && c.size === 'xs'); // 日期資訊（灰色小字）
            
            html += '<div class="form-section">';
            html += '<div class="section-title"><span class="section-icon">📝</span>內容設定</div>';
            html += '<div class="form-group">';
            html += '<label class="form-label">主標題</label>';
            html += '<input type="text" class="form-input" value="' + (titleContent?.text || '') + '" onchange="updateMainTitle(this.value)" placeholder="例：勝美 - 建功段">';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<label class="form-label">副標題</label>';
            html += '<input type="text" class="form-input" value="' + (subtitleContent?.text || '') + '" onchange="updateSubtitle(this.value)" placeholder="例：台北市信義區">';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<label class="form-label">下方內容</label>';
            html += '<textarea class="form-textarea" onchange="updateBottomContent(this.value)" placeholder="例：工程進度說明或其他補充資訊">' + (bottomContent?.text || '') + '</textarea>';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<label class="form-label">日期資訊</label>';
            html += '<input type="text" class="form-input" value="' + (dateContent?.text || '') + '" onchange="updateDateInfo(this.value)" placeholder="例：2025-08-24 進度報告">';
            html += '</div>';
            html += '</div>';
            
            // 棟別資料設定
            html += '<div class="form-section">';
            html += '<div class="section-title"><span class="section-icon">🏢</span>棟別資料設定</div>';
            if (buildingBox?.contents) {
                buildingBox.contents.forEach((building, index) => {
                    if (building.type === 'box' && building.layout === 'baseline') {
                        const buildingName = building.contents.find(c => c.type === 'text' && c.weight === 'bold')?.text || '';
                        const percentage = building.contents.find(c => c.type === 'text' && c.align === 'end')?.text || '';
                        
                        html += '<div class="form-group" style="border: 1px solid #e1e8ed; padding: 10px; margin-bottom: 10px; border-radius: 4px;">';
                        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">';
                        html += '<label class="form-label" style="margin-bottom: 0;">棟別 ' + (index + 1) + '</label>';
                        html += '<button type="button" class="template-delete-btn" onclick="removeBuilding(' + index + ')" style="font-size: 12px; padding: 2px 8px;">刪除</button>';
                        html += '</div>';
                        html += '<div style="display: flex; gap: 10px;">';
                        html += '<input type="text" class="form-input" value="' + buildingName + '" onchange="updateBuildingName(' + index + ', this.value)" placeholder="例：A棟" style="flex: 1;">';
                        html += '<input type="text" class="form-input" value="' + percentage + '" onchange="updateBuildingPercentage(' + index + ', this.value)" placeholder="例：95%" style="flex: 1;">';
                        html += '</div>';
                        html += '</div>';
                    }
                });
            }
            html += '<button type="button" class="btn" onclick="addBuilding()" style="background: #28a745; color: white;">+ 新增棟別</button>';
            html += '</div>';
            
            // 按鈕設定
            const buttons = bubble.footer?.contents || [];
            html += '<div class="form-section">';
            html += '<div class="section-title"><span class="section-icon">🔘</span>按鈕設定</div>';
            buttons.forEach((button, index) => {
                html += '<div class="form-group" style="border: 1px solid #e1e8ed; padding: 10px; margin-bottom: 10px; border-radius: 4px;">';
                html += '<label class="form-label">按鈕 ' + (index + 1) + '</label>';
                html += '<input type="text" class="form-input" value="' + (button.action?.label || '') + '" onchange="updateButtonLabel(' + index + ', this.value)" placeholder="按鈕文字" style="margin-bottom: 5px;">';
                html += '<input type="url" class="form-input" value="' + (button.action?.uri || '') + '" onchange="updateButtonUri(' + index + ', this.value)" placeholder="按鈕連結" style="margin-bottom: 5px;">';
                html += '<label class="form-label">按鈕顏色</label>';
                html += '<input type="text" class="form-input" value="' + (button.color || '#1976d2') + '" onchange="updateButtonColor(' + index + ', this.value)" placeholder="#ffffff" pattern="^#[0-9A-Fa-f]{6}$" style="margin-bottom: 5px;">';
                html += '<button type="button" class="template-delete-btn" onclick="removeButton(' + index + ')" style="margin-top: 5px;">刪除按鈕</button>';
                html += '</div>';
            });
            html += '<button type="button" class="btn" onclick="addButton()" style="background: #28a745; color: white; margin-right: 10px;">+ 新增按鈕</button>';
            html += '<button type="button" class="btn" onclick="addShareButton()" style="background: #00c851; color: white;">+ 新增分享按鈕</button>';
            html += '</div>';
            
            form.innerHTML = html;
        }

        // 更新主圖
        async function uploadHeroImage(input) {
            if (!input.files || input.files.length === 0) return;
            
            const file = input.files[0];
            const statusDiv = input.parentElement.querySelector('.upload-status');
            const preview = input.parentElement.querySelector('.hero-preview');
            
            console.log('開始上傳圖片:', file.name, 'Size:', file.size);
            statusDiv.textContent = '上傳中...';
            statusDiv.style.color = '#666';
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData
                });
                
                console.log('上傳回應狀態:', response.status);
                const result = await response.json();
                console.log('上傳結果:', result);
                
                if (result.success) {
                    const bubble = carouselData.contents[currentTabIndex];
                    if (!bubble.hero) {
                        bubble.hero = {
                            "type": "image",
                            "size": "full",
                            "aspectRatio": "20:13",
                            "aspectMode": "cover"
                        };
                    }
                    // API 回應的 URL 在 data.publicUrl 中
                    const imageUrl = result.data?.publicUrl || result.url;
                    bubble.hero.url = imageUrl;
                    templates[currentTemplateIndex].carouselData = carouselData;
                    console.log('設定圖片URL:', imageUrl);
                    console.log('更新後的hero對象:', bubble.hero);
                    
                    // 更新預覽圖片
                    if (preview) {
                        preview.src = imageUrl;
                        preview.style.display = 'block';
                        console.log('更新預覽圖片元素:', preview.src);
                    }
                    
                    statusDiv.textContent = '上傳成功: ' + imageUrl;
                    statusDiv.style.color = '#28a745';
                    
                    // 更新預覽區
                    updatePreview();
                    console.log('呼叫updatePreview完成');
                } else {
                    statusDiv.textContent = '上傳失敗: ' + result.error;
                    statusDiv.style.color = '#dc3545';
                }
            } catch (error) {
                console.error('上傳錯誤:', error);
                statusDiv.textContent = '上傳失敗: ' + error.message;
                statusDiv.style.color = '#dc3545';
            }
        }

        function updateHeroImage(url) {
            const bubble = carouselData.contents[currentTabIndex];
            if (bubble.hero) {
                bubble.hero.url = url;
                templates[currentTemplateIndex].carouselData = carouselData;
                updatePreview();
            }
        }


        // 更新主標題
        function updateMainTitle(text) {
            const bubble = carouselData.contents[currentTabIndex];
            const titleContent = bubble.body.contents.find(c => c.type === 'text' && c.weight === 'bold');
            if (titleContent) {
                titleContent.text = text;
                templates[currentTemplateIndex].carouselData = carouselData;
                updateTabs();
                updatePreview();
            }
        }

        // 更新日期資訊
        function updateDateInfo(text) {
            const bubble = carouselData.contents[currentTabIndex];
            let dateContent = bubble.body.contents.find(c => c.type === 'text' && c.color === '#aaaaaa' && c.size === 'xs');
            
            if (!dateContent && text) {
                // 如果不存在日期資訊元素，在最後創建一個
                dateContent = {
                    "type": "text",
                    "text": text,
                    "wrap": true,
                    "color": "#aaaaaa",
                    "size": "xs"
                };
                bubble.body.contents.push(dateContent);
            } else if (dateContent) {
                if (text) {
                    dateContent.text = text;
                } else {
                    // 如果文字為空，移除日期資訊
                    const index = bubble.body.contents.indexOf(dateContent);
                    if (index > -1) {
                        bubble.body.contents.splice(index, 1);
                    }
                }
            }
            
            templates[currentTemplateIndex].carouselData = carouselData;
            updatePreview();
        }

        // 更新副標題
        function updateSubtitle(text) {
            const bubble = carouselData.contents[currentTabIndex];
            let subtitleContent = bubble.body.contents.find(c => c.type === 'text' && c !== bubble.body.contents[0] && c.color !== '#aaaaaa' && c.size !== 'xs' && !c.wrap);
            
            if (!subtitleContent && text) {
                // 如果不存在副標題元素，在主標題後創建一個
                subtitleContent = {
                    "type": "text",
                    "text": text,
                    "size": "sm",
                    "color": "#666666",
                    "margin": "sm"
                };
                // 找到棟別box的位置，插入到前面，如果沒有則插入到位置1
                const buildingBoxIndex = bubble.body.contents.findIndex(c => c.type === 'box' && c.layout === 'vertical');
                const insertIndex = buildingBoxIndex > -1 ? buildingBoxIndex : 1;
                bubble.body.contents.splice(insertIndex, 0, subtitleContent);
                console.log('添加副標題到位置:', insertIndex, '內容:', text);
            } else if (subtitleContent) {
                if (text) {
                    subtitleContent.text = text;
                    console.log('更新副標題內容:', text);
                } else {
                    // 如果文字為空，移除副標題
                    const index = bubble.body.contents.indexOf(subtitleContent);
                    if (index > -1) {
                        bubble.body.contents.splice(index, 1);
                        console.log('移除副標題');
                    }
                }
            }
            
            templates[currentTemplateIndex].carouselData = carouselData;
            updatePreview();
        }

        // 更新下方內容
        function updateBottomContent(text) {
            const bubble = carouselData.contents[currentTabIndex];
            // 使用更精確的選擇器，避免與日期資訊衝突
            const titleContent = bubble.body.contents.find(c => c.type === 'text' && c.weight === 'bold');
            const subtitleContent = bubble.body.contents.find(c => c.type === 'text' && c !== titleContent && c.color !== '#aaaaaa' && c.size !== 'xs' && !c.wrap);
            let bottomContent = bubble.body.contents.find(c => c.type === 'text' && c !== titleContent && c !== subtitleContent && c.wrap === true && c.color !== '#aaaaaa');
            
            if (!bottomContent && text) {
                // 如果不存在下方內容元素，在日期資訊前創建一個
                bottomContent = {
                    "type": "text",
                    "text": text,
                    "size": "sm",
                    "wrap": true,
                    "margin": "md"
                };
                
                // 找到日期資訊的位置，插入到前面
                const dateIndex = bubble.body.contents.findIndex(c => c.type === 'text' && c.color === '#aaaaaa' && c.size === 'xs');
                if (dateIndex > -1) {
                    bubble.body.contents.splice(dateIndex, 0, bottomContent);
                    console.log('添加下方內容到日期資訊前，位置:', dateIndex, '內容:', text);
                } else {
                    bubble.body.contents.push(bottomContent);
                    console.log('添加下方內容到最後，內容:', text);
                }
            } else if (bottomContent) {
                if (text) {
                    bottomContent.text = text;
                } else {
                    // 如果文字為空，移除下方內容
                    const index = bubble.body.contents.indexOf(bottomContent);
                    if (index > -1) {
                        bubble.body.contents.splice(index, 1);
                    }
                }
            }
            
            templates[currentTemplateIndex].carouselData = carouselData;
            updatePreview();
        }

        // 更新棟別名稱
        function updateBuildingName(index, name) {
            const bubble = carouselData.contents[currentTabIndex];
            const buildingBox = bubble.body.contents.find(c => c.type === 'box' && c.layout === 'vertical' && c.spacing === 'sm');
            if (buildingBox?.contents?.[index]?.type === 'box') {
                const buildingNameText = buildingBox.contents[index].contents.find(c => c.type === 'text' && c.weight === 'bold');
                if (buildingNameText) {
                    buildingNameText.text = name;
                    templates[currentTemplateIndex].carouselData = carouselData;
                    updatePreview();
                }
            }
        }

        // 更新棟別百分比
        function updateBuildingPercentage(index, percentage) {
            const bubble = carouselData.contents[currentTabIndex];
            const buildingBox = bubble.body.contents.find(c => c.type === 'box' && c.layout === 'vertical' && c.spacing === 'sm');
            if (buildingBox?.contents?.[index]?.type === 'box') {
                const percentageText = buildingBox.contents[index].contents.find(c => c.type === 'text' && c.align === 'end');
                if (percentageText) {
                    percentageText.text = percentage;
                    templates[currentTemplateIndex].carouselData = carouselData;
                    updatePreview();
                }
            }
        }

        // 新增棟別
        function addBuilding() {
            const bubble = carouselData.contents[currentTabIndex];
            const buildingBox = bubble.body.contents.find(c => c.type === 'box' && c.layout === 'vertical' && c.spacing === 'sm');
            if (buildingBox) {
                const newBuilding = {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                        {
                            "type": "icon",
                            "url": "https://developers-resource.landpress.line.me/fx/img/restaurant_regular_32.png"
                        },
                        {
                            "type": "text",
                            "text": "新棟別",
                            "weight": "bold",
                            "margin": "sm",
                            "flex": 0
                        },
                        {
                            "type": "text",
                            "text": "0%",
                            "size": "sm",
                            "align": "end",
                            "color": "#aaaaaa"
                        }
                    ]
                };
                buildingBox.contents.push(newBuilding);
                templates[currentTemplateIndex].carouselData = carouselData;
                loadTabContent();
                updatePreview();
            }
        }

        // 更新按鈕標籤
        function updateButtonLabel(index, label) {
            const bubble = carouselData.contents[currentTabIndex];
            const button = bubble.footer?.contents?.[index];
            if (button?.action) {
                button.action.label = label;
                templates[currentTemplateIndex].carouselData = carouselData;
                updatePreview();
            }
        }

        // 更新按鈕連結
        function updateButtonUri(index, uri) {
            const bubble = carouselData.contents[currentTabIndex];
            const button = bubble.footer?.contents?.[index];
            if (button?.action) {
                button.action.uri = uri;
                templates[currentTemplateIndex].carouselData = carouselData;
                updatePreview();
            }
        }

        // 新增按鈕
        function addButton() {
            const bubble = carouselData.contents[currentTabIndex];
            if (!bubble.footer) {
                bubble.footer = {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [],
                    "paddingAll": "md",
                    "paddingTop": "none"
                };
            }
            
            const newButton = {
                "type": "button",
                "action": {
                    "type": "uri",
                    "label": "新按鈕",
                    "uri": "https://line.me/"
                },
                "style": "secondary",
                "margin": "md"
            };
            
            bubble.footer.contents.push(newButton);
            templates[currentTemplateIndex].carouselData = carouselData;
            loadTabContent();
            updatePreview();
        }

        // 移除棟別
        function removeBuilding(index) {
            const bubble = carouselData.contents[currentTabIndex];
            const buildingBox = bubble.body.contents.find(c => c.type === 'box' && c.layout === 'vertical' && c.spacing === 'sm');
            if (buildingBox?.contents?.[index]) {
                buildingBox.contents.splice(index, 1);
                templates[currentTemplateIndex].carouselData = carouselData;
                loadTabContent();
                updatePreview();
            }
        }

        // 移除按鈕
        function removeButton(index) {
            const bubble = carouselData.contents[currentTabIndex];
            if (bubble.footer?.contents) {
                bubble.footer.contents.splice(index, 1);
                templates[currentTemplateIndex].carouselData = carouselData;
                loadTabContent();
                updatePreview();
            }
        }

        // 更新按鈕顏色
        function updateButtonColor(index, color) {
            const bubble = carouselData.contents[currentTabIndex];
            if (bubble.footer?.contents?.[index]) {
                bubble.footer.contents[index].color = color;
                templates[currentTemplateIndex].carouselData = carouselData;
                updatePreview();
            }
        }

        // 新增分享按鈕
        function addShareButton() {
            const bubble = carouselData.contents[currentTabIndex];
            if (!bubble.footer) {
                bubble.footer = {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": []
                };
            }
            
            const shareButton = {
                "type": "button",
                "action": {
                    "type": "uri",
                    "label": "分享",
                    "uri": "https://line-bot-pusher.pages.dev/liff-share?template=" + templates[currentTemplateIndex].id
                },
                "style": "primary",
                "color": "#00c851"
            };
            
            bubble.footer.contents.push(shareButton);
            templates[currentTemplateIndex].carouselData = carouselData;
            loadTabContent();
            updatePreview();
        }

        // 更新氣泡文字內容
        function updateBubbleText(type, value) {
            const bubble = carouselData.contents[currentTabIndex];
            if (!bubble.body?.contents) return;
            
            const contents = bubble.body.contents;
            
            if (type === 'title') {
                const titleItem = contents.find(c => c.weight === 'bold');
                if (titleItem) {
                    titleItem.text = value;
                } else {
                    contents.unshift({
                        type: 'text',
                        text: value,
                        wrap: true,
                        weight: 'bold',
                        size: 'xl'
                    });
                }
            } else if (type === 'subtitle') {
                let subtitleItem = contents.find(c => c.size === 'sm' && c.color === '#666666');
                if (subtitleItem) {
                    subtitleItem.text = value;
                } else {
                    const titleIndex = contents.findIndex(c => c.weight === 'bold');
                    contents.splice(titleIndex + 1, 0, {
                        type: 'text',
                        text: value,
                        wrap: true,
                        size: 'sm',
                        color: '#666666'
                    });
                }
            }
            
            updateTabs();
            updatePreview();
        }

        // 更新預覽
        function updatePreview() {
            const container = document.getElementById('carousel-preview');
            let html = '';
            
            carouselData.contents.forEach((bubble, index) => {
                const hero = bubble.hero;
                const body = bubble.body?.contents || [];
                const titleContent = body.find(c => c.type === 'text' && c.weight === 'bold');
                const title = titleContent?.text || '分頁 ' + (index + 1);
                const buildingBox = body.find(c => c.type === 'box' && c.layout === 'vertical' && c.spacing === 'sm');
                const dateContent = body.find(c => c.type === 'text' && c.color === '#aaaaaa' && c.size === 'xs');
                const buttons = bubble.footer?.contents || [];
                
                html += '<div class="bubble-preview' + (index === currentTabIndex ? ' active' : '') + '">';
                
                // 主圖
                if (hero?.url) {
                    html += '<img src="' + hero.url + '" class="bubble-image" alt="圖片">';
                } else {
                    html += '<div class="bubble-image" style="display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #999;">無圖片</div>';
                }
                
                // 內容區域
                html += '<div class="bubble-content">';
                html += '<div class="bubble-title">' + title + '</div>';
                
                // 副標題
                const titleContent = body[0];
                const subtitleContent = body.find(c => c.type === 'text' && c !== titleContent && c.color !== '#aaaaaa' && c.size !== 'xs' && !c.wrap);
                if (subtitleContent?.text) {
                    html += '<div style="font-size: 12px; color: #666; margin-top: 4px;">' + subtitleContent.text + '</div>';
                }
                
                // 棟別資訊
                if (buildingBox?.contents) {
                    html += '<div style="margin: 8px 0;">';
                    buildingBox.contents.forEach(building => {
                        if (building.type === 'box' && building.layout === 'baseline') {
                            const buildingName = building.contents.find(c => c.type === 'text' && c.weight === 'bold')?.text || '';
                            const percentage = building.contents.find(c => c.type === 'text' && c.align === 'end')?.text || '';
                            html += '<div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">';
                            html += '<span style="font-weight: bold;">' + buildingName + '</span>';
                            html += '<span style="color: #aaa;">' + percentage + '</span>';
                            html += '</div>';
                        }
                    });
                    html += '</div>';
                }
                
                // 下方內容
                const bottomContent = body.find(c => c.type === 'text' && c !== titleContent && c !== subtitleContent && c.wrap === true && c.color !== '#aaaaaa');
                if (bottomContent?.text) {
                    html += '<div style="font-size: 11px; color: #555; margin-top: 6px; line-height: 1.3;">' + bottomContent.text + '</div>';
                }
                
                // 日期資訊
                const dateContent = body.find(c => c.type === 'text' && c.color === '#aaaaaa' && c.size === 'xs');
                if (dateContent?.text) {
                    html += '<div style="font-size: 11px; color: #aaa; margin-top: 8px;">' + dateContent.text + '</div>';
                }
                
                html += '</div>';
                
                // 按鈕
                if (buttons.length > 0) {
                    html += '<div class="bubble-buttons">';
                    buttons.forEach((btn, btnIndex) => {
                        const btnClass = btn.style === 'primary' ? 'bubble-button' : 'bubble-button secondary';
                        const btnStyle = btn.color ? 'background-color: ' + btn.color + ';' : '';
                        html += '<button class="' + btnClass + '" style="' + btnStyle + '">' + (btn.action?.label || '按鈕') + '</button>';
                    });
                    html += '</div>';
                }
                
                html += '</div>';
            });
            
            container.innerHTML = html;
        }

        // 工具列功能
        function loadProject() {
            alert('建案載入功能開發中...');
        }

        function showJsonPreview() {
            const jsonWindow = window.open('', '_blank', 'width=800,height=600');
            const jsonString = JSON.stringify(carouselData, null, 2);
            const jsonEscaped = jsonString.replace(/'/g, "\\\\'");
            
            jsonWindow.document.write(
                '<html><head><title>Flex Carousel JSON</title></head>' +
                '<body style="font-family: monospace; padding: 20px;">' +
                '<h3>生成的 Flex Carousel JSON</h3>' +
                '<pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto; white-space: pre-wrap; max-height: 80vh;">' +
                jsonString +
                '</pre><br>' +
                '<button onclick="navigator.clipboard.writeText(\\'' + jsonEscaped + '\\'); alert(\\'JSON 已複製到剪貼簿!\\');" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 複製 JSON</button>' +
                '<button onclick="window.close();" style="margin-left: 10px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">✕ 關閉</button>' +
                '</body></html>'
            );
        }

        function previewInNewWindow() {
            alert('預覽功能開發中...');
        }

        async function saveTemplate() {
            if (templates.length === 0) return;
            
            const currentTemplate = templates[currentTemplateIndex];
            
            try {
                const response = await fetch('/api/flex-templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_name: currentTemplate.name,
                        description: '共' + carouselData.contents.length + '個分頁',
                        template_type: 'carousel',
                        flex_content: JSON.stringify(carouselData),
                        category: 'custom'
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    // 更新模板 ID
                    currentTemplate.id = result.template_id;
                    alert('模板儲存成功!');
                    // 重新載入模板列表
                    await loadTemplates();
                } else {
                    alert('儲存失敗：' + result.error);
                }
            } catch (error) {
                alert('儲存出錯：' + error.message);
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
                    
                    const flexContent = JSON.parse(template.flex_content);
                    if (flexContent.type === 'carousel') {
                        carouselData = flexContent;
                    }
                    
                    if (template.category) {
                        currentCategory = template.category;
                    }
                    
                    currentTabIndex = 0;
                    updateTabs();
                    updatePreview();
                } else {
                    alert('載入模板失敗: ' + (data.error || '模板不存在'));
                }
            } catch (error) {
                console.error('載入模板錯誤:', error);
                alert('載入模板時發生錯誤');
            }
        }

        // 頁面載入時初始化
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;

  return new Response(flexCarouselEditorHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}