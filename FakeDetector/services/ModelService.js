import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import SightengineService from './SightengineService.js';

// ========================================
// 🔥 DUAL MODEL SERVICE
// Sightengine API + Haywoodsloan Server
// ========================================

// Analiz modları
const ANALYSIS_MODES = {
  SIGHTENGINE: 'sightengine',
  HAYWOODSLOAN: 'haywoodsloan'
};

class ModelService {
  constructor() {
    console.log('🚀 ModelService başlatılıyor - Dual Model Ready');
    this.sightengineService = SightengineService;
    this.currentMode = ANALYSIS_MODES.SIGHTENGINE; // Varsayılan
    this.haywoodsloanServerUrl = null;
    
    // Render sunucu URL'si (deploy tamamlandıktan sonra güncellenecek)
    this.RENDER_SERVER_URL = "https://fakedetector-haywoodsloan.onrender.com";
  }

  // ===== MAIN ANALYSIS METHOD =====
  async analyzeImage(imageUri) {
    try {
      console.log(`🔍 ${this.currentMode.toUpperCase()} ile görsel analizi başlıyor...`);
      const startTime = Date.now();

      // 1. Görseli işle (resize yok, %100 kalite)
      const base64Image = await this.preprocessImage(imageUri);

      // 2. Seçili mode'a göre analiz yap
      let result;
      if (this.currentMode === ANALYSIS_MODES.SIGHTENGINE) {
        result = await this.analyzeWithSightengine(base64Image);
      } else if (this.currentMode === ANALYSIS_MODES.HAYWOODSLOAN) {
        result = await this.analyzeWithHaywoodsloan(base64Image);
      } else {
        throw new Error('Geçersiz analiz modu');
      }

      // 3. Sonucu formatla
      const totalTime = Date.now() - startTime;
      const formattedResult = {
        ...result,
        analysisMode: this.currentMode,
        totalProcessingTime: totalTime,
        timestamp: Date.now()
      };

      console.log('✅ Analiz tamamlandı:', formattedResult.prediction, `(${formattedResult.confidence}%)`);
      return formattedResult;

    } catch (error) {
      console.error('❌ Analiz hatası:', error);
      throw new Error(`Analiz başarısız: ${error.message}`);
    }
  }

  // ===== SIGHTENGINE ANALYSIS =====
  async analyzeWithSightengine(base64Image) {
    console.log('🔥 Sightengine API analizi başlıyor...');
    const result = await this.sightengineService.analyzeImage(base64Image);
    
    // Doğru confidence değerini hesapla
    let correctConfidence = result.confidence;
    
    // Eğer prediction "Gerçek" ise, gerçek olma oranını al
    if (result.prediction === 'Gerçek' && result.probabilities) {
      correctConfidence = result.probabilities.real;
    }
    // Eğer prediction "Sahte" ise, sahte olma oranını al
    else if (result.prediction === 'Sahte' && result.probabilities) {
      correctConfidence = result.probabilities.fake;
    }
    
    return {
      ...result,
      confidence: correctConfidence
    };
  }

  // ===== HAYWOODSLOAN ANALYSIS =====
  async analyzeWithHaywoodsloan(base64Image) {
    console.log('🤖 Haywoodsloan Server analizi başlıyor...');
    
    // Render sunucu URL'sini kullan (kullanıcı ayarlamadıysa)
    const serverUrl = this.haywoodsloanServerUrl || this.RENDER_SERVER_URL;
    
    if (!serverUrl) {
      throw new Error('Haywoodsloan server URL ayarlanmamış');
    }

    try {
      const response = await fetch(`${serverUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        })
      });

      if (!response.ok) {
        throw new Error(`Server hatası: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server analiz hatası');
      }

      // Doğru confidence değerini hesapla
      let correctConfidence = result.confidence;
      
      // Eğer prediction "Gerçek" ise, gerçek olma oranını al
      if ((result.prediction === 'Gerçek' || result.prediction === 'Gercek') && result.probabilities) {
        correctConfidence = result.probabilities.real;
      }
      // Eğer prediction "Sahte" ise, sahte olma oranını al
      else if (result.prediction === 'Sahte' && result.probabilities) {
        correctConfidence = result.probabilities.fake;
      }

      // Haywoodsloan sonucunu formatla
      return {
        success: true,
        prediction: result.prediction,
        prediction_en: result.prediction_en,
        confidence: correctConfidence,
        raw_score: result.raw_score,
        processing_time: result.processing_time,
        model_used: result.model_used,
        model_author: result.model_author,
        probabilities: result.probabilities,
        model_info: result.model_info
      };

    } catch (error) {
      console.error('❌ Haywoodsloan server hatası:', error);
      throw new Error(`Haywoodsloan analizi başarısız: ${error.message}`);
    }
  }

