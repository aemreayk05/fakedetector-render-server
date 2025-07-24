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
  TextInput,        // Metin girişi için
} from 'react-native';

// Expo kütüphanelerini içe aktarma
import { Ionicons } from '@expo/vector-icons';          // İkon seti
import { LinearGradient } from 'expo-linear-gradient';  // Gradyan arka plan

// Servisler
import ModelService from '../services/ModelService';

// Ekran genişliğini al (responsive tasarım için)
const { width } = Dimensions.get('window');

// Ana bileşen fonksiyonu
export default function SettingsScreen() {
  // State tanımlamaları - Ayar değerlerini yönetir
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);  // Bildirimler açık/kapalı
  const [autoSaveResults, setAutoSaveResults] = useState(true);             // Otomatik kaydetme açık/kapalı
  const [darkMode, setDarkMode] = useState(false);                          // Karanlık mod açık/kapalı
  
  // Analiz modu state'leri
  const [currentAnalysisMode, setCurrentAnalysisMode] = useState('sightengine');
  const [haywoodsloanServerUrl, setHaywoodsloanServerUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [serverHealth, setServerHealth] = useState({ status: 'unknown' });

  // Component mount - analiz modu ve server durumu yükle
  useEffect(() => {
    loadCurrentMode();
    loadServerHealth();
  }, []);

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
          onPress: () => {
            // Gerçek uygulamada burada veritabanından veri silinir
            Alert.alert('Başarılı', 'Analiz geçmişi temizlendi.');
          }
        }
      ]
    );
  };

  // Hakkında bilgisi gösterme
  const handleAbout = () => {
    Alert.alert(
      'Hakkında',                                                          // Başlık
      'FakeDetector v2.0.0\n\nBu uygulama, görsel içeriklerin gerçeklik durumunu analiz etmek için geliştirilmiştir.\n\n🔥 Sightengine Professional API\n⚡ Yüksek doğruluklu AI detection\n🚀 Production ready\n✨ Tek tıkla çalışır\n\nGeliştirici: AEA\nTarih: 2025', // İçerik
      [{ text: 'Tamam' }]                                                  // Tamam butonu
    );
  };

  // Gizlilik politikası gösterme
  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Gizlilik Politikası',                                               // Başlık
      'Bu uygulama, analiz edilen görselleri yalnızca analiz sürecinde kullanır. Verileriniz güvende.\n\n🔒 Sightengine Professional API\n• Görsel sadece analiz için gönderilir\n• HTTPS ile güvenli iletim\n• Veriler saklanmaz\n• Üçüncü taraflarla paylaşılmaz\n\n✅ GDPR uyumlu', // İçerik
      [{ text: 'Tamam' }]                                                  // Tamam butonu
    );
  };

  // Analiz modu değiştirme
  const handleChangeAnalysisMode = (mode) => {
    if (ModelService.setAnalysisMode(mode)) {
      setCurrentAnalysisMode(mode);
      loadServerHealth(); // Server durumunu güncelle
      Alert.alert('Başarılı', `Analiz modu ${mode === 'sightengine' ? 'Sightengine' : 'Haywoodsloan'} olarak değiştirildi.`);
    }
  };

  // Haywoodsloan server URL ayarlama
  const handleHaywoodsloanUrlSetting = () => {
    setShowUrlInput(true);
  };

  const handleSaveHaywoodsloanUrl = () => {
    if (haywoodsloanServerUrl.trim()) {
      ModelService.setHaywoodsloanServerUrl(haywoodsloanServerUrl.trim());
      setShowUrlInput(false);
      loadServerHealth(); // Server durumunu güncelle
      Alert.alert('Başarılı', 'Haywoodsloan server URL kaydedildi.');
    } else {
      Alert.alert('Hata', 'Geçerli bir URL girin.');
    }
  };

  // Analiz modu bilgisi
  const handleAnalysisInfo = () => {
    const modeInfo = currentAnalysisMode === 'sightengine' 
      ? '🔥 Sightengine Professional API\n• Yüksek doğruluk\n• Ticari kullanım\n• Hızlı analiz'
      : '🤖 Haywoodsloan SwinV2 Model\n• Open-source\n• Güçlü AI detection\n• 781MB model';
    
    Alert.alert(
      'Analiz Modu',
      `✅ ${currentAnalysisMode === 'sightengine' ? 'Sightengine' : 'Haywoodsloan'} aktif\n\n${modeInfo}`,
      [{ text: 'Tamam' }]
    );
  };

  // Sadeleştirildi - helper fonksiyonlar gereksiz

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

  // UI render fonksiyonu
  return (
    // Ana container - gradyan arka plan
    <LinearGradient
      colors={['#667eea', '#764ba2']} // Mavi-mor gradyan
      style={styles.container}
    >
      {/* Güvenli alan wrapper */}
      <SafeAreaView style={styles.safeArea}>
        {/* Kaydırılabilir içerik alanı */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Başlık bölümü */}
          <View style={styles.header}>
            <Text style={styles.title}>Ayarlar</Text>
            <Text style={styles.subtitle}>Uygulama tercihlerinizi yönetin</Text>
          </View>

          {/* Analiz Modları bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analiz Modları</Text>
            
            {/* Analiz Modu Seçimi */}
            <SettingItem
              icon="analytics-outline" 
              title="Analiz Modu"
              subtitle={`${currentAnalysisMode === 'sightengine' ? '🔥 Sightengine' : '🤖 Haywoodsloan'} ${serverHealth.status === 'healthy' ? '✅ Ready' : '❌ Error'}`}
              onPress={handleAnalysisInfo}
            />

            {/* Mode Seçimi */}
            <SettingItem
              icon="radio-button-on-outline"
              title="Sightengine API"
              subtitle="Professional AI detection - Yüksek doğruluk"
              onPress={() => handleChangeAnalysisMode('sightengine')}
              rightComponent={
                <View style={[styles.radioButton, currentAnalysisMode === 'sightengine' && styles.radioButtonActive]}>
                  {currentAnalysisMode === 'sightengine' && <View style={styles.radioButtonInner} />}
                </View>
              }
            />

            <SettingItem
              icon="radio-button-on-outline"
              title="Haywoodsloan Server"
              subtitle="SwinV2 Model - Open-source AI detection"
              onPress={() => handleChangeAnalysisMode('haywoodsloan')}
              rightComponent={
                <View style={[styles.radioButton, currentAnalysisMode === 'haywoodsloan' && styles.radioButtonActive]}>
                  {currentAnalysisMode === 'haywoodsloan' && <View style={styles.radioButtonInner} />}
                </View>
              }
            />

            {/* Haywoodsloan Server URL - sadece haywoodsloan seçiliyse göster */}
            {currentAnalysisMode === 'haywoodsloan' && (
              <SettingItem
                icon="server-outline"
                title="Server URL"
                subtitle={haywoodsloanServerUrl || "Server URL ayarlanmamış"}
                onPress={handleHaywoodsloanUrlSetting}
              />
            )}

            {/* URL Input - koşullu göster */}
            {showUrlInput && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://your-ngrok-url.ngrok.io"
                  value={haywoodsloanServerUrl}
                  onChangeText={setHaywoodsloanServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveHaywoodsloanUrl}>
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>

          {/* Genel ayarlar bölümü */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel</Text>
            
            {/* Bildirimler ayarı */}
            <SettingItem
              icon="notifications-outline"
              title="Bildirimler"
              subtitle="Analiz sonuçları için bildirim al"
              rightComponent={
                <Switch
                  value={notificationsEnabled}                            // Mevcut durum
                  onValueChange={setNotificationsEnabled}                 // Değişiklik fonksiyonu
                  trackColor={{ false: '#ccc', true: '#007AFF' }}        // Track renkleri
                  thumbColor="#fff"                                       // Thumb rengi
                />
              }
            />

            {/* Otomatik kaydetme ayarı */}
            <SettingItem
              icon="save-outline"
              title="Otomatik Kaydet"
              subtitle="Analiz sonuçlarını otomatik olarak kaydet"
              rightComponent={
                <Switch
                  value={autoSaveResults}
                  onValueChange={setAutoSaveResults}
                  trackColor={{ false: '#ccc', true: '#007AFF' }}
                  thumbColor="#fff"
                />
              }
            />

            {/* Karanlık mod ayarı */}
            <SettingItem
              icon="moon-outline"
              title="Karanlık Mod"
              subtitle="Koyu tema kullan"
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
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
              <Text style={styles.footerSubtext}>🔥 Sightengine API destekli</Text>
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

  // URL Input stilleri
  urlInputContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  urlInputGradient: {
    padding: 20,
  },
  urlInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#495057',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  urlInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urlSaveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  urlSaveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  urlCancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  urlCancelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Sightengine Config Input stilleri
  configInputContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  configInputGradient: {
    padding: 20,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  configDescription: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 15,
  },
  configInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#495057',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  configButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  configSaveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.6,
    alignItems: 'center',
  },
  configSaveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  configCancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.35,
    alignItems: 'center',
  },
  configCancelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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

  // Input container stilleri
  inputContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#495057',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 