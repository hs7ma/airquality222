// Vercel Serverless Function - GET /api/current
// الحصول على البيانات الحالية

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = global.airqualityData || {
    current: {
      temperature: 0,
      humidity: 0,
      heatIndex: 0,
      gasLevel: 0,
      lightLevel: 0,
      timestamp: Date.now(),
      status: 'waiting'
    },
    stats: {
      totalReadings: 0
    }
  };

  return res.json({
    success: true,
    data: data.current || data.current,
    stats: data.stats || {}
  });
}

