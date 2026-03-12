import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../theme/colors';

// Screens
import TasksScreen from '../screens/tasks/TasksScreen';
import ScheduleScreen from '../screens/schedule/section/ScheduleScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TodayScreen from '../screens/today/TodayScreen';
import AiScreen from '../screens/ai/AiScreen';

import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            backBehavior="initialRoute"
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Schedule" component={ScheduleScreen} />
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Today" component={TodayScreen} />
            <Tab.Screen name="AI" component={AiScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        paddingTop: 10,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginBottom: Platform.OS === 'ios' ? 0 : 5,
    },
    homeIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -30,
        borderWidth: 4,
        borderColor: colors.bg,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    homeIconActive: {
        backgroundColor: colors.cyan,
        borderColor: colors.bg,
    },
});
