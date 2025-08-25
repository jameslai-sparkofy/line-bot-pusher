const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查圖片和按鈕預覽...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://d2fbb428.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(3000);
    
    // 檢查是否有圖片載入
    const images = await page.$$('img');
    console.log('📷 頁面圖片數量:', images.length);
    
    for (let i = 0; i < images.length; i++) {
      const src = await images[i].getAttribute('src');
      const naturalWidth = await images[i].evaluate(img => img.naturalWidth);
      const naturalHeight = await images[i].evaluate(img => img.naturalHeight);
      console.log(`圖片 ${i + 1}:`);
      console.log(`  - src: ${src}`);
      console.log(`  - 尺寸: ${naturalWidth}x${naturalHeight}`);
      console.log(`  - 載入狀態: ${naturalWidth > 0 ? '✅' : '❌'}`);
    }
    
    // 檢查按鈕
    const buttons = await page.$$('button, .btn, [role="button"]');
    console.log('🔘 按鈕元素數量:', buttons.length);
    
    // 檢查 flex-render 是否正確渲染
    const flexElements = await page.$$('.flex-bubble, .flex-message, .flex-render-container');
    console.log('🎯 Flex 渲染元素數量:', flexElements.length);
    
    // 檢查預覽容器內容
    const previewContent = await page.$eval('#carousel-preview', el => el.innerHTML);
    console.log('📋 預覽容器內容長度:', previewContent.length);
    console.log('📋 包含 flex-render-container:', previewContent.includes('flex-render-container'));
    
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 測試完成');
  }
})();