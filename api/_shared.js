// Shared data storage for Vercel Serverless Functions
// في Serverless، البيانات تُفقد بين invocations - هذا حل مؤقت

// استخدام module-level storage (يُشارك داخل نفس invocation)
let sharedData = {
  current: {
    temperature: 0,
    humidity: 0,
    heatIndex: 0,
    gasLevel: 0,
    lightLevel: 0,
    timestamp: Date.now(),
    status: 'waiting'
  },
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

// للاستخدام في production، استخدم قاعدة بيانات (MongoDB, Supabase, etc.)
module.exports = sharedData;

