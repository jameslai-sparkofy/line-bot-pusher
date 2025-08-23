const { Client } = require('@line/bot-sdk');
const config = require('../config/config');
const logger = require('../utils/logger');
const { database } = require('../models/database');

const client = new Client({
  channelAccessToken: config.lineBot.channelAccessToken
});

class MessageService {
  // 推送訊息到指定群組
  static async pushMessage(groupIdentifier, messageContent, options = {}) {
    try {
      // 取得群組資訊
      const groupInfo = await MessageService.getGroupInfo(groupIdentifier);
      
      if (!groupInfo) {
        throw new Error(`群組不存在或不活躍: ${groupIdentifier}`);
      }

      if (!groupInfo.is_active) {
        throw new Error(`群組已停用: ${groupIdentifier}`);
      }

      // 驗證訊息內容
      const message = MessageService.validateMessage(messageContent);
      
      // 推送訊息
      const result = await client.pushMessage(groupInfo.group_id, message);
      
      logger.info('訊息推送成功', {
        groupId: groupInfo.group_id,
        groupAlias: groupInfo.group_alias,
        messageType: message.type
      });

      // 記錄推送日誌
      await MessageService.logPushMessage({
        apiKeyId: options.apiKeyId,
        groupId: groupInfo.group_id,
        templateId: options.templateId,
        messageContent: JSON.stringify(message),
        status: 'sent'
      });

      return {
        success: true,
        groupId: groupInfo.group_id,
        groupAlias: groupInfo.group_alias,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('推送訊息失敗', {
        groupIdentifier,
        error: error.message
      });

      // 記錄失敗日誌
      await MessageService.logPushMessage({
        apiKeyId: options.apiKeyId,
        groupId: groupIdentifier,
        templateId: options.templateId,
        messageContent: JSON.stringify(messageContent),
        status: 'failed',
        errorMessage: error.message
      });

      throw error;
    }
  }

  // 批量推送訊息
  static async pushMessageToMultipleGroups(groupIdentifiers, messageContent, options = {}) {
    const results = [];
    
    for (const groupIdentifier of groupIdentifiers) {
      try {
        const result = await MessageService.pushMessage(groupIdentifier, messageContent, options);
        results.push({
          group: groupIdentifier,
          ...result
        });
      } catch (error) {
        results.push({
          group: groupIdentifier,
          success: false,
          error: error.message
        });
      }
      
      // 避免推送太快觸發限制，稍微延遲
      await MessageService.delay(100);
    }

    return results;
  }

  // 使用模版推送訊息
  static async pushTemplateMessage(templateId, variables, groupIdentifiers, options = {}) {
    try {
      // 取得模版資訊
      const template = await MessageService.getTemplate(templateId);
      
      if (!template) {
        throw new Error(`模版不存在: ${templateId}`);
      }

      if (!template.is_active) {
        throw new Error(`模版已停用: ${templateId}`);
      }

      // 渲染模版
      const messageContent = MessageService.renderTemplate(template, variables);
      
      // 推送到多個群組
      const results = await MessageService.pushMessageToMultipleGroups(
        groupIdentifiers, 
        messageContent, 
        { ...options, templateId }
      );

      return results;

    } catch (error) {
      logger.error('模版訊息推送失敗', {
        templateId,
        error: error.message
      });
      throw error;
    }
  }

  // 渲染訊息模版
  static renderTemplate(template, variables) {
    try {
      let messageText = template.message_template;
      
      // 簡單的變數替換 (支援 {{variable}} 格式)
      if (variables) {
        Object.keys(variables).forEach(key => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          messageText = messageText.replace(regex, variables[key]);
        });
      }

      // 處理特殊變數
      messageText = MessageService.processSpecialVariables(messageText, variables);

      return {
        type: 'text',
        text: messageText
      };
    } catch (error) {
      logger.error('模版渲染失敗', { error: error.message });
      throw new Error('Template rendering failed');
    }
  }

  // 處理特殊變數 (如進度條)
  static processSpecialVariables(messageText, variables) {
    // 進度條變數 {{progress_bar}}
    if (messageText.includes('{{progress_bar}}') && variables?.progress_percentage) {
      const percentage = parseInt(variables.progress_percentage);
      const progressBar = MessageService.generateProgressBar(percentage);
      messageText = messageText.replace(/{{progress_bar}}/g, progressBar);
    }

    // 時間戳變數 {{timestamp}}
    if (messageText.includes('{{timestamp}}')) {
      const timestamp = new Date().toLocaleString('zh-TW');
      messageText = messageText.replace(/{{timestamp}}/g, timestamp);
    }

    return messageText;
  }

  // 生成進度條
  static generateProgressBar(percentage, length = 10) {
    const filled = Math.round(percentage / 10);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  // 驗證訊息格式
  static validateMessage(messageContent) {
    if (typeof messageContent === 'string') {
      // 字串訊息
      if (messageContent.length > config.limits.maxMessageLength) {
        throw new Error(`Message too long. Max length: ${config.limits.maxMessageLength}`);
      }
      return {
        type: 'text',
        text: messageContent
      };
    } else if (typeof messageContent === 'object') {
      // 物件訊息 (支援 LINE Message API 格式)
      if (!messageContent.type) {
        throw new Error('Message object must have a type field');
      }
      return messageContent;
    } else {
      throw new Error('Invalid message format');
    }
  }

  // 取得群組資訊
  static async getGroupInfo(identifier) {
    return new Promise((resolve, reject) => {
      // 可以用 group_id, group_alias 或 群組名稱查詢
      const sql = `
        SELECT * FROM groups 
        WHERE (group_id = ? OR group_alias = ? OR group_name = ?) 
        AND is_active = 1
      `;
      
      database.db.get(sql, [identifier, identifier, identifier], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 取得模版資訊
  static async getTemplate(templateId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM message_templates WHERE template_id = ? AND is_active = 1';
      
      database.db.get(sql, [templateId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 記錄推送日誌
  static async logPushMessage(logData) {
    return database.logPush(logData);
  }

  // 延遲函數
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 取得群組列表
  static async getActiveGroups() {
    return database.getActiveGroups();
  }
}

module.exports = MessageService;