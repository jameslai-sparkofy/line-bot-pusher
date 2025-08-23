// Cloudflare Pages Function for LINE webhook
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const channelSecret = env.CHANNEL_SECRET;
    const channelAccessToken = env.CHANNEL_ACCESS_TOKEN;

    if (!channelSecret || !channelAccessToken) {
      return new Response('Missing LINE credentials', { status: 500 });
    }

    // Get request body
    const body = await request.text();
    const events = JSON.parse(body).events;
    
    // Process each event
    for (const event of events) {
      if (event.type === 'join' && event.source.type === 'group') {
        // Handle group join
        const groupId = event.source.groupId;
        const groupAlias = `GROUP_${Date.now().toString().slice(-8)}`;
        
        // Store in D1 database
        await env.DB.prepare(`
          INSERT OR REPLACE INTO groups (group_id, group_name, group_alias, department, is_active, joined_at)
          VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `).bind(groupId, 'LINE群組', groupAlias, null).run();

        // Send welcome message via LINE Messaging API
        const welcomeMessage = {
          replyToken: event.replyToken,
          messages: [{
            type: 'text',
            text: `🤖 歡迎使用 LINE Bot 推送系統！\n\n群組代號：${groupAlias}\n\n管理員可以使用這個代號來推送訊息到此群組。\n\n如需幫助，請聯繫系統管理員。`
          }]
        };

        await fetch('https://api.line.me/v2/bot/message/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${channelAccessToken}`
          },
          body: JSON.stringify(welcomeMessage)
        });
      }
      
      if (event.type === 'leave' && event.source.type === 'group') {
        // Handle group leave
        const groupId = event.source.groupId;
        await env.DB.prepare(`
          UPDATE groups 
          SET is_active = 0, left_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE group_id = ?
        `).bind(groupId).run();
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}