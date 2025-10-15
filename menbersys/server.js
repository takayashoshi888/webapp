const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 所有路由都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});