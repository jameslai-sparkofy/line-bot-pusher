const { chromium } = require('playwright');

(async () => {
  console.log('🔍 檢查所有環境網址...');
  
  const browser = await chromium.launch({ headless: true });
  
  const urls = [
    'https://line-bot-pusher.pages.dev/flex-carousel-editor',
    'https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', 
    'https://dev.line-bot-pusher.pages.dev/flex-carousel-editor'
  ];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n📋 測試 ${i + 1}: ${url}`);
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      // 檢查頁面標題
      const title = await page.title();
      console.log(`  📝 標題: ${title}`);
      
      // 檢查是否有 JavaScript 功能
      const jsCheck = await page.evaluate(() => {
        return {
          hasInit: typeof init === 'function',
          hasTemplates: typeof templates !== 'undefined',
          templateCount: typeof templates !== 'undefined' ? templates.length : 0
        };
      });
      
      console.log(`  🔧 JavaScript: ${jsCheck.hasInit ? '✅' : '❌'}`);
      console.log(`  📊 模板數量: ${jsCheck.templateCount}`);
      
      // 檢查最後修改時間或版本信息
      const metaInfo = await page.evaluate(() => {
        const generators = Array.from(document.querySelectorAll('meta[name="generator"]'));
        const lastModified = document.lastModified;
        return { generators: generators.map(g => g.content), lastModified };
      });
      
      console.log(`  ⏰ 最後修改: ${metaInfo.lastModified}`);
      
      await page.close();
      
    } catch (error) {
      console.log(`  ❌ 錯誤: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ 測試完成');
})();