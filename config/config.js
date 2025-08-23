require('dotenv').config();

module.exports = {
  // LINE Bot 設定
  LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
  
  // 伺服器設定
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 資料庫設定
  DATABASE_PATH: process.env.DATABASE_PATH || './data/bot.sqlite',
  
  // API 設定
  API_SECRET_KEY: process.env.API_SECRET_KEY || 'your-secret-key-here',
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-here',
  
  // 推送限制
  MAX_PUSH_RATE: parseInt(process.env.MAX_PUSH_RATE) || 500, // 每分鐘最大推送數
  MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH) || 2000,
  
  // 日誌設定
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log'
};