// 取得單一 Flex Message 模板
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const url = new URL(request.url);
  const template_id = url.pathname.split('/').pop();

  if (!template_id) {
    return jsonResponse({
      success: false,
      error: 'Template ID is required'
    }, 400);
  }

  switch (method) {
    case 'GET':
      return await getTemplate(context, template_id);
    case 'PUT':
      return await updateTemplate(context, template_id);
    case 'DELETE':
      return await deleteTemplate(context, template_id);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

// 取得單一模板
async function getTemplate(context, template_id) {
  const { env } = context;
  
  try {
    const template = await env.DB.prepare(`
      SELECT * FROM flex_message_templates 
      WHERE template_id = ? AND is_active = 1
    `).bind(template_id).first();
    
    if (!template) {
      return jsonResponse({
        success: false,
        error: 'Template not found'
      }, 404);
    }

    return jsonResponse({
      success: true,
      template: template
    });
  } catch (error) {
    console.error('Get flex template error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to fetch template' 
    }, 500);
  }
}

// 更新模板
async function updateTemplate(context, template_id) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
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
      WHERE template_id = ? AND is_active = 1
    `).bind(...values).run();

    if (result.changes > 0) {
      // 增加使用次數
      await env.DB.prepare(`
        UPDATE flex_message_templates 
        SET usage_count = usage_count + 1 
        WHERE template_id = ?
      `).bind(template_id).run();

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
async function deleteTemplate(context, template_id) {
  const { env } = context;

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