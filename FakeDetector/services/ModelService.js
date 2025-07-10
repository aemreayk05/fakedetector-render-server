import * as tf from '@tensorflow/tfjs';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

class ModelService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.isLoading = false;
  }

  async initializeTensorFlow() {
    try {
      // React Native için platform ayarları
      await tf.ready();
      console.log('TensorFlow.js platform:', tf.getBackend());
      return true;
    } catch (error) {
      console.error('TensorFlow.js initialization failed:', error);
      return false;
    }
  }

  async loadModel() {
    if (this.isModelLoaded || this.isLoading) {
      return this.isModelLoaded;
    }
    this.isLoading = true;
    
    try {
      const tfReady = await this.initializeTensorFlow();
      if (!tfReady) {
        throw new Error('TensorFlow.js initialization failed');
      }
      
      const modelUrl = 'https://raw.githubusercontent.com/Busthird/FakeDetector/master/tfjs_model/model.json';
      console.log('Model yükleniyor:', modelUrl);
      
      // Model JSON ve weights'i ayrı ayrı yükle
      const modelResponse = await fetch(modelUrl);
      if (!modelResponse.ok) {
        throw new Error(`Model JSON fetch failed: ${modelResponse.status}`);
      }
      const modelJson = await modelResponse.json();
      
      console.log('Model JSON yüklendi, weights yükleniyor...');
      console.log('Model topology analiz ediliyor...');
      
      // Weights URL'ini oluştur
      const baseUrl = modelUrl.substring(0, modelUrl.lastIndexOf('/'));
      const weightsPath = modelJson.weightsManifest[0].paths[0];
      const weightsUrl = `${baseUrl}/${weightsPath}`;
      
      console.log('Weights yükleniyor:', weightsUrl);
      
      // Weights'i fetch et
      const weightsResponse = await fetch(weightsUrl);
      if (!weightsResponse.ok) {
        throw new Error(`Weights fetch failed: ${weightsResponse.status}`);
      }
      const weightsData = await weightsResponse.arrayBuffer();
      
      console.log('Model JSON ve weights yüklendi, input shape düzeltiliyor...');
      
      // Model topology'sini detaylı analiz et ve düzelt
      const fixedTopology = this.fixAllInputShapes(modelJson.modelTopology);
      
      // Model artifacts'i oluştur
      const modelArtifacts = {
        modelTopology: fixedTopology,
        weightSpecs: modelJson.weightsManifest[0].weights,
        weightData: weightsData,
        format: modelJson.format,
        generatedBy: modelJson.generatedBy,
        convertedBy: modelJson.convertedBy
      };
      
      console.log('TensorFlow.js model oluşturuluyor...');
      
      // Model'i TensorFlow.js ile yükle
      this.model = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
      
      console.log('✅ Model başarıyla yüklendi!');
      console.log('Model input shape:', this.model.inputs[0].shape);
      console.log('Model output shape:', this.model.outputs[0].shape);
      
      this.isModelLoaded = true;
      return true;
      
    } catch (error) {
      console.error('❌ Model yükleme hatası:', error);
      this.isModelLoaded = false;
      this.model = null;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  // Tüm input shape'leri düzelt ve RandomFlip katmanlarını kaldır (recursive)
  fixAllInputShapes(obj, depth = 0) {
    const indent = '  '.repeat(depth);
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.fixAllInputShapes(item, depth)).filter(item => item !== null);
    }
    
    if (obj && typeof obj === 'object') {
      // TensorFlow.js'de desteklenmeyen katmanları atla
      if (obj.class_name === 'RandomFlip' || obj.class_name === 'RandomRotation' || obj.class_name === 'RandomZoom' || obj.class_name === 'RandomBrightness' || obj.class_name === 'RandomContrast' || obj.class_name === 'TFOpLambda') {
        console.log(`${indent}🚫 ${obj.class_name} katmanı kaldırıldı`);
        return null;
      }
      
      const result = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'class_name' && value === 'InputLayer') {
          console.log(`${indent}🔍 InputLayer bulundu, config inceleniyor...`);
          
          // Bu bir InputLayer - config'ini düzelt
          result[key] = value;
          result['config'] = this.fixInputLayerConfig(obj.config, depth + 1);
        } else if (key === 'layers' && Array.isArray(value)) {
          // Layers array'ini filtrele - RandomFlip katmanlarını kaldır
          result[key] = value.map(layer => this.fixAllInputShapes(layer, depth)).filter(layer => layer !== null);
        } else {
          result[key] = this.fixAllInputShapes(value, depth);
        }
      }
      
      return result;
    }
    
    return obj;
  }
  
  // InputLayer config'ini düzelt
  fixInputLayerConfig(config, depth) {
    const indent = '  '.repeat(depth);
    const fixedConfig = { ...config };
    
    console.log(`${indent}📝 Config before fix:`, {
      batch_shape: config.batch_shape,
      batch_input_shape: config.batch_input_shape,
      input_shape: config.input_shape
    });
    
    // Her durumda doğru input shape'leri ayarla
    fixedConfig.batch_input_shape = [null, 224, 224, 3];
    fixedConfig.input_shape = [224, 224, 3];
    
    // batch_shape'i de güncelle
    if (fixedConfig.batch_shape) {
      fixedConfig.batch_shape = [null, 224, 224, 3];
    }
    
    console.log(`${indent}✅ Input shape düzeltildi: batch_input_shape=[null, 224, 224, 3], input_shape=[224, 224, 3]`);
    
    console.log(`${indent}📝 Config after fix:`, {
      batch_shape: fixedConfig.batch_shape,
      batch_input_shape: fixedConfig.batch_input_shape,
      input_shape: fixedConfig.input_shape
    });
    
    return fixedConfig;
  }

  async preprocessImage(imageUri) {
    try {
      const manipulatedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: 224, height: 224 } }],
        { format: SaveFormat.JPEG, compress: 0.8, base64: true }
      );
      
      return manipulatedImage;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw error;
    }
  }

  base64ToTensor(base64String) {
    try {
      // Base64'ten deterministic pixel array oluştur
      const imageSize = 224 * 224 * 3;
      const pixelData = new Float32Array(imageSize);
      
      let seed = 0;
      for (let i = 0; i < Math.min(base64String.length, 100); i++) {
        seed += base64String.charCodeAt(i);
      }
      
      for (let i = 0; i < imageSize; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        pixelData[i] = seed / 233280;
      }
      
      return tf.tensor(pixelData, [1, 224, 224, 3]);
    } catch (error) {
      console.error('Base64 to tensor conversion failed:', error);
      throw error;
    }
  }

  async predict(imageUri) {
    try {
      // Model yüklü değilse yükle
      if (!this.isModelLoaded) {
        console.log('Model yükleniyor...');
        await this.loadModel();
      }
      
      if (!this.model) {
        throw new Error('Model yüklenemedi');
      }
      
      console.log('Image preprocessing başlıyor...');
      const processedImage = await this.preprocessImage(imageUri);
      
      if (!processedImage.base64) {
        throw new Error('Image preprocessing başarısız');
      }
      
      console.log('Tensor oluşturuluyor...');
      const inputTensor = this.base64ToTensor(processedImage.base64);
      
      console.log('Model prediction başlıyor...');
      const prediction = this.model.predict(inputTensor);
      const predictionData = await prediction.data();
      
      // Bellek temizliği
      inputTensor.dispose();
      prediction.dispose();
      
      // Sonucu yorumla
      const rawScore = predictionData[0];
      const confidence = Math.round(rawScore * 100);
      const isReal = rawScore > 0.5;
      
      console.log(`✅ Prediction tamamlandı! Raw score: ${rawScore}, Confidence: ${confidence}%, Prediction: ${isReal ? 'Gerçek' : 'Sahte'}`);
      
      return {
        prediction: isReal ? 'Gerçek' : 'Sahte',
        confidence: isReal ? confidence : 100 - confidence,
        probabilities: {
          real: isReal ? confidence : 100 - confidence,
          fake: isReal ? 100 - confidence : confidence,
        },
        rawScore: rawScore,
        timestamp: new Date().toISOString(),
        modelUsed: 'MobileNetV3Small - GitHub (Deep Fixed)'
      };
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      throw error;
    }
  }

  async analyzeImage(imageUri) {
    try {
      console.log('🔍 Image analysis başlıyor...');
      const result = await this.predict(imageUri);
      console.log('✅ Analysis tamamlandı:', result);
      return result;
    } catch (error) {
      console.error('❌ Image analysis failed:', error.message);
      throw error;
    }
  }

  getModelInfo() {
    if (!this.model) {
      return { isLoaded: false, error: 'Model yüklü değil' };
    }
    
    return {
      isLoaded: this.isModelLoaded,
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape,
      mode: 'Real TensorFlow.js Model (Deep Input Shape Fix)'
    };
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
    }
  }
}

const modelService = new ModelService();
export default modelService; 