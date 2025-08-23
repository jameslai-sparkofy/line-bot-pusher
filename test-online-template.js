const { chromium } = require('playwright');

async function testOnlineTemplateEditor() {
  console.log('🌐 開始測試線上模板編輯器...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 等待部署完成並檢查網站狀態
    console.log('⏳ 等待 Cloudflare 部署完成...');
    let retryCount = 0;
    const maxRetries = 10;
    
    while (retryCount < maxRetries) {
      try {
        const response = await page.goto('https://line-bot-pusher.pages.dev/health', { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        if (response.status() === 200) {
          const healthData = await page.textContent('body');
          console.log('✅ 網站健康狀態:', healthData.substring(0, 100));
          break;
        }
      } catch (error) {
        console.log(`🔄 重試 ${retryCount + 1}/${maxRetries}: ${error.message}`);
        retryCount++;
        await page.waitForTimeout(3000);
      }
    }

    if (retryCount >= maxRetries) {
      throw new Error('網站部署可能還未完成');
    }

    // 2. 導航到模板編輯器
    console.log('📝 導航到線上模板編輯器...');
    await page.goto('https://line-bot-pusher.pages.dev/template-editor');
    await page.waitForLoadState('networkidle');

    // 檢查頁面是否正確加載
    const pageTitle = await page.title();
    console.log('📄 頁面標題:', pageTitle);

    if (pageTitle.includes('LINE Bot 推送系統') && !pageTitle.includes('訊息模板編輯器')) {
      console.log('⚠️  模板編輯器頁面可能還未部署，顯示的是 fallback 頁面');
      
      // 嘗試直接訪問管理介面
      console.log('🔄 嘗試訪問管理介面...');
      await page.goto('https://line-bot-pusher.pages.dev/management');
      await page.waitForLoadState('networkidle');
      
      const mgmtTitle = await page.title();
      console.log('📄 管理頁面標題:', mgmtTitle);
      
      await page.screenshot({ 
        path: './test-results/management-page.png', 
        fullPage: true 
      });
      
      return;
    }

    // 3. 填寫多頁工地報告模板
    console.log('📋 建立多頁工地進度報告模板...');
    
    await page.fill('#templateName', '多頁工地進度報告');
    await page.fill('#templateDescription', '包含總覽、各棟進度、問題報告的多頁式工地進度報告');
    await page.selectOption('#templateCategory', '工程部');

    // 4. 新增變數 - 專案名稱
    console.log('🔢 新增變數: 專案名稱');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'project_name');
    await page.selectOption('#varType', 'string');
    await page.fill('#varDescription', '工程專案名稱');
    await page.fill('#varExample', '台北101大樓整修工程');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    await page.waitForSelector('#addVariableModal[style*="none"]');

    // 5. 新增變數 - 整體進度
    console.log('🔢 新增變數: 整體進度');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'overall_progress');
    await page.selectOption('#varType', 'number');
    await page.fill('#varDescription', '整體完成進度 (0-100)');
    await page.fill('#varExample', '75');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    await page.waitForSelector('#addVariableModal[style*="none"]');

    // 6. 新增變數 - A棟進度
    console.log('🔢 新增變數: A棟進度');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'building_a_progress');
    await page.selectOption('#varType', 'number');
    await page.fill('#varDescription', 'A棟完成進度 (0-100)');
    await page.fill('#varExample', '85');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    await page.waitForSelector('#addVariableModal[style*="none"]');

    // 7. 新增變數 - B棟進度
    console.log('🔢 新增變數: B棟進度');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'building_b_progress');
    await page.selectOption('#varType', 'number');
    await page.fill('#varDescription', 'B棟完成進度 (0-100)');
    await page.fill('#varExample', '60');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    await page.waitForSelector('#addVariableModal[style*="none"]');

    // 8. 新增變數 - 專案負責人
    console.log('🔢 新增變數: 專案負責人');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'project_manager');
    await page.selectOption('#varType', 'string');
    await page.fill('#varDescription', '專案負責人姓名');
    await page.fill('#varExample', '王建民');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    await page.waitForSelector('#addVariableModal[style*="none"]');

    // 9. 新增變數 - 預計完工日
    console.log('🔢 新增變數: 預計完工日');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'estimated_completion');
    await page.selectOption('#varType', 'date');
    await page.fill('#varDescription', '預計完工日期');
    await page.fill('#varExample', '2024-12-31');
    await page.click('button:has-text("新增")'); // 不必填
    await page.waitForSelector('#addVariableModal[style*="none"]');

    // 10. 編寫多頁式模板內容
    console.log('📝 編寫多頁模板內容...');
    const multiPageTemplate = `🏗️ 工地進度報告
專案：{{project_name}}

═══════════════════════════
📊 第一頁：整體進度總覽
═══════════════════════════

🎯 整體完成度：{{overall_progress}}%
👨‍💼 專案負責人：{{project_manager}}
📅 預計完工：{{estimated_completion}}
⏰ 更新時間：{{timestamp}}

進度條：{{progress_bar}}

═══════════════════════════
🏢 第二頁：A棟施工進度
═══════════════════════════

🏗️ A棟進度：{{building_a_progress}}%
📊 A棟進度條：█████████░ {{building_a_progress}}%

✅ 已完成項目：
• 基礎工程
• 鋼筋混凝土澆置
• 外牆施工

⏳ 進行中項目：
• 內裝工程
• 水電配置

═══════════════════════════
🏢 第三頁：B棟施工進度  
═══════════════════════════

🏗️ B棟進度：{{building_b_progress}}%
📊 B棟進度條：██████░░░░ {{building_b_progress}}%

✅ 已完成項目：
• 基礎工程
• 結構工程

⏳ 進行中項目：
• 外牆施工
• 屋頂工程

═══════════════════════════
📋 第四頁：總結與聯絡資訊
═══════════════════════════

📈 專案整體狀況良好
🔧 如有問題請聯繫：{{project_manager}}

💬 備註：此為多頁式報告範例
實際使用可拆分為 LINE Carousel`;

    await page.fill('#templateContent', multiPageTemplate);

    // 11. 預覽模板
    console.log('👁️ 預覽多頁模板...');
    await page.click('button:has-text("👁️ 預覽")');
    await page.waitForTimeout(1000);

    // 截圖預覽效果
    await page.screenshot({ 
      path: './test-results/template-preview.png', 
      fullPage: true 
    });

    // 12. 儲存模板
    console.log('💾 儲存多頁模板...');
    await page.click('button:has-text("💾 儲存模板")');
    
    // 等待儲存響應
    await page.waitForTimeout(3000);

    // 13. 導航到模板列表頁面
    console.log('📋 檢查模板列表...');
    await page.goto('https://line-bot-pusher.pages.dev/templates');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 截圖模板列表
    await page.screenshot({ 
      path: './test-results/template-list.png', 
      fullPage: true 
    });

    // 14. 測試多頁模板發送
    console.log('🧪 測試多頁模板發送...');
    
    // 設置對話框處理器
    let dialogCount = 0;
    const testVariables = {
      'project_name': '台北101大樓整修工程',
      'overall_progress': '75',
      'building_a_progress': '85', 
      'building_b_progress': '60',
      'project_manager': '王建民',
      'estimated_completion': '2024-12-31'
    };

    page.on('dialog', async dialog => {
      dialogCount++;
      const message = dialog.message();
      console.log(`💬 對話框 ${dialogCount}: ${message.substring(0, 50)}...`);
      
      // 根據對話框內容提供相應的值
      for (const [varName, value] of Object.entries(testVariables)) {
        if (message.includes(varName)) {
          console.log(`📝 輸入變數 ${varName}: ${value}`);
          await dialog.accept(value);
          return;
        }
      }
      
      // 選擇預覽模式
      if (message.includes('預覽') || message.includes('確定')) {
        console.log('👁️ 選擇預覽模式');
        await dialog.accept();
        return;
      }
      
      // 默認接受
      await dialog.accept();
    });

    // 點擊第一個模板的測試按鈕
    const testButtons = await page.locator('button:has-text("🧪 測試")');
    if (await testButtons.count() > 0) {
      await testButtons.first().click();
      
      // 等待所有對話框處理完成
      await page.waitForTimeout(5000);
      
      console.log(`✅ 處理了 ${dialogCount} 個對話框`);
      
      // 如果打開了預覽窗口，截圖
      const pages = context.pages();
      if (pages.length > 1) {
        const previewPage = pages[pages.length - 1];
        await previewPage.waitForLoadState('load');
        await previewPage.screenshot({ 
          path: './test-results/message-preview.png'
        });
        console.log('📱 已截圖訊息預覽');
      }
    }

    console.log('✅ 多頁模板測試完成！');

  } catch (error) {
    console.error('❌ 線上測試發生錯誤:', error);
    await page.screenshot({ 
      path: './test-results/online-test-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 線上測試結束');
  }
}

// 確保目錄存在
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results', { recursive: true });
}

// 執行測試
testOnlineTemplateEditor().catch(console.error);