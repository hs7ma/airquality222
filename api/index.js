// Vercel Serverless Function - API Routes
// عرض البيانات فقط - بدون تخزين دائم

// ⚠️ ملاحظة: في Vercel Serverless، البيانات في الذاكرة مؤقتة فقط
// هذه البيانات ستُفقد عند إعادة تشغيل Function

// استخدام global object للمشاركة بين invocations (في نفس container)
if (!global.lastReading) {
  global.lastReading = {
    temperature: 0,
    humidity: 0,
    heatIndex: 0,
    gasLevel: 0,
    lightLevel: 0,
    timestamp: Date.now(),
    status: 'waiting'
  };
}

module.exports = function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // استخراج المسار من query string
  const path = req.query.path || req.url.split('?')[0].replace('/api/', '');

  // POST /api/data - استقبال البيانات من ESP32 (عرض فقط)
  if (req.method === 'POST' && (path.includes('/api/data') || path === 'data')) {
    try {
      const { temperature, humidity, heatIndex, gasLevel, lightLevel } = req.body;
      
      if (temperature === undefined || humidity === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // حفظ آخر قراءة (مؤقت فقط - في الذاكرة)
      global.lastReading = {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        heatIndex: parseFloat(heatIndex) || parseFloat(temperature),
        gasLevel: parseFloat(gasLevel) || 0,
        lightLevel: parseFloat(lightLevel) || 0,
        timestamp: Date.now(),
        status: 'active'
      };
      
      // إرجاع البيانات مباشرة (عرض فقط)
      return res.json({
        success: true,
        message: 'Data received',
        data: global.lastReading
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/current - عرض آخر قراءة
  if (req.method === 'GET' && (path.includes('/api/current') || path === 'current')) {
    return res.json({
      success: true,
      data: global.lastReading || {
        temperature: 0,
        humidity: 0,
        heatIndex: 0,
        gasLevel: 0,
        lightLevel: 0,
        timestamp: Date.now(),
        status: 'waiting'
      },
      stats: {
        totalReadings: (global.lastReading && global.lastReading.status === 'active') ? 1 : 0
      }
    });
  }

  // GET /api/history - بدون بيانات (عرض فقط)
  if (req.method === 'GET' && path.includes('/api/history')) {
    return res.json({
      success: true,
      data: [],
      count: 0
    });
  }

  // GET /api/stats - بدون إحصائيات (عرض فقط)
  if (req.method === 'GET' && path.includes('/api/stats')) {
    return res.json({
      success: true,
      stats: {
        totalReadings: 0
      }
    });
  }

  return res.status(404).json({ error: 'Not found' });
};
