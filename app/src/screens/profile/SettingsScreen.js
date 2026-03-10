import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/auth.store';
import { updateProfile, requestSecurityOtp, changePassword, deleteAccount, logoutAll } from '../../api/auth.api';

// ── THEME PILL ──────────────────────────────────────────────────────────
function ThemePill({ mode, icon, label, active, onPress, cyan }) {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.themePill, active && { backgroundColor: cyan + (isDark ? '1E' : '16'), borderColor: cyan + '44' }, !active && { borderColor: 'transparent' }]}
        >
            <MaterialIcon name={icon} size={14} color={active ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.30)')} />
            <Text style={[styles.themePillTxt, { color: active ? cyan : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)') }, active && { fontWeight: '800' }]}>{label}</Text>
        </TouchableOpacity>
    );
}

// ── SETTING ITEM ────────────────────────────────────────────────────────
const SettingItem = ({ icon, label, value, subtext, onValueChange, type = 'toggle', disabled, onPress, danger }) => {
    const { theme, isDark } = useTheme();
    const rightSide = () => {
        if (type === 'toggle') return <Switch value={value} onValueChange={onValueChange} disabled={disabled} trackColor={{ false: theme.border, true: theme.cyan }} thumbColor="#fff" />;
        if (type === 'info') return <Text style={{ color: theme.textDim, fontSize: 13, opacity: disabled ? 0.7 : 1 }}>{subtext}</Text>;
        if (type === 'link') return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{subtext && <Text style={{ color: theme.textDim, fontSize: 13 }}>{subtext}</Text>}<Icon name="chevron-right" size={20} color={theme.textDim} /></View>;
        return null;
    };

    return (
        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border, opacity: disabled ? 0.6 : 1 }]} onPress={onPress} disabled={disabled || type === 'toggle' || type === 'info'}>
            <View style={[styles.settingIconContainer, { backgroundColor: danger ? 'rgba(239, 68, 68, 0.1)' : theme.cyanDim }]}>
                <Icon name={icon} size={18} color={danger ? '#ef4444' : theme.cyan} />
            </View>
            <Text style={[styles.settingLabel, { color: danger ? '#ef4444' : theme.text }]}>{label}</Text>
            {rightSide()}
        </TouchableOpacity>
    );
};

