const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查圖片 URL 和載入狀況...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://72cc46d9.line-bot-pusher.pages.dev/flex-carousel-editor');
    await page.waitForTimeout(3000);
    
    // 選擇第一個模板查看內容
    const templates = await page.$$('.template-item');
    if (templates.length > 0) {
      await templates[0].click();
      await page.waitForTimeout(2000);
    }
    
    // 檢查當前編輯的模板資料
    const templateData = await page.evaluate(() => {
      if (typeof carouselData !== 'undefined' && carouselData.contents) {
        const bubble = carouselData.contents[currentTabIndex] || carouselData.contents[0];
        return {
          hasHero: !!bubble.hero,
          heroImageUrl: bubble.hero?.url || 'none',
          bodyContents: bubble.body?.contents || []
        };
      }
      return { error: 'carouselData not found' };
    });
    
    console.log('📋 模板資料:');
    console.log('  - 有 Hero 區塊:', templateData.hasHero);
    console.log('  - Hero 圖片 URL:', templateData.heroImageUrl);
    console.log('  - Body 內容數量:', templateData.bodyContents.length);
    
    // 檢查預覽區的 HTML 內容
    const previewHtml = await page.$eval('#carousel-preview', el => el.innerHTML);
    console.log('📋 預覽 HTML 片段:', previewHtml.substring(0, 500));
    
    // 檢查是否有圖片標籤
    const imageElements = await page.$$eval('#carousel-preview img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      }))
    );
    
    console.log('🖼️  預覽區圖片元素:', imageElements);
    
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 測試完成');
  }
})();