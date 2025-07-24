import sightengineConfig from '../config/sightengine.js';

class SightengineService {
  constructor() {
    this.config = sightengineConfig;
    this.isConfigured = this.config.isConfigured;
    
    if (!this.isConfigured) {
      console.warn('⚠️ Sightengine API yapılandırılmamış');
      console.warn('📝 Konfigürasyon errors:', this.config.configErrors);
    } else {
      console.log('✅ Sightengine API yapılandırıldı');
    }
  }

  // API ile sağlık kontrolü
  async checkHealth() {
    try {
      if (!this.isConfigured) {
        return { healthy: false, error: 'API yapılandırılmamış' };
      }

      // Test image ile API'yi kontrol et
      const testUrl = 'https://sightengine.com/assets/img/examples/example-prop-c1.jpg';
      const response = await this.analyzeImageByUrl(testUrl);
      
      return { 
        healthy: true, 
        status: 'ready',
        operations: response.request?.operations || 0
      };
    } catch (error) {
      console.error('❌ Sightengine health check failed:', error);
      return { 
        healthy: false, 
        error: error.message 
      };
    }
  }

  // Image URL ile analiz
  async analyzeImageByUrl(imageUrl) {
    try {
      if (!this.isConfigured) {
        throw new Error('Sightengine API yapılandırılmamış');
      }

      console.log('🔍 Sightengine API - URL ile analiz başlıyor...');

      const params = new URLSearchParams({
        url: imageUrl,
        models: this.config.MODELS.AI_DETECTION,
        api_user: this.config.API_USER,
        api_secret: this.config.API_SECRET
      });

      const response = await fetch(
        `${this.config.BASE_URL}${this.config.CHECK_ENDPOINT}?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Sightengine API response:', result);

      return result;
    } catch (error) {
      console.error('❌ Sightengine URL analysis error:', error);
      throw error;
    }
  }

  // File System kullanarak base64'ü dosyaya yazıp gönder (Ana method - Sightengine docs'a uygun)
  async analyzeImageByBase64(base64Image) {
    try {
      if (!this.isConfigured) {
        throw new Error('Sightengine API yapılandırılmamış');
      }

      console.log('🔍 Sightengine API - FileSystem ile analiz başlıyor...');

      // Expo FileSystem'i import et
      const FileSystem = require('expo-file-system');
      
      // Base64'ü temizle (data:image/jpeg;base64, prefix'ini kaldır)
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Geçici dosya yolu
      const fileName = `temp_image_${Date.now()}.jpg`;
      const tempUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Base64'ü dosyaya yaz
      await FileSystem.writeAsStringAsync(tempUri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('📁 Temp file created:', tempUri);

      // FormData oluştur - Sightengine docs'a uygun format
      const formData = new FormData();
      
      // Media file'ı ekle - React Native format
      formData.append('media', {
        uri: tempUri,
        type: 'image/jpeg',
        name: fileName
      });
      
      // API parameters - dokümantasyondaki gibi
      formData.append('models', this.config.MODELS.AI_DETECTION);
      formData.append('api_user', this.config.API_USER);
      formData.append('api_secret', this.config.API_SECRET);

      console.log('📤 Sightengine API request parameters:', {
        endpoint: `${this.config.BASE_URL}${this.config.CHECK_ENDPOINT}`,
        model: this.config.MODELS.AI_DETECTION,
        api_user: this.config.API_USER
      });

      // API'ye gönder - Sightengine'e uygun headers
      const response = await fetch(
        `${this.config.BASE_URL}${this.config.CHECK_ENDPOINT}`,
        {
          method: 'POST',
          body: formData,
          // Headers - multipart/form-data otomatik set edilir, manuel ekleme
        }
      );

      // Geçici dosyayı sil
      await FileSystem.deleteAsync(tempUri, { idempotent: true });
      console.log('🗑️ Temp file deleted');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Sightengine API Error Response:', errorText);
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Sightengine API response:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('❌ Sightengine Base64 analysis error:', error);
      throw error;
    }
  }

  // Alternatif method - Direct data URI (backup)
  async analyzeImageByBase64Direct(base64Image) {
    try {
      if (!this.isConfigured) {
        throw new Error('Sightengine API yapılandırılmamış');
      }

      console.log('🔍 Sightengine API - Direct Base64 ile analiz başlıyor...');

      // FormData oluştur
      const formData = new FormData();
      
      // Base64'ü temizle
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Direct data URI format dene
      formData.append('media', {
        uri: `data:image/jpeg;base64,${cleanBase64}`,
        type: 'image/jpeg',
        name: 'image.jpg'
      });
      
      formData.append('models', this.config.MODELS.AI_DETECTION);
      formData.append('api_user', this.config.API_USER);
      formData.append('api_secret', this.config.API_SECRET);

      const response = await fetch(
        `${this.config.BASE_URL}${this.config.CHECK_ENDPOINT}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Sightengine API response (direct):', result);

      return result;
    } catch (error) {
      console.error('❌ Sightengine Base64 direct analysis error:', error);
      throw error;
    }
  }

  // Sightengine response'unu uygulama formatına çevir - Docs'a uygun parsing
  formatResponse(sightengineResponse, processingTime = 0) {
    try {
      console.log('🔄 Formatting Sightengine response:', JSON.stringify(sightengineResponse, null, 2));
      
      if (!sightengineResponse || sightengineResponse.status !== 'success') {
        throw new Error(`Geçersiz API response - Status: ${sightengineResponse?.status || 'undefined'}`);
      }

      // DETAYLI DEBUG - Response structure'ını incele
      console.log('🔍 Response structure debug:');
      console.log('  - status:', sightengineResponse.status);
      console.log('  - type object:', sightengineResponse.type);
      console.log('  - type keys:', Object.keys(sightengineResponse.type || {}));
      console.log('  - full response keys:', Object.keys(sightengineResponse));

      // AI generation score al - Sightengine docs'a göre type.ai_generated
      const aiScore = sightengineResponse.type?.ai_generated;
      
      console.log('🎯 AI Score extraction:');
      console.log('  - sightengineResponse.type:', sightengineResponse.type);
      console.log('  - aiScore:', aiScore);
      console.log('  - aiScore type:', typeof aiScore);
      
      if (aiScore === undefined || aiScore === null) {
        console.error('❌ AI generation score bulunamadı!');
        console.error('❌ Available type fields:', Object.keys(sightengineResponse.type || {}));
        
        // Alternatif field'ları kontrol et
        const alternativeFields = ['ai_generated', 'genai', 'artificial', 'generated'];
        for (const field of alternativeFields) {
          if (sightengineResponse.type && sightengineResponse.type[field] !== undefined) {
            console.log(`✨ Alternative field found: ${field} = ${sightengineResponse.type[field]}`);
          }
        }
        
        throw new Error('AI generation score bulunamadı - response.type.ai_generated eksik');
      }
      
      console.log('📊 AI Score from Sightengine:', aiScore);
      console.log('📊 AI Score as percentage:', (aiScore * 100).toFixed(2) + '%');

      // Threshold debug
      console.log('🎚️ Threshold comparison:');
      console.log('  - AI Score:', aiScore);
      console.log('  - Threshold:', this.config.THRESHOLDS.AI_GENERATED_THRESHOLD);
      console.log('  - aiScore >= threshold:', aiScore >= this.config.THRESHOLDS.AI_GENERATED_THRESHOLD);

      // Threshold'a göre karar ver
      const isAIGenerated = aiScore >= this.config.THRESHOLDS.AI_GENERATED_THRESHOLD;
      const confidence = Math.round(aiScore * 100); // Yüzde olarak
      
      console.log('🏷️ Classification result:');
      console.log('  - isAIGenerated:', isAIGenerated);
      console.log('  - confidence:', confidence + '%');
      console.log('  - prediction:', isAIGenerated ? 'Sahte (AI-Generated)' : 'Gerçek (Real)');
      
      // Confidence level belirle
      let confidenceLevel = 'medium';
      if (aiScore >= this.config.THRESHOLDS.HIGH_CONFIDENCE) {
        confidenceLevel = 'high';
      } else if (aiScore <= this.config.THRESHOLDS.LOW_CONFIDENCE) {
        confidenceLevel = 'low';
      }

      const formattedResult = {
        success: true,
        prediction: isAIGenerated ? 'Sahte' : 'Gerçek',
        prediction_en: isAIGenerated ? 'AI-Generated' : 'Real',
        confidence: confidence,
        raw_score: aiScore,
        processing_time: processingTime,
        model_used: 'Sightengine AI Detection',
        model_info: {
          name: 'Sightengine AI Image Detection',
          type: 'Commercial API',
          provider: 'Sightengine',
          note: 'Professional AI vs Real image detection'
        },
        probabilities: {
          real: Math.round((1 - aiScore) * 100),
          fake: Math.round(aiScore * 100)
        },
        confidence_level: confidenceLevel,
        threshold_used: this.config.THRESHOLDS.AI_GENERATED_THRESHOLD,
        timestamp: Date.now(),
        sightengine_response: sightengineResponse, // Debug için
        request_info: {
          operations: sightengineResponse.request?.operations || 1,
          request_id: sightengineResponse.request?.id,
          timestamp: sightengineResponse.request?.timestamp
        },
        // DEBUG INFO - Geçici olarak ekleniyor
        debug_info: {
          original_ai_score: aiScore,
          original_ai_score_percentage: (aiScore * 100).toFixed(2) + '%',
          threshold_used: this.config.THRESHOLDS.AI_GENERATED_THRESHOLD,
          classification_logic: `${aiScore} >= ${this.config.THRESHOLDS.AI_GENERATED_THRESHOLD} = ${isAIGenerated}`,
          site_comparison: {
            expected_ai_score: 0.85, // Site örneği
            expected_prediction: 'AI-Generated',
            actual_ai_score: aiScore,
            actual_prediction: isAIGenerated ? 'AI-Generated' : 'Real'
          }
        }
      };

      console.log('✅ Formatted result:', JSON.stringify(formattedResult, null, 2));
      return formattedResult;
    } catch (error) {
      console.error('❌ Response formatting error:', error);
      console.error('❌ Original response:', sightengineResponse);
      throw new Error(`Response formatlanamadı: ${error.message}`);
    }
  }

  // Genel analiz fonksiyonu - retry logic ile (FileSystem öncelikli)
  async analyzeImage(base64Image) {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Sightengine analiz başlıyor - Method 1 (FileSystem - Recommended)');
      
      // Önce FileSystem method'unu dene (Sightengine docs'a en uygun)
      const sightengineResponse = await this.analyzeImageByBase64(base64Image);
      const processingTime = Date.now() - startTime;
      
      return this.formatResponse(sightengineResponse, processingTime);
    } catch (error) {
      console.warn('⚠️ Method 1 başarısız, Method 2 deneniyor (Direct Base64):', error.message);
      
      try {
        // Direct base64 method'unu dene
        const sightengineResponse = await this.analyzeImageByBase64Direct(base64Image);
        const processingTime = Date.now() - startTime;
        
        return this.formatResponse(sightengineResponse, processingTime);
      } catch (alternativeError) {
        console.error('❌ Her iki method da başarısız');
        console.error('❌ Method 1 error:', error.message);
        console.error('❌ Method 2 error:', alternativeError.message);
        throw new Error(`Sightengine analiz başarısız: ${error.message}`);
      }
    }
  }

  // API kullanım bilgileri
  getUsageInfo() {
    return {
      provider: 'Sightengine',
      model: 'AI Image Detection',
      endpoint: `${this.config.BASE_URL}${this.config.CHECK_ENDPOINT}`,
      configured: this.isConfigured,
      pricing: 'Pay per operation',
      documentation: 'https://sightengine.com/docs/ai-generated-image-detection',
      features: [
        'AI-generated image detection',
        'Real-time processing',
        'High accuracy (95%+)',
        'Supports GPT-4o, DALL-E, MidJourney, Stable Diffusion, etc.'
      ]
    };
  }

  // Configuration güncelle
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.isConfigured = this.config.API_USER !== 'YOUR_API_USER_HERE' && 
                       this.config.API_SECRET !== 'YOUR_API_SECRET_HERE';
    
    console.log('🔄 Sightengine config updated:', this.isConfigured ? 'Ready' : 'Not configured');
    return this.isConfigured;
  }
}

export default new SightengineService(); 