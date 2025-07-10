import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  const mockHistoryData = [
    {
      id: '1',
      imageUri: 'https://picsum.photos/200/200?random=1',
      prediction: 'Gerçek',
      confidence: 85,
      timestamp: '2024-01-15T10:30:00Z',
      userFeedback: null,
    },
    {
      id: '2',
      imageUri: 'https://picsum.photos/200/200?random=2',
      prediction: 'Sahte',
      confidence: 92,
      timestamp: '2024-01-15T09:15:00Z',
      userFeedback: 'correct',
    },
    {
      id: '3',
      imageUri: 'https://picsum.photos/200/200?random=3',
      prediction: 'Gerçek',
      confidence: 78,
      timestamp: '2024-01-14T16:45:00Z',
      userFeedback: 'incorrect',
    },
    {
      id: '4',
      imageUri: 'https://picsum.photos/200/200?random=4',
      prediction: 'Sahte',
      confidence: 89,
      timestamp: '2024-01-14T14:20:00Z',
      userFeedback: null,
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

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = () => {
    // In a real app, this would load from SQLite database
    setHistoryData(mockHistoryData);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadHistoryData();
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUserFeedback = (itemId, feedback) => {
    setHistoryData(prevData =>
      prevData.map(item =>
        item.id === itemId ? { ...item, userFeedback: feedback } : item
      )
    );
  };

  const renderHistoryItem = ({ item, index }) => (
    <Animated.View style={[styles.historyItem, { opacity: 1 }]}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.itemGradient}
      >
        <View style={styles.itemContent}>
          <View style={styles.imageSection}>
            <Image source={{ uri: item.imageUri }} style={styles.historyImage} />
            <View style={styles.imageOverlay}>
              <Ionicons name="image" size={16} color="white" />
            </View>
          </View>
          
          <View style={styles.historyDetails}>
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
            
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Güven:</Text>
              <Text style={styles.confidenceValue}>%{item.confidence || 0}</Text>
            </View>
            
            <Text style={styles.timestamp}>{item.timestamp ? formatDate(item.timestamp) : 'Tarih bilinmiyor'}</Text>
            
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>Doğru mu?</Text>
              <View style={styles.feedbackButtons}>
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
                
                <TouchableOpacity
                  style={[
                    styles.feedbackButton,
                    { marginRight: 0 },
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

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Geçmiş Analizler</Text>
          <Text style={styles.subtitle}>Son analizlerinizi görüntüleyin</Text>
        </View>
        
        {historyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.emptyGradient}
            >
              <Ionicons name="time-outline" size={60} color="#6c757d" />
              <Text style={styles.emptyText}>Henüz analiz geçmişi yok</Text>
              <Text style={styles.emptySubtext}>İlk analizinizi yapmak için Analiz sekmesini kullanın</Text>
            </LinearGradient>
          </View>
        ) : (
          <FlatList
            data={historyData}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor="white"
                colors={['#667eea']}
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  historyItem: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  itemGradient: {
    padding: 20,
  },
  itemContent: {
    flexDirection: 'row',
  },
  imageSection: {
    position: 'relative',
    marginRight: 15,
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
  },
  historyDetails: {
    flex: 1,
  },
  predictionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  predictionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  realBadge: {
    backgroundColor: '#d4edda',
  },
  fakeBadge: {
    backgroundColor: '#f8d7da',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  real: {
    color: '#155724',
  },
  fake: {
    color: '#721c24',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
  timestamp: {
    fontSize: 12,
    color: '#adb5bd',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '500',
  },
  feedbackButtons: {
    flexDirection: 'row',
  },
  feedbackButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 8,
  },
  feedbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedCorrect: {
    transform: [{ scale: 1.05 }],
  },
  selectedIncorrect: {
    transform: [{ scale: 1.05 }],
  },
  feedbackButtonText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#6c757d',
    fontWeight: '600',
  },
  selectedFeedbackText: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 