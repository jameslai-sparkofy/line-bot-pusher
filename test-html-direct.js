const { chromium } = require('playwright');

(async () => {
  console.log('直接測試 HTML 修改...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('導航到線上編輯器...');
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
    }
    
    // 直接找到下方內容輸入框並測試
    console.log('尋找下方內容輸入框...');
    const bottomTextarea = await page.$('textarea[placeholder*="工程進度說明"]');
    if (bottomTextarea) {
      console.log('✅ 找到下方內容輸入框');
      await bottomTextarea.fill('測試底部內容-獨立');
      await page.waitForTimeout(500);
      
      // 檢查預覽
      const preview = await page.textContent('.bubble-preview');
      console.log('👁️ 預覽包含底部內容:', preview?.includes('測試底部內容-獨立') ? '✅是' : '❌否');
    } else {
      console.log('❌ 找不到下方內容輸入框');
    }
    
    // 直接找到日期輸入框並測試
    console.log('尋找日期資訊輸入框...');
    const dateInput = await page.$('input[placeholder*="2025-08-24"]');
    if (dateInput) {
      console.log('✅ 找到日期資訊輸入框');
      await dateInput.fill('2025-08-25 測試日期-獨立');
      await page.waitForTimeout(500);
      
      // 檢查預覽
      const preview2 = await page.textContent('.bubble-preview');
      console.log('👁️ 預覽包含日期:', preview2?.includes('2025-08-25 測試日期-獨立') ? '✅是' : '❌否');
      console.log('👁️ 底部內容還在:', preview2?.includes('測試底部內容-獨立') ? '✅是' : '❌否');
      
      // 檢查是否有衝突 - 修改日期後底部內容值是否改變
      if (bottomTextarea) {
        const bottomValue = await bottomTextarea.inputValue();
        console.log('🔍 底部內容值:', bottomValue);
        console.log('👁️ 底部內容未被覆蓋:', bottomValue === '測試底部內容-獨立' ? '✅是' : '❌否');
      }
      
      // 反向測試 - 修改底部內容，看日期是否改變
      if (bottomTextarea) {
        await bottomTextarea.fill('修改後的底部內容');
        await page.waitForTimeout(500);
        
        const dateValue = await dateInput.inputValue();
        console.log('🔍 日期值:', dateValue);
        console.log('👁️ 日期未被覆蓋:', dateValue === '2025-08-25 測試日期-獨立' ? '✅是' : '❌否');
      }
      
    } else {
      console.log('❌ 找不到日期資訊輸入框');
    }
    
    console.log('\n📸 保持瀏覽器開啟 10 秒供檢視...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 瀏覽器已關閉');
  }
})();