// Vercel Serverless Function - POST /api/data
// استقبال البيانات من ESP32

// تخزين البيانات (مؤقت - في الذاكرة)
// في الإنتاج، استخدم قاعدة بيانات
let currentData = {
  temperature: 0,
  humidity: 0,
  heatIndex: 0,
  gasLevel: 0,
  lightLevel: 0,
  timestamp: Date.now(),
  status: 'waiting'
};

// هذا سيتم مشاركته بين جميع functions - لكن في Serverless قد لا يعمل
// للحل الدائم، استخدم قاعدة بيانات
global.airqualityData = global.airqualityData || {
  current: currentData,
  history: [],
  stats: {
    maxTemp: -999,
    minTemp: 999,
    maxHum: 0,
    minHum: 100,
    avgTemp: 0,
    avgHum: 0,
    maxGas: 0,
    minGas: 999999,
    avgGas: 0,
    maxLight: 0,
    minLight: 999999,
    avgLight: 0,
    totalReadings: 0
  }
};

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { temperature, humidity, heatIndex, gasLevel, lightLevel } = req.body;
      
      if (temperature === undefined || humidity === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      const data = {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        heatIndex: parseFloat(heatIndex) || parseFloat(temperature),
        gasLevel: parseFloat(gasLevel) || 0,
        lightLevel: parseFloat(lightLevel) || 0,
        timestamp: Date.now(),
        status: 'active'
      };
      
      global.airqualityData.current = data;
      global.airqualityData.history.push({
        ...data,
        id: global.airqualityData.history.length + 1
      });
      
      if (global.airqualityData.history.length > 100) {
        global.airqualityData.history.shift();
      }
      
      // تحديث الإحصائيات
      const stats = global.airqualityData.stats;
      if (data.temperature > stats.maxTemp) stats.maxTemp = data.temperature;
      if (data.temperature < stats.minTemp) stats.minTemp = data.temperature;
      if (data.humidity > stats.maxHum) stats.maxHum = data.humidity;
      if (data.humidity < stats.minHum) stats.minHum = data.humidity;
      if (data.gasLevel > stats.maxGas) stats.maxGas = data.gasLevel;
      if (data.gasLevel < stats.minGas) stats.minGas = data.gasLevel;
      if (data.lightLevel > stats.maxLight) stats.maxLight = data.lightLevel;
      if (data.lightLevel < stats.minLight) stats.minLight = data.lightLevel;
      stats.totalReadings++;
      
      if (global.airqualityData.history.length > 0) {
        stats.avgTemp = global.airqualityData.history.reduce((sum, item) => sum + item.temperature, 0) / global.airqualityData.history.length;
        stats.avgHum = global.airqualityData.history.reduce((sum, item) => sum + item.humidity, 0) / global.airqualityData.history.length;
      }
      
      return res.json({
        success: true,
        message: 'Data received successfully',
        data: data
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

