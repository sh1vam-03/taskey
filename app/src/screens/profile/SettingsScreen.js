import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

const SettingItem = ({ icon, label, value, onValueChange, type = 'toggle', onPress }) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={type === 'toggle'}
        >
            <View style={[styles.settingIconContainer, { backgroundColor: theme.cyanDim }]}>
                <Icon name={icon} size={20} color={theme.cyan} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: theme.border, true: theme.cyan }}
                    thumbColor="#fff"
                />
            ) : (
                <Icon name="chevron-right" size={20} color={theme.textDim} />
            )}
        </TouchableOpacity>
    );
};

export default function SettingsScreen({ navigation }) {
    const [notifications, setNotifications] = useState(true);
    const [aiAutoSync, setAiAutoSync] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>Preferences</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="bell"
                        label="Push Notifications"
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                    <SettingItem
                        icon="moon"
                        label="Dark Mode"
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>AI & Productivity</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="cpu"
                        label="Smart Scheduling"
                        value={aiAutoSync}
                        onValueChange={setAiAutoSync}
                    />
                    <SettingItem
                        icon="sliders"
                        label="AI Model Preference"
                        type="link"
                        onPress={() => console.log('Model settings')}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>Account</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="user"
                        label="Profile Information"
                        type="link"
                        onPress={() => console.log('Profile edit')}
                    />
                    <SettingItem
                        icon="shield"
                        label="Privacy & Security"
                        type="link"
                        onPress={() => console.log('Security')}
                    />
                </View>

                <TouchableOpacity style={styles.dangerZone}>
                    <Text style={styles.dangerText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    backBtn: { padding: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 16 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 16,
        marginLeft: 4,
    },
    section: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingLabel: { flex: 1, fontSize: 15 },
    dangerZone: {
        marginTop: 40,
        padding: 16,
        alignItems: 'center',
    },
    dangerText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
