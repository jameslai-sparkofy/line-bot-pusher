// 訊息記錄 API
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    try {
      const messages = await env.DB.prepare(`
        SELECT pl.*, ak.key_name
        FROM push_logs pl
        LEFT JOIN api_keys ak ON pl.api_key_id = ak.id
        ORDER BY pl.sent_at DESC
        LIMIT 100
      `).all();
      
      return jsonResponse({ messages: messages.results || [] });
    } catch (error) {
      console.error('Get messages error:', error);
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