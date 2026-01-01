// Vercel Serverless Function - GET /api/history
// الحصول على البيانات التاريخية

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = parseInt(req.query.limit) || 50;
  const history = (global.airqualityData && global.airqualityData.history) || [];
  const data = history.slice(-limit);
  
  return res.json({
    success: true,
    data: data,
    count: data.length
  });
}