  // ===== IMAGE PREPROCESSING =====
  async preprocessImage(imageUri) {
    try {
      console.log('📸 Görsel işleniyor - Orijinal kalite korunuyor...');
      
      // Sightengine için: Resize YOK, compress YOK, %100 kalite
      const manipulatedImage = await manipulateAsync(
        imageUri,
        [], // Resize yok - orijinal boyut
        { 
          format: SaveFormat.JPEG, 
          compress: 1.0,  // %100 kalite
          base64: true 
        }
      );

      console.log('✅ Görsel işleme tamamlandı:', {
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        base64Length: manipulatedImage.base64?.length || 0
      });
      
      return manipulatedImage.base64;
    } catch (error) {
      console.error('❌ Görsel işleme hatası:', error);
      throw new Error('Görsel işlenemedi');
    }
  }

  // ===== HEALTH & STATUS =====
  async checkHealth() {
    if (this.currentMode === ANALYSIS_MODES.SIGHTENGINE) {
      return await this.sightengineService.checkHealth();
    } else if (this.currentMode === ANALYSIS_MODES.HAYWOODSLOAN) {
      return await this.checkHaywoodsloanHealth();
    }
    return { status: 'unknown', mode: this.currentMode };
  }

  async checkHaywoodsloanHealth() {
    const serverUrl = this.haywoodsloanServerUrl || this.RENDER_SERVER_URL;
    
    if (!serverUrl) {
      return { status: 'error', error: 'Server URL ayarlanmamış' };
    }

    try {
      const response = await fetch(`${serverUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        return { 
          status: 'healthy', 
          mode: 'haywoodsloan',
          model: data.model_name,
          device: data.device || 'unknown'
        };
      } else {
        return { status: 'error', error: `Server hatası: ${response.status}` };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async getModelInfo() {
    if (this.currentMode === ANALYSIS_MODES.SIGHTENGINE) {
      return {
        ...this.sightengineService.getUsageInfo(),
        mode: 'Sightengine API',
        status: 'ready',
        note: 'Production-ready AI detection'
      };
    } else if (this.currentMode === ANALYSIS_MODES.HAYWOODSLOAN) {
      return {
        mode: 'Haywoodsloan Server',
        status: this.haywoodsloanServerUrl ? 'ready' : 'not_configured',
        model: 'haywoodsloan/ai-image-detector-deploy',
        type: 'SwinV2 (Swin Transformer V2)',
        size: '781 MB',
        note: 'Open-source AI detection model'
      };
    }
  }

  // ===== MODE MANAGEMENT =====
  getCurrentMode() {
    return this.currentMode;
  }

  getModeDescription() {
    if (this.currentMode === ANALYSIS_MODES.SIGHTENGINE) {
      return 'Sightengine Professional API - Yüksek doğruluk, ticari kullanım';
    } else if (this.currentMode === ANALYSIS_MODES.HAYWOODSLOAN) {
      return 'Haywoodsloan SwinV2 Model - Open-source, güçlü AI detection';
    }
    return 'Bilinmeyen mod';
  }

  setAnalysisMode(mode) {
    if (mode === ANALYSIS_MODES.SIGHTENGINE || mode === ANALYSIS_MODES.HAYWOODSLOAN) {
      this.currentMode = mode;
      console.log(`✅ Analiz modu değiştirildi: ${mode}`);
      return true;
    }
    console.log('❌ Geçersiz analiz modu:', mode);
    return false;
  }

  setHaywoodsloanServerUrl(url) {
    this.haywoodsloanServerUrl = url;
    console.log(`✅ Haywoodsloan server URL ayarlandı: ${url}`);
  }
  
  setDemoMode(enabled) { 
    console.log('⚠️ Demo mode devre dışı - sadece Sightengine kullanılıyor'); 
  }
  
  async getServicesStatus() {
    return {
      sightengine: { available: true, status: 'ready' },
      current_mode: 'sightengine'
    };
  }
}

export default new ModelService(); 