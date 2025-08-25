const { chromium } = require('playwright');

(async () => {
  console.log('檢查預設日期顯示...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(2000);
    
    // 點擊第一個模板
    console.log('點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    await firstTemplate.click();
    await page.waitForTimeout(1000);
    
    // 檢查預覽中是否有預設日期
    const preview = await page.textContent('.bubble-preview');
    console.log('👁️ 預覽包含預設日期 "2025-08-24 進度報告":', preview?.includes('2025-08-24 進度報告') ? '✅是' : '❌否');
    console.log('👁️ 預覽包含 "進度報告":', preview?.includes('進度報告') ? '✅是' : '❌否');
    console.log('👁️ 預覽包含 "2025-08-24":', preview?.includes('2025-08-24') ? '✅是' : '❌否');
    
    // 檢查日期輸入框的值
    const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
    if (dateInput) {
      const dateValue = await dateInput.inputValue();
      console.log('📝 日期輸入框的值:', dateValue);
    }
    
    console.log('\\n📄 完整預覽內容:');
    console.log(preview);
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 完成');
  }
})();