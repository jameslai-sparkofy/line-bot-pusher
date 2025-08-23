// Cloudflare Pages Functions
// 處理所有動態路由

import { handleRequest } from '../src/worker.js';

export async function onRequest(context) {
  return handleRequest(context.request);
}