import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/auth.store';
import { logout as apiLogout } from '../../api/auth.api';
import { getSettings, updateSettings } from '../../api/ai.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ModelSelector from '../../components/ai/ModelSelector';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

export default function ProfileScreen({ navigation }) {
    const { user } = useAuthStore();
    const { theme, toggleTheme, themeMode, isDark } = useTheme();
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [isModelSelectorVisible, setIsModelSelectorVisible] = useState(false);

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await getSettings();
            const settings = data?.data || data;
            if (settings?.chatModel) {
                setSelectedModel(settings.chatModel);
            }
        } catch (err) {
            console.log('Failed to fetch AI settings', err);
        }
    };

    const handleModelSelect = async (m) => {
        setSelectedModel(m);
        setIsModelSelectorVisible(false);
        try {
            await updateSettings({ chatModel: m });
        } catch (err) {
            console.log('Failed to update AI settings', err);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.log('Logout API failed, clearing local state anyway');
        } finally {
            logout();
        }
    };

    const confirmLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: handleLogout },
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <Text style={[styles.headerTitle, { color: theme.text, borderBottomColor: theme.border }]}>Profile</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* User Card */}
                <Card style={[styles.userCard, { backgroundColor: theme.surface }]}>
                    <View style={[styles.avatar, { backgroundColor: theme.cyanDim, borderColor: theme.cyan }]}>
                        <Text style={[styles.avatarText, { color: theme.cyan }]}>{getInitials(user?.name)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'User Name'}</Text>
                        <Text style={[styles.userEmail, { color: theme.textDim }]}>{user?.email || 'email@example.com'}</Text>
                        <View style={{ marginTop: 8 }}>
                            <Badge text={user?.plan || 'FREE PLAN'} color={theme.surface} bgColor={theme.cyan} />
                        </View>
                    </View>
                </Card>

                {/* AI Preferences */}
                <Text style={[styles.sectionTitle, { color: theme.textDim }]}>AI Preferences</Text>
                <Card style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[styles.settingRow, { borderBottomColor: theme.border }]}
                        onPress={() => setIsModelSelectorVisible(true)}
                    >
                        <View style={styles.settingLeft}>
                            <Icon name="cpu" size={20} color={theme.text} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.text }]}>Default AI Model</Text>
                        </View>
                        <View style={styles.settingRight}>
                            <Text style={[styles.settingValue, { color: theme.textDim }]}>{selectedModel}</Text>
                            <Icon name="chevron-right" size={20} color={theme.textDim} />
                        </View>
                    </TouchableOpacity>
                </Card>

                {/* Subscription */}
                <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Subscription</Text>
                <Card style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
                    <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.settingLeft}>
                            <Icon name="credit-card" size={20} color={theme.cyan} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.text }]}>Current Plan: {user?.plan || 'FREE'}</Text>
                        </View>
                        <Text style={[styles.creditsText, { color: theme.success }]}>{user?.credits || 0} Credits</Text>
                    </View>
                    <Button
                        title="Manage Billing & Upgrade"
                        variant="outline"
                        onPress={() => navigation.navigate('Billing')}
                        style={{ marginTop: 16 }}
                    />
                </Card>

                {/* App Settings */}
                <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Settings</Text>
                <Card style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
                    <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.settingLeft}>
                            <Icon name="moon" size={20} color={theme.text} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={() => toggleTheme(isDark ? 'light' : 'dark')}
                            trackColor={{ false: theme.border, true: theme.cyan }}
                            thumbColor={theme.text}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.themeModeToggle, { borderTopWidth: 1, borderTopColor: theme.border }]}
                        onPress={() => {
                            const modes = ['light', 'dark', 'system'];
                            const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
                            toggleTheme(modes[nextIndex]);
                        }}
                    >
                        <Text style={[styles.settingText, { color: theme.text }]}>Theme Mode</Text>
                        <Text style={[styles.settingValue, { color: theme.cyan, textTransform: 'capitalize' }]}>{themeMode}</Text>
                    </TouchableOpacity>
                </Card>

                {/* Danger Zone */}
                <Text style={[styles.sectionTitle, { color: theme.error, marginTop: 40 }]}>Danger Zone</Text>
                <Card style={[styles.settingsCard, { borderStyle: 'solid', borderWidth: 1, borderColor: theme.error, backgroundColor: theme.surface }]}>
                    <TouchableOpacity style={styles.settingRow} onPress={confirmLogout}>
                        <View style={styles.settingLeft}>
                            <Icon name="log-out" size={20} color={theme.error} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.error }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </Card>

            </ScrollView>

            {isModelSelectorVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBottom}>
                        <ModelSelector
                            selectedModel={selectedModel}
                            onSelect={handleModelSelect}
                            onClose={() => setIsModelSelectorVisible(false)}
                        />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: 'bold', padding: 16, borderBottomWidth: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1 },
    avatarText: { fontSize: typography.fontSizes.xl, fontWeight: 'bold' },
    userInfo: { flex: 1 },
    userName: { fontSize: typography.fontSizes.lg, fontWeight: 'bold', marginBottom: 4 },
    userEmail: { fontSize: typography.fontSizes.sm },
    sectionTitle: { fontSize: typography.fontSizes.sm, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, marginTop: 16 },
    settingsCard: { padding: 0, overflow: 'hidden' },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    themeModeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingIcon: { marginRight: 16 },
    settingText: { fontSize: typography.fontSizes.md, fontWeight: '500' },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    settingValue: { fontSize: typography.fontSizes.sm, marginRight: 8 },
    creditsText: { fontWeight: 'bold' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 100 },
    modalBottom: { width: '100%' }
});
