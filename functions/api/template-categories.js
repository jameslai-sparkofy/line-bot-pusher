// 模板類別 API
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const categories = await env.DB.prepare(`
      SELECT * FROM flex_template_categories 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, created_at ASC
    `).all();

    return jsonResponse({
      success: true,
      categories: categories.results || []
    });
  } catch (error) {
    console.error('Get template categories error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch template categories'
    }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}