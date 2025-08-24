const { chromium } = require('playwright');

async function debugSyntax() {
  console.log('🔍 詳細診斷語法錯誤...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let jsErrors = [];
  let consoleErrors = [];
  
  // 捕獲所有錯誤和日誌
  page.on('pageerror', (error) => {
    jsErrors.push({
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    await page.goto('https://line-bot-pusher.pages.dev/management', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(5000);
    
    console.log(`📊 詳細錯誤分析:`);
    
    if (jsErrors.length > 0) {
      console.log(`\n🚨 JavaScript 錯誤 (${jsErrors.length} 個):`);
      jsErrors.forEach((error, index) => {
        console.log(`\n錯誤 ${index + 1}:`);
        console.log(`  類型: ${error.name}`);
        console.log(`  訊息: ${error.message}`);
        if (error.stack) {
          console.log(`  堆疊: ${error.stack.split('\n')[1] || error.stack.split('\n')[0]}`);
        }
      });
    }
    
    if (consoleErrors.length > 0) {
      console.log(`\n📝 Console 錯誤 (${consoleErrors.length} 個):`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 嘗試檢查 JavaScript 腳本載入
    const scriptTags = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      return Array.from(scripts).map(script => ({
        src: script.src || 'inline',
        hasContent: script.textContent.length > 0,
        contentPreview: script.textContent.substring(0, 100) + '...'
      }));
    });
    
    console.log(`\n📜 Script 標籤 (${scriptTags.length} 個):`);
    scriptTags.forEach((script, index) => {
      console.log(`  ${index + 1}. ${script.src} (內容: ${script.hasContent ? '有' : '無'})`);
      if (script.hasContent) {
        console.log(`     預覽: ${script.contentPreview}`);
      }
    });
    
  } catch (error) {
    console.error('❌ 診斷失敗:', error.message);
  } finally {
    await browser.close();
  }
}

debugSyntax();