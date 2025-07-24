// Sightengine API Configuration
// Sightengine dashboard'dan API key'lerinizi buraya girin
// https://dashboard.sightengine.com/

const SIGHTENGINE_CONFIG = {
  // API Credentials - Production keys (embedded)
  API_USER: '1111382970',              // API User ID
  API_SECRET: 'R9EaX9EnihtinYspKhfmT7cCT6Rb8tWM',  // API Secret Key
  
  // API Endpoints
  BASE_URL: 'https://api.sightengine.com/1.0',
  CHECK_ENDPOINT: '/check.json',
  
  // Model Configuration
  MODELS: {
    AI_DETECTION: 'genai',  // AI-generated image detection model
  },
  
  // Request Configuration
  REQUEST_CONFIG: {
    timeout: 30000,  // 30 saniye timeout
    retries: 2,      // Hata durumunda retry sayısı
  },
  
  // Response Thresholds
  THRESHOLDS: {
    AI_GENERATED_THRESHOLD: 0.5,  // 0.5'ten yüksek = AI generated
    HIGH_CONFIDENCE: 0.8,         // Yüksek güven seviyesi
    LOW_CONFIDENCE: 0.3,          // Düşük güven seviyesi
  }
};

// Export configuration (API keys embedded - ready to use)
export default {
  ...SIGHTENGINE_CONFIG,
  isConfigured: true,
  configErrors: []
}; 