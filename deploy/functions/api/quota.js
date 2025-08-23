// LINE API 用量查詢端點
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'GET') {
    try {
      // 查詢額度
      const quotaResponse = await fetch('https://api.line.me/v2/bot/message/quota', {
        headers: { 'Authorization': `Bearer ${env.CHANNEL_ACCESS_TOKEN}` }
      });
      
      // 查詢用量
      const consumptionResponse = await fetch('https://api.line.me/v2/bot/message/quota/consumption', {
        headers: { 'Authorization': `Bearer ${env.CHANNEL_ACCESS_TOKEN}` }
      });
      
      if (!quotaResponse.ok || !consumptionResponse.ok) {
        throw new Error('Failed to fetch quota information');
      }
      
      const quotaData = await quotaResponse.json();
      const consumptionData = await consumptionResponse.json();
      
      // 計算剩餘額度和百分比
      const totalQuota = quotaData.value;
      const usedQuota = consumptionData.totalUsage;
      const remainingQuota = totalQuota - usedQuota;
      const usagePercentage = Math.round((usedQuota / totalQuota) * 100);
      
      // 判斷警告等級
      let warningLevel = 'safe';
      if (usagePercentage >= 95) {
        warningLevel = 'critical';
      } else if (usagePercentage >= 80) {
        warningLevel = 'warning';
      }
      
      return jsonResponse({
        success: true,
        plan: quotaData.type,
        totalQuota: totalQuota,
        usedQuota: usedQuota,
        remainingQuota: remainingQuota,
        usagePercentage: usagePercentage,
        warningLevel: warningLevel,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Quota API error:', error);
      return jsonResponse({ 
        success: false,
        error: 'Failed to fetch quota information',
        details: error.message 
      }, 500);
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