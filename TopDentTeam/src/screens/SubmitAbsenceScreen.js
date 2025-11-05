import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// !!! Замініть на свій IP:ПОРТ !!!
const API_BASE_URL = 'http://192.168.0.121:8000'; 

// Варіанти відсутності для вибору
const ABSENCE_TYPES = ['Dovolená', 'Nemoc', 'Volno', 'Jiné'];

export default function SubmitAbsenceScreen({ navigation }) {
    const { userToken } = useAuth(); // 
    const [startDate, setStartDate] = useState(''); // Формат: YYYY-MM-DD
    const [endDate, setEndDate] = useState('');   // Формат: YYYY-MM-DD
    const [reason, setReason] = useState('');
    const [absenceType, setAbsenceType] = useState(ABSENCE_TYPES[0]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason) {
            Alert.alert('Помилка', 'Будь ласка, заповніть всі поля.');
            return;
        }

        // Перевірка формату дати (дуже проста)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            Alert.alert('Помилка', 'Використовуйте формат дати: YYYY-MM-DD.');
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                start_date: startDate,
                end_date: endDate,
                reason: reason,
                absence_type: absenceType,
            };

            await axios.post(`${API_BASE_URL}/absences/`, data, {
                // У реальному проєкті:
                // headers: { Authorization: userToken }
            });

            Alert.alert('Успіх', 'Вашу заявку надіслано на розгляд адміністратору!');
            navigation.goBack(); // Повертаємось до списку або головного екрану
        } catch (error) {
            console.error('Submission Error:', error.response?.data || error);
            Alert.alert('Помилка', 'Не вдалося надіслати заявку. Перевірте з\'єднання.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Подача Заявки на Відсутність 🌴</Text>

            <Text style={styles.label}>Тип відсутності:</Text>
            <View style={styles.typeContainer}>
                {ABSENCE_TYPES.map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.typeButton, absenceType === type && styles.typeButtonActive]}
                        onPress={() => setAbsenceType(type)}
                        disabled={isLoading}
                    >
                        <Text style={[styles.typeText, absenceType === type && styles.typeTextActive]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Дата початку (YYYY-MM-DD):</Text>
            <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="Наприклад: 2025-12-01"
            />

            <Text style={styles.label}>Дата закінчення (YYYY-MM-DD):</Text>
            <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="Наприклад: 2025-12-05"
            />

            <Text style={styles.label}>Причина / Коментар:</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Вкажіть причину відсутності або деталі"
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity 
                style={[styles.button, isLoading && { backgroundColor: 'gray' }]} 
                onPress={handleSubmit} 
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? 'Надсилання...' : 'Надіслати на розгляд'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#4682B4' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 5, marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4682B4',
        marginRight: 10,
        marginTop: 5,
    },
    typeButtonActive: {
        backgroundColor: '#4682B4',
    },
    typeText: {
        color: '#4682B4',
        fontWeight: '500',
    },
    typeTextActive: {
        color: 'white',
    },
    button: {
        backgroundColor: '#4CAF50', // Зелена кнопка для відправки
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});