// إعدادات API
const API_URL = 'http://localhost:3000/api/data';
const UPDATE_INTERVAL = 5000; // تحديث كل 5 ثواني

// عناصر DOM
const elements = {
    temperature: document.getElementById('temperature'),
    humidity: document.getElementById('humidity'),
    gas: document.getElementById('gas'),
    light: document.getElementById('light'),
    tempStatus: document.getElementById('tempStatus'),
    humStatus: document.getElementById('humStatus'),
    gasStatus: document.getElementById('gasStatus'),
    lightStatus: document.getElementById('lightStatus'),
    lastUpdate: document.getElementById('lastUpdate'),
    connectionStatus: document.getElementById('connectionStatus'),
    connectionText: document.getElementById('connectionText')
};

// دالة لجلب البيانات من السيرفر
async function fetchSensorData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateUI(data);
        updateConnectionStatus(true);
    } catch (error) {
        console.error('Error fetching data:', error);
        updateConnectionStatus(false);
    }
}

// دالة لتحديث واجهة المستخدم
function updateUI(data) {
    // تحديث درجة الحرارة
    if (data.temperature !== undefined) {
        elements.temperature.textContent = data.temperature.toFixed(1);
        updateStatus(elements.tempStatus, data.temperature, 15, 30, 'درجة الحرارة');
    }

    // تحديث الرطوبة
    if (data.humidity !== undefined) {
        elements.humidity.textContent = data.humidity.toFixed(1);
        updateStatus(elements.humStatus, data.humidity, 30, 70, 'الرطوبة');
    }

    // تحديث الغاز
    if (data.gas !== undefined) {
        elements.gas.textContent = data.gas;
        updateStatus(elements.gasStatus, data.gas, 0, 500, 'الغاز', true); // القيم العالية خطيرة
    }

    // تحديث الإضاءة
    if (data.light !== undefined) {
        elements.light.textContent = data.light.toFixed(0);
        updateStatus(elements.lightStatus, data.light, 100, 1000, 'الإضاءة');
    }

    // تحديث وقت آخر تحديث
    if (data.timestamp) {
        const date = new Date(data.timestamp);
        elements.lastUpdate.textContent = date.toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// دالة لتحديث حالة الحساس
function updateStatus(element, value, min, max, sensorName, reverse = false) {
    element.textContent = '';
    element.className = 'status';
    
    let status;
    if (reverse) {
        // للغاز: القيم العالية خطيرة
        if (value > max) {
            status = 'danger';
            element.textContent = '⚠️ خطر';
        } else if (value > min) {
            status = 'warning';
            element.textContent = '⚠️ تحذير';
        } else {
            status = 'normal';
            element.textContent = '✓ طبيعي';
        }
    } else {
        // للحساسات الأخرى: القيم المتوسطة جيدة
        if (value < min || value > max) {
            status = 'warning';
            element.textContent = '⚠️ خارج النطاق';
        } else {
            status = 'normal';
            element.textContent = '✓ طبيعي';
        }
    }
    
    element.classList.add(status);
}

// دالة لتحديث حالة الاتصال
function updateConnectionStatus(connected) {
    if (connected) {
        elements.connectionStatus.classList.remove('disconnected');
        elements.connectionStatus.classList.add('connected');
        elements.connectionText.textContent = 'متصل';
    } else {
        elements.connectionStatus.classList.remove('connected');
        elements.connectionStatus.classList.add('disconnected');
        elements.connectionText.textContent = 'غير متصل';
    }
}

// بدء التحديث التلقائي
function startAutoUpdate() {
    fetchSensorData(); // جلب البيانات فوراً
    setInterval(fetchSensorData, UPDATE_INTERVAL);
}

// بدء التطبيق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', startAutoUpdate);

