// 分享事件記錄 API
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
    const {
      event_type,
      project_id,
      template_id,
      user_id,
      shared_at
    } = data;

    // 記錄分享事件
    await env.DB.prepare(`
      INSERT INTO share_events 
      (event_type, project_id, template_id, user_id, shared_at, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      event_type || 'flex_share',
      project_id,
      template_id,
      user_id,
      shared_at
    ).run();

    // 更新模板使用次數
    if (template_id) {
      await env.DB.prepare(`
        UPDATE flex_message_templates 
        SET usage_count = usage_count + 1 
        WHERE template_id = ?
      `).bind(template_id).run();
    }

    return jsonResponse({
      success: true,
      message: 'Share event recorded successfully'
    });

  } catch (error) {
    console.error('Record share event error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to record share event'
    }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}