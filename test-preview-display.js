const { chromium } = require('playwright');

(async () => {
  console.log('測試預覽顯示修復...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const page = await browser.newPage();
  
  try {
    // 測試生產URL
    console.log('導航到編輯器(生產版)...');
    await page.goto('https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(2000);
    
    // 點擊第一個模板
    console.log('點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    if (firstTemplate) {
      await firstTemplate.click();
      await page.waitForTimeout(1000);
      
      // 測試副標題
      const subtitleInput = await page.$('input[placeholder*="台北市信義區"]');
      if (subtitleInput) {
        console.log('🧪 測試副標題...');
        await subtitleInput.fill('測試副標題顯示');
        await page.waitForTimeout(500);
        
        const preview = await page.textContent('.bubble-preview');
        console.log('👁️ 副標題在預覽中:', preview?.includes('測試副標題顯示') ? '✅顯示' : '❌不顯示');
        console.log('🔍 預覽內容片段:', preview?.substring(0, 100));
      } else {
        console.log('❌ 找不到副標題輸入框');
      }
      
      // 測試下方內容
      const bottomTextarea = await page.$('textarea[placeholder*="工程進度說明"]');
      if (bottomTextarea) {
        console.log('🧪 測試下方內容...');
        await bottomTextarea.fill('測試下方內容顯示');
        await page.waitForTimeout(500);
        
        const preview2 = await page.textContent('.bubble-preview');
        console.log('👁️ 下方內容在預覽中:', preview2?.includes('測試下方內容顯示') ? '✅顯示' : '❌不顯示');
      } else {
        console.log('❌ 找不到下方內容輸入框');
      }
      
      // 測試日期資訊
      const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
      if (dateInput) {
        console.log('🧪 測試日期資訊...');
        await dateInput.fill('2025-08-25 測試日期顯示');
        await page.waitForTimeout(500);
        
        const preview3 = await page.textContent('.bubble-preview');
        console.log('👁️ 日期在預覽中:', preview3?.includes('2025-08-25 測試日期顯示') ? '✅顯示' : '❌不顯示');
      } else {
        console.log('❌ 找不到日期資訊輸入框');
      }
      
      // 顯示完整預覽內容以便調試
      const fullPreview = await page.textContent('.bubble-preview');
      console.log('\\n📝 完整預覽內容:');
      console.log(fullPreview?.substring(0, 200) + '...');
      
    } else {
      console.log('❌ 找不到模板項目');
    }
    
    console.log('\\n📸 保持瀏覽器開啟 8 秒供檢視...');
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 瀏覽器已關閉');
  }
})();