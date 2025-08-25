const { chromium } = require('playwright');

(async () => {
  console.log('調試日期資訊顯示問題...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('導航到編輯器...');
    await page.goto('https://e689f71e.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(2000);
    
    // 監聽控制台訊息
    page.on('console', msg => {
      if (msg.text().includes('日期') || msg.text().includes('date')) {
        console.log('🔍 前端日誌:', msg.text());
      }
    });
    
    // 點擊第一個模板
    console.log('點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    if (firstTemplate) {
      await firstTemplate.click();
      await page.waitForTimeout(1000);
      
      // 檢查日期輸入框
      const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
      if (dateInput) {
        console.log('✅ 找到日期輸入框');
        
        // 清空並輸入新值
        await dateInput.fill('');
        await page.waitForTimeout(300);
        await dateInput.fill('2025-08-25 調試日期');
        await page.waitForTimeout(1000);
        
        // 檢查 JSON 結構
        const currentData = await page.evaluate(() => {
          if (window.carouselData && window.carouselData.contents && window.currentTabIndex !== undefined) {
            const bubble = window.carouselData.contents[window.currentTabIndex];
            const body = bubble.body?.contents || [];
            
            console.log('🔍 Bubble body contents:', body.length, '個元素');
            body.forEach((item, index) => {
              console.log(`  ${index}:`, item.type, item.text?.substring(0, 30), 
                         item.color, item.size, item.wrap ? 'wrap' : '');
            });
            
            // 尋找日期資訊元素
            const dateElement = body.find(c => c.type === 'text' && c.color === '#aaaaaa' && c.size === 'xs');
            if (dateElement) {
              console.log('✅ 找到日期元素:', dateElement.text);
              return { found: true, text: dateElement.text };
            } else {
              console.log('❌ 找不到日期元素');
              return { found: false, text: null };
            }
          }
          return { error: 'No data available' };
        });
        
        console.log('📊 JSON 結構檢查:', currentData);
        
        // 檢查預覽內容
        const previewContent = await page.textContent('.bubble-preview');
        console.log('👁️ 日期是否在預覽中:', previewContent?.includes('2025-08-25 調試日期') ? '✅是' : '❌否');
        console.log('📝 完整預覽內容:', previewContent?.substring(0, 150));
        
      } else {
        console.log('❌ 找不到日期輸入框');
      }
    }
    
    console.log('\\n📸 保持瀏覽器開啟 10 秒供檢視...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.log('❌ 調試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 瀏覽器已關閉');
  }
})();