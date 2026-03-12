import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import AiScreen from '../screens/ai/AiScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BehaviorScreen from '../screens/behavior/BehaviorScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import BillingScreen from '../screens/profile/BillingScreen';

import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.cyan,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') iconName = 'home';
                    else if (route.name === 'Tasks') iconName = 'check-square';
                    else if (route.name === 'Schedule') iconName = 'calendar';
                    else if (route.name === 'AiChat') iconName = 'message-circle';
                    else if (route.name === 'Profile') iconName = 'user';
                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Schedule" component={ScheduleScreen} />
            <Tab.Screen name="AiChat" component={AiScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Behavior" component={BehaviorScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="Billing" component={BillingScreen} />
        </Stack.Navigator>
    );
}
