const { chromium } = require('playwright');

async function testConsoleErrors() {
    console.log('🚀 啟動 Console 錯誤檢查...\n');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // 收集所有console訊息
    const consoleLogs = [];
    const consoleErrors = [];
    const networkErrors = [];
    
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        
        consoleLogs.push(`[${type.toUpperCase()}] ${text}`);
        
        if (type === 'error') {
            consoleErrors.push(text);
        }
    });
    
    page.on('requestfailed', request => {
        networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    try {
        console.log('📱 正在載入管理系統頁面...');
        await page.goto('https://line-bot-pusher.pages.dev/management');
        await page.waitForTimeout(3000);
        
        console.log('\n📋 初始載入的Console訊息:');
        consoleLogs.forEach(log => console.log('  ', log));
        
        // 清空之前的日誌
        consoleLogs.length = 0;
        
        console.log('\n🔄 開始測試標籤切換...');
        
        const tabs = [
            '👥 用戶管理',
            '👨‍👩‍👧‍👦 群組管理', 
            '📝 模板管理',
            '⏰ 定時任務',
            '📤 推送訊息',
            '💬 訊息記錄',
            '📊 事件日誌',
            '📈 用量監控'
        ];
        
        for (let i = 0; i < tabs.length; i++) {
            const tabName = tabs[i];
            console.log(`\n🏷️  切換到標籤: ${tabName}`);
            
            // 清空console記錄
            consoleLogs.length = 0;
            
            try {
                // 點擊標籤
                await page.locator('.nav-tab').nth(i).click();
                await page.waitForTimeout(2000);
                
                // 檢查是否有新的console訊息
                if (consoleLogs.length > 0) {
                    console.log(`   📝 Console 訊息 (${consoleLogs.length} 條):`);
                    consoleLogs.forEach(log => console.log('     ', log));
                } else {
                    console.log('   ✅ 沒有console訊息');
                }
                
                // 檢查標籤是否正確切換
                const activeTab = await page.locator('.nav-tab.active').textContent();
                const isCorrect = activeTab.includes(tabName.replace(/[^\w\s]/g, ''));
                console.log(`   🎯 標籤狀態: ${isCorrect ? '✅ 正確切換' : '❌ 切換失敗'}`);
                
                // 檢查對應內容是否顯示
                const activeContent = await page.locator('.tab-content.active').isVisible();
                console.log(`   📄 內容顯示: ${activeContent ? '✅ 可見' : '❌ 不可見'}`);
                
                // 如果是用戶管理、群組管理等有載入按鈕的標籤，測試載入功能
                if (i < 3 || i === 5 || i === 6) { // 用戶、群組、模板、訊息、事件
                    console.log('   🔄 測試載入按鈕...');
                    
                    // 查找當前標籤頁的載入按鈕
                    const loadButtons = await page.locator('.tab-content.active button:has-text("重新載入")').count();
                    if (loadButtons > 0) {
                        try {
                            await page.locator('.tab-content.active button:has-text("重新載入")').first().click();
                            await page.waitForTimeout(3000);
                            
                            if (consoleLogs.length > 0) {
                                console.log(`   📥 載入後的Console訊息:`);
                                consoleLogs.forEach(log => console.log('     ', log));
                            } else {
                                console.log('   ✅ 載入成功，無錯誤');
                            }
                        } catch (loadError) {
                            console.log(`   ❌ 載入按鈕點擊失敗: ${loadError.message.slice(0, 50)}`);
                        }
                    } else {
                        console.log('   ℹ️  未發現載入按鈕');
                    }
                }
                
            } catch (tabError) {
                console.log(`   ❌ 標籤切換失敗: ${tabError.message.slice(0, 100)}`);
            }
        }
        
        console.log('\n📊 最終統計:');
        console.log(`   總Console錯誤: ${consoleErrors.length} 個`);
        console.log(`   網路錯誤: ${networkErrors.length} 個`);
        
        if (consoleErrors.length > 0) {
            console.log('\n❌ Console 錯誤詳情:');
            consoleErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        if (networkErrors.length > 0) {
            console.log('\n🌐 網路錯誤詳情:');
            networkErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        // 最終截圖
        await page.screenshot({ 
            path: './test-results/console-debug-final.png',
            fullPage: true 
        });
        console.log('\n📸 已保存最終截圖: console-debug-final.png');
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error.message);
    } finally {
        await browser.close();
        console.log('\n🎯 Console 除錯測試完成');
    }
}

// 創建測試結果目錄
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
    fs.mkdirSync('./test-results');
}

testConsoleErrors().catch(console.error);