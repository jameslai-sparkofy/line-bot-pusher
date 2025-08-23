-- 新增訊息發送歷史記錄表
-- 建立時間: 2025-08-23

CREATE TABLE IF NOT EXISTS message_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    template_id TEXT,
    group_id TEXT NOT NULL,
    processed_message TEXT NOT NULL,
    variables_used TEXT DEFAULT '{}',
    sent_at DATETIME DEFAULT (datetime('now')),
    created_at DATETIME DEFAULT (datetime('now'))
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_message_history_template_id ON message_history(template_id);
CREATE INDEX IF NOT EXISTS idx_message_history_group_id ON message_history(group_id);
CREATE INDEX IF NOT EXISTS idx_message_history_sent_at ON message_history(sent_at);