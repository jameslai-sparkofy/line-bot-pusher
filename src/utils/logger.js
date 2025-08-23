const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class Logger {
  constructor() {
    this.logDir = path.dirname(config.logging.file);
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      logMessage += ` ${JSON.stringify(data)}`;
    }
    
    return logMessage;
  }

  writeLog(level, message, data = null) {
    const logMessage = this.formatMessage(level, message, data);
    
    // 寫入檔案
    fs.appendFileSync(config.logging.file, logMessage + '\n');
    
    // 同時輸出到 console
    if (config.server.nodeEnv === 'development') {
      const colors = {
        error: '\x1b[31m',   // 紅色
        warn: '\x1b[33m',    // 黃色
        info: '\x1b[36m',    // 青色
        debug: '\x1b[90m'    // 灰色
      };
      
      const reset = '\x1b[0m';
      const color = colors[level] || '';
      
      console.log(`${color}${logMessage}${reset}`);
    }
  }

  info(message, data = null) {
    this.writeLog('info', message, data);
  }

  warn(message, data = null) {
    this.writeLog('warn', message, data);
  }

  error(message, data = null) {
    this.writeLog('error', message, data);
  }

  debug(message, data = null) {
    if (config.logging.level === 'debug') {
      this.writeLog('debug', message, data);
    }
  }
}

module.exports = new Logger();