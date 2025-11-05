import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// Не забудьте встановити axios: npm install axios
import axios from 'axios'; 
// Припустимо, ви використовуєте Context для зберігання стану автентифікації
import { useAuth } from '../context/AuthContext'; 

const API_URL = 'http://192.168.0.121:8000/auth/login'; // IP для тестування

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth(); // Функція з контексту для входу

  const handleLogin = async () => {
    try {
      // 1. Запит до вашого бекенду FastAPI
      const response = await axios.post(API_URL, {
        username,
        password,
      });

      // 2. Отримання токена та ролі
      const { access_token, token_type, role } = response.data;
      
      // 3. Збереження даних і перехід у додаток
      signIn(`${token_type} ${access_token}`, role); 

    } catch (error) {
      // Обробка помилок (неправильні дані, помилка мережі)
      console.error('Login Error:', error);
      Alert.alert('Помилка входу', 'Неправильне ім\'я користувача або пароль.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TopDentTeam</Text>
      <TextInput
        style={styles.input}
        placeholder="Ім'я користувача (логін)"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Увійти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 8 },
  button: { backgroundColor: '#4682B4', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});