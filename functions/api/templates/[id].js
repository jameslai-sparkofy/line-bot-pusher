export async function onRequest(context) {
  const { request, env, params } = context;
  const templateId = params.id;
  
  if (request.method === 'GET') {
    return await getTemplate(context, templateId);
  } else if (request.method === 'PUT') {
    return await updateTemplate(context, templateId);
  } else if (request.method === 'DELETE') {
    return await deleteTemplate(context, templateId);
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function getTemplate(context, templateId) {
  const { env } = context;
  
  try {
    const stmt = env.DB.prepare(`
      SELECT * FROM message_templates 
      WHERE template_id = ? AND is_active = 1
    `);
    
    const template = await stmt.bind(templateId).first();
    
    if (!template) {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }

    // 解析變數 JSON
    const processedTemplate = {
      ...template,
      variables: JSON.parse(template.variables || '[]')
    };

    return jsonResponse({
      success: true,
      data: processedTemplate
    });

  } catch (error) {
    console.error('Get template error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch template',
      details: error.message
    }, 500);
  }
}

async function updateTemplate(context, templateId) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    
    // 檢查模板是否存在
    const checkStmt = env.DB.prepare(`
      SELECT template_id FROM message_templates 
      WHERE template_id = ? AND is_active = 1
    `);
    
    const existing = await checkStmt.bind(templateId).first();
    
    if (!existing) {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }

    // 更新模板
    const updateStmt = env.DB.prepare(`
      UPDATE message_templates 
      SET template_name = COALESCE(?, template_name),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          version = COALESCE(?, version),
          variables = COALESCE(?, variables),
          message_template = COALESCE(?, message_template),
          is_active = COALESCE(?, is_active),
          updated_at = datetime('now')
      WHERE template_id = ?
    `);

    const result = await updateStmt.bind(
      data.template_name || null,
      data.description || null,
      data.category || null,
      data.version || null,
      data.variables || null,
      data.message_template || null,
      data.is_active !== undefined ? data.is_active : null,
      templateId
    ).run();

    if (result.success) {
      return jsonResponse({
        success: true,
        data: {
          template_id: templateId,
          message: '模板更新成功'
        }
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Database update failed'
      }, 500);
    }

  } catch (error) {
    console.error('Update template error:', error);
    return jsonResponse({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
}

async function deleteTemplate(context, templateId) {
  const { env } = context;
  
  try {
    // 軟刪除 - 將 is_active 設為 0
    const stmt = env.DB.prepare(`
      UPDATE message_templates 
      SET is_active = 0, updated_at = datetime('now')
      WHERE template_id = ?
    `);
    
    const result = await stmt.bind(templateId).run();
    
    if (result.changes > 0) {
      return jsonResponse({
        success: true,
        data: {
          template_id: templateId,
          message: '模板刪除成功'
        }
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }

  } catch (error) {
    console.error('Delete template error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to delete template',
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