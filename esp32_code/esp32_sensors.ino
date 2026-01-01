#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

// إعدادات WiFi
const char* ssid = "TP-Link_7159";
const char* password = "87381542";

// عنوان السيرفر
const char* serverURL = "http://192.168.1.111:3000/api/data";

// إعدادات DHT22
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// إعدادات MQ-2
#define MQ2_PIN 34  // Analog pin

// إعدادات BH1750
BH1750 lightMeter;

// متغيرات التوقيت
unsigned long lastTime = 0;
unsigned long timerDelay = 5000;  // إرسال البيانات كل 5 ثواني

void setup() {
  Serial.begin(115200);
  
  // تهيئة DHT22
  dht.begin();
  
  // تهيئة BH1750
  Wire.begin();
  if (lightMeter.begin()) {
    Serial.println("BH1750 initialized");
  } else {
    Serial.println("Error initializing BH1750");
  }
  
  // تهيئة MQ-2
  pinMode(MQ2_PIN, INPUT);
  
  // الاتصال بـ WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    if (WiFi.status() == WL_CONNECTED) {
      // قراءة البيانات من الحساسات
      float temperature = dht.readTemperature();
      float humidity = dht.readHumidity();
      int gasValue = analogRead(MQ2_PIN);
      float lux = lightMeter.readLightLevel();
      
      // التحقق من صحة قراءة DHT22
      if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor!");
        temperature = 0;
        humidity = 0;
      }
      
      // إرسال البيانات إلى السيرفر
      sendDataToServer(temperature, humidity, gasValue, lux);
      
      // طباعة البيانات في Serial Monitor
      Serial.println("=== Sensor Readings ===");
      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.println(" °C");
      Serial.print("Humidity: ");
      Serial.print(humidity);
      Serial.println(" %");
      Serial.print("Gas (MQ-2): ");
      Serial.println(gasValue);
      Serial.print("Light: ");
      Serial.print(lux);
      Serial.println(" lux");
      Serial.println("======================");
    } else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}

void sendDataToServer(float temp, float hum, int gas, float light) {
  HTTPClient http;
  
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // إنشاء JSON
  String jsonData = "{";
  jsonData += "\"temperature\":" + String(temp) + ",";
  jsonData += "\"humidity\":" + String(hum) + ",";
  jsonData += "\"gas\":" + String(gas) + ",";
  jsonData += "\"light\":" + String(light);
  jsonData += "}";
  
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

