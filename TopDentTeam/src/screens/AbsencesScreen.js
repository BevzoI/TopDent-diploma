import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AbsencesScreen({ navigation }) {
    const { userRole, userToken } = useAuth();
    
    // Тут має бути логіка отримання графіка змін (залишимо її для майбутнього)

    const handlePress = (target) => {
        navigation.navigate(target);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Управління Відсутністю</Text>

            {/* Дії для ПЕРСОНАЛУ */}
            <TouchableOpacity style={styles.tile} onPress={() => handlePress('SubmitAbsence')}>
                <Ionicons name="send" size={24} color="#4682B4" />
                <Text style={styles.tileText}>Подати нову заявку на відсутність</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tile} onPress={() => handlePress('MyRequests')}>
                <Ionicons name="list" size={24} color="#4682B4" />
                <Text style={styles.tileText}>Переглянути мої заявки</Text>
            </TouchableOpacity>

            {/* Дії для АДМІНА (якщо він на цьому екрані) */}
            {userRole === 'admin' && (
                <TouchableOpacity style={[styles.tile, styles.adminTile]} onPress={() => handlePress('AdminAbsences')}>
                    <Ionicons name="alert-circle" size={24} color="#ff6f61" />
                    <Text style={[styles.tileText, { color: '#ff6f61' }]}>Розглянути заявки (Admin)</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    tile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    adminTile: {
        borderLeftWidth: 5,
        borderLeftColor: '#ff6f61',
    },
    tileText: {
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '500',
    },
});