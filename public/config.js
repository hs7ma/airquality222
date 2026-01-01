// ============================================
// Runtime Configuration
// ============================================

// إعدادات Backend
// إذا نشرت على Vercel، اتركها فارغة (ستستخدم نفس الـ origin)
// إذا استخدمت Render/Railway، ضع رابط Backend هنا
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {
  apiBase: "",   // مثال: "https://your-backend.render.com" أو اترك فارغ لـ Vercel
  wsBase: ""     // WebSocket غير مدعوم على Vercel - سيستخدم Polling تلقائياً
};

