// HistoryScreen: Kullanıcının geçmişte analiz ettiği görselleri ve sonuçlarını listeler, kullanıcıdan doğruluk geri bildirimi alır.

// React ve React Native bileşenlerini içe aktarma
import React, { useState, useEffect } from 'react';
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
} from 'react-native';

// Expo kütüphanelerini içe aktarma
import { Ionicons } from '@expo/vector-icons';          // İkon seti
import { LinearGradient } from 'expo-linear-gradient';  // Gradyan arka plan

// Ekran genişliğini al (responsive tasarım için)
const { width } = Dimensions.get('window');

// Ana bileşen fonksiyonu
export default function HistoryScreen() {
  // State tanımlamaları - Bileşenin durumunu yönetir
  const [historyData, setHistoryData] = useState([]);      // Analiz geçmişi verisi
  const [refreshing, setRefreshing] = useState(false);     // Yenileme durumu

  // Demo için örnek geçmiş verisi - gerçek uygulamada veritabanından gelir
  const mockHistoryData = [
    {
      id: '1',                                            // Benzersiz kimlik
      imageUri: 'https://picsum.photos/200/200?random=1', // Görsel URL'si
      prediction: 'Gerçek',                               // Tahmin sonucu
      confidence: 85,                                     // Güven oranı (%)
      timestamp: '2024-01-15T10:30:00Z',                 // Analiz tarihi
      userFeedback: null,                                 // Kullanıcı geri bildirimi
    },
    {
      id: '2',
      imageUri: 'https://picsum.photos/200/200?random=2',
      prediction: 'Sahte',
      confidence: 92,
      timestamp: '2024-01-15T09:15:00Z',
      userFeedback: 'correct',  // Kullanıcı "doğru" demiş
    },
    {
      id: '3',
      imageUri: 'https://picsum.photos/200/200?random=3',
      prediction: 'Gerçek',
      confidence: 78,
      timestamp: '2024-01-14T16:45:00Z',
      userFeedback: 'incorrect', // Kullanıcı "yanlış" demiş
    },
    {
      id: '4',
      imageUri: 'https://picsum.photos/200/200?random=4',
      prediction: 'Sahte',
      confidence: 89,
      timestamp: '2024-01-14T14:20:00Z',
      userFeedback: null, // Henüz geri bildirim yok
    },
    {
      id: '5',
      imageUri: 'https://picsum.photos/200/200?random=5',
      prediction: 'Gerçek',
      confidence: 73,
      timestamp: '2024-01-13T11:10:00Z',
      userFeedback: 'correct',
    },
  ];

  // useEffect: Bileşen ilk yüklendiğinde çalışır
  useEffect(() => {
    loadHistoryData(); // Geçmiş verisini yükle
  }, []); // Boş dependency array = sadece ilk render'da çalış

  // Geçmiş verisini yükleme fonksiyonu
  const loadHistoryData = () => {
    // Gerçek uygulamada SQLite veritabanından veri çekilir
    setHistoryData(mockHistoryData);
  };

  // Aşağı çekerek yenileme fonksiyonu
  const onRefresh = () => {
    setRefreshing(true);  // Yenileme durumunu aktif et
    setTimeout(() => {
      loadHistoryData();  // Verileri yeniden yükle
      setRefreshing(false); // Yenileme durumunu pasif et
    }, 1000); // 1 saniye bekle (demo için)
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
  const handleUserFeedback = (itemId, feedback) => {
    // State'i güncelle - belirli ID'li öğenin feedback'ini değiştir
    setHistoryData(prevData =>
      prevData.map(item =>
        item.id === itemId ? { ...item, userFeedback: feedback } : item
      )
    );
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
            <Image source={{ uri: item.imageUri }} style={styles.historyImage} />
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

  // UI render fonksiyonu
  return (
    // Ana container - gradyan arka plan
    <LinearGradient
      colors={['#667eea', '#764ba2']} // Mavi-mor gradyan
      style={styles.container}
    >
      {/* Güvenli alan wrapper */}
      <SafeAreaView style={styles.safeArea}>
        {/* Başlık bölümü */}
        <View style={styles.header}>
          <Text style={styles.title}>Geçmiş Analizler</Text>
          <Text style={styles.subtitle}>Son analizlerinizi görüntüleyin</Text>
        </View>
        
        {/* İçerik bölümü - koşullu render */}
        {historyData.length === 0 ? (
          // Veri yoksa boş durum göster
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.emptyGradient}
            >
              <Ionicons name="time-outline" size={60} color="#6c757d" />
              <Text style={styles.emptyText}>Henüz analiz geçmişi yok</Text>
              <Text style={styles.emptySubtext}>
                İlk analizinizi yapmak için Analiz sekmesini kullanın
              </Text>
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
                colors={['#667eea']}             // Android spinner rengi
              />
            }
            contentContainerStyle={styles.listContainer} // Liste container stili
            showsVerticalScrollIndicator={false}          // Scroll bar'ı gizle
          />
        )}
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
  header: {
    alignItems: 'center',     // Ortala
    paddingVertical: 20,      // Dikey padding
    paddingHorizontal: 20,    // Yatay padding
  },
  title: {
    fontSize: 28,             // Büyük font
    fontWeight: 'bold',       // Kalın
    textAlign: 'center',      // Ortala
    color: 'white',           // Beyaz renk
    marginBottom: 8,          // Alt boşluk
  },
  subtitle: {
    fontSize: 16,                      // Orta font
    textAlign: 'center',               // Ortala
    color: 'rgba(255,255,255,0.8)',   // Yarı saydam beyaz
    fontWeight: '500',                 // Orta kalınlık
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
    paddingHorizontal: 40,              // Yatay padding
    margin: 20,                         // Dış boşluk
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
    padding: 40,              // İç boşluk
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
}); 