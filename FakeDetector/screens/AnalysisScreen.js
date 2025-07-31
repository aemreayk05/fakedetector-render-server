// AnalysisScreen: Kullanıcıdan bir görsel seçmesini veya fotoğraf çekmesini sağlar, ardından bu görseli analiz eder ve sonucu gösterir.

// React ve React Native bileşenlerini içe aktarma
import React, { useState, useEffect } from 'react';
import {
  View,           // Temel container bileşeni
  Text,           // Metin gösterme bileşeni
  StyleSheet,     // Stil tanımlama
  TouchableOpacity, // Dokunulabilir buton bileşeni
  Image,          // Görsel gösterme bileşeni
  Alert,          // Uyarı popup'ları için
  ScrollView,     // Kaydırılabilir alan
  SafeAreaView,   // Güvenli alan (notch vs. için)
  Dimensions,     // Ekran boyutları
  Animated,       // Animasyon bileşeni
  StatusBar,      // Status bar kontrolü
  Platform,       // Platform bilgisini için
} from 'react-native';

// Expo kütüphanelerini içe aktarma
import * as ImagePicker from 'expo-image-picker';  // Galeri ve kamera erişimi
import { Ionicons } from '@expo/vector-icons';     // İkon seti
import { LinearGradient } from 'expo-linear-gradient'; // Gradyan arka plan
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Özel servis dosyaları - AI model analizi için
import ModelService from '../services/ModelService';

// Ekran boyutlarını al (responsive tasarım için)
const { width, height } = Dimensions.get('window');

