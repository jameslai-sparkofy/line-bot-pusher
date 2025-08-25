const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查模板資料載入過程...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://72cc46d9.line-bot-pusher.pages.dev/flex-carousel-editor');
    await page.waitForTimeout(3000);
    
    // 檢查 templates 陣列
    const templatesInfo = await page.evaluate(() => {
      if (typeof templates !== 'undefined') {
        return templates.map((template, index) => {
          const bubble = template.carouselData?.contents?.[0];
          return {
            index,
            title: template.title,
            hasCarouselData: !!template.carouselData,
            bubbleType: bubble?.type,
            heroUrl: bubble?.hero?.url,
            heroType: bubble?.hero?.type
          };
        });
      }
      return { error: 'templates not found' };
    });
    
    console.log('📋 Templates 資料:');
    templatesInfo.forEach(template => {
      console.log(`  ${template.index + 1}. ${template.title}:`);
      console.log(`     - 有 CarouselData: ${template.hasCarouselData}`);
      console.log(`     - Hero URL: ${template.heroUrl || 'none'}`);
      console.log(`     - Hero Type: ${template.heroType || 'none'}`);
    });
    
    // 選擇第一個模板並檢查
    const firstTemplate = await page.$('.template-item');
    if (firstTemplate) {
      await firstTemplate.click();
      await page.waitForTimeout(1000);
      
      // 檢查當前 carouselData
      const currentData = await page.evaluate(() => {
        if (typeof carouselData !== 'undefined' && carouselData.contents) {
          const bubble = carouselData.contents[0];
          return {
            type: bubble.type,
            heroUrl: bubble?.hero?.url,
            heroSize: bubble?.hero?.size,
            bodyContentsCount: bubble?.body?.contents?.length || 0
          };
        }
        return { error: 'carouselData not found' };
      });
      
      console.log('🎯 當前 CarouselData (第一個模板選中後):');
      console.log(currentData);
    }
    
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 測試完成');
  }
})();