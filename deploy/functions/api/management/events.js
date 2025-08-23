// 事件日誌 API
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    try {
      const events = await env.DB.prepare(`
        SELECT id, event_type, source_type, source_id, user_id, received_at
        FROM webhook_logs
        ORDER BY received_at DESC
        LIMIT 50
      `).all();
      
      return jsonResponse({ events: events.results || [] });
    } catch (error) {
      console.error('Get events error:', error);
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