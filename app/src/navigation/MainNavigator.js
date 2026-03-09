import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Screens that are NOT in tabs
import CalendarScreen from '../screens/calendar/CalendarScreen';
import BillingScreen from '../screens/profile/BillingScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChatScreen from '../screens/ai/sections/ChatScreen';
import CreateTaskScreen from '../screens/tasks/sections/CreateTaskScreen';
import TaskDetailScreen from '../screens/tasks/sections/TaskDetailScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Billing" component={BillingScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen
                name="CreateTask"
                component={CreateTaskScreen}
                options={{
                    presentation: 'transparentModal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        </Stack.Navigator>
    );
}
