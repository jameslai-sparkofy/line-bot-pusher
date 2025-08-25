const { chromium } = require('playwright');

(async () => {
  console.log('啟動瀏覽器測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('導航到編輯器頁面...');
    await page.goto('https://46d566b2.line-bot-pusher.pages.dev/flex-carousel-editor', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('等待頁面載入完成...');
    await page.waitForTimeout(3000);
    
    // 檢查頁面標題
    const title = await page.title();
    console.log('頁面標題:', title);
    
    // 監聽所有控制台訊息
    const allLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      allLogs.push(msg.type() + ': ' + text);
    });
    
    page.on('pageerror', error => {
      allLogs.push('頁面錯誤: ' + error.message);
    });
    
    // 檢查關鍵元素是否存在
    const checks = [
      { selector: '.template-panel', name: '模板面板' },
      { selector: '.content-editor', name: '內容編輯區' },
      { selector: '.variable-panel', name: '變數管理面板' },
      { selector: '.preview-area', name: '預覽區' },
      { selector: '#template-title', name: '模板標題輸入框' },
      { selector: '#variable-list', name: '變數列表' }
    ];
    
    for (const check of checks) {
      const element = await page.$(check.selector);
      if (element) {
        console.log('✅', check.name, '存在');
      } else {
        console.log('❌', check.name, '不存在');
      }
    }
    
    // 檢查模板列表是否有內容
    await page.waitForTimeout(5000); // 增加等待時間讓API載入
    const templateItems = await page.$$('.template-item');
    console.log('📋 模板數量:', templateItems.length);
    
    // 檢查是否有具體的模板名稱
    const templateNames = await page.$$eval('.template-item', items => 
        items.map(item => item.textContent.trim())
    );
    console.log('📋 模板列表:', templateNames);
    
    // 等待載入完成
    await page.waitForTimeout(3000);
    
    // 顯示所有控制台訊息
    console.log('\n--- 控制台訊息 ---');
    allLogs.forEach(log => console.log('📝', log));
    
    // 檢查變數面板是否正常載入
    await page.waitForTimeout(1000);
    const variableItems = await page.$$('.variable-item');
    console.log('🔧 變數數量:', variableItems.length);
    
    // 點擊第一個模板進入編輯模式
    try {
      await page.waitForTimeout(2000);
      const firstTemplate = await page.$('.template-item');
      if (firstTemplate) {
        console.log('✅ 點擊第一個模板');
        await firstTemplate.click();
        await page.waitForTimeout(2000);
        
        // 檢查模板標題輸入框是否有值
        const titleInput = await page.$('#template-title');
        const titleValue = await titleInput?.inputValue();
        console.log('📝 模板標題:', titleValue);
        
        // 檢查是否有表單欄位
        const mainTitle = await page.$('input[placeholder="例：勝美 - 建功段"]');
        const subtitle = await page.$('input[placeholder="例：台北市信義區"]');
        const bottomContent = await page.$('textarea[placeholder="例：工程進度說明或其他補充資訊"]');
        const dateInfo = await page.$('input[placeholder="例：2025-08-24 進度報告"]');
        const imageUpload = await page.$('input[type="file"]');
        
        console.log('📝 主標題欄位:', mainTitle ? '存在' : '不存在');
        console.log('📝 副標題欄位:', subtitle ? '存在' : '不存在');
        console.log('📝 下方內容欄位:', bottomContent ? '存在' : '不存在');
        console.log('📝 日期資訊欄位:', dateInfo ? '存在' : '不存在');
        console.log('📝 圖片上傳欄位:', imageUpload ? '存在' : '不存在');
        
        // 測試副標題功能
        if (subtitle) {
          console.log('🧪 測試副標題功能...');
          await subtitle.fill('測試副標題');
          await page.waitForTimeout(1000);
          
          // 檢查預覽區是否更新
          const previewText = await page.textContent('.bubble-preview');
          console.log('👁️ 預覽內容包含測試副標題:', previewText?.includes('測試副標題') ? '是' : '否');
        }
        
        // 測試下方內容和日期資訊
        if (bottomContent && dateInfo) {
          console.log('🧪 測試下方內容和日期資訊...');
          await bottomContent.fill('這是下方內容測試');
          await dateInfo.fill('2025-08-25 測試日期');
          await page.waitForTimeout(1000);
          
          const previewText2 = await page.textContent('.bubble-preview');
          console.log('👁️ 預覽包含下方內容:', previewText2?.includes('這是下方內容測試') ? '是' : '否');
          console.log('👁️ 預覽包含日期資訊:', previewText2?.includes('2025-08-25 測試日期') ? '是' : '否');
        }
        
        // 測試圖片上傳功能
        if (imageUpload) {
          console.log('🧪 測試圖片上傳功能...');
          try {
            // 創建一個測試圖片文件
            const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
            
            // 監聽console訊息
            const uploadLogs = [];
            page.on('console', msg => {
              if (msg.text().includes('上傳') || msg.text().includes('設定圖片') || msg.text().includes('hero')) {
                uploadLogs.push(msg.text());
              }
            });
            
            // 模擬文件上傳
            await imageUpload.setInputFiles([{
              name: 'test-image.png',
              mimeType: 'image/png',
              buffer: testImageBuffer
            }]);
            
            // 等待上傳完成
            await page.waitForTimeout(5000);
            
            console.log('📸 圖片上傳日誌:');
            uploadLogs.forEach(log => console.log('  ', log));
            
            // 檢查預覽圖片是否更新
            const heroImage = await page.$('.hero-preview');
            const imageSrc = await heroImage?.getAttribute('src');
            const imageDisplay = await heroImage?.getAttribute('style');
            
            console.log('👁️ 預覽圖片src:', imageSrc || '無');
            console.log('👁️ 預覽圖片display:', imageDisplay?.includes('block') ? '顯示' : '隱藏');
            
            // 檢查氣泡預覽中的圖片
            const bubbleImage = await page.$('.bubble-preview .bubble-image');
            if (bubbleImage) {
              const bubbleImageContent = await bubbleImage.innerHTML();
              console.log('👁️ 氣泡預覽圖片:', bubbleImageContent.includes('<img') ? '有圖片' : '無圖片');
              if (bubbleImageContent.includes('<img')) {
                const imgSrc = bubbleImageContent.match(/src="([^"]+)"/);
                console.log('👁️ 氣泡預覽圖片src:', imgSrc ? imgSrc[1] : '無src');
                
                // 測試圖片URL是否可以訪問
                if (imgSrc && imgSrc[1]) {
                  try {
                    const imgResponse = await page.goto(imgSrc[1]);
                    console.log('🌐 圖片URL測試:', imgResponse?.status() || 'failed');
                    await page.goBack();
                  } catch (e) {
                    console.log('🌐 圖片URL測試失敗:', e.message);
                  }
                }
              }
            }
            
          } catch (e) {
            console.log('❌ 圖片上傳測試失敗:', e.message);
          }
        }
        
      } else {
        console.log('❌ 找不到模板項目');
      }
    } catch (e) {
      console.log('❌ 模板測試失敗:', e.message);
    }
    
    console.log('\n測試完成，瀏覽器將保持開啟 10 秒供檢視...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.log('❌ 測試過程中發生錯誤:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 已截圖保存為 error-screenshot.png');
  } finally {
    await browser.close();
    console.log('✅ 瀏覽器已關閉');
  }
})();