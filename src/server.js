const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const logger = require('./utils/logger');
const { initDatabase } = require('./models/database');
const WebhookController = require('./controllers/webhookController');
const apiController = require('./controllers/apiController');
const adminController = require('./controllers/adminController');

const app = express();

// 安全性中間件
app.use(helmet());
app.use(cors());

// 日誌中間件
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// LINE Webhook 路由 (需要原始 body)
app.use('/webhook', express.raw({ type: 'application/json' }));

// 其他路由使用 JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// LINE Webhook 端點
app.post('/webhook', 
  WebhookController.getMiddleware(), 
  WebhookController.handleEvents
);

// API 路由
app.use('/api', apiController);

// 管理後台路由
app.use('/admin', adminController);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Path ${req.originalUrl} not found`
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  logger.error('未處理的錯誤', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: config.server.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 啟動伺服器
async function startServer() {
  try {
    // 初始化資料庫
    await initDatabase();
    logger.info('✅ 資料庫初始化完成');
    
    // 啟動伺服器
    const server = app.listen(config.server.port, () => {
      logger.info(`🚀 伺服器啟動成功`);
      logger.info(`📡 PORT: ${config.server.port}`);
      logger.info(`🌐 Environment: ${config.server.nodeEnv}`);
      logger.info(`🔗 Webhook URL: http://localhost:${config.server.port}/webhook`);
      logger.info(`❤️  Health Check: http://localhost:${config.server.port}/health`);
      
      if (config.server.nodeEnv === 'development') {
        logger.info('💡 開發模式提示：');
        logger.info('   1. 複製 .env.example 為 .env 並設定 LINE Bot 憑證');
        logger.info('   2. 使用 ngrok 建立外部 URL：ngrok http 3000');
        logger.info('   3. 在 LINE Console 設定 Webhook URL');
      }
    });

    // 優雅關機
    process.on('SIGTERM', () => {
      logger.info('收到 SIGTERM 信號，開始關機...');
      server.close(() => {
        logger.info('伺服器已關閉');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('啟動伺服器失敗', { error: error.message });
    process.exit(1);
  }
}

// 未捕獲的異常處理
process.on('uncaughtException', (err) => {
  logger.error('未捕獲的異常', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未處理的 Promise 拒絕', { reason, promise });
  process.exit(1);
});

// 啟動應用
startServer();

module.exports = app;