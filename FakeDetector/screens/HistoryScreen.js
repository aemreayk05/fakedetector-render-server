// HistoryScreen: Kullanıcının geçmişte analiz ettiği görselleri ve sonuçlarını listeler, kullanıcıdan doğruluk geri bildirimi alır.

// HistoryScreen: Kullanıcının geçmişte analiz ettiği görselleri ve sonuçlarını listeler, kullanıcıdan doğruluk geri bildirimi alır.

// React ve React Native bileşenlerini içe aktarma
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,             // Temel container bileşeni
  Text,             // Metin gösterme bileşeni
  StyleSheet,       // Stil tanımlama
  FlatList,         // Performanslı liste bileşeni
  Image,            // Görsel gösterme bileşeni
  TouchableOpacity, // Dokunulabilir buton bileşeni
  SafeAreaView,     // Güvenli alan (notch vs. için)
  RefreshControl,   // Aşağı çekerek yenileme
  Dimensions,       // Ekran boyutları
  Animated,         // Animasyon bileşeni
  StatusBar,        // Status bar kontrolü
  Platform,         // Platform bilgisini almak için
} from 'react-native';

// Expo kütüphanelerini içe aktarma
import { Ionicons } from '@expo/vector-icons';          // İkon seti
import { LinearGradient } from 'expo-linear-gradient';  // Gradyan arka plan
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import DatabaseService from '../services/DatabaseService.js';

// Ekran genişliğini al (responsive tasarım için)
const { width } = Dimensions.get('window');

