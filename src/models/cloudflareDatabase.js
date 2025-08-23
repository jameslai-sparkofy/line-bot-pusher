// Cloudflare D1 資料庫適配器
class CloudflareDatabase {
  constructor(env) {
    this.db = env.DB || env.LINE_BOT_DB;
  }

  // 群組相關操作
  async addGroup(groupData) {
    const { groupId, groupName, groupAlias, department } = groupData;
    
    const result = await this.db.prepare(`
      INSERT OR REPLACE INTO groups (group_id, group_name, group_alias, department, is_active, joined_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `).bind(groupId, groupName, groupAlias, department).run();
    
    return result.meta?.last_row_id || result.meta?.changes;
  }

  async getActiveGroups() {
    const result = await this.db.prepare(
      'SELECT * FROM groups WHERE is_active = 1 ORDER BY joined_at DESC'
    ).all();
    
    return result.results || [];
  }

  async deactivateGroup(groupId) {
    const result = await this.db.prepare(`
      UPDATE groups 
      SET is_active = 0, left_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE group_id = ?
    `).bind(groupId).run();
    
    return result.meta?.changes || 0;
  }

  // 取得群組資訊
  async getGroupInfo(identifier) {
    const result = await this.db.prepare(`
      SELECT * FROM groups 
      WHERE (group_id = ? OR group_alias = ? OR group_name = ?) 
      AND is_active = 1
    `).bind(identifier, identifier, identifier).first();
    
    return result;
  }

  // API 金鑰相關操作
  async getApiKeyInfo(apiKey) {
    const result = await this.db.prepare(`
      SELECT id, key_name, department, allowed_groups, is_active, expires_at, last_used_at
      FROM api_keys 
      WHERE api_key = ? AND is_active = 1
    `).bind(apiKey).first();
    
    return result;
  }

  async updateLastUsed(apiKeyId) {
    const result = await this.db.prepare(`
      UPDATE api_keys 
      SET last_used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(apiKeyId).run();
    
    return result.meta?.changes || 0;
  }

  async createApiKey(keyData) {
    const { keyName, apiKey, department, allowedGroups, expiresAt } = keyData;
    
    const result = await this.db.prepare(`
      INSERT INTO api_keys (key_name, api_key, department, allowed_groups, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(keyName, apiKey, department, allowedGroups, expiresAt).run();
    
    return result.meta?.last_row_id;
  }

  // 推送記錄
  async logPush(logData) {
    const { apiKeyId, groupId, templateId, messageContent, status, errorMessage } = logData;
    
    const result = await this.db.prepare(`
      INSERT INTO push_logs (api_key_id, group_id, template_id, message_content, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(apiKeyId, groupId, templateId, messageContent, status, errorMessage).run();
    
    return result.meta?.last_row_id;
  }

  // 模版相關操作
  async getTemplate(templateId) {
    const result = await this.db.prepare(
      'SELECT * FROM message_templates WHERE template_id = ? AND is_active = 1'
    ).bind(templateId).first();
    
    return result;
  }

  async getTemplateList() {
    const result = await this.db.prepare(
      'SELECT * FROM message_templates WHERE is_active = 1 ORDER BY created_at DESC'
    ).all();
    
    return result.results || [];
  }

  // 批次操作
  async batch(operations) {
    return await this.db.batch(operations);
  }

  // 執行原始 SQL
  async prepare(sql) {
    return this.db.prepare(sql);
  }
}

module.exports = CloudflareDatabase;