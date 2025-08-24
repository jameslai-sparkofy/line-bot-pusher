// LIFF 分享頁面
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const liffShareHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分享建案資訊</title>
    <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .share-container {
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }

        .share-icon {
            font-size: 60px;
            margin-bottom: 20px;
            color: #667eea;
        }

        .share-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }

        .share-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }

        .share-preview {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: left;
        }

        .preview-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }

        .preview-content {
            font-size: 14px;
            color: #666;
            line-height: 1.4;
        }

        .share-actions {
            display: flex;
            gap: 15px;
        }

        .btn {
            flex: 1;
            padding: 15px 20px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: #f8f9fa;
            color: #666;
            border: 2px solid #e9ecef;
        }

        .btn-secondary:hover {
            background: #e9ecef;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-message {
            display: none;
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }

        .success-message {
            display: none;
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }

        /* 行動裝置適配 */
        @media (max-width: 480px) {
            .share-container {
                padding: 30px 20px;
            }
            
            .share-title {
                font-size: 20px;
            }
            
            .share-actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="share-container">
        <div class="share-icon">🏠</div>
        <h1 class="share-title">分享建案資訊</h1>
        <p class="share-subtitle">選擇要分享給的朋友或群組</p>
        
        <div class="share-preview" id="share-preview">
            <div class="preview-title">建案名稱載入中...</div>
            <div class="preview-content">準備分享內容...</div>
        </div>
        
        <div class="share-actions">
            <button class="btn btn-primary" onclick="shareContent()" id="share-btn">
                📤 選擇分享對象
            </button>
            <button class="btn btn-secondary" onclick="closeWindow()">
                ❌ 取消
            </button>
        </div>
        
        <div class="loading" id="loading">
            <div class="loading-spinner"></div>
            <p>正在處理分享...</p>
        </div>
        
        <div class="error-message" id="error-message"></div>
        <div class="success-message" id="success-message"></div>
    </div>

    <script>
        let liffInitialized = false;
        let shareData = null;

        // 初始化 LIFF
        async function initializeLiff() {
            try {
                await liff.init({ 
                    liffId: "2006279734-aBgKjxLw" // 需要替換為實際的 LIFF ID
                });
                
                liffInitialized = true;
                console.log('LIFF 初始化成功');
                
                // 載入分享內容
                await loadShareContent();
                
            } catch (error) {
                console.error('LIFF 初始化失敗:', error);
                showError('LIFF 初始化失敗，請確認在 LINE 中開啟');
            }
        }

        // 載入分享內容
        async function loadShareContent() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('project');
                const templateId = urlParams.get('template');
                
                if (templateId) {
                    // 從模板載入
                    const response = await fetch(\`/api/flex-templates/\${templateId}\`);
                    const data = await response.json();
                    
                    if (data.success) {
                        const template = data.template;
                        shareData = {
                            type: 'flex',
                            altText: template.template_name + ' - 建案資訊',
                            contents: JSON.parse(template.flex_content)
                        };
                        
                        updatePreview(template.template_name, template.description || '建案資訊分享');
                    }
                    
                } else if (projectId) {
                    // 從建案資料載入
                    const response = await fetch(\`/api/projects/\${projectId}\`);
                    const data = await response.json();
                    
                    if (data.success) {
                        const project = data.project;
                        shareData = {
                            type: 'flex',
                            altText: project.project_name + ' - 建案資訊',
                            contents: generateProjectShareContent(project)
                        };
                        
                        updatePreview(project.project_name, project.description || '精選建案推薦');
                    }
                }
                
                if (!shareData) {
                    throw new Error('無法載入分享內容');
                }
                
            } catch (error) {
                console.error('載入分享內容失敗:', error);
                showError('載入分享內容失敗');
            }
        }

        // 更新預覽
        function updatePreview(title, description) {
            document.getElementById('share-preview').innerHTML = 
                '<div class="preview-title">' + title + '</div>' +
                '<div class="preview-content">' + description + '</div>';
        }

        // 生成建案分享內容
        function generateProjectShareContent(project) {
            return {
                type: 'bubble',
                hero: {
                    type: 'image',
                    url: 'https://via.placeholder.com/300x200/667eea/white?text=' + encodeURIComponent(project.project_name),
                    size: 'full',
                    aspectRatio: '20:13',
                    aspectMode: 'cover'
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'text',
                            text: project.project_name,
                            weight: 'bold',
                            size: 'xl',
                            wrap: true
                        },
                        {
                            type: 'text',
                            text: project.location || '精華地段',
                            size: 'sm',
                            color: '#666666',
                            wrap: true
                        },
                        {
                            type: 'text',
                            text: project.description || '優質建案，歡迎詢問',
                            size: 'sm',
                            wrap: true,
                            margin: 'md'
                        }
                    ]
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'button',
                            style: 'primary',
                            action: {
                                type: 'uri',
                                label: '了解更多',
                                uri: \`https://line-bot-pusher.pages.dev/project/\${project.project_id}\`
                            }
                        }
                    ]
                }
            };
        }

        // 執行分享
        async function shareContent() {
            if (!liffInitialized) {
                showError('LIFF 尚未初始化');
                return;
            }

            if (!shareData) {
                showError('沒有可分享的內容');
                return;
            }

            try {
                showLoading();
                
                // 檢查是否支援 ShareTargetPicker
                if (liff.isApiAvailable('shareTargetPicker')) {
                    await liff.shareTargetPicker([shareData]);
                    
                    showSuccess('分享成功！');
                    
                    // 記錄分享事件
                    await recordShareEvent();
                    
                    // 延遲關閉視窗
                    setTimeout(() => {
                        liff.closeWindow();
                    }, 2000);
                    
                } else {
                    throw new Error('此版本不支援分享功能');
                }
                
            } catch (error) {
                console.error('分享失敗:', error);
                showError('分享失敗: ' + error.message);
            } finally {
                hideLoading();
            }
        }

        // 記錄分享事件
        async function recordShareEvent() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('project');
                const templateId = urlParams.get('template');
                
                await fetch('/api/share-events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_type: 'flex_share',
                        project_id: projectId,
                        template_id: templateId,
                        user_id: liff.getContext()?.userId,
                        shared_at: new Date().toISOString()
                    })
                });
            } catch (error) {
                console.error('記錄分享事件失敗:', error);
            }
        }

        // 關閉視窗
        function closeWindow() {
            if (liffInitialized) {
                liff.closeWindow();
            } else {
                window.close();
            }
        }

        // 顯示載入狀態
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('share-btn').disabled = true;
        }

        // 隱藏載入狀態
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('share-btn').disabled = false;
        }

        // 顯示錯誤訊息
        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // 隱藏成功訊息
            document.getElementById('success-message').style.display = 'none';
        }

        // 顯示成功訊息
        function showSuccess(message) {
            const successDiv = document.getElementById('success-message');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            
            // 隱藏錯誤訊息
            document.getElementById('error-message').style.display = 'none';
        }

        // 頁面載入時初始化
        document.addEventListener('DOMContentLoaded', () => {
            console.log('LIFF 分享頁面載入');
            initializeLiff();
        });
    </script>
</body>
</html>`;

  return new Response(liffShareHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}