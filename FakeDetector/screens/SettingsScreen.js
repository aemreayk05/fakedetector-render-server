// SettingsScreen: Uygulama ayarlarını (bildirim, otomatik kaydetme, karanlık mod, geçmiş temizleme, hakkında, gizlilik) yönetir.

// React ve React Native bileşenlerini içe aktarma
import React, { useState, useEffect } from 'react';
import {
  View,             // Temel container bileşeni
  Text,             // Metin gösterme bileşeni
  StyleSheet,       // Stil tanımlama
  TouchableOpacity, // Dokunulabilir buton bileşeni
  Switch,           // Açma/kapama düğmesi
  ScrollView,       // Kaydırılabilir alan
  SafeAreaView,     // Güvenli alan (notch vs. için)
  Alert,            // Uyarı popup'ları için
  Dimensions,       // Ekran boyutları
  StatusBar,        // Status bar kontrolü
} from 'react-native';

// Expo kütüphanelerini içe aktarma
import { Ionicons } from '@expo/vector-icons';          // İkon seti
import { LinearGradient } from 'expo-linear-gradient';  // Gradyan arka plan
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Servisler
import ModelService from '../services/ModelService';
import DatabaseService from '../services/DatabaseService.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ekran genişliğini al (responsive tasarım için)
const { width } = Dimensions.get('window');

