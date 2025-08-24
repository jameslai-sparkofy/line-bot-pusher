// 建案管理 API
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  switch (method) {
    case 'GET':
      return await getProjects(context);
    case 'POST':
      return await createProject(context);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

// 取得建案列表
async function getProjects(context) {
  const { env } = context;
  
  try {
    const projects = await env.DB.prepare(`
      SELECT p.*, 
             COUNT(pb.id) as building_count,
             GROUP_CONCAT(pb.building_name) as building_names
      FROM projects p
      LEFT JOIN project_buildings pb ON p.project_id = pb.project_id
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();

    // 為每個建案載入棟別詳細資料
    const projectsWithBuildings = await Promise.all(
      (projects.results || []).map(async (project) => {
        const buildings = await env.DB.prepare(`
          SELECT * FROM project_buildings 
          WHERE project_id = ? 
          ORDER BY building_name
        `).bind(project.project_id).all();

        return {
          ...project,
          buildings: buildings.results || []
        };
      })
    );
    
    return jsonResponse({
      success: true,
      projects: projectsWithBuildings
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to fetch projects' 
    }, 500);
  }
}

// 建立新建案
async function createProject(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const {
      project_name,
      description = '',
      location = '',
      total_units = 0,
      contact_phone = '',
      contact_email = '',
      buildings = []
    } = data;

    if (!project_name) {
      return jsonResponse({
        success: false,
        error: 'project_name is required'
      }, 400);
    }

    // 生成建案 ID
    const project_id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // 建立建案
    await env.DB.prepare(`
      INSERT INTO projects 
      (project_id, project_name, description, location, total_units, contact_phone, contact_email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      project_id,
      project_name,
      description,
      location,
      total_units,
      contact_phone,
      contact_email
    ).run();

    // 建立棟別資料
    if (buildings.length > 0) {
      for (const building of buildings) {
        await env.DB.prepare(`
          INSERT INTO project_buildings 
          (project_id, building_name, total_units, sold_units, sold_percentage, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          project_id,
          building.building_name,
          building.total_units || 0,
          building.sold_units || 0,
          building.sold_percentage || '0%',
          building.description || ''
        ).run();
      }
    }

    return jsonResponse({
      success: true,
      message: 'Project created successfully',
      project_id: project_id
    });

  } catch (error) {
    console.error('Create project error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to create project' 
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