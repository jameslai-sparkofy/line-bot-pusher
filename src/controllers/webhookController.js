const { middleware, Client } = require('@line/bot-sdk');
const config = require('../config/config');
const logger = require('../utils/logger');
const { database } = require('../models/database');

const client = new Client({
  channelAccessToken: config.lineBot.channelAccessToken
});

const lineConfig = {
  channelSecret: config.lineBot.channelSecret,
};

class WebhookController {
  // LINE Bot middleware for signature verification
  static getMiddleware() {
    return middleware(lineConfig);
  }

  // 處理 LINE webhook 事件
  static async handleEvents(req, res) {
    try {
      const events = req.body.events;
      logger.info(`收到 ${events.length} 個事件`);

      // 處理每個事件
      const promises = events.map(event => WebhookController.handleEvent(event));
      await Promise.all(promises);

      res.status(200).json({ message: 'OK' });
    } catch (error) {
      logger.error('處理 webhook 事件失敗', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 處理單一事件
  static async handleEvent(event) {
    logger.info('處理事件', { type: event.type, source: event.source });

    switch (event.type) {
      case 'join':
        await WebhookController.handleJoinEvent(event);
        break;
        
      case 'leave':
        await WebhookController.handleLeaveEvent(event);
        break;
        
      case 'message':
        await WebhookController.handleMessageEvent(event);
        break;
        
      default:
        logger.debug('未處理的事件類型', { type: event.type });
    }
  }

  // 處理機器人加入群組事件
  static async handleJoinEvent(event) {
    try {
      const groupId = event.source.groupId;
      if (!groupId) return;

      // 取得群組資訊
      const groupInfo = await client.getGroupSummary(groupId);
      
      // 生成群組別名 (使用時間戳)
      const groupAlias = `GROUP_${Date.now().toString().slice(-8)}`;
      
      // 儲存到資料庫
      await database.addGroup({
        groupId: groupId,
        groupName: groupInfo.groupName || '未知群組',
        groupAlias: groupAlias,
        department: null // 可以後續設定
      });

      // 發送歡迎訊息
      const welcomeMessage = {
        type: 'text',
        text: `🎉 歡迎使用公司內部推送機器人！\n\n` +
              `群組代碼：${groupAlias}\n` +
              `群組名稱：${groupInfo.groupName || '未知群組'}\n\n` +
              `📋 功能說明：\n` +
              `• 接收系統推送訊息\n` +
              `• 支援多種訊息格式\n` +
              `• 可設定推送權限\n\n` +
              `🔧 如需設定部門或權限，請聯繫系統管理員\n` +
              `群組代碼：${groupAlias}`
      };

      await client.replyMessage(event.replyToken, welcomeMessage);
      
      logger.info('群組加入處理完成', { 
        groupId, 
        groupName: groupInfo.groupName,
        groupAlias 
      });

    } catch (error) {
      logger.error('處理群組加入事件失敗', { 
        error: error.message, 
        groupId: event.source.groupId 
      });
    }
  }

  // 處理機器人離開群組事件
  static async handleLeaveEvent(event) {
    try {
      const groupId = event.source.groupId;
      if (!groupId) return;

      // 更新群組狀態為非活躍
      await database.deactivateGroup(groupId);
      
      logger.info('群組離開處理完成', { groupId });

    } catch (error) {
      logger.error('處理群組離開事件失敗', { 
        error: error.message, 
        groupId: event.source.groupId 
      });
    }
  }

  // 處理訊息事件 (基本回應)
  static async handleMessageEvent(event) {
    try {
      // 只處理文字訊息
      if (event.message.type !== 'text') return;
      
      const messageText = event.message.text.toLowerCase();
      let replyMessage = null;

      // 簡單的指令處理
      if (messageText.includes('help') || messageText.includes('幫助')) {
        replyMessage = {
          type: 'text',
          text: `🤖 機器人指令說明：\n\n` +
                `💬 help - 顯示此說明\n` +
                `📊 status - 顯示群組狀態\n` +
                `🔧 info - 顯示群組資訊\n\n` +
                `💡 此機器人主要用於接收系統推送訊息\n` +
                `如有問題請聯繫 IT 部門`
        };
      } else if (messageText.includes('info') || messageText.includes('資訊')) {
        const groupId = event.source.groupId;
        if (groupId) {
          // 從資料庫查詢群組資訊
          // 這裡先簡化處理
          replyMessage = {
            type: 'text',
            text: `📋 群組資訊：\n\n` +
                  `群組ID：${groupId}\n` +
                  `狀態：活躍中\n` +
                  `功能：接收推送訊息`
          };
        }
      } else if (messageText.includes('status') || messageText.includes('狀態')) {
        replyMessage = {
          type: 'text',
          text: `✅ 機器人狀態正常\n` +
                `📡 推送服務運行中\n` +
                `⏰ 最後更新：${new Date().toLocaleString('zh-TW')}`
        };
      }

      // 發送回覆訊息
      if (replyMessage) {
        await client.replyMessage(event.replyToken, replyMessage);
        logger.info('訊息回覆完成', { 
          command: messageText,
          groupId: event.source.groupId 
        });
      }

    } catch (error) {
      logger.error('處理訊息事件失敗', { 
        error: error.message,
        messageText: event.message.text 
      });
    }
  }
}

module.exports = WebhookController;