import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// TensorFlow.js Web import
import * as tf from '@tensorflow/tfjs';

// React Native için fetch polyfill
global.fetch = fetch;
global.Response = Response;
global.Headers = Headers;
global.Request = Request;

// Screens
import AnalysisScreen from './screens/AnalysisScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    // TensorFlow.js Web initializasyon
    const initTensorFlow = async () => {
      try {
        await tf.ready();
        console.log('TensorFlow.js Web initialized');
      } catch (error) {
        console.error('TensorFlow.js initialization failed:', error);
      }
    };

    initTensorFlow();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Analysis') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Analysis" 
          component={AnalysisScreen}
          options={{
            tabBarLabel: 'Analiz',
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            tabBarLabel: 'Geçmiş',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Ayarlar',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
