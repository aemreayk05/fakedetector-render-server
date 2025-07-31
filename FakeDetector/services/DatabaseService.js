// DatabaseService.js - SQL Sunucu Entegrasyonu
import { getActiveConfig, API_ENDPOINTS } from '../config/database.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DatabaseService {
  constructor() {
    // Konfigürasyondan ayarları al
    const config = getActiveConfig();
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout;
    
    // Kullanıcı kimliği oluştur veya mevcut olanı al
    this.userId = this.generateUserId();
    
    console.log('🗄️ DatabaseService başlatılıyor...', this.baseUrl);
    console.log('👤 Kullanıcı kimliği:', this.userId);
  }

  // Benzersiz kullanıcı kimliği oluştur
  generateUserId() {
    // AsyncStorage'dan mevcut kullanıcı kimliğini al
    const getStoredUserId = async () => {
      try {
        const stored = await AsyncStorage.getItem('userId');
        if (stored) return stored;
        
        // Yeni kullanıcı kimliği oluştur
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('userId', userId);
        return userId;
      } catch (error) {
        console.error('❌ Kullanıcı kimliği oluşturma hatası:', error);
        // Fallback: timestamp + random
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
    };
    
    // Senkron olarak çalıştır (constructor'da async kullanamayız)
    let userId = null;
    getStoredUserId().then(id => {
      this.userId = id;
    }).catch(() => {
      this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    });
    
    // Geçici olarak timestamp kullan
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ===== ANALİZ SONUCU KAYDETME =====
  async saveAnalysisResult(analysisData) {
    try {
      console.log('💾 Analiz sonucu kaydediliyor...');
      
      const payload = {
        image_hash: analysisData.imageHash || this.generateImageHash(analysisData.imageUri),
        image_data: analysisData.imageUri, // Görsel URI'sini sakla
        prediction: analysisData.prediction,
        confidence: analysisData.confidence,
        analysis_mode: analysisData.analysisMode,
        processing_time: analysisData.totalProcessingTime,
        model_used: analysisData.model_used,
        model_author: analysisData.model_author,
        probabilities: JSON.stringify(analysisData.probabilities),
        raw_score: analysisData.raw_score,
        timestamp: new Date().toISOString(),
        device_info: await this.getDeviceInfo(),
        app_version: '2.0.0',
        user_id: this.userId // Kullanıcı kimliği ekle
      };

      console.log('📸 Payload image_data:', payload.image_data);
      console.log('📸 AnalysisData imageUri:', analysisData.imageUri);
      console.log('👤 User ID:', this.userId);
      console.log('📦 Full payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ANALYSIS_RESULTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-ID': this.userId // Kullanıcı kimliği header'ı ekle
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Analiz sonucu kaydedildi:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Analiz sonucu kaydetme hatası:', error);
      throw error;
    }
  }

  // ===== ANALİZ GEÇMİŞİ GETİRME =====
  async getAnalysisHistory(limit = 50, offset = 0) {
    try {
      console.log('📚 Analiz geçmişi getiriliyor...');
      console.log('🔑 API Key:', this.apiKey);
      console.log('🌐 Base URL:', this.baseUrl);
      
      const url = `${this.baseUrl}${API_ENDPOINTS.ANALYSIS_RESULTS}?limit=${limit}&offset=${offset}`;
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-ID': this.userId // Kullanıcı kimliği ekle
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.results.length} analiz sonucu getirildi`);
      
      // Debug: İlk sonucun image_data'sını kontrol et
      if (data.results.length > 0) {
        console.log('🔍 İlk sonuç image_data:', data.results[0].image_data);
        console.log('🔍 İlk sonuç image_hash:', data.results[0].image_hash);
      }
      
      return data.results;
    } catch (error) {
      console.error('❌ Analiz geçmişi getirme hatası:', error);
      throw error;
    }
  }

  // ===== KULLANICI GERİ BİLDİRİMİ KAYDETME =====
  async saveUserFeedback(analysisId, feedback) {
    try {
      console.log('👍 Kullanıcı geri bildirimi kaydediliyor...');
      
      const payload = {
        analysis_id: analysisId,
        feedback: feedback, // 'correct', 'incorrect', 'unsure'
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.FEEDBACK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-ID': this.userId // Kullanıcı kimliği ekle
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Geri bildirim kaydedildi');
      
      return result;
    } catch (error) {
      console.error('❌ Geri bildirim kaydetme hatası:', error);
      throw error;
    }
  }

  // ===== İSTATİSTİKLER GETİRME =====
  async getStatistics() {
    try {
      console.log('📊 İstatistikler getiriliyor...');
      
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.STATISTICS}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-ID': this.userId // Kullanıcı kimliği ekle
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ İstatistikler getirildi');
      
      return data;
    } catch (error) {
      console.error('❌ İstatistik getirme hatası:', error);
      throw error;
    }
  }

  // ===== GEÇMİŞİ TEMİZLEME =====
  async clearHistory() {
    try {
      console.log('🗑️ Geçmiş temizleniyor...');
      
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ANALYSIS_RESULTS}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-ID': this.userId // Kullanıcı kimliği ekle
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Geçmiş temizlendi');
      return true;
    } catch (error) {
      console.error('❌ Geçmiş temizleme hatası:', error);
      throw error;
    }
  }

  // ===== YARDIMCI FONKSİYONLAR =====
  
  // Görsel hash'i oluştur
  generateImageHash(imageUri) {
    // Basit hash oluşturma - gerçek uygulamada daha güvenli bir yöntem kullanın
    return btoa(imageUri).substring(0, 16);
  }

  // Cihaz bilgilerini al
  async getDeviceInfo() {
    try {
      const { Platform } = require('react-native');
      const { Constants } = require('expo-constants');
      
      return {
        platform: Platform.OS,
        version: Platform.Version,
        device_name: Constants.deviceName,
        app_version: Constants.expoConfig?.version || '2.0.0'
      };
    } catch (error) {
      return {
        platform: 'unknown',
        version: 'unknown',
        device_name: 'unknown',
        app_version: '2.0.0'
      };
    }
  }

  // Bağlantı durumunu kontrol et
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      return {
        status: response.ok ? 'connected' : 'error',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
const databaseServiceInstance = new DatabaseService();
export default databaseServiceInstance; 