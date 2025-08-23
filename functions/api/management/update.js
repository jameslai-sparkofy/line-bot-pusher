// 更新備註 API
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'POST') {
    try {
      const { type, id, note_name, department } = await request.json();
      
      if (type === 'user') {
        await env.DB.prepare(`
          UPDATE users 
          SET note_name = ?, department = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).bind(note_name, department, id).run();
      } else if (type === 'group') {
        await env.DB.prepare(`
          UPDATE groups 
          SET note_name = ?, department = ?, updated_at = CURRENT_TIMESTAMP
          WHERE group_id = ?
        `).bind(note_name, department, id).run();
      } else {
        return jsonResponse({ error: 'Invalid type' }, 400);
      }
      
      return jsonResponse({ success: true });
    } catch (error) {
      console.error('Update error:', error);
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