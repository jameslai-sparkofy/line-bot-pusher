-- 圖片儲存表
CREATE TABLE IF NOT EXISTS r2_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT UNIQUE NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    public_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_count INTEGER DEFAULT 0
);

-- 建案資料表
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    total_units INTEGER DEFAULT 0,
    contact_phone TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'active', -- active, completed, suspended
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 建案棟別資料表
CREATE TABLE IF NOT EXISTS project_buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    building_name TEXT NOT NULL,
    total_units INTEGER NOT NULL,
    sold_units INTEGER DEFAULT 0,
    sold_percentage TEXT,
    building_image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- Flex 模板類別表
CREATE TABLE IF NOT EXISTS flex_template_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id TEXT UNIQUE NOT NULL,
    category_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- LIFF 應用設定表
CREATE TABLE IF NOT EXISTS liff_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liff_id TEXT UNIQUE NOT NULL,
    app_name TEXT NOT NULL,
    description TEXT,
    endpoint_url TEXT NOT NULL,
    view_type TEXT DEFAULT 'full', -- compact, tall, full
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 分享事件記錄表
CREATE TABLE IF NOT EXISTS share_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL DEFAULT 'flex_share',
    project_id TEXT,
    template_id TEXT,
    user_id TEXT,
    shared_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (template_id) REFERENCES flex_message_templates(template_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_r2_images_created_at ON r2_images(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_buildings_project_id ON project_buildings(project_id);
CREATE INDEX IF NOT EXISTS idx_flex_template_categories_sort_order ON flex_template_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_share_events_template_id ON share_events(template_id);
CREATE INDEX IF NOT EXISTS idx_share_events_project_id ON share_events(project_id);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON share_events(created_at);

-- 插入預設模板類別
INSERT OR IGNORE INTO flex_template_categories (
    category_id, category_name, description, icon, sort_order
) VALUES 
(
    'construction_progress',
    '工地進度推送',
    '用於推送工程進度、施工照片等資訊',
    '🏗️',
    1
),
(
    'new_project_launch',
    '新建案開賣',
    '新建案上市、開賣活動推廣',
    '🏢',
    2
),
(
    'completion_handover',
    '完工交屋通知',
    '完工通知、交屋相關資訊',
    '🗝️',
    3
),
(
    'sales_update',
    '銷售進度更新',
    '各棟銷售狀況、剩餘戶數更新',
    '📊',
    4
),
(
    'event_promotion',
    '活動推廣',
    '賞屋活動、優惠方案推廣',
    '🎉',
    5
);

-- 插入範例建案資料
INSERT OR IGNORE INTO projects (
    project_id, project_name, description, location, total_units, contact_phone
) VALUES 
(
    'proj_sample_001',
    '麗晶花園',
    '市中心精品住宅，交通便利，生活機能完善',
    '台北市信義區',
    120,
    '02-1234-5678'
),
(
    'proj_sample_002', 
    '翡翠森林',
    '山景第一排，享受自然綠意的渡假式住宅',
    '新北市新店區',
    88,
    '02-8765-4321'
);

-- 插入範例棟別資料
INSERT OR IGNORE INTO project_buildings (
    project_id, building_name, total_units, sold_units, sold_percentage, description
) VALUES 
(
    'proj_sample_001',
    'A棟',
    40,
    39,
    '97%',
    '面東南向，採光極佳'
),
(
    'proj_sample_001',
    'B棟', 
    40,
    36,
    '89%',
    '面西南向，夕陽美景'
),
(
    'proj_sample_001',
    'C棟',
    40,
    30,
    '75%',
    '面北向，安靜舒適'
),
(
    'proj_sample_002',
    'A棟',
    44,
    35,
    '80%',
    '山景第一排'
),
(
    'proj_sample_002',
    'B棟',
    44,
    25,
    '57%',
    '森林景觀'
);