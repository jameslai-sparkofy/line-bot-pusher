const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查 flex-render 生成的 HTML...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://d2fbb428.line-bot-pusher.pages.dev/flex-carousel-editor');
    await page.waitForTimeout(3000);
    
    // 選擇第一個模板
    const templates = await page.$$('.template-item');
    if (templates.length > 0) {
      await templates[0].click();
      await page.waitForTimeout(2000);
    }
    
    // 取得 flex-render-container 的完整 HTML
    const flexHtml = await page.$eval('.flex-render-container', el => el.innerHTML);
    console.log('📋 Flex-render HTML (前 1000 字元):');
    console.log(flexHtml.substring(0, 1000));
    
    // 檢查是否有 background-image 的 style
    const hasBackgroundImages = flexHtml.includes('background-image:url');
    console.log('🖼️  包含背景圖片樣式:', hasBackgroundImages);
    
    // 檢查是否有 img 標籤
    const hasImgTags = flexHtml.includes('<img');
    console.log('🏷️  包含 img 標籤:', hasImgTags);
    
    // 尋找所有圖片相關的 URL
    const imageUrls = flexHtml.match(/url\([^)]+\)/g) || [];
    console.log('🔗 找到的圖片 URLs:');
    imageUrls.forEach(url => console.log('  -', url));
    
    // 檢查原始 carouselData
    const originalData = await page.evaluate(() => {
      if (typeof carouselData !== 'undefined') {
        return JSON.stringify(carouselData, null, 2);
      }
      return 'carouselData not found';
    });
    
    console.log('📊 原始 CarouselData 的 hero URLs:');
    try {
      const data = JSON.parse(originalData);
      data.contents?.forEach((bubble, index) => {
        console.log(`  Bubble ${index + 1}: ${bubble.hero?.url || 'none'}`);
      });
    } catch (e) {
      console.log('無法解析 carouselData');
    }
    
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 測試完成');
  }
})();