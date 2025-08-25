const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查預覽版本 (52780544)...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 測試預覽版本...');
    await page.goto('https://52780544.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(2000);
    
    // 檢查JavaScript函數是否存在
    const jsStatus = await page.evaluate(() => {
      return {
        hasInit: typeof init === 'function',
        hasLoadTemplates: typeof loadTemplates === 'function',
        hasTemplates: typeof templates !== 'undefined',
        documentReady: document.readyState
      };
    });
    
    console.log('🔧 JavaScript 狀態:');
    console.log('  - init 函數:', jsStatus.hasInit ? '✅存在' : '❌不存在');
    console.log('  - loadTemplates 函數:', jsStatus.hasLoadTemplates ? '✅存在' : '❌不存在');
    console.log('  - templates 變數:', jsStatus.hasTemplates ? '✅存在' : '❌不存在');
    
    if (jsStatus.hasInit) {
      console.log('✅ 主域名版本 JavaScript 正常！');
      
      // 等待初始化完成
      await page.waitForTimeout(3000);
      
      // 檢查模板數量
      const templates = await page.$$('.template-item');
      console.log('📋 模板數量:', templates.length);
      
      if (templates.length > 0) {
        console.log('🎯 測試選擇模板...');
        await templates[0].click();
        await page.waitForTimeout(2000);
        
        // 檢查編輯器功能
        const titleInput = await page.$('#template-title');
        if (titleInput) {
          const title = await titleInput.inputValue();
          console.log('📝 模板標題:', title);
        }
        
        console.log('✅ 主域名版本完全正常！');
      }
    } else {
      console.log('❌ 主域名版本也有 JavaScript 問題');
    }
    
    console.log('\\n⏰ 保持開啟 8 秒供檢視...');
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 測試完成');
  }
})();