// Ana bileşen fonksiyonu
export default function HistoryScreen({ navigation }) {
  // State tanımlamaları - Bileşenin durumunu yönetir
  const [historyData, setHistoryData] = useState([]);      // Analiz geçmişi verisi
  const [refreshing, setRefreshing] = useState(false);     // Yenileme durumu

  // Font yükleme - her zaman çağrılmalı
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  // Geçmiş verisini yükleme fonksiyonu
  const loadHistoryData = useCallback(async () => {
    try {
      // SQL sunucusundan veri çek
      const data = await DatabaseService.getAnalysisHistory(50, 0);
      setHistoryData(data);
    } catch (error) {
      console.error('❌ Geçmiş verisi yükleme hatası:', error);
      // Hata durumunda boş array göster
      setHistoryData([]);
    }
  }, []); // useCallback ile fonksiyonu memoize et

  // useEffect: Bileşen ilk yüklendiğinde çalışır
  useEffect(() => {
    loadHistoryData(); // Geçmiş verisini yükle
  }, [loadHistoryData]); // loadHistoryData dependency olarak ekle

  // useFocusEffect: Ekran her odaklandığında çalışır
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 History ekranı odaklandı - veriler yenileniyor...');
      loadHistoryData(); // Her girişte verileri yenile
    }, [loadHistoryData])
  );

  // Aşağı çekerek yenileme fonksiyonu
  const onRefresh = async () => {
    setRefreshing(true);  // Yenileme durumunu aktif et
    try {
      console.log('🔄 Geçmiş yenileniyor...');
      await loadHistoryData();  // Verileri yeniden yükle
      console.log('✅ Geçmiş başarıyla yenilendi');
    } catch (error) {
      console.error('❌ Yenileme hatası:', error);
      // Hata durumunda boş array göster
      setHistoryData([]);
    } finally {
      setRefreshing(false); // Yenileme durumunu pasif et
    }
  };

  // Tarih formatlama fonksiyonu
  const formatDate = (timestamp) => {
    const date = new Date(timestamp); // String'i Date objesine çevir
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',     // Gün (01-31)
      month: '2-digit',   // Ay (01-12)
      year: 'numeric',    // Yıl (2024)
      hour: '2-digit',    // Saat (00-23)
      minute: '2-digit',  // Dakika (00-59)
    });
  };

  // Kullanıcı geri bildirimi işleme fonksiyonu
  const handleUserFeedback = async (itemId, feedback) => {
    try {
      // SQL sunucusuna geri bildirimi kaydet
      await DatabaseService.saveUserFeedback(itemId, feedback);
      console.log(`✅ Kullanıcı geri bildirimi kaydedildi: ${itemId} - ${feedback}`);
      
      // State'i güncelle
    setHistoryData(prevData =>
      prevData.map(item =>
        item.id === itemId ? { ...item, userFeedback: feedback } : item
      )
    );
    } catch (error) {
      console.error('❌ Geri bildirim kaydetme hatası:', error);
      Alert.alert('Hata', 'Geri bildirim kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Her bir geçmiş kaydının render fonksiyonu
  const renderHistoryItem = ({ item, index }) => (
    // Ana container - animasyonlu
    <Animated.View style={[styles.historyItem, { opacity: 1 }]}>
      {/* Gradyan arka plan */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']} // Beyaz-gri gradyan
        style={styles.itemGradient}
      >
        {/* İçerik container */}
        <View style={styles.itemContent}>
          {/* Görsel bölümü */}
          <View style={styles.imageSection}>
            <Image source={{ uri: item.image_data || item.imageUri }} style={styles.historyImage} />
            {/* Görsel üzerine ikon overlay */}
            <View style={styles.imageOverlay}>
              <Ionicons name="image" size={16} color="white" />
            </View>
          </View>
          
          {/* Detay bilgileri bölümü */}
          <View style={styles.historyDetails}>
            {/* Tahmin sonucu */}
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionLabel}>Tahmin:</Text>
              <View style={[
                styles.predictionBadge,
                item.prediction === 'Gerçek' ? styles.realBadge : styles.fakeBadge
              ]}>
                <Text style={[
                  styles.predictionValue,
                  item.prediction === 'Gerçek' ? styles.real : styles.fake
                ]}>
                  {item.prediction || 'Bilinmiyor'}
                </Text>
              </View>
            </View>
            
            {/* Güven oranı */}
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Güven:</Text>
              <Text style={styles.confidenceValue}>%{item.confidence || 0}</Text>
            </View>
            
            {/* Tarih bilgisi */}
            <Text style={styles.timestamp}>
              {item.timestamp ? formatDate(item.timestamp) : 'Tarih bilinmiyor'}
            </Text>
            
            {/* Kullanıcı geri bildirimi bölümü */}
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>Doğru mu?</Text>
              <View style={styles.feedbackButtons}>
                {/* "Doğru" butonu */}
                <TouchableOpacity
                  style={[
                    styles.feedbackButton,
                    item.userFeedback === 'correct' && styles.selectedCorrect
                  ]}
                  onPress={() => handleUserFeedback(item.id, 'correct')}
                >
                  <LinearGradient
                    colors={item.userFeedback === 'correct' ? ['#4facfe', '#00f2fe'] : ['#f8f9fa', '#e9ecef']}
                    style={styles.feedbackGradient}
                  >
                    <Ionicons 
                      name="checkmark" 
                      size={14} 
                      color={item.userFeedback === 'correct' ? 'white' : '#28a745'} 
                    />
                    <Text style={[
                      styles.feedbackButtonText,
                      item.userFeedback === 'correct' && styles.selectedFeedbackText
                    ]}>
                      Doğru
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* "Yanlış" butonu */}
                <TouchableOpacity
                  style={[
                    styles.feedbackButton,
                    { marginRight: 0 }, // Son buton için sağ margin yok
                    item.userFeedback === 'incorrect' && styles.selectedIncorrect
                  ]}
                  onPress={() => handleUserFeedback(item.id, 'incorrect')}
                >
                  <LinearGradient
                    colors={item.userFeedback === 'incorrect' ? ['#f093fb', '#f5576c'] : ['#f8f9fa', '#e9ecef']}
                    style={styles.feedbackGradient}
                  >
                    <Ionicons 
                      name="close" 
                      size={14} 
                      color={item.userFeedback === 'incorrect' ? 'white' : '#dc3545'} 
                    />
                    <Text style={[
                      styles.feedbackButtonText,
                      item.userFeedback === 'incorrect' && styles.selectedFeedbackText
                    ]}>
                      Yanlış
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

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
          <View style={styles.appBar}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.appBarGradient}
            >
              <Text style={styles.appBarTitle}>Geçmiş Analizler</Text>
            </LinearGradient>
          </View>
        
        {/* İçerik bölümü - koşullu render */}
        {historyData.length === 0 ? (
          // Veri yoksa boş durum göster
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.emptyGradient}
            >
              {/* Animasyonlu ikon container */}
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.emptyIconGradient}
                >
                  <Ionicons name="analytics-outline" size={50} color="white" />
                </LinearGradient>
              </View>
              
              <Text style={styles.emptyText}>Henüz analiz geçmişi yok</Text>
              <Text style={styles.emptySubtext}>
                İlk analizinizi yapmak için Analiz sekmesini kullanın
              </Text>
              
              {/* Call-to-Action butonu */}
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate('Analysis')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.emptyActionGradient}
                >
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={styles.emptyActionText}>İlk Analizi Yap</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Floating particles */}
              <View style={styles.particlesContainer}>
                <View style={styles.particle1} />
                <View style={styles.particle2} />
                <View style={styles.particle3} />
              </View>
            </LinearGradient>
          </View>
        ) : (
          // Veri varsa liste göster
          <FlatList
            data={historyData}                    // Gösterilecek veri
            renderItem={renderHistoryItem}        // Her öğe için render fonksiyonu
            keyExtractor={(item) => item.id}      // Benzersiz key çıkarma
            refreshControl={
              // Aşağı çekerek yenileme kontrolü
              <RefreshControl 
                refreshing={refreshing}           // Yenileme durumu
                onRefresh={onRefresh}            // Yenileme fonksiyonu
                tintColor="white"                // iOS spinner rengi
                colors={['#667eea', '#764ba2']}  // Android spinner renkleri
                progressBackgroundColor="rgba(255,255,255,0.1)" // Arka plan rengi
                size="large"                     // Büyük spinner
              />
            }
            contentContainerStyle={styles.listContainer} // Liste container stili
            showsVerticalScrollIndicator={false}          // Scroll bar'ı gizle
          />
        )}
        
        {/* Floating Action Button - Refresh */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.fabGradient}
          >
            <Ionicons 
              name={refreshing ? "sync" : "refresh"} 
              size={24} 
              color="white" 
              style={refreshing ? styles.rotating : null}
            />
          </LinearGradient>
        </TouchableOpacity>
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

  // Liste container
  listContainer: {
    padding: 15,        // İç boşluk
    paddingBottom: 30,  // Alt boşluk
  },

  // Her bir geçmiş öğesi
  historyItem: {
    marginBottom: 15,                   // Alt boşluk
    borderRadius: 20,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge rengi
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.15,                // Gölge saydamlığı
    shadowRadius: 12,                   // Gölge yayılımı
    elevation: 8,                       // Android gölge
  },
  itemGradient: {
    padding: 20, // İç boşluk
  },
  itemContent: {
    flexDirection: 'row', // Yatay dizilim (görsel + detaylar)
  },

  // Görsel bölümü
  imageSection: {
    position: 'relative', // Overlay için
    marginRight: 15,      // Sağ boşluk
  },
  historyImage: {
    width: 80,            // Sabit genişlik
    height: 80,           // Sabit yükseklik (kare)
    borderRadius: 12,     // Yuvarlatılmış köşeler
  },
  imageOverlay: {
    position: 'absolute',              // Görsel üzerine yerleştir
    top: 5, right: 5,                  // Sağ üst köşe
    backgroundColor: 'rgba(0,0,0,0.6)', // Yarı saydam siyah
    borderRadius: 10,                   // Yuvarlatılmış köşeler
    padding: 4,                         // İç boşluk
  },

  // Detay bilgileri
  historyDetails: {
    flex: 1, // Kalan alanı kapla
  },
  predictionContainer: {
    flexDirection: 'row',        // Yatay dizilim
    alignItems: 'center',        // Dikey ortala
    justifyContent: 'space-between', // Aralarında boşluk
    marginBottom: 8,             // Alt boşluk
  },
  predictionLabel: {
    fontSize: 14,         // Küçük font
    color: '#6c757d',     // Açık gri
    fontWeight: '500',    // Orta kalın
  },
  predictionBadge: {
    paddingHorizontal: 12, // Yatay padding
    paddingVertical: 6,    // Dikey padding
    borderRadius: 15,      // Yuvarlatılmış köşeler
  },
  realBadge: {
    backgroundColor: '#d4edda', // Açık yeşil arka plan
  },
  fakeBadge: {
    backgroundColor: '#f8d7da', // Açık kırmızı arka plan
  },
  predictionValue: {
    fontSize: 14,         // Küçük font
    fontWeight: 'bold',   // Kalın
  },
  real: {
    color: '#155724', // Koyu yeşil metin
  },
  fake: {
    color: '#721c24', // Koyu kırmızı metin
  },

  // Güven oranı
  confidenceContainer: {
    flexDirection: 'row',        // Yatay dizilim
    alignItems: 'center',        // Dikey ortala
    justifyContent: 'space-between', // Aralarında boşluk
    marginBottom: 8,             // Alt boşluk
  },
  confidenceLabel: {
    fontSize: 14,         // Küçük font
    color: '#6c757d',     // Açık gri
    fontWeight: '500',    // Orta kalın
  },
  confidenceValue: {
    fontSize: 14,         // Küçük font
    fontWeight: 'bold',   // Kalın
    color: '#495057',     // Koyu gri
  },

  // Tarih bilgisi
  timestamp: {
    fontSize: 12,         // Çok küçük font
    color: '#adb5bd',     // Çok açık gri
    marginBottom: 12,     // Alt boşluk
    fontStyle: 'italic',  // İtalik
  },

  // Geri bildirim bölümü
  feedbackContainer: {
    marginTop: 8, // Üst boşluk
  },
  feedbackLabel: {
    fontSize: 12,         // Çok küçük font
    color: '#6c757d',     // Açık gri
    marginBottom: 8,      // Alt boşluk
    fontWeight: '500',    // Orta kalın
  },
  feedbackButtons: {
    flexDirection: 'row', // Butonları yan yana diz
  },
  feedbackButton: {
    flex: 1,                            // Eşit genişlik
    borderRadius: 12,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge
    shadowOffset: { width: 0, height: 2 }, // Gölge pozisyonu
    shadowOpacity: 0.1,                 // Hafif gölge
    shadowRadius: 4,                    // Gölge yayılımı
    elevation: 3,                       // Android gölge
    marginRight: 8,                     // Sağ boşluk
  },
  feedbackGradient: {
    flexDirection: 'row',       // İkon ve metin yan yana
    alignItems: 'center',       // Dikey ortala
    justifyContent: 'center',   // Yatay ortala
    paddingVertical: 8,         // Dikey padding
    paddingHorizontal: 12,      // Yatay padding
  },
  selectedCorrect: {
    transform: [{ scale: 1.05 }], // Seçili durumda hafif büyüt
  },
  selectedIncorrect: {
    transform: [{ scale: 1.05 }], // Seçili durumda hafif büyüt
  },
  feedbackButtonText: {
    fontSize: 12,         // Çok küçük font
    marginLeft: 6,        // İkondan boşluk
    color: '#6c757d',     // Açık gri
    fontWeight: '600',    // Orta kalın
  },
  selectedFeedbackText: {
    color: 'white', // Seçili durumda beyaz metin
  },

  // Boş durum stilleri
  emptyContainer: {
    flex: 1,                            // Tüm alanı kapla
    justifyContent: 'center',           // Dikey ortala
    alignItems: 'center',               // Yatay ortala
    paddingHorizontal: 20,              // Yatay padding azaltıldı
    marginHorizontal: 20,               // Sadece yatay margin
    marginVertical: 10,                 // Dikey margin azaltıldı
    borderRadius: 20,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.15,                // Gölge saydamlığı
    shadowRadius: 12,                   // Gölge yayılımı
    elevation: 8,                       // Android gölge
  },
  emptyGradient: {
    flex: 1,                  // Tüm alanı kapla
    width: '100%',            // Tam genişlik
    justifyContent: 'center', // Dikey ortala
    alignItems: 'center',     // Yatay ortala
    padding: 30,              // İç boşluk azaltıldı
  },
  emptyText: {
    fontSize: 20,         // Büyük font
    fontWeight: 'bold',   // Kalın
    color: '#495057',     // Koyu gri
    marginTop: 20,        // Üst boşluk
    textAlign: 'center',  // Ortala
  },
  emptySubtext: {
    fontSize: 14,         // Küçük font
    color: '#6c757d',     // Açık gri
    marginTop: 10,        // Üst boşluk
    textAlign: 'center',  // Ortala
    lineHeight: 20,       // Satır yüksekliği
  },
  
  // Yeni empty state stilleri
  emptyIconContainer: {
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActionButton: {
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
  },
  particle2: {
    position: 'absolute',
    top: '60%',
    right: '15%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(118, 75, 162, 0.4)',
  },
  particle3: {
    position: 'absolute',
    bottom: '30%',
    left: '20%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
  },

  // Floating Action Button stilleri
  fab: {
    position: 'absolute',           // Mutlak pozisyon
    bottom: 30,                     // Alt boşluk
    right: 20,                      // Sağ boşluk
    zIndex: 1000,                   // En üstte göster
  },
  fabGradient: {
    width: 56,                      // Sabit genişlik
    height: 56,                     // Sabit yükseklik (kare)
    borderRadius: 28,               // Yuvarlak (yarıçap = genişlik/2)
    justifyContent: 'center',       // Dikey ortala
    alignItems: 'center',           // Yatay ortala
    shadowColor: '#000',            // Gölge rengi
    shadowOffset: { width: 0, height: 4 }, // Gölge pozisyonu
    shadowOpacity: 0.3,             // Gölge saydamlığı
    shadowRadius: 8,                // Gölge yayılımı
    elevation: 8,                   // Android gölge
  },
  rotating: {
    transform: [{ rotate: '360deg' }], // Döndürme animasyonu
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