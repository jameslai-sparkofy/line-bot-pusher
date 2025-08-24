-- Flex Message 模板系統
-- 建立時間: 2025-08-24

-- Flex Message 模板資料表
CREATE TABLE IF NOT EXISTS flex_message_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id TEXT UNIQUE NOT NULL,
    template_name TEXT NOT NULL,
    description TEXT,
    template_type TEXT DEFAULT 'bubble', -- bubble, carousel
    flex_content TEXT NOT NULL, -- JSON content of flex message
    variables TEXT DEFAULT '[]', -- JSON array of variables
    preview_image TEXT, -- base64 encoded preview image
    category TEXT DEFAULT 'general',
    tags TEXT DEFAULT '[]', -- JSON array for search tags
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    usage_count INTEGER DEFAULT 0
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_flex_templates_template_id ON flex_message_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_flex_templates_type ON flex_message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_flex_templates_category ON flex_message_templates(category);
CREATE INDEX IF NOT EXISTS idx_flex_templates_is_active ON flex_message_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_flex_templates_created_at ON flex_message_templates(created_at);

-- Flex Message 發送記錄表 (擴充現有的 push_logs)
-- 為了追蹤 Flex Message 的使用情況，我們可能需要在 push_logs 中新增欄位
-- 但先使用現有結構，template_id 會指向 flex template

