const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = config.database.path;
  }

  async init() {
    try {
      // 確保資料庫目錄存在
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath);
      
      await this.createTables();
      logger.info('資料庫初始化完成', { path: this.dbPath });
      
      return this.db;
    } catch (error) {
      logger.error('資料庫初始化失敗', { error: error.message });
      throw error;
    }
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // 群組資料表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id TEXT UNIQUE NOT NULL,
            group_name TEXT,
            group_alias TEXT UNIQUE,
            department TEXT,
            is_active BOOLEAN DEFAULT 1,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            left_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // API金鑰資料表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_name TEXT NOT NULL,
            api_key TEXT UNIQUE NOT NULL,
            department TEXT,
            allowed_groups TEXT, -- JSON array of group IDs
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            last_used_at DATETIME
          )
        `);

        // 訊息推送記錄
        this.db.run(`
          CREATE TABLE IF NOT EXISTS push_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key_id INTEGER,
            group_id TEXT NOT NULL,
            template_id TEXT,
            message_content TEXT,
            status TEXT DEFAULT 'pending', -- pending, sent, failed
            error_message TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
          )
        `);

        // 訊息模版資料表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS message_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            template_id TEXT UNIQUE NOT NULL,
            template_name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            version TEXT DEFAULT '1.0',
            variables TEXT, -- JSON array
            message_template TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            logger.error('建立資料表失敗', { error: err.message });
            reject(err);
          } else {
            logger.info('資料表建立完成');
            resolve();
          }
        });
      });
    });
  }

  // 群組相關操作
  async addGroup(groupData) {
    return new Promise((resolve, reject) => {
      const { groupId, groupName, groupAlias, department } = groupData;
      
      const sql = `
        INSERT OR REPLACE INTO groups (group_id, group_name, group_alias, department, is_active, joined_at)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(sql, [groupId, groupName, groupAlias, department], function(err) {
        if (err) {
          logger.error('新增群組失敗', { error: err.message, groupData });
          reject(err);
        } else {
          logger.info('群組新增成功', { groupId, id: this.lastID });
          resolve(this.lastID);
        }
      });
    });
  }

  async getActiveGroups() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM groups WHERE is_active = 1 ORDER BY joined_at DESC';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          logger.error('查詢活躍群組失敗', { error: err.message });
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async deactivateGroup(groupId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE groups 
        SET is_active = 0, left_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE group_id = ?
      `;
      
      this.db.run(sql, [groupId], function(err) {
        if (err) {
          logger.error('停用群組失敗', { error: err.message, groupId });
          reject(err);
        } else {
          logger.info('群組已停用', { groupId, changes: this.changes });
          resolve(this.changes);
        }
      });
    });
  }

  // 推送記錄
  async logPush(logData) {
    return new Promise((resolve, reject) => {
      const { apiKeyId, groupId, templateId, messageContent, status, errorMessage } = logData;
      
      const sql = `
        INSERT INTO push_logs (api_key_id, group_id, template_id, message_content, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [apiKeyId, groupId, templateId, messageContent, status, errorMessage], function(err) {
        if (err) {
          logger.error('記錄推送日誌失敗', { error: err.message });
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('關閉資料庫連線失敗', { error: err.message });
        } else {
          logger.info('資料庫連線已關閉');
        }
      });
    }
  }
}

const database = new Database();

module.exports = {
  database,
  initDatabase: () => database.init()
};