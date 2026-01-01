// Vercel Serverless Function - POST /api/data
// استقبال البيانات من ESP32

// ⚠️ ملاحظة مهمة: في Vercel Serverless Functions، كل invocation منفصل
// البيانات في الذاكرة قد تُفقد. للحل الدائم، استخدم قاعدة بيانات.

// استخدام ملف مشترك للبيانات
const sharedData = require('./_shared');

module.exports = function handler(req, res) {
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
      
      sharedData.current = data;
      sharedData.history.push({
        ...data,
        id: sharedData.history.length + 1
      });
      
      if (sharedData.history.length > 100) {
        sharedData.history.shift();
      }
      
      // تحديث الإحصائيات
      const stats = sharedData.stats;
      if (data.temperature > stats.maxTemp) stats.maxTemp = data.temperature;
      if (data.temperature < stats.minTemp) stats.minTemp = data.temperature;
      if (data.humidity > stats.maxHum) stats.maxHum = data.humidity;
      if (data.humidity < stats.minHum) stats.minHum = data.humidity;
      if (data.gasLevel > stats.maxGas) stats.maxGas = data.gasLevel;
      if (data.gasLevel < stats.minGas) stats.minGas = data.gasLevel;
      if (data.lightLevel > stats.maxLight) stats.maxLight = data.lightLevel;
      if (data.lightLevel < stats.minLight) stats.minLight = data.lightLevel;
      stats.totalReadings++;
      
      if (sharedData.history.length > 0) {
        stats.avgTemp = sharedData.history.reduce((sum, item) => sum + item.temperature, 0) / sharedData.history.length;
        stats.avgHum = sharedData.history.reduce((sum, item) => sum + item.humidity, 0) / sharedData.history.length;
        
        const gasReadings = sharedData.history.filter(item => item.gasLevel > 0);
        if (gasReadings.length > 0) {
          stats.avgGas = gasReadings.reduce((sum, item) => sum + item.gasLevel, 0) / gasReadings.length;
        }
        
        const lightReadings = sharedData.history.filter(item => item.lightLevel > 0);
        if (lightReadings.length > 0) {
          stats.avgLight = lightReadings.reduce((sum, item) => sum + item.lightLevel, 0) / lightReadings.length;
        }
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

