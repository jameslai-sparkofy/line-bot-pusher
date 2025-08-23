// Cloudflare Pages Function for health check
export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Test database connection
    const result = await env.DB.prepare('SELECT 1 as test').first();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      environment: env.NODE_ENV || 'production'
    };
    
    return new Response(JSON.stringify(healthStatus, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: env.NODE_ENV || 'production'
    };
    
    return new Response(JSON.stringify(healthStatus, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}