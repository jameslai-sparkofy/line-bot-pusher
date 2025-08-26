// 資料庫連接調試 API
export async function onRequest(context) {
  const { env } = context;
  
  try {
    const debug_info = {
      timestamp: new Date().toISOString(),
      environment_keys: Object.keys(env || {}),
      database_bindings: {
        has_DB: !!env.DB,
        has_LINE_BOT_DB: !!env.LINE_BOT_DB,
        db_type_DB: typeof env.DB,
        db_type_LINE_BOT_DB: typeof env.LINE_BOT_DB
      }
    };

    // 嘗試連接資料庫
    const db = env.DB || env.LINE_BOT_DB;
    if (db) {
      try {
        // 檢查資料庫表
        const tables = await db.prepare(`
          SELECT name FROM sqlite_master WHERE type='table'
        `).all();

        debug_info.database_status = {
          connected: true,
          tables: tables.results || []
        };

        // 如果有 flex_message_templates 表，檢查記錄數量
        const hasFlexTable = (tables.results || []).some(t => t.name === 'flex_message_templates');
        if (hasFlexTable) {
          const count = await db.prepare(`
            SELECT COUNT(*) as count FROM flex_message_templates
          `).first();
          debug_info.template_count = count?.count || 0;
        }

      } catch (dbError) {
        debug_info.database_error = {
          message: dbError.message,
          name: dbError.name
        };
      }
    } else {
      debug_info.database_status = {
        connected: false,
        reason: "No database binding found"
      };
    }

    return new Response(JSON.stringify(debug_info, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Debug failed",
      message: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}