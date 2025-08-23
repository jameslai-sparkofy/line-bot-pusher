export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    return await getTemplates(context);
  } else if (request.method === 'POST') {
    return await createTemplate(context);
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function getTemplates(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // 建構查詢條件
    let whereClause = 'WHERE is_active = 1';
    let params = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (template_name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 查詢模板列表
    const stmt = env.DB.prepare(`
      SELECT template_id, template_name, description, category, version, 
             created_at, updated_at, variables, message_template
      FROM message_templates 
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `);

    const templates = await stmt.bind(...params, limit, offset).all();

    // 查詢總數
    const countStmt = env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM message_templates 
      ${whereClause}
    `);

    const countResult = await countStmt.bind(...params).first();
    const total = countResult.total;

    // 處理變數 JSON 解析
    const processedTemplates = templates.results.map(template => ({
      ...template,
      variables: JSON.parse(template.variables || '[]'),
      variable_count: JSON.parse(template.variables || '[]').length,
      content_preview: template.message_template.substring(0, 100) + (template.message_template.length > 100 ? '...' : '')
    }));

    return jsonResponse({
      success: true,
      data: {
        templates: processedTemplates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch templates',
      details: error.message
    }, 500);
  }
}

async function createTemplate(context) {
  const { request, env } = context;
  
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