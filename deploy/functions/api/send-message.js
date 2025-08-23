export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
    
    // 檢查 API 金鑰 (簡單驗證)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({
        success: false,
        error: 'Missing or invalid Authorization header'
      }, 401);
    }

    // 支援兩種發送模式：模板模式和直接模式
    if (data.template_id) {
      return await sendTemplateMessage(context, data);
    } else if (data.message) {
      return await sendDirectMessage(context, data);
    } else {
      return jsonResponse({
        success: false,
        error: 'Either template_id or message is required'
      }, 400);
    }

  } catch (error) {
    console.error('Send message error:', error);
    return jsonResponse({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
}

async function sendTemplateMessage(context, data) {
  const { env } = context;
  const { template_id, group_id, variables = {} } = data;

  if (!template_id || !group_id) {
    return jsonResponse({
      success: false,
      error: 'template_id and group_id are required'
    }, 400);
  }

  // 取得模板資料
  const templateStmt = env.DB.prepare(`
    SELECT * FROM message_templates 
    WHERE template_id = ? AND is_active = 1
  `);
  
  const template = await templateStmt.bind(template_id).first();
  
  if (!template) {
    return jsonResponse({
      success: false,
      error: 'Template not found'
    }, 404);
  }

  // 解析模板變數
  const templateVariables = JSON.parse(template.variables || '[]');

  // 驗證必填變數
  const missingRequired = templateVariables
    .filter(variable => variable.required && !variables[variable.name])
    .map(variable => variable.name);

  if (missingRequired.length > 0) {
    return jsonResponse({
      success: false,
      error: 'Missing required variables',
      details: { missing_variables: missingRequired }
    }, 400);
  }

  // 處理模板內容
  let processedMessage = template.message_template;
  
  // 替換用戶提供的變數
  templateVariables.forEach(variable => {
    const value = variables[variable.name] || variable.example || '';
    const regex = new RegExp('\\{\\{' + variable.name + '\\}\\}', 'g');
    processedMessage = processedMessage.replace(regex, value);
  });

  // 添加系統變數
  const now = new Date();
  processedMessage = processedMessage.replace(/\\{\\{timestamp\\}\\}/g, now.toLocaleString('zh-TW'));
  processedMessage = processedMessage.replace(/\\{\\{date\\}\\}/g, now.toLocaleDateString('zh-TW'));
  processedMessage = processedMessage.replace(/\\{\\{time\\}\\}/g, now.toLocaleTimeString('zh-TW'));

  // 處理進度條（如果有 progress 變數）
  if (variables.progress !== undefined) {
    const progress = Math.min(100, Math.max(0, parseInt(variables.progress) || 0));
    const barLength = 10;
    const filledLength = Math.round((progress / 100) * barLength);
    const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    processedMessage = processedMessage.replace(/\\{\\{progress_bar\\}\\}/g, progressBar);
  }

  // 發送到 LINE
  const result = await sendToLine(env, group_id, processedMessage);
  
  if (!result.success) {
    return jsonResponse(result, 500);
  }

  // 記錄發送歷史
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  try {
    const logStmt = env.DB.prepare(`
      INSERT OR IGNORE INTO message_history 
      (message_id, template_id, group_id, processed_message, variables_used, sent_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    await logStmt.bind(
      messageId,
      template_id,
      group_id,
      processedMessage,
      JSON.stringify(variables)
    ).run();
  } catch (logError) {
    console.warn('Failed to log message history:', logError);
  }

  return jsonResponse({
    success: true,
    data: {
      message_id: messageId,
      template_id: template_id,
      template_name: template.template_name,
      group_id: group_id,
      processed_message: processedMessage,
      variables_used: Object.keys(variables).length,
      sent_at: new Date().toISOString()
    }
  });
}

async function sendDirectMessage(context, data) {
  const { env } = context;
  const { message, group_id } = data;

  if (!message || !group_id) {
    return jsonResponse({
      success: false,
      error: 'message and group_id are required'
    }, 400);
  }

  // 發送到 LINE
  const result = await sendToLine(env, group_id, message);
  
  if (!result.success) {
    return jsonResponse(result, 500);
  }

  // 記錄發送歷史
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  try {
    const logStmt = env.DB.prepare(`
      INSERT OR IGNORE INTO message_history 
      (message_id, template_id, group_id, processed_message, variables_used, sent_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    await logStmt.bind(
      messageId,
      'direct_message',
      group_id,
      message,
      '{}'
    ).run();
  } catch (logError) {
    console.warn('Failed to log message history:', logError);
  }

  return jsonResponse({
    success: true,
    data: {
      message_id: messageId,
      group_id: group_id,
      message: message,
      sent_at: new Date().toISOString()
    }
  });
}

async function sendToLine(env, groupId, message) {
  try {
    // 檢查群組是否存在
    const groupStmt = env.DB.prepare(`
      SELECT group_id, group_name FROM line_groups 
      WHERE group_id = ? AND is_active = 1
    `);
    
    const group = await groupStmt.bind(groupId).first();
    
    if (!group) {
      return {
        success: false,
        error: 'Group not found or inactive'
      };
    }

    // 發送訊息到 LINE
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{
          type: 'text',
          text: message
        }]
      })
    });

    if (!lineResponse.ok) {
      const lineError = await lineResponse.text();
      console.error('LINE API Error:', lineError);
      return {
        success: false,
        error: 'Failed to send LINE message',
        details: lineError
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Send to LINE error:', error);
    return {
      success: false,
      error: 'Failed to send message',
      details: error.message
    };
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}