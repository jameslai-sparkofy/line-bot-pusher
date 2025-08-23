-- LINE Bot 推送系統資料庫初始化
-- 建立時間: 2025-08-23

-- 群組資料表
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
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_groups_group_id ON groups(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_alias ON groups(group_alias);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);

-- API金鑰資料表
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
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- 訊息推送記錄
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
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_push_logs_group_id ON push_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_push_logs_status ON push_logs(status);
CREATE INDEX IF NOT EXISTS idx_push_logs_sent_at ON push_logs(sent_at);

-- 訊息模版資料表
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
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_message_templates_template_id ON message_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);