const { chromium } = require('playwright');

(async () => {
  console.log('檢查JSON結構...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    await page.waitForTimeout(2000);
    
    // 點擊第一個模板
    console.log('點擊第一個模板...');
    const firstTemplate = await page.$('.template-item');
    await firstTemplate.click();
    await page.waitForTimeout(1000);
    
    // 檢查JSON結構
    const jsonStructure = await page.evaluate(() => {
      // 嘗試獲取當前模板數據
      if (typeof carouselData !== 'undefined' && carouselData && carouselData.contents && carouselData.contents[0]) {
        const bubble = carouselData.contents[0];
        const body = bubble.body?.contents || [];
        
        console.log('🔍 Body contents 總數:', body.length);
        
        const result = {
          totalElements: body.length,
          elements: []
        };
        
        body.forEach((item, index) => {
          const element = {
            index: index,
            type: item.type,
            text: item.text ? item.text.substring(0, 50) : '(no text)',
            color: item.color || '(no color)',
            size: item.size || '(no size)',
            weight: item.weight || '(no weight)',
            wrap: item.wrap || false,
            margin: item.margin || '(no margin)'
          };
          
          result.elements.push(element);
          console.log(`  ${index}:`, element.type, element.text, 
                     element.color, element.size, element.wrap ? 'wrap' : '');
        });
        
        return result;
      } else {
        return { error: 'No carouselData available' };
      }
    });
    
    console.log('\n📊 JSON 結構分析:');
    if (jsonStructure.error) {
      console.log('❌', jsonStructure.error);
    } else {
      console.log('✅ 總元素數:', jsonStructure.totalElements);
      
      jsonStructure.elements.forEach(el => {
        const typeIcon = el.type === 'text' ? '📝' : '📦';
        const colorInfo = el.color !== '(no color)' ? ` [${el.color}]` : '';
        const sizeInfo = el.size !== '(no size)' ? ` (${el.size})` : '';
        const wrapInfo = el.wrap ? ' +wrap' : '';
        
        console.log(`${typeIcon} [${el.index}] ${el.text}${colorInfo}${sizeInfo}${wrapInfo}`);
        
        // 判斷元素類型
        if (el.type === 'text') {
          if (el.weight === 'bold') {
            console.log('    ↳ 🎯 這是主標題');
          } else if (el.color === '#aaaaaa' && el.size === 'xs') {
            console.log('    ↳ 📅 這是日期資訊');
          } else if (el.wrap && el.color !== '#aaaaaa') {
            console.log('    ↳ 📄 這是底部內容');
          } else if (!el.wrap && el.color !== '#aaaaaa' && el.size !== 'xs') {
            console.log('    ↳ 📌 這是副標題');
          }
        }
      });
    }
    
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
  } finally {
    await browser.close();
    console.log('✅ 完成');
  }
})();