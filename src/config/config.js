require('dotenv').config();

const config = {
  // LINE Bot 設定
  lineBot: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  },
  
  // 伺服器設定
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // 資料庫設定
  database: {
    path: process.env.DATABASE_PATH || './data/bot.sqlite',
  },
  
  // API 設定
  api: {
    secretKey: process.env.API_SECRET_KEY || 'your-secret-key-here',
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-here',
  },
  
  // 推送限制
  limits: {
    maxPushRate: parseInt(process.env.MAX_PUSH_RATE) || 500,
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 2000,
  },
  
  // 日誌設定
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  }
};

// 驗證必要設定
function validateConfig() {
  const required = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的環境變數:', missing);
    console.error('請參考 .env.example 設定環境變數');
    process.exit(1);
  }
}

if (config.server.nodeEnv === 'production') {
  validateConfig();
}

module.exports = config;