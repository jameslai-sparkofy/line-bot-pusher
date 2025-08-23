// Cloudflare Pages Function for API endpoints

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  
  // Handle different API endpoints
  if (path === '/push' && request.method === 'POST') {
    return handlePushMessage(request, env);
  }
  
  if (path === '/groups' && request.method === 'GET') {
    return handleGetGroups(request, env);
  }
  
  if (path === '/templates' && request.method === 'GET') {
    return handleGetTemplates(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function handlePushMessage(request, env) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Missing or invalid authorization header' }, 401);
    }

    const apiKey = authHeader.split(' ')[1];
    
    // Validate API key
    const keyInfo = await env.DB.prepare(`
      SELECT id, key_name, department, allowed_groups, is_active, expires_at
      FROM api_keys 
      WHERE api_key = ? AND is_active = 1
    `).bind(apiKey).first();

    if (!keyInfo) {
      return jsonResponse({ error: 'Invalid API key' }, 401);
    }

    if (keyInfo.expires_at && new Date(keyInfo.expires_at) < new Date()) {
      return jsonResponse({ error: 'API key expired' }, 401);
    }

    // Parse request body
    const body = await request.json();
    const { groupId, message } = body;

    if (!groupId || !message) {
      return jsonResponse({ error: 'groupId and message are required' }, 400);
    }

    // Get group info
    const groupInfo = await env.DB.prepare(`
      SELECT * FROM groups 
      WHERE (group_id = ? OR group_alias = ? OR group_name = ?) 
      AND is_active = 1
    `).bind(groupId, groupId, groupId).first();

    if (!groupInfo) {
      return jsonResponse({ error: 'Group not found' }, 404);
    }

    // Send message via LINE Messaging API
    const pushMessage = {
      to: groupInfo.group_id,
      messages: [{
        type: 'text',
        text: message
      }]
    };

    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify(pushMessage)
    });

    if (!lineResponse.ok) {
      throw new Error('Failed to send message to LINE');
    }

    // Log the push
    await env.DB.prepare(`
      INSERT INTO push_logs (api_key_id, group_id, message_content, status)
      VALUES (?, ?, ?, ?)
    `).bind(keyInfo.id, groupInfo.group_id, message, 'sent').run();

    // Update API key last used
    await env.DB.prepare(`
      UPDATE api_keys 
      SET last_used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(keyInfo.id).run();

    return jsonResponse({ 
      success: true, 
      groupName: groupInfo.group_name,
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Push message error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

async function handleGetGroups(request, env) {
  try {
    const groups = await env.DB.prepare(
      'SELECT group_id, group_name, group_alias, department, joined_at FROM groups WHERE is_active = 1 ORDER BY joined_at DESC'
    ).all();
    
    return jsonResponse({ groups: groups.results || [] });
  } catch (error) {
    console.error('Get groups error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

async function handleGetTemplates(request, env) {
  try {
    const templates = await env.DB.prepare(
      'SELECT * FROM message_templates WHERE is_active = 1 ORDER BY created_at DESC'
    ).all();
    
    return jsonResponse({ templates: templates.results || [] });
  } catch (error) {
    console.error('Get templates error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}