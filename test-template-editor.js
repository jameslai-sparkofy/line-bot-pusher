const { chromium } = require('playwright');

async function testTemplateEditor() {
  console.log('🚀 開始測試模板編輯器...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 導航到模板編輯器
    console.log('📝 導航到模板編輯器...');
    await page.goto('http://localhost:3000/template-editor');
    await page.waitForLoadState('networkidle');

    // 2. 填寫基本資訊
    console.log('📋 填寫模板基本資訊...');
    await page.fill('#templateName', '工地多階段進度報告');
    await page.fill('#templateDescription', '用於推送工地各階段完成進度的多頁報告');
    await page.selectOption('#templateCategory', '工程部');

    // 3. 新增第一個變數 - 專案名稱
    console.log('🔢 新增變數：專案名稱...');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'project_name');
    await page.selectOption('#varType', 'string');
    await page.fill('#varDescription', '工程專案名稱');
    await page.fill('#varExample', '台北101大樓整修工程');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    
    await page.waitForSelector('#addVariableModal[style*="none"]');
    console.log('✅ 已新增變數：專案名稱');

    // 4. 新增第二個變數 - 總進度
    console.log('🔢 新增變數：總進度...');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'total_progress');
    await page.selectOption('#varType', 'number');
    await page.fill('#varDescription', '整體完成進度百分比');
    await page.fill('#varExample', '75');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    
    await page.waitForSelector('#addVariableModal[style*="none"]');
    console.log('✅ 已新增變數：總進度');

    // 5. 新增第三個變數 - A棟進度
    console.log('🔢 新增變數：A棟進度...');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'building_a_progress');
    await page.selectOption('#varType', 'number');
    await page.fill('#varDescription', 'A棟完成進度百分比');
    await page.fill('#varExample', '85');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    
    await page.waitForSelector('#addVariableModal[style*="none"]');
    console.log('✅ 已新增變數：A棟進度');

    // 6. 新增第四個變數 - B棟進度
    console.log('🔢 新增變數：B棟進度...');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'building_b_progress');
    await page.selectOption('#varType', 'number');
    await page.fill('#varDescription', 'B棟完成進度百分比');
    await page.fill('#varExample', '65');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    
    await page.waitForSelector('#addVariableModal[style*="none"]');
    console.log('✅ 已新增變數：B棟進度');

    // 7. 新增負責人變數
    console.log('🔢 新增變數：專案負責人...');
    await page.click('button:has-text("+ 新增變數")');
    await page.waitForSelector('#addVariableModal[style*="flex"]');
    
    await page.fill('#varName', 'manager');
    await page.selectOption('#varType', 'string');
    await page.fill('#varDescription', '專案負責人姓名');
    await page.fill('#varExample', '王經理');
    await page.check('#varRequired');
    await page.click('button:has-text("新增")');
    
    await page.waitForSelector('#addVariableModal[style*="none"]');
    console.log('✅ 已新增變數：專案負責人');

    // 8. 編輯多頁模板內容
    console.log('📝 編輯多頁模板內容...');
    const templateContent = `🏗️ 工地進度報告 - {{project_name}}

📊 整體進度概覽
▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️
總進度：{{total_progress}}%
專案負責人：{{manager}}
更新時間：{{timestamp}}

━━━━━━━━━━━━━━━━━━━━

🏢 A棟施工進度
進度：{{building_a_progress}}%
進度條：{{building_a_progress|progressBar}}

🏢 B棟施工進度  
進度：{{building_b_progress}}%
進度條：{{building_b_progress|progressBar}}

━━━━━━━━━━━━━━━━━━━━

💡 這是一個模擬的多頁報告
實際使用時可以拆分為多個 Carousel 頁面
每個棟別都可以是獨立的一頁

📞 如有問題請聯繫：{{manager}}`;

    await page.fill('#templateContent', templateContent);

    // 9. 預覽模板
    console.log('👁️ 預覽模板效果...');
    await page.click('button:has-text("👁️ 預覽")');
    
    // 等待預覽更新
    await page.waitForTimeout(1000);
    
    const previewContent = await page.textContent('#previewContent');
    console.log('📱 預覽內容片段：', previewContent.substring(0, 200) + '...');

    // 10. 儲存模板
    console.log('💾 儲存模板...');
    await page.click('button:has-text("💾 儲存模板")');
    
    // 等待響應
    await page.waitForTimeout(2000);
    
    // 檢查是否有成功訊息或跳轉
    const currentUrl = page.url();
    console.log('📍 當前頁面：', currentUrl);

    // 11. 測試發送功能 - 導航到模板列表
    console.log('📋 導航到模板列表...');
    await page.goto('http://localhost:3000/templates');
    await page.waitForLoadState('networkidle');
    
    // 等待模板載入
    await page.waitForTimeout(2000);
    
    // 查找剛創建的模板
    const templateCards = await page.locator('.template-card');
    const templateCount = await templateCards.count();
    console.log(`📊 找到 ${templateCount} 個模板`);
    
    if (templateCount > 0) {
      // 點擊第一個模板的測試按鈕
      console.log('🧪 測試發送模板...');
      await templateCards.first().locator('button:has-text("🧪 測試")').click();
      
      // 等待測試彈窗
      await page.waitForTimeout(1000);
      
      // 模擬輸入變數值（如果有提示框）
      page.on('dialog', async dialog => {
        console.log('💬 對話框內容：', dialog.message());
        if (dialog.message().includes('project_name')) {
          await dialog.accept('台北101大樓整修工程');
        } else if (dialog.message().includes('total_progress')) {
          await dialog.accept('75');
        } else if (dialog.message().includes('building_a_progress')) {
          await dialog.accept('85');
        } else if (dialog.message().includes('building_b_progress')) {
          await dialog.accept('65');
        } else if (dialog.message().includes('manager')) {
          await dialog.accept('王經理');
        } else if (dialog.message().includes('預覽')) {
          console.log('✅ 選擇預覽模式');
          await dialog.accept(); // 確定 = 預覽
        } else {
          await dialog.accept();
        }
      });
      
      // 等待處理完成
      await page.waitForTimeout(3000);
      
      console.log('✅ 模板測試完成！');
    }

    // 12. 截圖保存
    await page.screenshot({ 
      path: './test-results/template-editor-final.png', 
      fullPage: true 
    });
    
    console.log('📸 已保存最終截圖');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤：', error);
    await page.screenshot({ 
      path: './test-results/template-editor-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 測試完成');
  }
}

// 確保目錄存在
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results', { recursive: true });
}

// 執行測試
testTemplateEditor().catch(console.error);