// Ana bileşen fonksiyonu
export default function AnalysisScreen() {
  // State tanımlamaları - Bileşenin durumunu yönetir
  const [selectedImage, setSelectedImage] = useState(null);     // Seçilen görselin bilgisi
  const [isAnalyzing, setIsAnalyzing] = useState(false);        // Analiz işlemi devam ediyor mu?
  const [analysisResult, setAnalysisResult] = useState(null);   // Analiz sonucu verisi
  const [isAnalyzed, setIsAnalyzed] = useState(false);          // Görsel analiz edildi mi?
  const [fadeAnim] = useState(new Animated.Value(0));          // Soluklaşma animasyonu için
  const [scaleAnim] = useState(new Animated.Value(0.8));       // Büyütme animasyonu için
  const [spinAnim] = useState(new Animated.Value(0));          // Döndürme animasyonu için
  const [pulseAnim] = useState(new Animated.Value(1));         // Nabız animasyonu için
  const [progressAnim] = useState(new Animated.Value(0));      // Progress bar animasyonu için
  const [typingAnim] = useState(new Animated.Value(0));        // Yazma animasyonu için
  const [progressText, setProgressText] = useState('AI analizi başlatılıyor');

  // Font yükleme - her zaman çağrılmalı
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  // useEffect: Bileşen ilk yüklendiğinde çalışır
  useEffect(() => {
    // Ekran açılış animasyonları - paralel olarak çalışır
    Animated.parallel([
      // Soluklaşma animasyonu (0'dan 1'e)
      Animated.timing(fadeAnim, {
        toValue: 1,           // Hedef değer
        duration: 800,        // Süre (ms)
        useNativeDriver: true, // Performans için native driver kullan
      }),
      // Ölçekleme animasyonu (0.8'den 1'e)
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(); // Animasyonları başlat
  }, []);

  // Analiz animasyonları
  useEffect(() => {
    if (isAnalyzing) {
      // Spinner animasyonu - sürekli döner
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animasyonu - nabız gibi büyüyüp küçülür
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress bar animasyonu
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000, // 3 saniye
        useNativeDriver: false,
      }).start();

      // Typing animasyonu ve progress text güncelleme
      const progressSteps = [
        'AI analizi başlatılıyor',
        'Görsel işleniyor',
        'Model yükleniyor',
        'Analiz yapılıyor',
        'Sonuç hazırlanıyor'
      ];
      
      progressSteps.forEach((text, index) => {
        setTimeout(() => {
          setProgressText(text);
        }, index * 600); // Her 600ms'de bir güncelle
      });

      Animated.timing(typingAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    } else {
      // Analiz bittiğinde animasyonları durdur
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
      typingAnim.setValue(0);
      setProgressText('AI analizi başlatılıyor'); // Reset progress text
    }
  }, [isAnalyzing]);

  // Galeriden görsel seçme fonksiyonu
  const pickImageFromGallery = async () => {
    try {
      // Galeri erişim izni iste
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir.');
        return;
      }

      // Galeriden görsel seç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Sadece görseller
        allowsEditing: false, // Düzenleme kapalı
        aspect: [4, 3], // Görsel oranı
        quality: 1, // En yüksek kalite
      });

      // Görsel seçildiyse state'e kaydet
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null); // Önceki sonucu temizle
        setIsAnalyzed(false); // Analiz durumunu sıfırla
      }
    } catch (error) {
      Alert.alert('Hata', 'Görsel seçilirken bir hata oluştu.');
      console.error(error);
    }
  };

  // Seçilen görseli analiz etme fonksiyonu
  const analyzeImage = async () => {
    // Görsel seçilmemişse uyarı ver
    if (!selectedImage) {
      Alert.alert('Hata', 'Lütfen önce bir görsel seçin.');
      return;
    }

    // Analiz durumunu true yap (loading göstergesi için)
    setIsAnalyzing(true);
    
    try {
      console.log(' Görsel analizi başlıyor...');
      const result = await ModelService.analyzeImage(selectedImage.uri);
      
      setAnalysisResult(result); // Sonucu state'e kaydet
      setIsAnalyzed(true);       // Analiz tamamlandı
    } catch (error) {
      // Hata durumunda kullanıcıya bilgi ver
      Alert.alert('Hata', 'Görsel analizi sırasında bir hata oluştu.');
      console.error(error); // Geliştirici için konsola log
    } finally {
      // Her durumda analiz durumunu false yap
      setIsAnalyzing(false);
    }
  };

  // Font yüklenene kadar loading göster
  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <StatusBar hidden={true} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // UI render fonksiyonu
  return (
    // Ana container - gradyan arka plan
    <LinearGradient
      colors={['#667eea', '#764ba2']} // Mavi-mor gradyan
      style={styles.container}
    >
      {/* Status bar'ı gizle */}
      <StatusBar hidden={true} />
              {/* Güvenli alan wrapper */}
        <SafeAreaView style={styles.safeArea}>
          {/* Buton Stili AppBar */}
          <Animated.View style={[styles.appBar, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.appBarGradient}
            >
              <Text style={styles.appBarTitle}>Görsel Analizi</Text>
            </LinearGradient>
          </Animated.View>

          {/* Kaydırılabilir içerik alanı */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Görsel gösterme bölümü */}
          <View style={styles.imageSection}>
            {selectedImage ? (
              // Görsel seçilmişse göster
              <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
                <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                <View style={styles.imageOverlay} /> {/* Görsel üzerine hafif overlay */}
              </Animated.View>
            ) : (
              // Görsel seçilmemişse placeholder göster
              <View style={styles.placeholderContainer}>
                <LinearGradient
                  colors={['#f8f9fa', '#e9ecef']}
                  style={styles.placeholderGradient}
                >
                  <Ionicons name="image-outline" size={60} color="#6c757d" />
                  <Text style={styles.placeholderText}>Görsel seçin</Text>
                  <Text style={styles.placeholderSubtext}>Analiz için bir görsel yükleyin</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Galeriden seç butonu - geniş tasarım */}
          <TouchableOpacity style={styles.wideActionButton} onPress={pickImageFromGallery}>
              <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.wideButtonGradient}
              >
                <Ionicons name="images-outline" size={24} color="white" />
              <Text style={styles.wideButtonText}>Galeriden Seç</Text>
              </LinearGradient>
            </TouchableOpacity>



          {/* Analiz butonu - sadece görsel seçilmişse göster */}
          {selectedImage && (
            <TouchableOpacity
              style={[styles.wideAnalyzeButton, (isAnalyzing || isAnalyzed) && styles.analyzeButtonDisabled]}
              onPress={analyzeImage}
              disabled={isAnalyzing || isAnalyzed} // Analiz sırasında veya tamamlandığında disable et
            >
              <LinearGradient
                colors={isAnalyzing ? ['#ff6b6b', '#ee5a24'] : ['#28a745', '#20c997']}
                style={styles.wideAnalyzeGradient}
              >
                {/* Animasyonlu loading spinner */}
                {isAnalyzing && (
                  <Animated.View style={[
                    styles.loadingSpinner,
                    {
                      transform: [{
                        rotate: spinAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]}>
                    <Ionicons name="sync-outline" size={24} color="white" />
                  </Animated.View>
                )}
                
                {/* Buton metni */}
                <Text style={styles.wideAnalyzeButtonText}>
                  {isAnalyzing ? 'Analiz Ediliyor...' : isAnalyzed ? 'Analiz Edildi' : 'Analiz Et'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Progress Bar - sadece analiz sırasında göster */}
          {isAnalyzing && (
            <Animated.View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]} 
                />
              </View>
              <Animated.Text style={styles.progressText}>
                {progressText}
              </Animated.Text>
            </Animated.View>
          )}

          {/* Analiz sonucu bölümü - sadece sonuç varsa göster */}
          {analysisResult && (
            <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.resultGradient}
              >
                {/* Sonuç başlığı */}
                <View style={styles.resultHeader}>
                  <Ionicons name="analytics-outline" size={24} color="#495057" />
                  <Text style={styles.resultTitle}>Analiz Sonucu</Text>
                </View>
                
                {/* Sonuç içeriği */}
                <View style={styles.resultContent}>
                  {/* Tahmin sonucu */}
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Tahmin:</Text>
                    <View style={[
                      styles.predictionBadge,
                      (analysisResult.prediction === 'Gerçek' || analysisResult.prediction === 'Gercek' || analysisResult.prediction === 'Real') ? styles.realBadge : styles.fakeBadge
                    ]}>
                      <Text style={[
                        styles.resultValue,
                        (analysisResult.prediction === 'Gerçek' || analysisResult.prediction === 'Gercek' || analysisResult.prediction === 'Real') ? styles.real : styles.fake
                      ]}>
                        {analysisResult.prediction || 'Bilinmiyor'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Güven oranı */}
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>
                      {(analysisResult.prediction === 'Gerçek' || analysisResult.prediction === 'Gercek' || analysisResult.prediction === 'Real') ? 'Gerçek Olma Oranı:' : 'Sahte Olma Oranı:'}
                    </Text>
                    <Text style={styles.confidenceValue}>%{analysisResult.confidence || 0}</Text>
                  </View>
                  
                  {/* Güven oranı bar grafiği */}
                  <View style={styles.confidenceBar}>
                    <View style={[
                      styles.confidenceFill, 
                      { 
                        width: (analysisResult.confidence || 0) + '%',
                        backgroundColor: (analysisResult.prediction === 'Gerçek' || analysisResult.prediction === 'Gercek' || analysisResult.prediction === 'Real') ? '#28a745' : '#dc3545'
                      }
                    ]} />
                  </View>

                  {/* Detaylı olasılıklar - varsa göster */}
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

                  {/* Kullanılan model bilgisi - varsa göster */}
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

// Stil tanımlamaları - bileşenin görünümünü belirler
const styles = StyleSheet.create({
  container: {
    flex: 1, // Tüm ekranı kapla
  },
  safeArea: {
    flex: 1, // Tüm alanı kullan
  },
  scrollContent: {
    padding: 20,        // İç boşluk
    paddingBottom: 40,  // Alt boşluk
  },
  // Buton Stili AppBar stilleri
  appBar: {
    marginBottom: 20,
  },
  appBarGradient: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#495057',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },

  // Görsel bölümü stilleri
  imageSection: {
    alignItems: 'center',  // Ortala
    marginBottom: 30,      // Alt boşluk
  },
  imageWrapper: {
    position: 'relative',           // Overlay için
    borderRadius: 20,               // Yuvarlatılmış köşeler
    overflow: 'hidden',             // Taşan kısımları gizle
    shadowColor: '#000',            // Gölge rengi
    shadowOffset: { width: 0, height: 8 }, // Gölge pozisyonu
    shadowOpacity: 0.3,             // Gölge saydamlığı
    shadowRadius: 20,               // Gölge yayılımı
    elevation: 15,                  // Android gölge
  },
  selectedImage: {
    width: width - 60,    // Ekran genişliği - 60px
    height: width - 60,   // Kare görsel
    borderRadius: 20,     // Yuvarlatılmış köşeler
    resizeMode: 'cover',  // Görseli sığdır
  },
  imageOverlay: {
    position: 'absolute',              // Görsel üzerine yerleştir
    top: 0, left: 0, right: 0, bottom: 0, // Tüm alanı kapla
    backgroundColor: 'rgba(0,0,0,0.1)', // Hafif koyu overlay
    borderRadius: 20,                   // Yuvarlatılmış köşeler
  },
  placeholderContainer: {
    width: width - 60,                      // Görsel ile aynı boyut
    height: width - 60,                     // Kare
    borderRadius: 20,                       // Yuvarlatılmış köşeler
    overflow: 'hidden',                     // Taşan kısımları gizle
    shadowColor: '#000',                    // Gölge
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.1,                     // Hafif gölge
    shadowRadius: 10,                       // Gölge yayılımı
    elevation: 5,                           // Android gölge
  },
  placeholderGradient: {
    flex: 1,                  // Tüm alanı kapla
    justifyContent: 'center', // Dikey ortala
    alignItems: 'center',     // Yatay ortala
    padding: 20,              // İç boşluk
  },
  placeholderText: {
    marginTop: 15,        // Üst boşluk
    fontSize: 18,         // Büyük font
    color: '#495057',     // Koyu gri
    fontWeight: '600',    // Orta kalın
    textAlign: 'center',  // Ortala
  },
  placeholderSubtext: {
    marginTop: 5,         // Üst boşluk
    fontSize: 14,         // Küçük font
    color: '#6c757d',     // Açık gri
    textAlign: 'center',  // Ortala
  },

  // Buton bölümü stilleri
  buttonSection: {
    flexDirection: 'row',        // Yatay dizilim
    justifyContent: 'space-between', // Aralarında boşluk
    marginBottom: 25,            // Alt boşluk
  },
  actionButton: {
    flex: 0.48,                         // %48 genişlik (ikisi yan yana)
    borderRadius: 15,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.3,                 // Gölge saydamlığı
    shadowRadius: 10,                   // Gölge yayılımı
    elevation: 8,                       // Android gölge
  },
  buttonGradient: {
    flexDirection: 'row',       // İkon ve metin yan yana
    alignItems: 'center',       // Dikey ortala
    justifyContent: 'center',   // Yatay ortala
    paddingVertical: 18,        // Dikey padding
    paddingHorizontal: 20,      // Yatay padding
  },
  buttonText: {
    color: 'white',       // Beyaz metin
    fontSize: 16,         // Orta font
    fontWeight: '700',    // Kalın
    marginLeft: 10,       // İkondan boşluk
  },

  // Analiz butonu stilleri
  analyzeButton: {
    marginBottom: 25,                   // Alt boşluk
    borderRadius: 15,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge
    shadowOffset: { width: 0, height: 6 }, // Gölge pozisyonu
    shadowOpacity: 0.3,                 // Gölge saydamlığı
    shadowRadius: 15,                   // Gölge yayılımı
    elevation: 10,                      // Android gölge
  },
  analyzeButtonDisabled: {
    opacity: 0.7, // Disabled durumda saydam
  },
  analyzeGradient: {
    flexDirection: 'row',       // Yatay dizilim
    alignItems: 'center',       // Dikey ortala
    justifyContent: 'center',   // Yatay ortala
    paddingVertical: 20,        // Dikey padding
    paddingHorizontal: 30,      // Yatay padding
  },
  loadingSpinner: {
    marginRight: 10, // Metinden boşluk
    transform: [{ rotate: '0deg' }], // Başlangıç rotasyonu
  },
  
  // Progress bar stilleri
  progressContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  analyzeButtonText: {
    color: 'white',       // Beyaz metin
    fontSize: 18,         // Büyük font
    fontWeight: 'bold',   // Kalın
  },

  // Sonuç bölümü stilleri
  resultContainer: {
    borderRadius: 20,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge
    shadowOffset: { width: 0, height: 8 }, // Gölge pozisyonu
    shadowOpacity: 0.15,                // Hafif gölge
    shadowRadius: 20,                   // Gölge yayılımı
    elevation: 12,                      // Android gölge
  },
  resultGradient: {
    padding: 25, // İç boşluk
  },
  resultHeader: {
    flexDirection: 'row',   // İkon ve metin yan yana
    alignItems: 'center',   // Dikey ortala
    marginBottom: 20,       // Alt boşluk
  },
  resultTitle: {
    fontSize: 22,         // Büyük font
    fontWeight: 'bold',   // Kalın
    color: '#495057',     // Koyu gri
    marginLeft: 10,       // İkondan boşluk
  },
  resultContent: {
    // İçerik alanı - özel stil yok
  },
  resultItem: {
    flexDirection: 'row',        // Yatay dizilim
    justifyContent: 'space-between', // Aralarında boşluk
    alignItems: 'center',        // Dikey ortala
    marginBottom: 15,            // Alt boşluk
  },
  resultLabel: {
    fontSize: 16,         // Orta font
    color: '#6c757d',     // Açık gri
    fontWeight: '500',    // Orta kalın
  },
  predictionBadge: {
    paddingHorizontal: 15, // Yatay padding
    paddingVertical: 8,    // Dikey padding
    borderRadius: 20,      // Yuvarlatılmış köşeler
  },
  realBadge: {
    backgroundColor: '#d4edda', // Açık yeşil arka plan
  },
  fakeBadge: {
    backgroundColor: '#f8d7da', // Açık kırmızı arka plan
  },
  resultValue: {
    fontSize: 16,         // Orta font
    fontWeight: 'bold',   // Kalın
  },
  real: {
    color: '#155724', // Koyu yeşil metin
  },
  fake: {
    color: '#721c24', // Koyu kırmızı metin
  },
  confidenceValue: {
    fontSize: 18,         // Büyük font
    fontWeight: 'bold',   // Kalın
    color: '#495057',     // Koyu gri
  },

  // Güven oranı bar grafiği
  confidenceBar: {
    height: 8,                // Bar yüksekliği
    backgroundColor: '#e9ecef', // Arka plan rengi
    borderRadius: 4,          // Yuvarlatılmış köşeler
    overflow: 'hidden',       // Taşan kısımları gizle
    marginTop: 5,             // Üst boşluk
    marginBottom: 15,         // Alt boşluk
  },
  confidenceFill: {
    height: '100%',           // Tam yükseklik
    backgroundColor: '#4facfe', // Mavi dolgu
    borderRadius: 4,          // Yuvarlatılmış köşeler
  },

  // Detaylı olasılıklar bölümü
  probabilitiesContainer: {
    marginTop: 15,                          // Üst boşluk
    marginBottom: 15,                       // Alt boşluk
    padding: 15,                            // İç boşluk
    backgroundColor: 'rgba(102, 126, 234, 0.1)', // Hafif mavi arka plan
    borderRadius: 12,                       // Yuvarlatılmış köşeler
  },
  probabilitiesTitle: {
    fontSize: 14,         // Küçük font
    fontWeight: 'bold',   // Kalın
    color: '#495057',     // Koyu gri
    marginBottom: 10,     // Alt boşluk
  },
  probabilityItem: {
    flexDirection: 'row',        // Yatay dizilim
    justifyContent: 'space-between', // Aralarında boşluk
    marginBottom: 5,             // Alt boşluk
  },
  probabilityLabel: {
    fontSize: 13,     // Küçük font
    color: '#6c757d', // Açık gri
  },
  probabilityValue: {
    fontSize: 13,         // Küçük font
    fontWeight: '600',    // Orta kalın
    color: '#495057',     // Koyu gri
  },

  // Model bilgisi bölümü
  modelUsedContainer: {
    marginTop: 15,                      // Üst boşluk
    marginBottom: 15,                   // Alt boşluk
    padding: 12,                        // İç boşluk
    backgroundColor: 'rgba(248, 249, 250, 0.8)', // Hafif gri arka plan
    borderRadius: 10,                   // Yuvarlatılmış köşeler
    borderLeftWidth: 3,                 // Sol kenarlık
    borderLeftColor: '#4facfe',         // Mavi kenarlık
  },
  modelUsedText: {
    fontSize: 12,         // Küçük font
    color: '#495057',     // Koyu gri
    fontWeight: '500',    // Orta kalın
  },

  // Placeholder buton stilleri
  placeholderButton: {
    marginTop: 20,                    // Üst boşluk
    borderRadius: 25,                 // Yuvarlatılmış köşeler
    overflow: 'hidden',               // Taşan kısımları gizle
    shadowColor: '#000',              // Gölge rengi
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.15,              // Gölge saydamlığı
    shadowRadius: 8,                  // Gölge yayılımı
    elevation: 6,                     // Android gölge
  },
  placeholderButtonGradient: {
    flexDirection: 'row',             // Yatay dizilim
    alignItems: 'center',             // Dikey ortala
    justifyContent: 'center',         // Yatay ortala
    paddingHorizontal: 30,            // Yatay padding
    paddingVertical: 15,              // Dikey padding
  },
  placeholderButtonText: {
    color: 'white',                   // Beyaz metin
    fontSize: 16,                     // Orta font
    fontWeight: '600',                // Orta kalın
    marginLeft: 8,                    // İkon ile metin arası boşluk
  },

  // Geniş buton stilleri
  wideActionButton: {
    marginTop: 20,                    // Üst boşluk
    marginHorizontal: 20,             // Yatay boşluk
    borderRadius: 15,                 // Yuvarlatılmış köşeler
    overflow: 'hidden',               // Taşan kısımları gizle
    shadowColor: '#000',              // Gölge rengi
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.2,               // Gölge saydamlığı
    shadowRadius: 10,                 // Gölge yayılımı
    elevation: 8,                     // Android gölge
  },
  wideButtonGradient: {
    flexDirection: 'row',             // Yatay dizilim
    alignItems: 'center',             // Dikey ortala
    justifyContent: 'center',         // Yatay ortala
    paddingHorizontal: 40,            // Yatay padding
    paddingVertical: 18,              // Dikey padding
  },
  wideButtonText: {
    color: 'white',                   // Beyaz metin
    fontSize: 18,                     // Büyük font
    fontWeight: '600',                // Orta kalın
    marginLeft: 10,                   // İkon ile metin arası boşluk
  },

  // Geniş analiz buton stilleri
  wideAnalyzeButton: {
    marginTop: 15,                    // Üst boşluk
    marginBottom: 25,                 // Alt boşluk - sonuç kartı ile arasında boşluk
    marginHorizontal: 20,             // Yatay boşluk
    borderRadius: 15,                 // Yuvarlatılmış köşeler
    overflow: 'hidden',               // Taşan kısımları gizle
    shadowColor: '#000',              // Gölge rengi
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.2,               // Gölge saydamlığı
    shadowRadius: 10,                 // Gölge yayılımı
    elevation: 8,                     // Android gölge
  },
  analyzeButtonDisabled: {
    opacity: 0.6,                     // Disabled durumda saydamlık
  },
  wideAnalyzeGradient: {
    flexDirection: 'row',             // Yatay dizilim
    alignItems: 'center',             // Dikey ortala
    justifyContent: 'center',         // Yatay ortala
    paddingHorizontal: 40,            // Yatay padding
    paddingVertical: 18,              // Dikey padding
  },


  wideAnalyzeButtonText: {
    color: 'white',                   // Beyaz metin
    fontSize: 18,                     // Büyük font
    fontWeight: '600',                // Orta kalın
  },

  // Loading stilleri
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
}); 