// ── CUSTOM MODAL ────────────────────────────────────────────────────────
const ActionModal = ({ visible, onClose, title, subtitle, children, onConfirm, confirmText, confirmDanger, loading, error }) => {
    const { theme, isDark } = useTheme();
    const sheetBg = isDark ? '#111' : '#fff';
    const sheetBord = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={styles.modalCenter}>
                <View style={[styles.modalBox, { backgroundColor: sheetBg, borderColor: sheetBord }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.modalSub, { color: theme.textDim }]}>{subtitle}</Text>}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.modalContent}>{children}</View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'transparent' }]} onPress={onClose} disabled={loading}>
                            <Text style={{ color: theme.textDim, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: confirmDanger ? '#ef4444' : theme.cyan }]} onPress={onConfirm} disabled={loading}>
                            {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={{ color: confirmDanger ? '#fff' : '#000', fontWeight: '700' }}>{confirmText}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ── MAIN SCREEN ─────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
    const { theme, themeMode, toggleTheme, isDark } = useTheme();
    const user = useAuthStore(s => s.user);
    const updateUser = useAuthStore(s => s.updateUser);
    const logoutStore = useAuthStore(s => s.logout);

    const cyan = theme.cyan ?? '#00d4ff';
    const sheetBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const themeBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

    // State: Edit Profile
    const [editModal, setEditModal] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    // State: Password Change
    const [pwdModal, setPwdModal] = useState(false);
    const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdOtp, setPwdOtp] = useState('');
    const [isPwdOtpSent, setIsPwdOtpSent] = useState(false);
    const [loadingPwd, setLoadingPwd] = useState(false);
    const [pwdError, setPwdError] = useState('');

    // State: Delete Account
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteText, setDeleteText] = useState('');
    const [deleteOtp, setDeleteOtp] = useState('');
    const [isDeleteOtpSent, setIsDeleteOtpSent] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // State: Logout All
    const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);

    // Helpers
    const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
    const plan = (user?.plan || 'FREE').replace('_', ' ').toUpperCase();

    // ── Handlers ──
    const handleUpdateProfile = async () => {
        if (!editName.trim()) return setEditError("Name cannot be empty");
        setLoadingEdit(true); setEditError('');
        try {
            await updateProfile({ name: editName });
            updateUser({ name: editName });
            setEditModal(false);
        } catch (err) {
            setEditError(err.response?.data?.message || "Failed to update profile");
        } finally { setLoadingEdit(false); }
    };

    const initiateChangePassword = async () => {
        setPwdError('');
        if (!pwdData.oldPassword || !pwdData.newPassword) return setPwdError("Required fields missing");
        if (pwdData.newPassword !== pwdData.confirmPassword) return setPwdError("Passwords do not match");
        if (pwdData.newPassword.length < 6) return setPwdError("Must be at least 6 characters");

        setLoadingPwd(true);
        try {
            await requestSecurityOtp(pwdData.oldPassword);
            setIsPwdOtpSent(true);
            setPwdError('');
        } catch (err) {
            setPwdError(err.response?.data?.message || "Verification failed");
        } finally { setLoadingPwd(false); }
    };

    const finalizeChangePassword = async () => {
        if (!pwdOtp) return setPwdError("Please enter OTP");
        setLoadingPwd(true);
        try {
            await changePassword(pwdData.oldPassword, pwdData.newPassword, pwdOtp);
            setPwdModal(false);
            setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setPwdOtp(''); setIsPwdOtpSent(false);
            Alert.alert("Success", "Password updated successfully");
        } catch (err) {
            setPwdError(err.response?.data?.message || "Failed to change password");
        } finally { setLoadingPwd(false); }
    };

    const initiateDeleteAccount = async () => {
        setDeleteError('');
        if (deleteText !== 'DELETE') return setDeleteError("Type DELETE to confirm");
        setLoadingDelete(true);
        try {
            await requestSecurityOtp();
            setIsDeleteOtpSent(true);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to send OTP");
        } finally { setLoadingDelete(false); }
    };

    const finalizeDeleteAccount = async () => {
        if (!deleteOtp) return setDeleteError("Enter OTP to delete");
        setLoadingDelete(true);
        try {
            await deleteAccount(deleteOtp);
            logoutStore();
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to delete account");
        } finally { setLoadingDelete(false); }
    };

    const handleLogoutAll = async () => {
        Alert.alert(
            "Logout All Devices",
            "This will invalidate all sessions on all devices.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm", style: "destructive", onPress: async () => {
                        try {
                            await logoutAll();
                            logoutStore();
                        } catch (e) { Alert.alert("Error", "Failed to logout all devices."); }
                    }
                }
            ]
        )
    };

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

                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>APPEARANCE</Text>
                <View style={[styles.themeTrack, { backgroundColor: themeBg, borderColor: sheetBord, marginHorizontal: 4, marginBottom: 16 }]}>
                    <ThemePill mode="light" icon="white-balance-sunny" label="Light" active={themeMode === 'light'} onPress={() => toggleTheme('light')} cyan={cyan} />
                    <ThemePill mode="dark" icon="weather-night" label="Dark" active={themeMode === 'dark'} onPress={() => toggleTheme('dark')} cyan={cyan} />
                    <ThemePill mode="system" icon="laptop" label="System" active={themeMode === 'system'} onPress={() => toggleTheme('system')} cyan={cyan} />
                </View>

                {/* PROFILE IDENTITY */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>PROFILE IDENTITY</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem icon="user" label="Display Name" type="link" subtext={user?.name || 'User'} onPress={() => setEditModal(true)} />
                    <SettingItem icon="mail" label="Neural ID" type="info" subtext={user?.email} disabled />
                    <SettingItem icon="calendar" label="Joined Date" type="info" subtext={joinedDate} disabled />
                </View>

                {/* AI INTERFACE */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>AI INTERFACE</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem icon="message-square" label="Response Style" type="info" subtext="Professional" disabled />
                    <SettingItem icon="mic" label="Voice Mode Auto-Start" type="toggle" value={false} disabled />
                </View>

                {/* SYSTEM ALERTS */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>SYSTEM ALERTS</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem icon="clock" label="Daily Briefing" type="toggle" value={false} disabled />
                    <SettingItem icon="zap" label="Streak Reminders" type="toggle" value={false} disabled />
                </View>

                {/* SUBSCRIPTION */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>SUBSCRIPTION</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem icon="credit-card" label="Current Plan" type="info" subtext={plan} disabled={isDark} />
                    <SettingItem icon="external-link" label="Manage Subscription" type="link" onPress={() => navigation.navigate('Billing')} />
                </View>

                {/* SECURITY */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>SECURITY</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem icon="lock" label="Change Password" type="link" onPress={() => setPwdModal(true)} />
                </View>

                {/* DANGER ZONE */}
                <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>DANGER ZONE</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem icon="log-out" label="Log Out All Devices" type="link" danger onPress={handleLogoutAll} />
                    <SettingItem icon="trash-2" label="Delete Account" type="link" danger onPress={() => setDeleteModal(true)} />
                </View>

                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Text style={{ fontSize: 10, color: theme.textDim, fontWeight: '700', letterSpacing: 2 }}>TASKTIME v1.0.0</Text>
                </View>
            </ScrollView>

            {/* MODALS */}
            <ActionModal
                visible={editModal} onClose={() => setEditModal(false)}
                title="Edit Profile" confirmText="Save" onConfirm={handleUpdateProfile} loading={loadingEdit} error={editError}
            >
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={theme.textDim} />
            </ActionModal>

            <ActionModal
                visible={pwdModal} onClose={() => { setPwdModal(false); setIsPwdOtpSent(false); setPwdError(''); }}
                title="Change Password" subtitle={isPwdOtpSent ? "Enter the OTP sent to your email." : "Enter your current and new password."}
                confirmText={isPwdOtpSent ? "Verify & Change" : "Send OTP"} onConfirm={isPwdOtpSent ? finalizeChangePassword : initiateChangePassword}
                loading={loadingPwd} error={pwdError}
            >
                {!isPwdOtpSent ? (
                    <>
                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={pwdData.oldPassword} onChangeText={t => setPwdData({ ...pwdData, oldPassword: t })} secureTextEntry />
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={pwdData.newPassword} onChangeText={t => setPwdData({ ...pwdData, newPassword: t })} secureTextEntry />
                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={pwdData.confirmPassword} onChangeText={t => setPwdData({ ...pwdData, confirmPassword: t })} secureTextEntry />
                    </>
                ) : (
                    <>
                        <Text style={styles.inputLabel}>Security OTP</Text>
                        <TextInput style={[styles.input, { color: theme.cyan, borderColor: theme.cyanDim, textAlign: 'center', letterSpacing: 8, fontSize: 18 }]} value={pwdOtp} onChangeText={setPwdOtp} keyboardType="number-pad" />
                    </>
                )}
            </ActionModal>

            <ActionModal
                visible={deleteModal} onClose={() => { setDeleteModal(false); setIsDeleteOtpSent(false); setDeleteError(''); }}
                title="Delete Account" subtitle={isDeleteOtpSent ? "Enter the deletion OTP" : "WARNING: This is irreversible."}
                confirmText={isDeleteOtpSent ? "Permanently Delete" : "Send OTP"} onConfirm={isDeleteOtpSent ? finalizeDeleteAccount : initiateDeleteAccount}
                loading={loadingDelete} error={deleteError} confirmDanger
            >
                {!isDeleteOtpSent ? (
                    <>
                        <Text style={styles.inputLabel}>Type DELETE to confirm</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={deleteText} onChangeText={setDeleteText} placeholder="DELETE" placeholderTextColor={theme.textDim} />
                    </>
                ) : (
                    <>
                        <Text style={styles.inputLabel}>Security OTP</Text>
                        <TextInput style={[styles.input, { color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', textAlign: 'center', letterSpacing: 8, fontSize: 18 }]} value={deleteOtp} onChangeText={setDeleteOtp} keyboardType="number-pad" />
                    </>
                )}
            </ActionModal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
    backBtn: { padding: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 16 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8, marginTop: 16, marginLeft: 4, opacity: 0.8 },
    section: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
    settingIconContainer: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    themeTrack: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 4, gap: 4 },
    themePill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 6 },
    themePillTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

    // Modal Styles
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalCenter: { flex: 1, justifyContent: 'center', padding: 24 },
    modalBox: { borderRadius: 20, borderWidth: 1, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
    modalSub: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
    errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginBottom: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 8, overflow: 'hidden' },
    modalContent: { marginBottom: 24 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, minWidth: 80, alignItems: 'center' },
    inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6, opacity: 0.6, marginTop: 10 },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
});
