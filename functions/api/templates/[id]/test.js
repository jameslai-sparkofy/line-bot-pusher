export async function onRequest(context) {
  const { request, env, params } = context;
  const templateId = params.id;
  
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
    
    // 取得模板資料
    const templateStmt = env.DB.prepare(`
      SELECT * FROM message_templates 
      WHERE template_id = ? AND is_active = 1
    `);
    
    const template = await templateStmt.bind(templateId).first();
    
    if (!template) {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }

    // 解析模板變數
    const templateVariables = JSON.parse(template.variables || '[]');
    const providedVariables = data.variables || {};

    // 驗證必填變數
    const missingRequired = templateVariables
      .filter(variable => variable.required && !providedVariables[variable.name])
      .map(variable => variable.name);

    if (missingRequired.length > 0) {
      return jsonResponse({
        success: false,
        error: 'Missing required variables',
        details: { missing_variables: missingRequired }
      }, 400);
    }

    // 替換模板變數
    let processedMessage = template.message_template;
    
    // 替換用戶提供的變數
    templateVariables.forEach(variable => {
      const value = providedVariables[variable.name] || variable.example || '';
      const regex = new RegExp('\\{\\{' + variable.name + '\\}\\}', 'g');
      processedMessage = processedMessage.replace(regex, value);
    });

    // 添加系統變數
    const now = new Date();
    processedMessage = processedMessage.replace(/\\{\\{timestamp\\}\\}/g, now.toLocaleString('zh-TW'));
    processedMessage = processedMessage.replace(/\\{\\{date\\}\\}/g, now.toLocaleDateString('zh-TW'));
    processedMessage = processedMessage.replace(/\\{\\{time\\}\\}/g, now.toLocaleTimeString('zh-TW'));

    // 處理進度條（如果有 progress 變數）
    if (providedVariables.progress !== undefined) {
      const progress = Math.min(100, Math.max(0, parseInt(providedVariables.progress) || 0));
      const barLength = 10;
      const filledLength = Math.round((progress / 100) * barLength);
      const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      processedMessage = processedMessage.replace(/\\{\\{progress_bar\\}\\}/g, progressBar);
    }

    // 如果是測試模式且沒有提供群組ID，則只返回預覽
    if (!data.group_id) {
      return jsonResponse({
        success: true,
        data: {
          template_id: templateId,
          template_name: template.template_name,
          processed_message: processedMessage,
          variables_used: Object.keys(providedVariables).length,
          message: '模板預覽成功'
        }
      });
    }

    // 檢查群組是否存在
    const groupStmt = env.DB.prepare(`
      SELECT group_id, group_name FROM line_groups 
      WHERE group_id = ? AND is_active = 1
    `);
    
    const group = await groupStmt.bind(data.group_id).first();
    
    if (!group) {
      return jsonResponse({
        success: false,
        error: 'Group not found'
      }, 404);
    }

    // 發送訊息到 LINE
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${env.CHANNEL_ACCESS_TOKEN}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: data.group_id,
        messages: [{
          type: 'text',
          text: processedMessage
        }]
      })
    });

    if (!lineResponse.ok) {
      const lineError = await lineResponse.text();
      return jsonResponse({
        success: false,
        error: 'Failed to send LINE message',
        details: lineError
      }, 500);
    }

    // 記錄發送歷史
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const logStmt = env.DB.prepare(`
      INSERT INTO message_history 
      (message_id, template_id, group_id, processed_message, variables_used, sent_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    await logStmt.bind(
      messageId,
      templateId,
      data.group_id,
      processedMessage,
      JSON.stringify(providedVariables)
    ).run();

    return jsonResponse({
      success: true,
      data: {
        message_id: messageId,
        template_id: templateId,
        template_name: template.template_name,
        group_id: data.group_id,
        group_name: group.group_name,
        processed_message: processedMessage,
        variables_used: Object.keys(providedVariables).length,
        sent_at: new Date().toISOString(),
        message: '訊息發送成功'
      }
    });

  } catch (error) {
    console.error('Test template error:', error);
    return jsonResponse({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}