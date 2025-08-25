const { chromium } = require('playwright');

(async () => {
  console.log('📺 演示測試 - 生產網址: https://46d566b2.line-bot-pusher.pages.dev');
  console.log('==================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1200 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 導航到生產版本...');
    await page.goto('https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(3000);
    
    console.log('🎯 點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    if (firstTemplate) {
      await firstTemplate.click();
      await page.waitForTimeout(2000);
      
      // 顯示初始狀態
      console.log('\\n📋 初始預覽內容:');
      const initialPreview = await page.textContent('.bubble-preview');
      console.log('"' + initialPreview?.substring(0, 100) + '..."');
      
      console.log('\\n🧪 開始測試各功能...');
      console.log('─'.repeat(50));
      
      // 測試1: 副標題
      console.log('1️⃣ 測試副標題功能...');
      const subtitleInput = await page.$('input[placeholder*="台北市信義區"]');
      if (subtitleInput) {
        await subtitleInput.fill('測試副標題內容');
        await page.waitForTimeout(1000);
        
        const preview1 = await page.textContent('.bubble-preview');
        const hasSubtitle = preview1?.includes('測試副標題內容');
        console.log('   結果: ' + (hasSubtitle ? '✅ 副標題正常顯示' : '❌ 副標題未顯示'));
        console.log('   預覽: "' + preview1?.substring(0, 120) + '..."');
      } else {
        console.log('   ❌ 找不到副標題輸入框');
      }
      
      console.log('\\n2️⃣ 測試底部內容功能...');
      const bottomInput = await page.$('textarea[placeholder*="工程進度說明"]');
      if (bottomInput) {
        await bottomInput.fill('這是底部內容測試');
        await page.waitForTimeout(1000);
        
        const preview2 = await page.textContent('.bubble-preview');
        const hasBottom = preview2?.includes('這是底部內容測試');
        console.log('   結果: ' + (hasBottom ? '✅ 底部內容正常顯示' : '❌ 底部內容未顯示'));
        console.log('   預覽: "' + preview2?.substring(0, 120) + '..."');
      } else {
        console.log('   ❌ 找不到底部內容輸入框');
      }
      
      console.log('\\n3️⃣ 測試日期資訊功能...');
      const dateInput = await page.$('input[placeholder*="2025-08-24 進度報告"]');
      if (dateInput) {
        await dateInput.fill('2025-08-25 演示日期');
        await page.waitForTimeout(1000);
        
        const preview3 = await page.textContent('.bubble-preview');
        const hasDate = preview3?.includes('2025-08-25 演示日期');
        console.log('   結果: ' + (hasDate ? '✅ 日期資訊正常顯示' : '❌ 日期資訊未顯示'));
        console.log('   預覽: "' + preview3?.substring(0, 120) + '..."');
      } else {
        console.log('   ❌ 找不到日期資訊輸入框');
      }
      
      console.log('\\n4️⃣ 檢查欄位獨立性...');
      if (bottomInput && dateInput) {
        const bottomValue = await bottomInput.inputValue();
        const dateValue = await dateInput.inputValue();
        
        console.log('   底部內容值: "' + bottomValue + '"');
        console.log('   日期資訊值: "' + dateValue + '"'); 
        console.log('   結果: ' + (bottomValue !== dateValue ? '✅ 欄位完全獨立' : '❌ 欄位有同步問題'));
      }
      
      console.log('\\n📊 最終測試結果:');
      console.log('─'.repeat(50));
      const finalPreview = await page.textContent('.bubble-preview');
      console.log('完整預覽內容:');
      console.log('"' + finalPreview + '"');
      
    } else {
      console.log('❌ 找不到模板');
    }
    
    console.log('\\n⏰ 瀏覽器將保持開啟 10 秒供確認...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.log('❌ 演示失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 演示完成');
  }
})();