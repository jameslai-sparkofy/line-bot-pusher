export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
    
    // 驗證必填欄位
    if (!data.template_name || !data.message_template) {
      return jsonResponse({
        success: false,
        error: 'Missing required fields: template_name, message_template'
      }, 400);
    }

    // 生成唯一的模板 ID
    const templateId = 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 插入資料到 D1 資料庫
    const stmt = env.DB.prepare(`
      INSERT INTO message_templates 
      (template_id, template_name, description, category, version, variables, message_template, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = await stmt.bind(
      templateId,
      data.template_name,
      data.description || '',
      data.category || '',
      data.version || '1.0',
      data.variables || '[]',
      data.message_template,
      data.is_active !== undefined ? data.is_active : 1
    ).run();

    if (result.success) {
      return jsonResponse({
        success: true,
        data: {
          template_id: templateId,
          message: '模板創建成功'
        }
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Database insert failed'
      }, 500);
    }

  } catch (error) {
    console.error('Create template error:', error);
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