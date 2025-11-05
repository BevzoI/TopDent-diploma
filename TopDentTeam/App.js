import React, { useMemo, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator'; // Потрібно створити
import { AuthContext } from './src/context/AuthContext'; // Потрібно створити
import AsyncStorage from '@react-native-async-storage/async-storage'; // npm install @react-native-async-storage/async-storage

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return { ...prevState, userToken: action.token, isLoading: false, userRole: action.role };
        case 'SIGN_IN':
          // Зберігаємо токен та роль в AsyncStorage
          AsyncStorage.setItem('userToken', action.token);
          AsyncStorage.setItem('userRole', action.role);
          return { ...prevState, isSignout: false, userToken: action.token, userRole: action.role };
        case 'SIGN_OUT':
          AsyncStorage.clear();
          return { ...prevState, isSignout: true, userToken: null, userRole: null };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userRole: null, // Додаємо поле для ролі
    }
  );

  // Ініціалізація, відновлення токена з пам'яті
  // ... (логіка useEffect для RESTORE_TOKEN)

  const authContext = useMemo(
    () => ({
      signIn: (token, role) => dispatch({ type: 'SIGN_IN', token, role }),
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      userToken: state.userToken,
      userRole: state.userRole,
    }),
    [state.userToken, state.userRole]
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.userToken == null ? (
            // Користувач не залогінений
            <Stack.Screen name="Auth" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            // Користувач залогінений, переходимо до основного навігатора додатку
            <Stack.Screen name="App" component={AppNavigator} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}