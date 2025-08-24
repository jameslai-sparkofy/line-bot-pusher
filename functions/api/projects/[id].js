// 單一建案 API
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const url = new URL(request.url);
  const project_id = url.pathname.split('/').pop();

  if (!project_id) {
    return jsonResponse({
      success: false,
      error: 'Project ID is required'
    }, 400);
  }

  switch (method) {
    case 'GET':
      return await getProject(context, project_id);
    case 'PUT':
      return await updateProject(context, project_id);
    case 'DELETE':
      return await deleteProject(context, project_id);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

// 取得單一建案
async function getProject(context, project_id) {
  const { env } = context;
  
  try {
    const project = await env.DB.prepare(`
      SELECT * FROM projects WHERE project_id = ? AND status = 'active'
    `).bind(project_id).first();
    
    if (!project) {
      return jsonResponse({
        success: false,
        error: 'Project not found'
      }, 404);
    }

    // 載入棟別資料
    const buildings = await env.DB.prepare(`
      SELECT * FROM project_buildings 
      WHERE project_id = ? 
      ORDER BY building_name
    `).bind(project_id).all();

    return jsonResponse({
      success: true,
      project: {
        ...project,
        buildings: buildings.results || []
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to fetch project' 
    }, 500);
  }
}

// 更新建案
async function updateProject(context, project_id) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const {
      project_name,
      description,
      location,
      total_units,
      contact_phone,
      contact_email,
      buildings = []
    } = data;

    // 構建更新語句
    const updateFields = [];
    const values = [];

    if (project_name !== undefined) {
      updateFields.push('project_name = ?');
      values.push(project_name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      values.push(location);
    }
    if (total_units !== undefined) {
      updateFields.push('total_units = ?');
      values.push(total_units);
    }
    if (contact_phone !== undefined) {
      updateFields.push('contact_phone = ?');
      values.push(contact_phone);
    }
    if (contact_email !== undefined) {
      updateFields.push('contact_email = ?');
      values.push(contact_email);
    }

    if (updateFields.length === 0) {
      return jsonResponse({
        success: false,
        error: 'No fields to update'
      }, 400);
    }

    updateFields.push('updated_at = datetime("now")');
    values.push(project_id);

    // 更新建案基本資料
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE project_id = ? AND status = 'active'
    `).bind(...values).run();

    if (result.changes === 0) {
      return jsonResponse({
        success: false,
        error: 'Project not found'
      }, 404);
    }

    // 更新棟別資料
    if (buildings.length > 0) {
      // 先刪除現有棟別資料
      await env.DB.prepare(`
        DELETE FROM project_buildings WHERE project_id = ?
      `).bind(project_id).run();

      // 重新插入棟別資料
      for (const building of buildings) {
        await env.DB.prepare(`
          INSERT INTO project_buildings 
          (project_id, building_name, total_units, sold_units, sold_percentage, description, building_image_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          project_id,
          building.building_name,
          building.total_units || 0,
          building.sold_units || 0,
          building.sold_percentage || '0%',
          building.description || '',
          building.building_image_url || null
        ).run();
      }
    }

    return jsonResponse({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to update project' 
    }, 500);
  }
}

// 刪除建案 (軟刪除)
async function deleteProject(context, project_id) {
  const { env } = context;

  try {
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET status = 'deleted', updated_at = datetime('now')
      WHERE project_id = ?
    `).bind(project_id).run();

    if (result.changes > 0) {
      return jsonResponse({
        success: true,
        message: 'Project deleted successfully'
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Project not found'
      }, 404);
    }
  } catch (error) {
    console.error('Delete project error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to delete project' 
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