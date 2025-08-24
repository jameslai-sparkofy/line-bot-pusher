const { chromium } = require('playwright');

async function testAdminPanel() {
    console.log('🚀 啟動 Playwright 測試線上管理後台...\n');
    
    // 啟動瀏覽器
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // 測試管理後台頁面載入
        console.log('📱 正在載入管理後台頁面...');
        await page.goto('https://line-bot-pusher.pages.dev/admin');
        await page.waitForTimeout(3000);
        
        // 檢查頁面標題
        const title = await page.title();
        console.log(`✅ 頁面標題: ${title}`);
        
        // 截圖 - 初始頁面
        await page.screenshot({ 
            path: './test-results/admin-initial.png',
            fullPage: true 
        });
        console.log('📸 已保存初始頁面截圖: admin-initial.png');
        
        // 測試群組管理功能
        console.log('\n🔄 測試群組管理功能...');
        const groupsButton = await page.locator('button:has-text("🔄 重新載入群組")');
        await groupsButton.click();
        await page.waitForTimeout(2000);
        
        // 檢查群組區域的內容
        const groupsContent = await page.locator('#groups').textContent();
        console.log('📊 群組區域內容:', groupsContent.slice(0, 100) + '...');
        
        // 截圖 - 群組載入後
        await page.screenshot({ 
            path: './test-results/admin-groups.png',
            fullPage: true 
        });
        console.log('📸 已保存群組功能截圖: admin-groups.png');
        
        // 測試模板管理功能
        console.log('\n📝 測試模板管理功能...');
        const templatesButton = await page.locator('button:has-text("📋 查看模板")');
        await templatesButton.click();
        await page.waitForTimeout(3000);
        
        // 檢查模板區域
        const templatesContent = await page.locator('#templates').innerHTML();
        const templateCount = (templatesContent.match(/template-card/g) || []).length;
        console.log(`📋 發現 ${templateCount} 個模板`);
        
        // 截圖 - 模板載入後
        await page.screenshot({ 
            path: './test-results/admin-templates.png',
            fullPage: true 
        });
        console.log('📸 已保存模板功能截圖: admin-templates.png');
        
        // 測試模板編輯器 - 文字模板
        console.log('\n✏️ 測試文字模板編輯器...');
        const newTextTemplateButton = await page.locator('button:has-text("➕ 新增文字模板")');
        await newTextTemplateButton.click();
        await page.waitForTimeout(1000);
        
        // 檢查編輯器是否打開
        const editorVisible = await page.locator('#editorOverlay').isVisible();
        console.log(`📝 文字模板編輯器可見: ${editorVisible}`);
        
        if (editorVisible) {
            // 填寫測試資料
            await page.fill('#textTemplateName', 'Playwright 測試模板');
            await page.fill('#textTemplateDesc', '這是用 Playwright 創建的測試模板');
            await page.fill('#textTemplateContent', '🤖 測試訊息: {{test_var}}');
            
            // 截圖 - 編輯器
            await page.screenshot({ 
                path: './test-results/admin-text-editor.png',
                fullPage: true 
            });
            console.log('📸 已保存文字編輯器截圖: admin-text-editor.png');
            
            // 關閉編輯器
            await page.locator('.close-btn').click();
            await page.waitForTimeout(500);
        }
        
        // 測試圖文模板編輯器
        console.log('\n🎨 測試圖文模板編輯器...');
        const newFlexTemplateButton = await page.locator('button:has-text("🎨 新增圖文模板")');
        await newFlexTemplateButton.click();
        await page.waitForTimeout(1000);
        
        const flexEditorVisible = await page.locator('#flexEditor').isVisible();
        console.log(`🎨 圖文模板編輯器可見: ${flexEditorVisible}`);
        
        if (flexEditorVisible) {
            // 填寫測試資料
            await page.fill('#flexTemplateName', 'Playwright 圖文測試');
            await page.fill('#flexTemplateDesc', '圖文模板測試');
            
            // 截圖 - 圖文編輯器
            await page.screenshot({ 
                path: './test-results/admin-flex-editor.png',
                fullPage: true 
            });
            console.log('📸 已保存圖文編輯器截圖: admin-flex-editor.png');
            
            // 關閉編輯器
            await page.locator('.close-btn').click();
            await page.waitForTimeout(500);
        }
        
        // 測試推送訊息功能區域
        console.log('\n📤 檢查推送訊息測試區域...');
        const messageSection = await page.locator('h3:has-text("📤 推送訊息測試")');
        const messageSectionVisible = await messageSection.isVisible();
        console.log(`📤 推送測試區域可見: ${messageSectionVisible}`);
        
        // 檢查表單元素
        const testGroupId = await page.locator('#testGroupId').isVisible();
        const testMessage = await page.locator('#testMessage').isVisible();
        const testApiKey = await page.locator('#testApiKey').isVisible();
        
        console.log(`📝 測試表單元素:`);
        console.log(`   群組ID欄位: ${testGroupId}`);
        console.log(`   訊息內容欄位: ${testMessage}`);
        console.log(`   API Key欄位: ${testApiKey}`);
        
        // 最終截圖
        await page.screenshot({ 
            path: './test-results/admin-final.png',
            fullPage: true 
        });
        console.log('📸 已保存最終截圖: admin-final.png');
        
        // 檢查控制台錯誤
        const logs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                logs.push(`❌ 控制台錯誤: ${msg.text()}`);
            }
        });
        
        if (logs.length > 0) {
            console.log('\n⚠️ 控制台錯誤:');
            logs.forEach(log => console.log(log));
        } else {
            console.log('\n✅ 沒有發現控制台錯誤');
        }
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        
        // 錯誤截圖
        await page.screenshot({ 
            path: './test-results/admin-error.png',
            fullPage: true 
        });
        console.log('📸 已保存錯誤截圖: admin-error.png');
    } finally {
        await browser.close();
        console.log('\n🎯 Playwright 測試完成');
    }
}

// 創建測試結果目錄
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
    fs.mkdirSync('./test-results');
}

// 執行測試
testAdminPanel().catch(console.error);