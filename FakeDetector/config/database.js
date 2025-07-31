// database.js - SQL Sunucu Konfigürasyonu

// SQL Sunucu Ayarları
export const DATABASE_CONFIG = {
  // Production sunucu (Render.com)
  PRODUCTION: {
    baseUrl: 'https://fakedetector-server-api.onrender.com/api',
    apiKey: 'fakedetector-secret-key-2025',
    timeout: 30000, // 30 saniye
  },
  
  // Development sunucu (Render.com)
  DEVELOPMENT: {
    baseUrl: 'https://fakedetector-server-api.onrender.com/api',
    apiKey: 'fakedetector-secret-key-2025',
    timeout: 30000,
  },
  
  // Local sunucu (geliştirme için)
  LOCAL: {
    baseUrl: 'http://localhost:3000/api',
    apiKey: 'fakedetector-secret-key-2025',
    timeout: 10000,
  }
};

// Aktif ortamı belirle
export const getActiveConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return DATABASE_CONFIG.PRODUCTION;
    case 'development':
      return DATABASE_CONFIG.DEVELOPMENT; // Render sunucusuna yönlendir
    default:
      return DATABASE_CONFIG.LOCAL;
  }
};

// API Endpoint'leri
export const API_ENDPOINTS = {
  // Analiz sonuçları
  ANALYSIS_RESULTS: '/analysis-results',
  FEEDBACK: '/feedback',
  STATISTICS: '/statistics',
  HEALTH: '/health',
  
  // Kullanıcı işlemleri
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  
  // Sistem
  SYSTEM_INFO: '/system/info',
  BACKUP: '/system/backup',
};

// Veritabanı tablo yapısı (referans için)
export const DATABASE_SCHEMA = {
  analysis_results: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    image_hash: 'VARCHAR(64)',
    prediction: 'VARCHAR(10)',
    confidence: 'DECIMAL(5,2)',
    analysis_mode: 'VARCHAR(50)',
    processing_time: 'INTEGER',
    model_used: 'VARCHAR(100)',
    model_author: 'VARCHAR(50)',
    probabilities: 'TEXT',
    raw_score: 'DECIMAL(5,4)',
    timestamp: 'DATETIME',
    device_info: 'TEXT',
    app_version: 'VARCHAR(20)',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  },
  
  user_feedback: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    analysis_id: 'INTEGER',
    feedback: 'VARCHAR(20)',
    timestamp: 'DATETIME',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    foreign_key: 'FOREIGN KEY (analysis_id) REFERENCES analysis_results(id)'
  },
  
  system_logs: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    level: 'VARCHAR(10)',
    message: 'TEXT',
    timestamp: 'DATETIME',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};

// Hata kodları
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Başarı mesajları
export const SUCCESS_MESSAGES = {
  ANALYSIS_SAVED: 'Analiz sonucu başarıyla kaydedildi',
  FEEDBACK_SAVED: 'Geri bildirim başarıyla kaydedildi',
  HISTORY_LOADED: 'Geçmiş başarıyla yüklendi',
  HISTORY_CLEARED: 'Geçmiş başarıyla temizlendi',
  CONNECTION_OK: 'Sunucu bağlantısı başarılı'
};

export default {
  DATABASE_CONFIG,
  getActiveConfig,
  API_ENDPOINTS,
  DATABASE_SCHEMA,
  ERROR_CODES,
  SUCCESS_MESSAGES
}; 