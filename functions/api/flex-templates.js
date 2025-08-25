// Flex Message 模板 API
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  switch (method) {
    case 'GET':
      return await getTemplates(context);
    case 'POST':
      return await createTemplate(context);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

// 取得模板列表
async function getTemplates(context) {
  const { env } = context;
  
  try {
    const templates = await env.DB.prepare(`
      SELECT * FROM flex_message_templates 
      WHERE is_active = 1 
      ORDER BY updated_at DESC
    `).all();

    return jsonResponse({
      success: true,
      templates: templates.results || []
    });
  } catch (error) {
    console.error('Get templates error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch templates'
    }, 500);
  }
}

// 建立新模板
async function createTemplate(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const {
      template_name,
      description = '',
      template_type = 'carousel',
      flex_content,
      category = 'custom'
    } = data;

    if (!template_name || !flex_content) {
      return jsonResponse({
        success: false,
        error: 'template_name and flex_content are required'
      }, 400);
    }

    // 生成模板 ID
    const template_id = 'flex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // 建立模板
    await env.DB.prepare(`
      INSERT INTO flex_message_templates 
      (template_id, template_name, description, template_type, flex_content, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      template_id,
      template_name,
      description,
      template_type,
      flex_content,
      category
    ).run();

    return jsonResponse({
      success: true,
      message: 'Template created successfully',
      template_id: template_id
    });

  } catch (error) {
    console.error('Create template error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to create template' 
    }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}