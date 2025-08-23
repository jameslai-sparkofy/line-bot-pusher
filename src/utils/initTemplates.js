const { database } = require('../models/database');
const logger = require('./logger');

// 預設訊息模版
const defaultTemplates = [
  {
    template_id: 'construction_progress',
    template_name: '工地進度通知',
    description: '用於推送工地施工進度更新',
    category: '工程部',
    version: '1.0',
    variables: [
      {
        name: 'project_name',
        type: 'string',
        required: true,
        description: '工程專案名稱',
        example: '台北101大樓整修工程'
      },
      {
        name: 'progress_percentage',
        type: 'number',
        required: true,
        description: '完成進度百分比 (0-100)',
        example: 75
      },
      {
        name: 'current_phase',
        type: 'string',
        required: true,
        description: '目前施工階段',
        example: '基礎工程'
      },
      {
        name: 'completion_date',
        type: 'date',
        required: false,
        description: '預計完工日期 (YYYY-MM-DD)',
        example: '2024-12-31'
      },
      {
        name: 'notes',
        type: 'string',
        required: false,
        description: '備註說明',
        example: '天候良好，進度超前'
      }
    ],
    message_template: `🏗️ 工地進度更新

專案名稱：{{project_name}}
完成進度：{{progress_percentage}}%
目前階段：{{current_phase}}

📊 專案進度條：{{progress_bar}}
⏰ 更新時間：{{timestamp}}`
  },
  {
    template_id: 'system_alert',
    template_name: '系統警報通知',
    description: '用於系統異常或警報推送',
    category: 'IT部',
    version: '1.0',
    variables: [
      {
        name: 'alert_level',
        type: 'string',
        required: true,
        description: '警報等級 (LOW/MEDIUM/HIGH/CRITICAL)',
        example: 'HIGH'
      },
      {
        name: 'system_name',
        type: 'string',
        required: true,
        description: '系統名稱',
        example: 'Web服務器'
      },
      {
        name: 'alert_message',
        type: 'string',
        required: true,
        description: '警報訊息',
        example: 'CPU使用率超過90%'
      },
      {
        name: 'action_required',
        type: 'string',
        required: false,
        description: '需要採取的行動',
        example: '請檢查服務器負載'
      }
    ],
    message_template: `🚨 系統警報 - {{alert_level}}

系統：{{system_name}}
警報：{{alert_message}}

時間：{{timestamp}}
請相關人員立即處理！`
  },
  {
    template_id: 'order_notification',
    template_name: '訂單狀態通知',
    description: '用於電商訂單狀態更新推送',
    category: '業務部',
    version: '1.0',
    variables: [
      {
        name: 'order_id',
        type: 'string',
        required: true,
        description: '訂單編號',
        example: 'ORD-2024-001'
      },
      {
        name: 'customer_name',
        type: 'string',
        required: true,
        description: '客戶姓名',
        example: '王小明'
      },
      {
        name: 'status',
        type: 'string',
        required: true,
        description: '訂單狀態',
        example: '已出貨'
      },
      {
        name: 'amount',
        type: 'number',
        required: false,
        description: '訂單金額',
        example: 1500
      },
      {
        name: 'tracking_number',
        type: 'string',
        required: false,
        description: '物流追蹤號碼',
        example: 'TW123456789'
      }
    ],
    message_template: `📦 訂單狀態更新

訂單編號：{{order_id}}
客戶姓名：{{customer_name}}
訂單狀態：{{status}}

更新時間：{{timestamp}}`
  }
];

async function initTemplates() {
  try {
    logger.info('開始初始化預設模版...');
    
    for (const template of defaultTemplates) {
      await createTemplate(template);
      logger.info(`模版建立完成: ${template.template_id}`);
    }
    
    logger.info('✅ 預設模版初始化完成');
  } catch (error) {
    logger.error('初始化模版失敗', { error: error.message });
    throw error;
  }
}

function createTemplate(templateData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO message_templates 
      (template_id, template_name, description, category, version, variables, message_template)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    database.db.run(sql, [
      templateData.template_id,
      templateData.template_name,
      templateData.description,
      templateData.category,
      templateData.version,
      JSON.stringify(templateData.variables),
      templateData.message_template
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

// 如果直接執行此檔案
if (require.main === module) {
  const { initDatabase } = require('../models/database');
  
  async function run() {
    try {
      await initDatabase();
      await initTemplates();
      process.exit(0);
    } catch (error) {
      console.error('初始化失敗:', error);
      process.exit(1);
    }
  }
  
  run();
}

module.exports = { initTemplates };