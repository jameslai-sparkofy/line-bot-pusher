// 測試取得 LINE 官方模板的腳本

async function testLineTemplates() {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    
    if (!channelAccessToken) {
        console.error('❌ 缺少 LINE_CHANNEL_ACCESS_TOKEN 環境變數');
        return;
    }

    console.log('🔍 測試取得 LINE 官方模板...\n');

    const tests = [
        {
            name: '📱 Rich Menu 列表',
            url: 'https://api.line.me/v2/bot/richmenu/list',
            method: 'GET'
        },
        {
            name: '👥 Bot 資訊',
            url: 'https://api.line.me/v2/bot/info',
            method: 'GET'
        },
        {
            name: '📊 配額資訊',
            url: 'https://api.line.me/v2/bot/message/quota',
            method: 'GET'
        }
    ];

    for (const test of tests) {
        console.log(`\n🧪 測試: ${test.name}`);
        console.log(`📡 API: ${test.method} ${test.url}`);
        
        try {
            const response = await fetch(test.url, {
                method: test.method,
                headers: {
                    'Authorization': `Bearer ${channelAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`📊 狀態碼: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ 成功取得資料:');
                console.log(JSON.stringify(data, null, 2));
            } else {
                const errorText = await response.text();
                console.log('❌ 錯誤回應:');
                console.log(errorText);
            }
        } catch (error) {
            console.log('❌ 請求失敗:', error.message);
        }
        
        console.log('─'.repeat(60));
    }

    // 測試取得特定 Rich Menu (如果有的話)
    console.log('\n🔍 嘗試取得預設 Rich Menu...');
    
    try {
        const response = await fetch('https://api.line.me/v2/bot/user/all/richmenu', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${channelAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 預設 Rich Menu 狀態碼: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ 預設 Rich Menu:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log('ℹ️ 沒有預設 Rich Menu 或錯誤:', errorText);
        }
    } catch (error) {
        console.log('❌ 取得預設 Rich Menu 失敗:', error.message);
    }
}

// 測試 Flex Message 模板格式
function showFlexMessageExample() {
    console.log('\n📝 Flex Message 模板範例:');
    console.log('LINE 的 Flex Message 是 JSON 格式，例如：');
    
    const flexExample = {
        "type": "flex",
        "altText": "這是 Flex Message",
        "contents": {
            "type": "bubble",
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "標題",
                        "weight": "bold",
                        "size": "lg"
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "內容文字",
                        "wrap": true
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "uri": "https://example.com"
                        },
                        "style": "primary",
                        "text": "點擊按鈕"
                    }
                ]
            }
        }
    };
    
    console.log(JSON.stringify(flexExample, null, 2));
}

// 執行測試
if (require.main === module) {
    testLineTemplates().then(() => {
        showFlexMessageExample();
        console.log('\n🎯 測試完成！');
    }).catch(console.error);
}

module.exports = { testLineTemplates };