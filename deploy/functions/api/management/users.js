// 用戶管理 API
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    try {
      const users = await env.DB.prepare(`
        SELECT u.*, COUNT(ui.id) as interaction_count
        FROM users u
        LEFT JOIN user_interactions ui ON u.user_id = ui.user_id
        GROUP BY u.user_id
        ORDER BY u.created_at DESC
      `).all();
      
      return jsonResponse({ users: users.results || [] });
    } catch (error) {
      console.error('Get users error:', error);
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