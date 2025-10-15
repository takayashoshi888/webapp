// 配置文件 - 加载环境变量
require('dotenv').config();

module.exports = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://xhqvbirifrdlmlnrwayp.supabase.co',
    key: process.env.SUPABASE_KEY
  }
};