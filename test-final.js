const { chromium } = require('playwright');

async function testFinal() {
  console.log('🔍 最終測試系統功能...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let jsErrors = [];
  
  page.on('pageerror', (error) => {
    jsErrors.push({
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  });
  
  try {
    console.log('📡 連接到管理介面...');
    await page.goto('https://line-bot-pusher.pages.dev/management', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(5000);
    
    console.log(`\n📊 JavaScript 錯誤檢查:`);
    if (jsErrors.length === 0) {
      console.log('✅ 沒有 JavaScript 錯誤！');
    } else {
      console.log(`❌ 發現 ${jsErrors.length} 個錯誤:`);
      jsErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.name}: ${error.message}`);
      });
    }
    
    // 檢查關鍵函數
    const functionCheck = await page.evaluate(() => {
      return {
        showTab: typeof window.showTab,
        loadUsers: typeof window.loadUsers,
        loadGroups: typeof window.loadGroups,
        loadMessages: typeof window.loadMessages,
        loadEvents: typeof window.loadEvents,
        loadQuota: typeof window.loadQuota
      };
    });
    
    console.log(`\n📊 關鍵函數檢查:`);
    let allFunctionsWork = true;
    Object.entries(functionCheck).forEach(([name, type]) => {
      const isFunction = type === 'function';
      console.log(`${isFunction ? '✅' : '❌'} ${name}: ${type}`);
      if (!isFunction) allFunctionsWork = false;
    });
    
    if (allFunctionsWork) {
      console.log(`\n🖱️  測試頁簽切換功能...`);
      
      // 測試群組管理頁簽
      await page.click('button:has-text("群組管理")');
      await page.waitForTimeout(1000);
      
      const groupsTabActive = await page.isVisible('#groups-tab.active');
      console.log(`📋 群組管理頁簽: ${groupsTabActive ? '✅ 正常' : '❌ 異常'}`);
      
      // 測試訊息記錄頁簽
      await page.click('button:has-text("訊息記錄")');
      await page.waitForTimeout(1000);
      
      const messagesTabActive = await page.isVisible('#messages-tab.active');
      console.log(`💬 訊息記錄頁簽: ${messagesTabActive ? '✅ 正常' : '❌ 異常'}`);
      
      // 測試用量監控頁簽
      await page.click('button:has-text("用量監控")');
      await page.waitForTimeout(1000);
      
      const quotaTabActive = await page.isVisible('#quota-tab.active');
      console.log(`📈 用量監控頁簽: ${quotaTabActive ? '✅ 正常' : '❌ 異常'}`);
      
      if (groupsTabActive && messagesTabActive && quotaTabActive) {
        console.log(`\n🎉 系統功能完全正常！所有頁簽都可以正常切換！`);
        console.log(`\n📍 系統資訊:`);
        console.log(`   網址: https://line-bot-pusher.pages.dev/management`);
        console.log(`   版本: 5c4e663 (修復資料表名稱版本)`);
        console.log(`   狀態: ✅ 完全可用`);
        console.log(`   功能: 用戶管理、群組管理、訊息記錄、事件日誌、用量監控`);
      } else {
        console.log(`\n⚠️ 部分頁簽功能異常`);
      }
    } else {
      console.log(`\n❌ 部分關鍵函數無法載入`);
    }
    
  } catch (error) {
    console.error('❌ 測試過程發生錯誤:', error.message);
  } finally {
    await browser.close();
  }
}

testFinal();