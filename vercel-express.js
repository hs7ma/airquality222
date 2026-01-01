// Vercel-compatible Express server
// يستخدم كـ serverless function wrapper

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تخزين البيانات (في الذاكرة)
let currentData = {
  temperature: 0,
  humidity: 0,
  heatIndex: 0,
  gasLevel: 0,
  lightLevel: 0,
  timestamp: Date.now(),
  status: 'waiting'
};

let historyData = [];
const MAX_HISTORY = 100;

let stats = {
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
};

function updateStats(data) {
  const { temperature, humidity, gasLevel, lightLevel } = data;
  
  if (temperature > stats.maxTemp) stats.maxTemp = temperature;
  if (temperature < stats.minTemp) stats.minTemp = temperature;
  if (humidity > stats.maxHum) stats.maxHum = humidity;
  if (humidity < stats.minHum) stats.minHum = humidity;
  
  if (gasLevel > stats.maxGas) stats.maxGas = gasLevel;
  if (gasLevel < stats.minGas) stats.minGas = gasLevel;
  if (lightLevel > stats.maxLight) stats.maxLight = lightLevel;
  if (lightLevel < stats.minLight) stats.minLight = lightLevel;
  
  stats.totalReadings++;
  if (historyData.length > 0) {
    stats.avgTemp = historyData.reduce((sum, item) => sum + item.temperature, 0) / historyData.length;
    stats.avgHum = historyData.reduce((sum, item) => sum + item.humidity, 0) / historyData.length;
    
    const gasReadings = historyData.filter(item => item.gasLevel > 0);
    if (gasReadings.length > 0) {
      stats.avgGas = gasReadings.reduce((sum, item) => sum + item.gasLevel, 0) / gasReadings.length;
    }
    
    const lightReadings = historyData.filter(item => item.lightLevel > 0);
    if (lightReadings.length > 0) {
      stats.avgLight = lightReadings.reduce((sum, item) => sum + item.lightLevel, 0) / lightReadings.length;
    }
  }
}

// API Routes
app.post('/api/data', (req, res) => {
  try {
    const { temperature, humidity, heatIndex, gasLevel, lightLevel } = req.body;
    
    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    currentData = {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      heatIndex: parseFloat(heatIndex) || parseFloat(temperature),
      gasLevel: parseFloat(gasLevel) || 0,
      lightLevel: parseFloat(lightLevel) || 0,
      timestamp: Date.now(),
      status: 'active'
    };
    
    historyData.push({
      ...currentData,
      id: historyData.length + 1
    });
    
    if (historyData.length > MAX_HISTORY) {
      historyData.shift();
    }
    
    updateStats(currentData);
    
    res.json({
      success: true,
      message: 'Data received successfully',
      data: currentData
    });
  } catch (error) {
    console.error('خطأ:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/current', (req, res) => {
  res.json({
    success: true,
    data: currentData,
    stats: stats
  });
});

app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const data = historyData.slice(-limit);
  
  res.json({
    success: true,
    data: data,
    count: data.length
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: stats
  });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel serverless function handler
module.exports = app;