// Ana bileşen fonksiyonu
export default function SettingsScreen() {
  // State tanımlamaları - Ayar değerlerini yönetir
  const [autoSaveResults, setAutoSaveResults] = useState(true);             // Otomatik kaydetme açık/kapalı
  
  // Analiz modu state'leri
  const [currentAnalysisMode, setCurrentAnalysisMode] = useState('haywoodsloan');
  const [serverHealth, setServerHealth] = useState({ status: 'unknown' });

  // Font yükleme - her zaman çağrılmalı
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  // Component mount - analiz modu ve server durumu yükle
  useEffect(() => {
    loadCurrentMode();
    loadServerHealth();
    loadAutoSaveSetting();
  }, []);

  // AsyncStorage'dan autoSave ayarını yükle
  const loadAutoSaveSetting = async () => {
    try {
      const savedValue = await AsyncStorage.getItem('autoSaveResults');
      if (savedValue !== null) {
        setAutoSaveResults(savedValue === 'true');
      }
    } catch (error) {
      console.error('❌ AutoSave ayarı yükleme hatası:', error);
    }
  };

  // Mevcut analiz modunu yükle
  const loadCurrentMode = () => {
    const mode = ModelService.getCurrentMode();
    setCurrentAnalysisMode(mode);
  };

  // Server sağlık durumunu kontrol et
  const loadServerHealth = async () => {
    try {
      const health = await ModelService.checkHealth();
      setServerHealth(health);
    } catch (error) {
      setServerHealth({ status: 'error', error: error.message });
    }
  };

  // Geçmişi temizleme işlemi - onay dialog'u gösterir
  const handleClearHistory = () => {
    Alert.alert(
      'Geçmişi Temizle',                                                    // Başlık
      'Tüm analiz geçmişi silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?', // Mesaj
      [
        { text: 'İptal', style: 'cancel' },                                // İptal butonu
        { 
          text: 'Sil',                                                     // Silme butonu
          style: 'destructive',                                            // Kırmızı renkte göster
          onPress: async () => {
            try {
              // SQL sunucusundan geçmişi temizle
              await DatabaseService.clearHistory();
            Alert.alert('Başarılı', 'Analiz geçmişi temizlendi.');
            } catch (error) {
              console.error('❌ Geçmiş temizleme hatası:', error);
              Alert.alert('Hata', 'Geçmiş temizlenirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  // Hakkında bilgisi gösterme
  const handleAbout = () => {
    Alert.alert(
      'Hakkında',                                                          // Başlık
      'FakeDetector v2.0.0\n\nBu uygulama, görsel içeriklerin gerçeklik durumunu analiz etmek için geliştirilmiştir.\n\n🤖 Haywoodsloan SwinV2 Model\n⚡ Yüksek doğruluklu AI detection\n🚀 Production ready\n✨ Tek tıkla çalışır\n\nGeliştirici: AEA\nTarih: 2025', // İçerik
      [{ text: 'Tamam' }]                                                  // Tamam butonu
    );
  };

  // Gizlilik politikası gösterme
  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Gizlilik Politikası',                                               // Başlık
      'FakeDetector Gizlilik Politikası\n\n📸 Analiz Görselleri:\n• Analiz için yüklenen fotoğraflar\n• 30 gün saklanır, sonra otomatik silinir\n• Sadece AI analizi için kullanılır\n\n🔒 Veri Güvenliği:\n• HTTPS şifreleme ile güvenli iletim\n• Üçüncü taraf servislerle sınırlı paylaşım\n• GDPR ve KVKK uyumlu\n\n📊 Toplanan Veriler:\n• Cihaz bilgileri (1 yıl saklanır)\n• Kullanım istatistikleri (2 yıl saklanır)\n• Anonim kullanıcı ID\'si\n\n🗑️ Kullanıcı Hakları:\n• Verilerinizi görme, düzeltme, silme\n• İşleme kısıtlama ve itiraz\n• Veri taşınabilirliği\n\n📧 İletişim: a.emreaykut@gmail.com\n\n✅ KVKK ve GDPR Uyumlu', // İçerik
      [{ text: 'Tamam' }]                                                  // Tamam butonu
    );
  };

  // Analiz modu değiştirme
  const handleChangeAnalysisMode = (mode) => {
    if (mode === 'sightengine' || mode === 'haywoodsloan') {
      ModelService.setAnalysisMode(mode);
      setCurrentAnalysisMode(mode);
      loadServerHealth(); // Server durumunu güncelle
      Alert.alert('Başarılı', `Analiz modu ${mode === 'sightengine' ? 'Pro' : 'Standart'} olarak değiştirildi.`);
    }
  };

  // Analiz modu bilgisi
  const handleAnalysisInfo = () => {
    let modeInfo;
    let modeName;
    
    if (currentAnalysisMode === 'sightengine') {
      modeName = 'Pro';
      modeInfo = '🔥 Sightengine Professional API\n• Yüksek doğruluk\n• Ticari kullanım\n• Hızlı analiz\n• Premium servis';
    } else if (currentAnalysisMode === 'haywoodsloan') {
      modeName = 'Standart';
      modeInfo = '🤖 Haywoodsloan SwinV2 Model\n• Open-source\n• Güçlü AI detection\n• 781MB model\n• Render sunucu\n• Ücretsiz kullanım';
    } else {
      modeName = 'Bilinmeyen';
      modeInfo = '❌ Bilinmeyen analiz modu';
    }
    
    Alert.alert(
      'Analiz Modu',
      `✅ ${modeName} aktif\n\n${modeInfo}`,
      [{ text: 'Tamam' }]
    );
  };

  // Yeniden kullanılabilir ayar öğesi bileşeni
  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      {/* Gradyan arka plan */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']} // Beyaz-gri gradyan
        style={styles.settingGradient}
      >
        {/* Sol taraf - ikon ve metinler */}
        <View style={styles.settingLeft}>
          {/* İkon container */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={22} color="#667eea" />
          </View>
          {/* Metin alanı */}
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title || ''}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {/* Sağ taraf - switch veya ok işareti */}
        {rightComponent ? rightComponent : <Ionicons name="chevron-forward" size={18} color="#adb5bd" />}
      </LinearGradient>
    </TouchableOpacity>
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
        {/* Kaydırılabilir içerik alanı */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
                      {/* Buton Stili AppBar */}
            <View style={styles.appBar}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.appBarGradient}
              >
                <Text style={styles.appBarTitle}>Ayarlar</Text>
              </LinearGradient>
            </View>

          {/* Analiz Modları bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analiz Modları</Text>
            
            {/* Analiz Modu Seçimi */}
            <SettingItem
              icon="analytics-outline" 
              title="Analiz Modu"
              subtitle={`${currentAnalysisMode === 'sightengine' ? '🔥 Pro' : '🤖 Standart'} ${serverHealth.status === 'healthy' ? '✅ Ready' : '❌ Error'}`}
              onPress={handleAnalysisInfo}
            />

            {/* Mode Seçimi */}
            <SettingItem
              icon="radio-button-on-outline"
              title="Pro"
              subtitle="Sightengine API - Professional AI detection"
              onPress={() => handleChangeAnalysisMode('sightengine')}
              rightComponent={
                <View style={[styles.radioButton, currentAnalysisMode === 'sightengine' && styles.radioButtonActive]}>
                  {currentAnalysisMode === 'sightengine' && <View style={styles.radioButtonInner} />}
                </View>
              }
            />

            <SettingItem
              icon="radio-button-on-outline"
              title="Standart"
              subtitle="SwinV2 Model"
              onPress={() => handleChangeAnalysisMode('haywoodsloan')}
              rightComponent={
                <View style={[styles.radioButton, currentAnalysisMode === 'haywoodsloan' && styles.radioButtonActive]}>
                  {currentAnalysisMode === 'haywoodsloan' && <View style={styles.radioButtonInner} />}
                </View>
              }
            />



          </View>

          {/* Genel ayarlar bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel</Text>

            {/* Otomatik kaydetme ayarı */}
            <SettingItem
              icon="save-outline"
              title="Otomatik Kaydet"
              subtitle="Analiz sonuçlarını otomatik olarak kaydet"
              rightComponent={
                <Switch
                  value={autoSaveResults}
                  onValueChange={async (value) => {
                    setAutoSaveResults(value);
                    try {
                      await AsyncStorage.setItem('autoSaveResults', value.toString());
                      console.log('✅ AutoSave ayarı kaydedildi:', value);
                    } catch (error) {
                      console.error('❌ AutoSave ayarı kaydetme hatası:', error);
                    }
                  }}
                  trackColor={{ false: '#ccc', true: '#007AFF' }}
                  thumbColor="#fff"
                />
              }
            />
          </View>

          {/* Veri yönetimi bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veri</Text>
            
            {/* Geçmişi temizle ayarı */}
            <SettingItem
              icon="trash-outline"
              title="Geçmişi Temizle"
              subtitle="Tüm analiz geçmişini sil"
              onPress={handleClearHistory}    // Tıklandığında çalışacak fonksiyon
            />
          </View>

          {/* Uygulama bilgileri bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama</Text>
            
            {/* Hakkında ayarı */}
            <SettingItem
              icon="information-circle-outline"
              title="Hakkında"
              subtitle="Uygulama bilgileri ve sürüm"
              onPress={handleAbout}           // Tıklandığında çalışacak fonksiyon
            />

            {/* Gizlilik politikası ayarı */}
            <SettingItem
              icon="shield-outline"
              title="Gizlilik Politikası"
              subtitle="Veri kullanımı ve gizlilik"
              onPress={handlePrivacyPolicy}  // Tıklandığında çalışacak fonksiyon
            />

            {/* Değerlendirme ayarı */}
            <SettingItem
              icon="star-outline"
              title="Uygulamayı Değerlendir"
              subtitle="App Store'da değerlendirin"
              onPress={() => Alert.alert('Teşekkürler', 'Bu özellik yakında eklenecek.')}
            />
          </View>

          {/* Footer bölümü - sürüm bilgisi */}
          <View style={styles.footer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.footerGradient}
            >
              <Text style={styles.footerText}>FakeDetector v2.0.0</Text>
              <Text style={styles.footerSubtext}>© 2024 Tüm hakları saklıdır</Text>
              <Text style={styles.footerSubtext}>🤖 Standart Model - Haywoodsloan SwinV2</Text>
            </LinearGradient>
          </View>
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
    paddingBottom: 30, // Alt boşluk
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

  // Bölüm stilleri
  section: {
    marginBottom: 25, // Bölümler arası boşluk
  },
  sectionTitle: {
    fontSize: 18,         // Büyük font
    fontWeight: 'bold',   // Kalın
    color: 'white',       // Beyaz renk
    marginBottom: 15,     // Alt boşluk
    marginHorizontal: 20, // Yatay margin
  },

  // Ayar öğesi stilleri
  settingItem: {
    marginHorizontal: 15,               // Yatay margin
    marginBottom: 8,                    // Alt boşluk
    borderRadius: 15,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge rengi
    shadowOffset: { width: 0, height: 2 }, // Gölge pozisyonu
    shadowOpacity: 0.1,                 // Gölge saydamlığı
    shadowRadius: 8,                    // Gölge yayılımı
    elevation: 5,                       // Android gölge
  },
  settingGradient: {
    flexDirection: 'row',        // Yatay dizilim
    alignItems: 'center',        // Dikey ortala
    justifyContent: 'space-between', // Aralarında boşluk
    paddingHorizontal: 20,       // Yatay padding
    paddingVertical: 18,         // Dikey padding
  },
  settingLeft: {
    flexDirection: 'row',   // Yatay dizilim
    alignItems: 'center',   // Dikey ortala
    flex: 1,                // Kalan alanı kapla
  },
  iconContainer: {
    width: 40,                                    // Sabit genişlik
    height: 40,                                   // Sabit yükseklik
    borderRadius: 20,                             // Tam yuvarlak
    backgroundColor: 'rgba(102, 126, 234, 0.1)', // Hafif mavi arka plan
    justifyContent: 'center',                     // Dikey ortala
    alignItems: 'center',                         // Yatay ortala
  },
  settingText: {
    marginLeft: 15, // İkondan boşluk
    flex: 1,        // Kalan alanı kapla
  },
  settingTitle: {
    fontSize: 16,         // Orta font
    fontWeight: '600',    // Orta kalın
    color: '#495057',     // Koyu gri
  },
  settingSubtitle: {
    fontSize: 13,     // Küçük font
    color: '#6c757d', // Açık gri
    marginTop: 2,     // Üst boşluk
  },

  // Footer stilleri
  footer: {
    alignItems: 'center',               // Ortala
    marginTop: 30,                      // Üst boşluk
    marginHorizontal: 20,               // Yatay margin
    borderRadius: 15,                   // Yuvarlatılmış köşeler
    overflow: 'hidden',                 // Taşan kısımları gizle
    shadowColor: '#000',                // Gölge
    shadowOffset: { width: 0, height: 2 }, // Gölge pozisyonu
    shadowOpacity: 0.1,                 // Gölge saydamlığı
    shadowRadius: 8,                    // Gölge yayılımı
    elevation: 5,                       // Android gölge
  },
  footerGradient: {
    alignItems: 'center',     // Ortala
    paddingVertical: 20,      // Dikey padding
    paddingHorizontal: 20,    // Yatay padding
    width: '100%',            // Tam genişlik
  },
  footerText: {
    fontSize: 16,         // Orta font
    fontWeight: 'bold',   // Kalın
    color: '#495057',     // Koyu gri
  },
  footerSubtext: {
    fontSize: 14,     // Küçük font
    color: '#6c757d', // Açık gri
    marginTop: 5,     // Üst boşluk
  },

  // Radio button stilleri
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
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