-- 插入預設的 Flex Message 模板
INSERT OR IGNORE INTO flex_message_templates (
    template_id, template_name, description, template_type, flex_content, variables, category, tags
) VALUES 
(
    'flex_product_showcase',
    '商品展示卡片',
    '用於展示商品資訊，包含圖片、名稱、價格和購買按鈕',
    'bubble',
    '{
        "type": "bubble",
        "hero": {
            "type": "image",
            "url": "{{product_image}}",
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": "{{product_name}}",
                    "weight": "bold",
                    "size": "lg"
                },
                {
                    "type": "text",
                    "text": "{{product_description}}",
                    "size": "sm",
                    "color": "#666666",
                    "margin": "md"
                },
                {
                    "type": "box",
                    "layout": "baseline",
                    "margin": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": "NT${{price}}",
                            "size": "xl",
                            "color": "#ff5551",
                            "flex": 0
                        }
                    ]
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "立即購買",
                        "uri": "{{purchase_url}}"
                    }
                },
                {
                    "type": "button",
                    "style": "secondary",
                    "height": "sm",
                    "action": {
                        "type": "postback",
                        "label": "加入收藏",
                        "data": "action=favorite&product_id={{product_id}}"
                    }
                }
            ]
        }
    }',
    '[
        {"name": "product_image", "type": "url", "required": true, "description": "商品圖片網址"},
        {"name": "product_name", "type": "text", "required": true, "description": "商品名稱"},
        {"name": "product_description", "type": "text", "required": false, "description": "商品描述"},
        {"name": "price", "type": "number", "required": true, "description": "價格"},
        {"name": "purchase_url", "type": "url", "required": true, "description": "購買連結"},
        {"name": "product_id", "type": "text", "required": true, "description": "商品ID"}
    ]',
    '電商',
    '["商品", "購物", "電商", "展示"]'
),
(
    'flex_receipt',
    '收據模板',
    '訂單收據和交易確認用途',
    'bubble',
    '{
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": "收據",
                    "weight": "bold",
                    "color": "#1DB446",
                    "size": "sm"
                },
                {
                    "type": "text",
                    "text": "{{company_name}}",
                    "weight": "bold",
                    "size": "xxl",
                    "margin": "md"
                },
                {
                    "type": "text",
                    "text": "{{company_address}}",
                    "size": "xs",
                    "color": "#aaaaaa",
                    "wrap": true
                },
                {
                    "type": "separator",
                    "margin": "xxl"
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "xxl",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "{{item_name}}",
                                    "size": "sm",
                                    "color": "#555555",
                                    "flex": 0
                                },
                                {
                                    "type": "text",
                                    "text": "NT${{item_price}}",
                                    "size": "sm",
                                    "color": "#111111",
                                    "align": "end"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "xxl"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "總計",
                                    "size": "sm",
                                    "color": "#555555"
                                },
                                {
                                    "type": "text",
                                    "text": "NT${{total_amount}}",
                                    "size": "sm",
                                    "color": "#111111",
                                    "weight": "bold",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "separator",
                    "margin": "xxl"
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "xxl",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "付款方式",
                                    "size": "xs",
                                    "color": "#aaaaaa",
                                    "flex": 0
                                },
                                {
                                    "type": "text",
                                    "text": "{{payment_method}}",
                                    "size": "xs",
                                    "color": "#aaaaaa",
                                    "align": "end"
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "交易時間",
                                    "size": "xs",
                                    "color": "#aaaaaa",
                                    "flex": 0
                                },
                                {
                                    "type": "text",
                                    "text": "{{transaction_time}}",
                                    "size": "xs",
                                    "color": "#aaaaaa",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "styles": {
            "footer": {
                "separator": true
            }
        }
    }',
    '[
        {"name": "company_name", "type": "text", "required": true, "description": "公司名稱"},
        {"name": "company_address", "type": "text", "required": false, "description": "公司地址"},
        {"name": "item_name", "type": "text", "required": true, "description": "商品名稱"},
        {"name": "item_price", "type": "number", "required": true, "description": "商品價格"},
        {"name": "total_amount", "type": "number", "required": true, "description": "總金額"},
        {"name": "payment_method", "type": "text", "required": true, "description": "付款方式"},
        {"name": "transaction_time", "type": "datetime", "required": true, "description": "交易時間"}
    ]',
    '電商',
    '["收據", "發票", "交易", "確認"]'
),
(
    'flex_restaurant_menu',
    '餐廳菜單',
    '餐廳菜單展示，包含菜品圖片和價格',
    'bubble',
    '{
        "type": "bubble",
        "hero": {
            "type": "image",
            "url": "{{restaurant_image}}",
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": "{{restaurant_name}}",
                    "weight": "bold",
                    "size": "xl"
                },
                {
                    "type": "box",
                    "layout": "baseline",
                    "margin": "md",
                    "contents": [
                        {
                            "type": "icon",
                            "size": "sm",
                            "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                        },
                        {
                            "type": "text",
                            "text": "{{rating}}",
                            "size": "sm",
                            "color": "#999999",
                            "margin": "md",
                            "flex": 0
                        },
                        {
                            "type": "text",
                            "text": "({{review_count}})",
                            "size": "sm",
                            "color": "#999999",
                            "margin": "md",
                            "flex": 0
                        }
                    ]
                },
                {
                    "type": "text",
                    "text": "{{dish_name}}",
                    "weight": "bold",
                    "size": "lg",
                    "margin": "xl"
                },
                {
                    "type": "text",
                    "text": "{{dish_description}}",
                    "size": "sm",
                    "color": "#666666",
                    "wrap": true
                },
                {
                    "type": "box",
                    "layout": "baseline",
                    "margin": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": "NT${{price}}",
                            "size": "xl",
                            "color": "#ff5551",
                            "weight": "bold",
                            "flex": 0
                        }
                    ]
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "立即訂餐",
                        "uri": "{{order_url}}"
                    }
                }
            ]
        }
    }',
    '[
        {"name": "restaurant_image", "type": "url", "required": true, "description": "餐廳圖片"},
        {"name": "restaurant_name", "type": "text", "required": true, "description": "餐廳名稱"},
        {"name": "rating", "type": "number", "required": false, "description": "評分"},
        {"name": "review_count", "type": "number", "required": false, "description": "評論數"},
        {"name": "dish_name", "type": "text", "required": true, "description": "菜品名稱"},
        {"name": "dish_description", "type": "text", "required": false, "description": "菜品描述"},
        {"name": "price", "type": "number", "required": true, "description": "價格"},
        {"name": "order_url", "type": "url", "required": true, "description": "訂餐連結"}
    ]',
    '餐飲',
    '["餐廳", "菜單", "美食", "訂餐"]'
);