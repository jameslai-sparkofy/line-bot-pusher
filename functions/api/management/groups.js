// 群組管理 API
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    try {
      const groups = await env.DB.prepare(`
        SELECT g.*, COUNT(ui.id) as message_count
        FROM groups g
        LEFT JOIN user_interactions ui ON g.group_id = ui.group_id
        GROUP BY g.group_id
        ORDER BY g.joined_at DESC
      `).all();
      
      return jsonResponse({ groups: groups.results || [] });
    } catch (error) {
      console.error('Get groups error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }
  
  return new Response('Method not allowed', { status: 405 });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}