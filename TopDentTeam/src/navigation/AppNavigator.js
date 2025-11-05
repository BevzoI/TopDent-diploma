import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons'; // Використовуємо Ionicons для іконок

// Імпортуйте екрани, які ви створите
import HomeScreen from '../screens/HomeScreen';
import ChatsScreen from '../screens/ChatsScreen';
import AbsencesScreen from '../screens/AbsencesScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { userRole } = useAuth(); // Отримання ролі користувача

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Головна':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Чати':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Графік':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Адмін':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            case 'Профіль':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4682B4', // Ваш корпоративний колір
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Головна" component={HomeScreen} />
      <Tab.Screen name="Чати" component={ChatsScreen} />
      <Tab.Screen name="Графік" component={AbsencesScreen} />

      {/* УМОВНИЙ РЕНДЕРИНГ: Показуємо вкладку "Адмін" лише адміністраторам */}
      {userRole === 'admin' && (
        <Tab.Screen 
          name="Адмін" 
          component={AdminPanelScreen} 
          options={{ title: 'Адмін-Панель' }}
        />
      )}
      
      <Tab.Screen name="Профіль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}