const { chromium } = require('playwright');

(async () => {
  console.log('測試底部內容和日期同步修復...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('導航到本地編輯器...');
    await page.goto('http://localhost:8788/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    console.log('等待頁面載入完成...');
    await page.waitForTimeout(2000);
    
    // 點擊第一個模板
    console.log('點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    if (firstTemplate) {
      await firstTemplate.click();
      await page.waitForTimeout(1000);
    }
    
    // 測試下方內容
    const bottomContentInput = await page.$('textarea[placeholder*="工程進度說明"]');
    if (bottomContentInput) {
      console.log('🧪 測試下方內容輸入...');
      await bottomContentInput.fill('這是底部內容測試 - 應該獨立');
      await page.waitForTimeout(500);
      
      // 檢查預覽
      const previewText = await page.textContent('.bubble-preview');
      console.log('👁️ 預覽包含底部內容:', previewText?.includes('這是底部內容測試') ? '是' : '否');
    } else {
      console.log('❌ 找不到下方內容輸入框');
    }
    
    // 測試日期資訊  
    const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
    if (dateInput) {
      console.log('🧪 測試日期資訊輸入...');
      await dateInput.fill('2025-08-25 測試日期 - 應該獨立');
      await page.waitForTimeout(500);
      
      // 檢查預覽
      const previewText2 = await page.textContent('.bubble-preview');
      console.log('👁️ 預覽包含日期資訊:', previewText2?.includes('2025-08-25 測試日期') ? '是' : '否');
      
      // 檢查底部內容是否還存在（確認沒有被覆蓋）
      console.log('👁️ 預覽仍包含底部內容:', previewText2?.includes('這是底部內容測試') ? '是' : '否');
    } else {
      console.log('❌ 找不到日期資訊輸入框');
    }
    
    // 清空日期資訊，測試底部內容是否保持
    if (dateInput) {
      console.log('🧪 清空日期資訊...');
      await dateInput.fill('');
      await page.waitForTimeout(500);
      
      const previewText3 = await page.textContent('.bubble-preview');
      console.log('👁️ 清空日期後底部內容依然存在:', previewText3?.includes('這是底部內容測試') ? '是' : '否');
    }
    
    // 清空底部內容，測試日期資訊是否獨立
    if (bottomContentInput && dateInput) {
      await dateInput.fill('2025-08-25 最終測試');
      await bottomContentInput.fill('');
      await page.waitForTimeout(500);
      
      const previewText4 = await page.textContent('.bubble-preview');
      console.log('👁️ 清空底部內容後日期依然存在:', previewText4?.includes('2025-08-25 最終測試') ? '是' : '否');
    }
    
    console.log('\n✅ 同步測試完成，瀏覽器將保持開啟 5 秒供檢視...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 瀏覽器已關閉');
  }
})();