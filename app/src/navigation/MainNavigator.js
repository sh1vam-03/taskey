import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Screens that are NOT in tabs
import CalendarScreen from '../screens/calendar/CalendarScreen';
import BillingScreen from '../screens/profile/BillingScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChatScreen from '../screens/ai/sections/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Billing" component={BillingScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}
