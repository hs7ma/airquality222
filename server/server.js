const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// تخزين البيانات
let sensorData = {
  temperature: 0,
  humidity: 0,
  gas: 0,
  light: 0,
  timestamp: new Date()
};

// API endpoint لاستقبال البيانات من ESP32
app.post('/api/data', (req, res) => {
  const { temperature, humidity, gas, light } = req.body;
  
  sensorData = {
    temperature: parseFloat(temperature) || 0,
    humidity: parseFloat(humidity) || 0,
    gas: parseInt(gas) || 0,
    light: parseFloat(light) || 0,
    timestamp: new Date()
  };
  
  console.log('Received data:', sensorData);
  
  res.json({ 
    success: true, 
    message: 'Data received successfully',
    data: sensorData 
  });
});

// API endpoint للحصول على آخر قراءة
app.get('/api/data', (req, res) => {
  res.json(sensorData);
});

// API endpoint للحصول على تاريخ القراءات (للتطوير المستقبلي)
app.get('/api/history', (req, res) => {
  // يمكن إضافة قاعدة بيانات هنا في المستقبل
  res.json([sensorData]);
});

// دالة للحصول على عنوان IP المحلي
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

// تشغيل السيرفر
app.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log('========================================');
  console.log('🌍 Server is running!');
  console.log('========================================');
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`📍 Network: http://${localIP}:${PORT}`);
  console.log('========================================');
  console.log(`💡 Use this IP in ESP32: ${localIP}`);
  console.log('========================================');
  console.log('Waiting for ESP32 data...');
  console.log('');
});

