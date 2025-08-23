const express = require('express');
const rateLimit = require('express-rate-limit');
const MessageService = require('../services/messageService');
const ApiAuthMiddleware = require('../middleware/apiAuth');
const logger = require('../utils/logger');
const { database } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const router = express.Router();

// API 速率限制
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each API key to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 所有 API 路由都需要速率限制
router.use(apiLimiter);

// API 資訊端點
router.get('/', (req, res) => {
  res.json({
    name: 'LINE Bot Push API',
    version: '1.0.0',
    description: '公司內部 LINE Bot 推送系統 API',
    endpoints: {
      'GET /api': 'API 資訊',
      'GET /api/groups': '取得群組列表 (需要 API Key)',
      'POST /api/send': '推送訊息 (需要 API Key)',
      'POST /api/send/template': '使用模版推送訊息 (需要 API Key)',
      'GET /api/templates': '取得模版列表 (需要 API Key)',
      'POST /api/keys': '建立 API Key (管理員功能)',
    },
    authentication: {
      method: 'API Key',
      header: 'X-API-Key 或 Authorization: Bearer YOUR_API_KEY'
    },
    documentation: 'https://your-domain.com/docs'
  });
});

// 取得群組列表 (需要認證)
router.get('/groups', ApiAuthMiddleware.validateApiKey, async (req, res) => {
  try {
    const groups = await MessageService.getActiveGroups();
    
    const groupList = groups.map(group => ({
      group_id: group.group_id,
      group_alias: group.group_alias,
      group_name: group.group_name,
      department: group.department,
      joined_at: group.joined_at
    }));

    res.json({
      success: true,
      count: groupList.length,
      groups: groupList
    });

    logger.info('群組列表查詢', { 
      apiKey: req.apiKey.key_name,
      count: groupList.length 
    });

  } catch (error) {
    logger.error('取得群組列表失敗', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch groups',
      message: error.message
    });
  }
});

// 推送訊息 API
router.post('/send', 
  ApiAuthMiddleware.validateApiKey,
  ApiAuthMiddleware.checkGroupPermission,
  async (req, res) => {
    try {
      const { message, target_groups, target_group } = req.body;
      
      if (!message) {
        return res.status(400).json({
          error: 'Missing message',
          message: 'Message content is required'
        });
      }

      const targetGroups = target_groups || (target_group ? [target_group] : []);
      
      // 推送訊息到指定群組
      const results = await MessageService.pushMessageToMultipleGroups(
        targetGroups, 
        message,
        { apiKeyId: req.apiKey.id }
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.json({
        success: true,
        total_groups: results.length,
        success_count: successCount,
        failed_count: failCount,
        results: results
      });

      logger.info('批量推送完成', {
        apiKey: req.apiKey.key_name,
        totalGroups: results.length,
        successCount,
        failCount
      });

    } catch (error) {
      logger.error('推送訊息失敗', { error: error.message });
      res.status(500).json({
        error: 'Push failed',
        message: error.message
      });
    }
  }
);

// 使用模版推送訊息
router.post('/send/template',
  ApiAuthMiddleware.validateApiKey,
  ApiAuthMiddleware.checkGroupPermission,
  async (req, res) => {
    try {
      const { template_id, variables, target_groups, target_group } = req.body;
      
      if (!template_id) {
        return res.status(400).json({
          error: 'Missing template_id',
          message: 'Template ID is required'
        });
      }

      const targetGroups = target_groups || (target_group ? [target_group] : []);

      // 使用模版推送訊息
      const results = await MessageService.pushTemplateMessage(
        template_id,
        variables || {},
        targetGroups,
        { apiKeyId: req.apiKey.id }
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.json({
        success: true,
        template_id: template_id,
        total_groups: results.length,
        success_count: successCount,
        failed_count: failCount,
        results: results
      });

      logger.info('模版推送完成', {
        apiKey: req.apiKey.key_name,
        templateId: template_id,
        totalGroups: results.length,
        successCount,
        failCount
      });

    } catch (error) {
      logger.error('模版推送失敗', { error: error.message });
      res.status(500).json({
        error: 'Template push failed',
        message: error.message
      });
    }
  }
);

// 取得模版列表
router.get('/templates', ApiAuthMiddleware.validateApiKey, async (req, res) => {
  try {
    const templates = await getTemplateList();
    
    res.json({
      success: true,
      count: templates.length,
      templates: templates.map(template => ({
        template_id: template.template_id,
        template_name: template.template_name,
        description: template.description,
        category: template.category,
        version: template.version,
        variables: JSON.parse(template.variables || '[]'),
        created_at: template.created_at
      }))
    });

  } catch (error) {
    logger.error('取得模版列表失敗', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

// 建立 API Key (管理員功能)
router.post('/keys', async (req, res) => {
  try {
    const { key_name, department, allowed_groups, expires_in_days } = req.body;
    
    // 簡單的管理員認證 (實際應用中應該有更完整的認證)
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'admin-secret-key') {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'Please provide valid admin key in X-Admin-Key header'
      });
    }

    if (!key_name) {
      return res.status(400).json({
        error: 'Missing key_name',
        message: 'API key name is required'
      });
    }

    // 生成 API Key
    const apiKey = generateApiKey();
    const hashedKey = await bcrypt.hash(apiKey, 10);

    // 計算過期時間
    const expiresAt = expires_in_days ? 
      new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000) : null;

    // 儲存到資料庫
    const keyId = await createApiKey({
      keyName: key_name,
      apiKey: apiKey, // 儲存原始 key，實際應用中應該儲存 hash
      department: department || null,
      allowedGroups: allowed_groups ? JSON.stringify(allowed_groups) : null,
      expiresAt: expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      api_key: apiKey, // 只在建立時回傳，之後不會再顯示
      key_id: keyId,
      key_name: key_name,
      department: department,
      allowed_groups: allowed_groups,
      expires_at: expiresAt,
      warning: 'Please save this API key securely. It will not be shown again.'
    });

    logger.info('API Key 建立成功', {
      keyId,
      keyName: key_name,
      department
    });

  } catch (error) {
    logger.error('建立 API Key 失敗', { error: error.message });
    res.status(500).json({
      error: 'Failed to create API key',
      message: error.message
    });
  }
});

// 輔助函數
function generateApiKey() {
  return 'bot_' + uuidv4().replace(/-/g, '');
}

async function createApiKey(keyData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO api_keys (key_name, api_key, department, allowed_groups, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    database.db.run(sql, [
      keyData.keyName,
      keyData.apiKey,
      keyData.department,
      keyData.allowedGroups,
      keyData.expiresAt
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

async function getTemplateList() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM message_templates WHERE is_active = 1 ORDER BY created_at DESC';
    
    database.db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = router;