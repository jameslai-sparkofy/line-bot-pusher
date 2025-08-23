const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');
const { database } = require('../models/database');

class ApiAuthMiddleware {
  // 驗證 API Key
  static async validateApiKey(req, res, next) {
    try {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API Key required',
          message: 'Please provide API key in X-API-Key header or Authorization Bearer token'
        });
      }

      // 查詢資料庫驗證 API Key
      const keyInfo = await ApiAuthMiddleware.getApiKeyInfo(apiKey);
      
      if (!keyInfo) {
        logger.warn('無效的 API Key', { apiKey: apiKey.substring(0, 8) + '...' });
        return res.status(401).json({
          error: 'Invalid API Key',
          message: 'The provided API key is invalid or expired'
        });
      }

      if (!keyInfo.is_active) {
        return res.status(401).json({
          error: 'API Key disabled',
          message: 'This API key has been disabled'
        });
      }

      // 檢查過期時間
      if (keyInfo.expires_at && new Date(keyInfo.expires_at) < new Date()) {
        return res.status(401).json({
          error: 'API Key expired',
          message: 'This API key has expired'
        });
      }

      // 記錄使用時間
      await ApiAuthMiddleware.updateLastUsed(keyInfo.id);

      // 將 API Key 資訊附加到 request
      req.apiKey = keyInfo;
      
      logger.info('API 認證成功', { 
        keyName: keyInfo.key_name,
        department: keyInfo.department 
      });

      next();
    } catch (error) {
      logger.error('API 認證失敗', { error: error.message });
      res.status(500).json({
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      });
    }
  }

  // 檢查群組推送權限
  static checkGroupPermission(req, res, next) {
    try {
      const { target_groups, target_group } = req.body;
      const apiKey = req.apiKey;
      
      // 取得目標群組列表
      const targetGroups = target_groups || (target_group ? [target_group] : []);
      
      if (!targetGroups || targetGroups.length === 0) {
        return res.status(400).json({
          error: 'No target groups specified',
          message: 'Please specify target_groups or target_group'
        });
      }

      // 檢查 API Key 是否有權限推送到指定群組
      if (apiKey.allowed_groups) {
        const allowedGroups = JSON.parse(apiKey.allowed_groups);
        const unauthorizedGroups = targetGroups.filter(group => !allowedGroups.includes(group));
        
        if (unauthorizedGroups.length > 0) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: `No permission to send to groups: ${unauthorizedGroups.join(', ')}`,
            allowed_groups: allowedGroups
          });
        }
      }

      req.targetGroups = targetGroups;
      next();
    } catch (error) {
      logger.error('群組權限檢查失敗', { error: error.message });
      res.status(500).json({
        error: 'Permission check failed',
        message: 'Internal server error during permission check'
      });
    }
  }

  // 取得 API Key 資訊
  static async getApiKeyInfo(apiKey) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, key_name, department, allowed_groups, is_active, expires_at, last_used_at
        FROM api_keys 
        WHERE api_key = ? AND is_active = 1
      `;
      
      database.db.get(sql, [apiKey], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 更新最後使用時間
  static async updateLastUsed(apiKeyId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE api_keys 
        SET last_used_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      database.db.run(sql, [apiKeyId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = ApiAuthMiddleware;