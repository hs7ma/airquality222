// Vercel Serverless Function - GET /api/current
// الحصول على البيانات الحالية

const sharedData = require('./_shared');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.json({
    success: true,
    data: sharedData.current,
    stats: sharedData.stats
  });
};

