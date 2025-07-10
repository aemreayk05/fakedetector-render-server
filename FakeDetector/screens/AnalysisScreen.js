import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModelService from '../services/ModelService';

const { width, height } = Dimensions.get('window');

export default function AnalysisScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImageFromGallery = async () => {
    try {
      // İzin kontrolü
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'İzin Gerekli', 
          'Galeriye erişim için izin vermeniz gerekiyor.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Galeri açma - en basit konfigürasyon
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
      });

      if (!result.cancelled && result.uri) {
        // Eski format için
        setSelectedImage({ uri: result.uri });
        setAnalysisResult(null);
      } else if (!result.canceled && result.assets && result.assets.length > 0) {
        // Yeni format için
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Hata', 'Galeri açılırken bir hata oluştu.');
    }
  };

  const takePhoto = async () => {
    try {
      // İzin kontrolü
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'İzin Gerekli', 
          'Kameraya erişim için izin vermeniz gerekiyor.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Kamera açma - en basit konfigürasyon
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });

      if (!result.cancelled && result.uri) {
        // Eski format için
        setSelectedImage({ uri: result.uri });
        setAnalysisResult(null);
      } else if (!result.canceled && result.assets && result.assets.length > 0) {
        // Yeni format için
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılırken bir hata oluştu.');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Hata', 'Lütfen önce bir görsel seçin.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await ModelService.analyzeImage(selectedImage.uri);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('Hata', 'Görsel analizi sırasında bir hata oluştu.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Görsel Analizi</Text>
            <Text style={styles.subtitle}>Görselin gerçeklik durumunu analiz edin</Text>
          </Animated.View>
          
          <View style={styles.imageSection}>
            {selectedImage ? (
              <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
                <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                <View style={styles.imageOverlay} />
              </Animated.View>
            ) : (
              <View style={styles.placeholderContainer}>
                <LinearGradient
                  colors={['#f8f9fa', '#e9ecef']}
                  style={styles.placeholderGradient}
                >
                  <Ionicons name="image-outline" size={60} color="#6c757d" />
                  <Text style={styles.placeholderText}>Görsel seçin veya çekin</Text>
                  <Text style={styles.placeholderSubtext}>Analiz için bir görsel yükleyin</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
              >
                <Ionicons name="images-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Galeriden Seç</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.buttonGradient}
              >
                <Ionicons name="camera-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Fotoğraf Çek</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={isAnalyzing ? ['#adb5bd', '#6c757d'] : ['#4facfe', '#00f2fe']}
                style={styles.analyzeGradient}
              >
                {isAnalyzing && (
                  <Animated.View style={styles.loadingSpinner}>
                    <Ionicons name="refresh-outline" size={20} color="white" />
                  </Animated.View>
                )}
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzing ? 'Analiz Ediliyor...' : 'Analiz Et'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {analysisResult && (
            <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.resultGradient}
              >
                <View style={styles.resultHeader}>
                  <Ionicons name="analytics-outline" size={24} color="#495057" />
                  <Text style={styles.resultTitle}>Analiz Sonucu</Text>
                </View>
                
                <View style={styles.resultContent}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Tahmin:</Text>
                    <View style={[
                      styles.predictionBadge,
                      analysisResult.prediction === 'Gerçek' ? styles.realBadge : styles.fakeBadge
                    ]}>
                      <Text style={[
                        styles.resultValue,
                        analysisResult.prediction === 'Gerçek' ? styles.real : styles.fake
                      ]}>
                        {analysisResult.prediction || 'Bilinmiyor'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Güven Oranı:</Text>
                    <Text style={styles.confidenceValue}>%{analysisResult.confidence || 0}</Text>
                  </View>
                  
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: (analysisResult.confidence || 0) + '%' }]} />
                  </View>

                  {analysisResult.probabilities && (
                    <View style={styles.probabilitiesContainer}>
                      <Text style={styles.probabilitiesTitle}>Detaylı Olasılıklar:</Text>
                      <View style={styles.probabilityItem}>
                        <Text style={styles.probabilityLabel}>Gerçek:</Text>
                        <Text style={styles.probabilityValue}>%{analysisResult.probabilities?.real || 0}</Text>
                      </View>
                      <View style={styles.probabilityItem}>
                        <Text style={styles.probabilityLabel}>Sahte:</Text>
                        <Text style={styles.probabilityValue}>%{analysisResult.probabilities?.fake || 0}</Text>
                      </View>
                    </View>
                  )}

                  {analysisResult.modelUsed && (
                    <View style={styles.modelUsedContainer}>
                      <Text style={styles.modelUsedText}>
                        Model: {analysisResult.modelUsed || 'Bilinmiyor'}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  selectedImage: {
    width: width - 60,
    height: width - 60,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  placeholderContainer: {
    width: width - 60,
    height: width - 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  placeholderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 15,
    fontSize: 18,
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  analyzeButton: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  loadingSpinner: {
    marginRight: 10,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  resultGradient: {
    padding: 25,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
    marginLeft: 10,
  },
  resultContent: {
    // gap özelliği yerine marginBottom kullanıyoruz
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  predictionBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  realBadge: {
    backgroundColor: '#d4edda',
  },
  fakeBadge: {
    backgroundColor: '#f8d7da',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  real: {
    color: '#155724',
  },
  fake: {
    color: '#721c24',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 15,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 4,
  },
  probabilitiesContainer: {
    marginTop: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
  },
  probabilitiesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
  },
  probabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  probabilityLabel: {
    fontSize: 13,
    color: '#6c757d',
  },
  probabilityValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  modelUsedContainer: {
    marginTop: 15,
    marginBottom: 15,
    padding: 12,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4facfe',
  },
  modelUsedText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },

}); 