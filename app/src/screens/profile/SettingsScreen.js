import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/* ── Theme pill ─────────────────────────────────────────────────────────── */
function ThemePill({ mode, icon, label, active, onPress, cyan }) {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.themePill,
                active && {
                    backgroundColor: cyan + (isDark ? '1E' : '16'),
                    borderColor: cyan + '44',
                },
                !active && {
                    borderColor: 'transparent',
                },
            ]}
        >
            <MaterialIcon name={icon} size={14} color={active ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.30)')} />
            <Text style={[
                styles.themePillTxt,
                { color: active ? cyan : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)') },
                active && { fontWeight: '800' },
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

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
    const { theme, themeMode, toggleTheme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const sheetBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const themeBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

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
                </View>

                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>APPEARANCE</Text>
                <View style={[styles.themeTrack, { backgroundColor: themeBg, borderColor: sheetBord, marginHorizontal: 4, marginBottom: 12 }]}>
                    <ThemePill mode="light" icon="sun" label="Light" active={themeMode === 'light'} onPress={() => toggleTheme('light')} cyan={cyan} />
                    <ThemePill mode="dark" icon="moon" label="Dark" active={themeMode === 'dark'} onPress={() => toggleTheme('dark')} cyan={cyan} />
                    <ThemePill mode="system" icon="monitor" label="System" active={themeMode === 'system'} onPress={() => toggleTheme('system')} cyan={cyan} />
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
    themeTrack: {
        flexDirection: 'row',
        borderRadius: 16,
        borderWidth: 1,
        padding: 4,
        gap: 4,
    },
    themePill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    themePillTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
    dangerZone: {
        marginTop: 40,
        padding: 16,
        alignItems: 'center',
    },
    dangerText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
