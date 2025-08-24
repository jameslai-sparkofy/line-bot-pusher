const { chromium } = require('playwright');

async function testManagementPanelSimple() {
    console.log('🚀 啟動簡化版 Playwright 測試...\n');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        console.log('📱 正在載入管理系統頁面...');
        await page.goto('https://line-bot-pusher.pages.dev/management');
        await page.waitForTimeout(5000);
        
        const title = await page.title();
        console.log(`✅ 頁面標題: ${title}`);
        
        // 截圖 - 初始頁面
        await page.screenshot({ 
            path: './test-results/mgmt-full-page.png',
            fullPage: true 
        });
        console.log('📸 初始完整頁面截圖已保存');
        
        // 檢查所有標籤是否存在
        const tabs = await page.locator('.nav-tab').allTextContents();
        console.log('📋 發現功能標籤:', tabs.length, '個');
        tabs.forEach((tab, index) => console.log(`   ${index + 1}. ${tab}`));
        
        // 依次點擊每個標籤並截圖
        for (let i = 0; i < tabs.length; i++) {
            const tabText = tabs[i];
            console.log(`\n🔄 切換到: ${tabText}`);
            
            try {
                await page.locator('.nav-tab').nth(i).click();
                await page.waitForTimeout(2000);
                
                // 截圖每個標籤頁
                const fileName = `./test-results/mgmt-tab-${i + 1}-${tabText.replace(/[^\w]/g, '_')}.png`;
                await page.screenshot({ 
                    path: fileName,
                    fullPage: true 
                });
                console.log(`📸 已截圖: ${fileName}`);
                
                // 檢查當前標籤頁的內容
                const activeTabContent = await page.locator('.tab-content.active').innerHTML();
                const hasTable = activeTabContent.includes('<table');
                const hasButtons = activeTabContent.includes('<button');
                console.log(`   📊 內容分析: 有表格=${hasTable}, 有按鈕=${hasButtons}`);
                
            } catch (tabError) {
                console.log(`   ❌ 處理標籤 "${tabText}" 時出錯:`, tabError.message.slice(0, 100));
            }
        }
        
        // 檢查API呼叫
        console.log('\n🔍 測試API端點...');
        const apiTests = [
            '/api/management/users',
            '/api/management/groups', 
            '/api/templates',
            '/api/management/messages',
            '/api/management/events',
            '/api/quota'
        ];
        
        for (const endpoint of apiTests) {
            try {
                const response = await page.request.get(`https://line-bot-pusher.pages.dev${endpoint}`);
                console.log(`   ${endpoint}: ${response.status()} ${response.statusText()}`);
            } catch (apiError) {
                console.log(`   ${endpoint}: 錯誤 - ${apiError.message.slice(0, 50)}`);
            }
        }
        
        // 最終狀態檢查
        const finalState = {
            hasNavTabs: await page.locator('.nav-tabs').isVisible(),
            hasContent: await page.locator('.content').isVisible(),
            hasHeader: await page.locator('.header').isVisible()
        };
        
        console.log('\n✅ 頁面元素檢查:');
        Object.entries(finalState).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        await page.screenshot({ 
            path: './test-results/mgmt-error-final.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('\n🎯 測試完成');
    }
}

// 創建測試結果目錄
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
    fs.mkdirSync('./test-results');
}

testManagementPanelSimple().catch(console.error);