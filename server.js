const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/bing-wallpaper', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
    );
    res.json(response.data);
  } catch (error) {
    console.error('Bing API error:', error);
    res.status(500).json({ error: 'Failed to fetch wallpaper' });
  }
});

// 错误处理中间件
app.get('/api/google-suggestions', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(`http://suggestqueries.google.com/complete/search?output=toolbar&q=${query}`);
    res.set('Content-Type', 'application/xml'); // Google API 返回 XML
    res.send(response.data);
  } catch (error) {
    console.error('Google Suggestions API error:', error);
    res.status(500).json({ error: 'Failed to fetch Google suggestions' });
  }
});

app.get('/api/bing-suggestions', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(`https://api.bing.com/qsonhs.aspx?type=cb&q=${query}`);
    res.json(response.data);
  } catch (error) {
    console.error('Bing Suggestions API error:', error);
    res.status(500).json({ error: 'Failed to fetch Bing suggestions' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
});