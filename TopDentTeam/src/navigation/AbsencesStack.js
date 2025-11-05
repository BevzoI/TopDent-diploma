import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AbsencesScreen from '../screens/AbsencesScreen'; // Головний екран
import SubmitAbsenceScreen from '../screens/SubmitAbsenceScreen'; // Форма подачі
import AdminAbsencesScreen from '../screens/AdminAbsencesScreen'; // Панель адміна

const Stack = createNativeStackNavigator();

export default function AbsencesStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="AbsenceMain" component={AbsencesScreen} options={{ title: 'Графік і Заявки' }} />
            <Stack.Screen name="SubmitAbsence" component={SubmitAbsenceScreen} options={{ title: 'Подати Заявку' }} />
            <Stack.Screen name="AdminAbsences" component={AdminAbsencesScreen} options={{ title: 'Розгляд Заявок' }} />
        </Stack.Navigator>
    );
}