export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'GET') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // 建構查詢條件
    let whereClause = 'WHERE is_active = 1';
    let params = [];

    if (search) {
      whereClause += ' AND (group_name LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 查詢群組列表 - 先嘗試從 line_groups 表，如果不存在則用 groups 表
    let stmt;
    try {
      stmt = env.DB.prepare(`
        SELECT group_id, group_name, group_alias, department, notes, 
               avatar_url, member_count, created_at, updated_at
        FROM line_groups 
        ${whereClause}
        ORDER BY group_name ASC
        LIMIT ? OFFSET ?
      `);
    } catch (e) {
      // 如果 line_groups 表不存在，使用舊的 groups 表
      stmt = env.DB.prepare(`
        SELECT group_id, group_name, group_alias, department, joined_at as created_at
        FROM groups 
        ${whereClause}
        ORDER BY group_name ASC
        LIMIT ? OFFSET ?
      `);
    }

    const groups = await stmt.bind(...params, limit, offset).all();

    // 查詢總數
    let countStmt;
    try {
      countStmt = env.DB.prepare(`
        SELECT COUNT(*) as total 
        FROM line_groups 
        ${whereClause}
      `);
    } catch (e) {
      countStmt = env.DB.prepare(`
        SELECT COUNT(*) as total 
        FROM groups 
        ${whereClause}
      `);
    }

    const countResult = await countStmt.bind(...params).first();
    const total = countResult.total;

    return jsonResponse({
      success: true,
      data: {
        groups: groups.results || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch groups',
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