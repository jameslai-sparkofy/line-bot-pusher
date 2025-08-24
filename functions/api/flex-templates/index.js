// Flex Message 模板 CRUD API
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  switch (method) {
    case 'GET':
      return await getTemplates(context);
    case 'POST':
      return await createTemplate(context);
    case 'PUT':
      return await updateTemplate(context);
    case 'DELETE':
      return await deleteTemplate(context);
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
      ORDER BY created_at DESC
    `).all();
    
    return jsonResponse({
      success: true,
      templates: templates.results || []
    });
  } catch (error) {
    console.error('Get flex templates error:', error);
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
      template_type = 'bubble',
      flex_content,
      variables = '[]',
      category = 'custom',
      tags = '[]',
      created_by = 'system'
    } = data;

    if (!template_name || !flex_content) {
      return jsonResponse({
        success: false,
        error: 'template_name and flex_content are required'
      }, 400);
    }

    // 驗證 JSON 格式
    try {
      JSON.parse(flex_content);
      JSON.parse(variables);
      JSON.parse(tags);
    } catch (jsonError) {
      return jsonResponse({
        success: false,
        error: 'Invalid JSON format'
      }, 400);
    }

    // 生成唯一模板ID
    const template_id = 'flex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const result = await env.DB.prepare(`
      INSERT INTO flex_message_templates 
      (template_id, template_name, description, template_type, flex_content, 
       variables, category, tags, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      template_id,
      template_name,
      description,
      template_type,
      flex_content,
      variables,
      category,
      tags,
      created_by
    ).run();

    if (result.success) {
      return jsonResponse({
        success: true,
        message: 'Template created successfully',
        template_id: template_id
      });
    } else {
      throw new Error('Database insert failed');
    }
  } catch (error) {
    console.error('Create flex template error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to create template' 
    }, 500);
  }
}

// 更新模板
async function updateTemplate(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const url = new URL(request.url);
    const template_id = url.pathname.split('/').pop();

    if (!template_id) {
      return jsonResponse({
        success: false,
        error: 'Template ID is required'
      }, 400);
    }

    const {
      template_name,
      description,
      template_type,
      flex_content,
      variables,
      category,
      tags
    } = data;

    // 驗證 JSON 格式
    if (flex_content) {
      try {
        JSON.parse(flex_content);
      } catch (jsonError) {
        return jsonResponse({
          success: false,
          error: 'Invalid flex_content JSON format'
        }, 400);
      }
    }

    if (variables) {
      try {
        JSON.parse(variables);
      } catch (jsonError) {
        return jsonResponse({
          success: false,
          error: 'Invalid variables JSON format'
        }, 400);
      }
    }

    // 構建更新語句
    const updateFields = [];
    const values = [];

    if (template_name !== undefined) {
      updateFields.push('template_name = ?');
      values.push(template_name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (template_type !== undefined) {
      updateFields.push('template_type = ?');
      values.push(template_type);
    }
    if (flex_content !== undefined) {
      updateFields.push('flex_content = ?');
      values.push(flex_content);
    }
    if (variables !== undefined) {
      updateFields.push('variables = ?');
      values.push(variables);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      values.push(category);
    }
    if (tags !== undefined) {
      updateFields.push('tags = ?');
      values.push(tags);
    }

    if (updateFields.length === 0) {
      return jsonResponse({
        success: false,
        error: 'No fields to update'
      }, 400);
    }

    updateFields.push('updated_at = datetime("now")');
    values.push(template_id);

    const result = await env.DB.prepare(`
      UPDATE flex_message_templates 
      SET ${updateFields.join(', ')}
      WHERE template_id = ?
    `).bind(...values).run();

    if (result.changes > 0) {
      return jsonResponse({
        success: true,
        message: 'Template updated successfully'
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }
  } catch (error) {
    console.error('Update flex template error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to update template' 
    }, 500);
  }
}

// 刪除模板
async function deleteTemplate(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const template_id = url.pathname.split('/').pop();

  if (!template_id) {
    return jsonResponse({
      success: false,
      error: 'Template ID is required'
    }, 400);
  }

  try {
    // 軟刪除 - 將 is_active 設為 0
    const result = await env.DB.prepare(`
      UPDATE flex_message_templates 
      SET is_active = 0, updated_at = datetime('now')
      WHERE template_id = ?
    `).bind(template_id).run();

    if (result.changes > 0) {
      return jsonResponse({
        success: true,
        message: 'Template deleted successfully'
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }
  } catch (error) {
    console.error('Delete flex template error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to delete template' 
    }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}