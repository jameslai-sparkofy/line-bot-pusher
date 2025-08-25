const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查資料庫模板資料...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    // 直接呼叫 API 檢查資料庫中的模板
    await page.goto('https://72cc46d9.line-bot-pusher.pages.dev/api/flex-templates');
    await page.waitForTimeout(2000);
    
    const apiResponse = await page.textContent('body');
    console.log('📋 API 回應:');
    
    try {
      const response = JSON.parse(apiResponse);
      response.templates.forEach((template, index) => {
        console.log(`模板 ${index + 1}: ${template.template_name}`);
        
        try {
          const carouselData = JSON.parse(template.flex_content);
          const bubble = carouselData.contents?.[0];
          
          console.log(`  - Hero URL: ${bubble?.hero?.url || 'none'}`);
          console.log(`  - Hero Type: ${bubble?.hero?.type || 'none'}`);
          console.log(`  - Body 內容數量: ${bubble?.body?.contents?.length || 0}`);
        } catch (e) {
          console.log(`  - Carousel 資料解析錯誤: ${e.message}`);
        }
        console.log('');
      });
    } catch (e) {
      console.log('API 回應解析錯誤:', e.message);
      console.log('原始回應:', apiResponse);
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.log('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 測試完成');
  }
})();