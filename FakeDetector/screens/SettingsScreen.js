import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveResults, setAutoSaveResults] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleClearHistory = () => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm analiz geçmişi silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Başarılı', 'Analiz geçmişi temizlendi.');
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Hakkında',
      'FakeDetector v1.0.0\n\nBu uygulama, görsel içeriklerin gerçeklik durumunu analiz etmek için geliştirilmiştir.\n\nGeliştirici: AEA\nTarih: 2025',
      [{ text: 'Tamam' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Gizlilik Politikası',
      'Bu uygulama, analiz edilen görselleri yalnızca analiz sürecinde kullanır. Verileriniz üçüncü taraflarla paylaşılmaz.',
      [{ text: 'Tamam' }]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.settingGradient}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={22} color="#667eea" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title || ''}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightComponent ? rightComponent : <Ionicons name="chevron-forward" size={18} color="#adb5bd" />}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Ayarlar</Text>
            <Text style={styles.subtitle}>Uygulama tercihlerinizi yönetin</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel</Text>
            
            <SettingItem
              icon="notifications-outline"
              title="Bildirimler"
              subtitle="Analiz sonuçları için bildirim al"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#ccc', true: '#007AFF' }}
                  thumbColor="#fff"
                />
              }
            />

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veri</Text>
            
            <SettingItem
              icon="trash-outline"
              title="Geçmişi Temizle"
              subtitle="Tüm analiz geçmişini sil"
              onPress={handleClearHistory}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama</Text>
            
            <SettingItem
              icon="information-circle-outline"
              title="Hakkında"
              subtitle="Uygulama bilgileri ve sürüm"
              onPress={handleAbout}
            />

            <SettingItem
              icon="shield-outline"
              title="Gizlilik Politikası"
              subtitle="Veri kullanımı ve gizlilik"
              onPress={handlePrivacyPolicy}
            />

            <SettingItem
              icon="star-outline"
              title="Uygulamayı Değerlendir"
              subtitle="App Store'da değerlendirin"
              onPress={() => Alert.alert('Teşekkürler', 'Bu özellik yakında eklenecek.')}
            />
          </View>

          <View style={styles.footer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.footerGradient}
            >
              <Text style={styles.footerText}>FakeDetector v1.0.0</Text>
              <Text style={styles.footerSubtext}>© 2024 Tüm hakları saklıdır</Text>
            </LinearGradient>
          </View>
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
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  settingItem: {
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  footerGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
}); 