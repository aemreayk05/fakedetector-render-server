import * as tf from '@tensorflow/tfjs';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Asset } from 'expo-asset';

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
      
      console.log('Yerel model yükleniyor...');
      
      // Yerel model dosyalarını yükle
      const modelJson = require('../assets/model.json');
      console.log('Model JSON yüklendi');
      
      // Weights dosyasını yükle
      const weightsPath = modelJson.weightsManifest[0].paths[0];
      console.log('Weights yükleniyor:', weightsPath);
      
      // Weights'i asset olarak yükle
      const weightsAsset = Asset.fromModule(require(`../assets/${weightsPath}`));
      await weightsAsset.downloadAsync();
      const weightsResponse = await fetch(weightsAsset.uri);
      if (!weightsResponse.ok) {
        throw new Error(`Weights fetch failed: ${weightsResponse.status}`);
      }
      const weightsData = await weightsResponse.arrayBuffer();
      
      console.log('Model JSON ve weights yüklendi');
      
      // Model artifacts'i oluştur
      const modelArtifacts = {
        modelTopology: modelJson.modelTopology,
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
  
  // Yeni model TensorFlow.js ile uyumlu olduğu için düzeltme gerekmiyor

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

  async base64ToTensor(base64String) {
    try {
      // Base64'ten gerçek image tensor oluştur
      const imageUri = `data:image/jpeg;base64,${base64String}`;
      
      // Image'i yükle ve tensor'a çevir
      const image = await tf.image.decodeImage(base64String, 3);
      
      // Resize to 224x224
      const resized = tf.image.resizeBilinear(image, [224, 224]);
      
      // Normalize to [0, 1]
      const normalized = tf.div(resized, 255.0);
      
      // Add batch dimension
      const batched = tf.expandDims(normalized, 0);
      
      // Cleanup intermediate tensors
      image.dispose();
      resized.dispose();
      normalized.dispose();
      
      console.log('✅ Image tensor oluşturuldu, shape:', batched.shape);
      return batched;
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
      const inputTensor = await this.base64ToTensor(processedImage.base64);
      
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
        modelUsed: 'Yerel Basit Model'
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
      mode: 'Yerel Basit Model'
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