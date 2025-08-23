// Cloudflare Worker Entry Point
// 用於 Cloudflare Pages Functions 和 Workers

// Import the main server
const app = require('./server');

// Cloudflare Workers fetch event handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
  try {
    // Convert Cloudflare Request to Express-compatible format
    const url = new URL(request.url);
    const method = request.method;
    
    // Simple routing for static admin interface
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return await handleAdminRequest(request);
    }
    
    // Handle API routes
    if (url.pathname.startsWith('/api/') || url.pathname === '/webhook' || url.pathname === '/health') {
      return await handleServerRequest(request);
    }
    
    // Default response
    return new Response('LINE Bot Pusher - Running on Cloudflare', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    console.error('Worker error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle admin interface requests
async function handleAdminRequest(request) {
  // Serve the admin HTML directly
  const adminController = require('./controllers/adminController');
  
  // Create a mock Express response object
  const mockRes = {
    send: (html) => {
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    },
    status: (code) => mockRes,
    json: (data) => {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
  
  // Mock Express request object
  const mockReq = {
    method: request.method,
    url: new URL(request.url).pathname,
    headers: Object.fromEntries(request.headers.entries())
  };
  
  // Call the admin controller directly
  return adminController(mockReq, mockRes);
}

// Handle server requests (API, webhook, etc.)
async function handleServerRequest(request) {
  // This would need adaptation for Cloudflare Workers
  // For now, return a placeholder
  const url = new URL(request.url);
  
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'cloudflare'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('API endpoint - Cloudflare adaptation needed', {
    status: 501,
    headers: { 'Content-Type': 'text/plain' }
  });
}