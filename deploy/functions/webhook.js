// Cloudflare Pages Function for LINE webhook
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const channelSecret = env.CHANNEL_SECRET;
    const channelAccessToken = env.CHANNEL_ACCESS_TOKEN;

    // 嘗試多種環境變數名稱
    const testChannelSecret = channelSecret || env.LINE_CHANNEL_SECRET;
    const testChannelAccessToken = channelAccessToken || env.LINE_CHANNEL_ACCESS_TOKEN;

    console.log('Environment check:', {
      channelSecret: !!testChannelSecret,
      channelAccessToken: !!testChannelAccessToken,
      originalSecret: !!channelSecret,
      originalToken: !!channelAccessToken,
      lineSecret: !!env.LINE_CHANNEL_SECRET,
      lineToken: !!env.LINE_CHANNEL_ACCESS_TOKEN
    });

    if (!testChannelSecret || !testChannelAccessToken) {
      return new Response(JSON.stringify({
        error: 'Missing LINE credentials',
        debug: {
          hasChannelSecret: !!testChannelSecret,
          hasChannelAccessToken: !!testChannelAccessToken,
          availableEnvKeys: Object.keys(env)
        }
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 使用測試變數
    const finalChannelSecret = testChannelSecret;
    const finalChannelAccessToken = testChannelAccessToken;

    // Get request body
    const body = await request.text();
    const events = JSON.parse(body).events;
    
    // 記錄所有 webhook 事件到資料庫
    for (const event of events) {
      // 記錄所有事件到日誌表
      await env.DB.prepare(`
        INSERT INTO webhook_logs (event_type, source_type, source_id, user_id, event_data, received_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        event.type,
        event.source?.type || null,
        event.source?.groupId || event.source?.roomId || event.source?.userId || null,
        event.source?.userId || null,
        JSON.stringify(event),
      ).run().catch(() => {}); // 忽略日誌錯誤，避免影響主要功能
      
      // 處理好友加入事件
      if (event.type === 'follow') {
        const userId = event.source.userId;
        
        // 取得用戶資料
        try {
          const userProfile = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${finalChannelAccessToken}` }
          });
          const userInfo = await userProfile.json();
          
          // 儲存用戶資料
          await env.DB.prepare(`
            INSERT OR REPLACE INTO users (user_id, display_name, picture_url, status_message, is_friend, created_at)
            VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
          `).bind(userId, userInfo.displayName, userInfo.pictureUrl, userInfo.statusMessage).run();
          
          // 發送歡迎訊息
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${finalChannelAccessToken}`
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{
                type: 'text',
                text: `🤖 歡迎加入 LINE Bot 推送系統！\n\n感謝您成為我們的好友，您可以透過這個機器人接收重要通知。`
              }]
            })
          });
        } catch (error) {
          console.error('Handle follow error:', error);
        }
      }
      
      // 處理好友封鎖事件
      if (event.type === 'unfollow') {
        const userId = event.source.userId;
        await env.DB.prepare(`
          UPDATE users SET is_friend = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
        `).bind(userId).run();
      }
      
      // 處理一般訊息事件（記錄互動）
      if (event.type === 'message') {
        const userId = event.source.userId;
        const groupId = event.source.groupId;
        
        // 記錄用戶互動
        await env.DB.prepare(`
          INSERT INTO user_interactions (user_id, group_id, message_type, message_text, interaction_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          userId, 
          groupId || null, 
          event.message.type,
          event.message.text || null
        ).run().catch(() => {});
      }
      
      // 原有的群組加入處理
      if (event.type === 'join' && event.source.type === 'group') {
        // Handle group join
        const groupId = event.source.groupId;
        const groupAlias = `GROUP_${Date.now().toString().slice(-8)}`;
        
        // 取得群組資訊包含頭像
        let groupInfo = { groupName: 'LINE群組', pictureUrl: null };
        try {
          const groupResponse = await fetch(`https://api.line.me/v2/bot/group/${groupId}/summary`, {
            headers: { 'Authorization': `Bearer ${finalChannelAccessToken}` }
          });
          if (groupResponse.ok) {
            groupInfo = await groupResponse.json();
          }
        } catch (error) {
          console.error('Get group info error:', error);
        }
        
        // Store in D1 database
        await env.DB.prepare(`
          INSERT OR REPLACE INTO groups (group_id, group_name, group_alias, department, picture_url, is_active, joined_at)
          VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `).bind(groupId, groupInfo.groupName || 'LINE群組', groupAlias, null, groupInfo.pictureUrl).run();

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
            'Authorization': `Bearer ${finalChannelAccessToken}`
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