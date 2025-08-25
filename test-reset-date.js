const { chromium } = require('playwright');

(async () => {
  console.log('重置日期資訊...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800 
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
    
    // 找到日期輸入框
    const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
    if (dateInput) {
      console.log('✅ 找到日期輸入框');
      
      // 清空並設為正確的預設值
      console.log('🔄 重置日期為預設值...');
      await dateInput.fill('');
      await page.waitForTimeout(300);
      await dateInput.fill('2025-08-24 進度報告');
      await page.waitForTimeout(1000);
      
      // 檢查預覽
      const preview = await page.textContent('.bubble-preview');
      console.log('👁️ 預覽包含正確日期:', preview?.includes('2025-08-24 進度報告') ? '✅是' : '❌否');
      
      // 保存模板
      const saveBtn = await page.$('button[onclick*="saveTemplate"]');
      if (saveBtn) {
        console.log('💾 保存模板...');
        await saveBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ 已保存');
      } else {
        console.log('❌ 找不到保存按鈕');
      }
      
      console.log('\\n📄 修復後預覽內容:');
      const newPreview = await page.textContent('.bubble-preview');
      console.log(newPreview);
      
    } else {
      console.log('❌ 找不到日期輸入框');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 完成');
  }
})();