-- 添加部屋タイプ字段到考勤记录表
-- 如果字段不存在则添加

-- 添加room_type字段
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS room_type TEXT NOT NULL DEFAULT '';

-- 如果需要修改现有记录的默认值，可以执行以下操作：
-- UPDATE attendance_records 
-- SET room_type = 'A' 
-- WHERE room_type = '';

-- 创建索引以提高查询性能（如果尚未创建）
CREATE INDEX IF NOT EXISTS idx_attendance_records_room_type 
ON attendance_records(room_type);

-- 验证字段是否已添加
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'attendance_records' 
-- AND column_name = 'room_type';