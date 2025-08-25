const { chromium } = require('playwright');

(async () => {
  console.log('簡單測試日期功能...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('導航到最新編輯器...');
    await page.goto('https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(3000);
    
    // 點擊第一個模板
    console.log('點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    await firstTemplate.click();
    await page.waitForTimeout(2000);
    
    // 找日期輸入框
    const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
    if (dateInput) {
      console.log('✅ 找到日期輸入框');
      
      // 輸入日期
      await dateInput.fill('測試日期顯示');
      await page.waitForTimeout(2000);
      
      // 檢查預覽
      const preview = await page.textContent('.bubble-preview');
      console.log('👁️ 預覽包含日期:', preview?.includes('測試日期顯示') ? '✅是' : '❌否');
      console.log('📄 預覽內容:');
      console.log(preview);
      
    } else {
      console.log('❌ 找不到日期輸入框');
    }
    
    console.log('\\n保持開啟 8 秒...');
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 完成');
  }
})();