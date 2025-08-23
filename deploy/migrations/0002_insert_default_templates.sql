-- 插入預設訊息模版
-- 建立時間: 2025-08-23

-- 工地進度通知模版
INSERT OR REPLACE INTO message_templates 
(template_id, template_name, description, category, version, variables, message_template, is_active)
VALUES (
    'construction_progress',
    '工地進度通知',
    '用於推送工地施工進度更新',
    '工程部',
    '1.0',
    '[
        {
            "name": "project_name",
            "type": "string",
            "required": true,
            "description": "工程專案名稱",
            "example": "台北101大樓整修工程"
        },
        {
            "name": "progress_percentage",
            "type": "number",
            "required": true,
            "description": "完成進度百分比 (0-100)",
            "example": 75
        },
        {
            "name": "current_phase",
            "type": "string",
            "required": true,
            "description": "目前施工階段",
            "example": "基礎工程"
        },
        {
            "name": "completion_date",
            "type": "date",
            "required": false,
            "description": "預計完工日期 (YYYY-MM-DD)",
            "example": "2024-12-31"
        },
        {
            "name": "notes",
            "type": "string",
            "required": false,
            "description": "備註說明",
            "example": "天候良好，進度超前"
        }
    ]',
    '🏗️ 工地進度更新

專案名稱：{{project_name}}
完成進度：{{progress_percentage}}%
目前階段：{{current_phase}}

📊 專案進度條：{{progress_bar}}
⏰ 更新時間：{{timestamp}}',
    1
);

-- 系統警報通知模版
INSERT OR REPLACE INTO message_templates 
(template_id, template_name, description, category, version, variables, message_template, is_active)
VALUES (
    'system_alert',
    '系統警報通知',
    '用於系統異常或警報推送',
    'IT部',
    '1.0',
    '[
        {
            "name": "alert_level",
            "type": "string",
            "required": true,
            "description": "警報等級 (LOW/MEDIUM/HIGH/CRITICAL)",
            "example": "HIGH"
        },
        {
            "name": "system_name",
            "type": "string",
            "required": true,
            "description": "系統名稱",
            "example": "Web服務器"
        },
        {
            "name": "alert_message",
            "type": "string",
            "required": true,
            "description": "警報訊息",
            "example": "CPU使用率超過90%"
        },
        {
            "name": "action_required",
            "type": "string",
            "required": false,
            "description": "需要採取的行動",
            "example": "請檢查服務器負載"
        }
    ]',
    '🚨 系統警報 - {{alert_level}}

系統：{{system_name}}
警報：{{alert_message}}

時間：{{timestamp}}
請相關人員立即處理！',
    1
);

-- 訂單狀態通知模版
INSERT OR REPLACE INTO message_templates 
(template_id, template_name, description, category, version, variables, message_template, is_active)
VALUES (
    'order_notification',
    '訂單狀態通知',
    '用於電商訂單狀態更新推送',
    '業務部',
    '1.0',
    '[
        {
            "name": "order_id",
            "type": "string",
            "required": true,
            "description": "訂單編號",
            "example": "ORD-2024-001"
        },
        {
            "name": "customer_name",
            "type": "string",
            "required": true,
            "description": "客戶姓名",
            "example": "王小明"
        },
        {
            "name": "status",
            "type": "string",
            "required": true,
            "description": "訂單狀態",
            "example": "已出貨"
        },
        {
            "name": "amount",
            "type": "number",
            "required": false,
            "description": "訂單金額",
            "example": 1500
        },
        {
            "name": "tracking_number",
            "type": "string",
            "required": false,
            "description": "物流追蹤號碼",
            "example": "TW123456789"
        }
    ]',
    '📦 訂單狀態更新

訂單編號：{{order_id}}
客戶姓名：{{customer_name}}
訂單狀態：{{status}}

更新時間：{{timestamp}}',
    1
);