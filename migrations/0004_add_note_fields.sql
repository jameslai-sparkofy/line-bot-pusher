-- 增加備註欄位
-- 建立時間: 2025-08-23

-- 為用戶表增加備註欄位
ALTER TABLE users ADD COLUMN note_name TEXT;
ALTER TABLE users ADD COLUMN department TEXT;

-- 為群組表增加備註欄位
ALTER TABLE groups ADD COLUMN note_name TEXT;