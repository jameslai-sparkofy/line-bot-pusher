const { chromium } = require('playwright');

(async () => {
  console.log('🔍 重新檢查所有環境網址...');
  
  const browser = await chromium.launch({ headless: true });
  
  const urls = [
    { name: '主域名', url: 'https://line-bot-pusher.pages.dev/flex-carousel-editor' },
    { name: '特定版本', url: 'https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor' },
    { name: '開發環境', url: 'https://dev.line-bot-pusher.pages.dev/flex-carousel-editor' }
  ];
  
  for (const { name, url } of urls) {
    console.log(`\n📋 測試 ${name}: ${url}`);
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      // 檢查頁面標題
      const title = await page.title();
      console.log(`  📝 標題: ${title}`);
      
      if (title === 'Deployment Not Found') {
        console.log('  ❌ 部署未找到');
        await page.close();
        continue;
      }
      
      // 檢查是否有 JavaScript 功能
      const jsCheck = await page.evaluate(() => {
        return {
          hasInit: typeof init === 'function',
          hasTemplates: typeof templates !== 'undefined',
          templateCount: typeof templates !== 'undefined' ? templates.length : 0
        };
      });
      
      console.log(`  🔧 JavaScript: ${jsCheck.hasInit ? '✅ 正常' : '❌ 無法載入'}`);
      console.log(`  📊 模板數量: ${jsCheck.templateCount}`);
      
      // 如果有模板，測試點擊第一個
      if (jsCheck.templateCount > 0) {
        const templateClick = await page.evaluate(() => {
          const firstTemplate = document.querySelector('.template-item');
          if (firstTemplate) {
            firstTemplate.click();
            return true;
          }
          return false;
        });
        
        if (templateClick) {
          await page.waitForTimeout(1000);
          console.log('  🎯 模板點擊測試: ✅ 成功');
        }
      }
      
      await page.close();
      
    } catch (error) {
      console.log(`  ❌ 錯誤: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ 測試完成');
})();