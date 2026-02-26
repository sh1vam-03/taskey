'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import billingService from '@/services/billing.service';
import authService from '@/services/auth.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import {
    Settings, User, CreditCard, Bell, Shield, LogOut,
    Trash2, Cpu, Zap, Calendar, ShieldCheck, Mail, Globe, Lock
} from 'lucide-react';

export default function SettingsPage() {
    const { user, logout, logoutAll, loading: authLoading } = useAuth();
    const { toast, success, error, info } = useToast();
    const router = useRouter();

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [logoutAllModal, setLogoutAllModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    // Deletion State
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteOtp, setDeleteOtp] = useState("");
    const [isDeleteOtpSent, setIsDeleteOtpSent] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [selectedTimezone, setSelectedTimezone] = useState("");
    const timezones = Intl.supportedValuesOf('timeZone');

    // Password Change State
    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [pwdData, setPwdData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [pwdOtp, setPwdOtp] = useState("");
    const [isPwdOtpSent, setIsPwdOtpSent] = useState(false);
    const [pwdError, setPwdError] = useState("");



    useEffect(() => {
        const loadData = async () => {

            try {
                const subData = await billingService.getCurrentSubscription();
                setSubscription(subData);
            } catch (err) {
                console.error("Failed to load subscription", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (user) {
            setEditName(user.name || "");
            setSelectedTimezone(user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, [user]);

    // --- Profile Update ---
    const handleUpdateProfile = async () => {
        if (!editName.trim()) return error("Name cannot be empty");

        try {
            await authService.updateProfile({ name: editName, timezone: selectedTimezone });
            success("Profile updated successfully");
            setIsEditingProfile(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error(err);
            error(err.response?.data?.message || "Failed to update profile");
        }
    };

    // --- Password Change Flow ---
    const initiateChangePassword = async () => {
        setPwdError("");
        if (!pwdData.oldPassword || !pwdData.newPassword) return setPwdError("All password fields are required");
        if (pwdData.newPassword !== pwdData.confirmPassword) return setPwdError("New passwords do not match");
        if (pwdData.newPassword.length < 6) return setPwdError("Password must be at least 6 characters");

        try {
            // Verify old password immediately before sending OTP
            await authService.requestSecurityOtp(pwdData.oldPassword);
            setIsPwdOtpSent(true);
            info("Security code sent to your email");
        } catch (err) {
            setPwdError(err.response?.data?.message || "Failed to verify password");
        }
    };

    const finalizeChangePassword = async () => {
        setPwdError("");
        if (!pwdOtp) return setPwdError("Please enter the security code");

        try {
            await authService.changePassword(pwdData.oldPassword, pwdData.newPassword, pwdOtp);
            success("Password changed successfully");
            setChangePasswordModal(false);
            setPwdData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setPwdOtp("");
            setIsPwdOtpSent(false);
            setPwdError("");
        } catch (err) {
            setPwdError(err.response?.data?.message || "Failed to change password");
        }
    };

    // ...



    // --- Delete Account Flow ---
    const initiateDeleteAccount = async () => {
        setDeleteError("");
        if (deleteConfirmText !== "DELETE") return setDeleteError("Please type DELETE to confirm.");

        try {
            await authService.requestSecurityOtp();
            setIsDeleteOtpSent(true);
            info("Security code sent to your email");
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to send OTP");
        }
    };

    const finalizeDeleteAccount = async () => {
        setDeleteError("");
        if (!deleteOtp) return setDeleteError("Please enter the security code");

        try {
            await authService.deleteAccount(deleteOtp);
            success("Account deleted successfully.");
            window.location.href = '/signup';
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to delete account");
        }
    };

    const handleLogoutAll = async () => {
        await logoutAll();
    };

    if (loading || authLoading) return <SkeletonLoader type="card" className="h-96" />;

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-cyan-500" />
                    System Configuration
                </h1>
                <p className="text-gray-400 font-mono text-sm max-w-xl">
                    Manage your neural interface, subscription, and account security.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

                {/* LEFT COLUMN */}
                <div className="space-y-8 lg:col-span-2">

                    {/* 1. Profile Overview */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="h-5 w-5 text-cyan-500" />
                            <h3 className="font-bold text-lg text-white">Profile Identity</h3>
                            {user?.isEmailVerified && (
                                <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-950/30 px-2 py-1 rounded border border-green-500/20">
                                    <ShieldCheck className="h-3 w-3" /> VERIFIED
                                </span>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Display Name */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Display Name</label>
                                {isEditingProfile ? (
                                    <div className="flex gap-2">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-white/5 border border-cyan-500/50 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono flex justify-between items-center group">
                                        {user?.name}
                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-wider"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Email - Read Only */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono flex items-center gap-1">
                                    Neural ID (Email) <Lock className="w-3 h-3 text-gray-600" />
                                </label>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 font-mono cursor-not-allowed opacity-70">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Timezone Selector */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono flex items-center gap-2">
                                    <Globe className="h-3 w-3 text-blue-500" /> Timezone
                                </label>
                                {isEditingProfile ? (
                                    <select
                                        value={selectedTimezone}
                                        onChange={(e) => setSelectedTimezone(e.target.value)}
                                        className="w-full bg-black/20 border border-cyan-500/50 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    >
                                        {timezones.map(tz => (
                                            <option key={tz} value={tz} className="bg-black text-white">{tz}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono">
                                        {selectedTimezone}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-cyan-500" /> Joined Date <Lock className="w-3 h-3 text-gray-600" />
                                </label>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 font-mono cursor-not-allowed opacity-70">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        {isEditingProfile && (
                            <div className="mt-6 flex justify-end gap-3 animate-in fade-in">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleUpdateProfile} className="bg-cyan-500 text-black hover:bg-cyan-400">Save Changes</Button>
                            </div>
                        )}
                    </Card>

                    {/* 2. AI Preferences */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu className="h-5 w-5 text-purple-500" />
                            <h3 className="font-bold text-lg text-white">AI Interface</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between pointer-events-none opacity-60">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-gray-200 flex items-center gap-2">Response Style <Lock className="w-3 h-3 text-gray-500" /></label>
                                    <p className="text-xs text-gray-500">Adjust the personality of your AI assistant.</p>
                                </div>
                                <select
                                    className="bg-black/20 border border-white/10 rounded-md text-sm text-gray-300 p-2 w-64"
                                    disabled
                                    value="PROFESSIONAL"
                                >
                                    <option value="PROFESSIONAL">Professional (Concise)</option>
                                    <option value="MOTIVATIONAL">Motivational (Supportive)</option>
                                    <option value="MINIMAL">Minimal (Data Only)</option>
                                </select>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <div className="pointer-events-none opacity-60">
                                    <Toggle
                                        label={<span className="flex items-center gap-2">Voice Mode Auto-Start <Lock className="w-3 h-3 text-gray-500" /></span>}
                                        checked={false}
                                        onChange={() => { }}
                                        disabled={true}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 ml-1">Automatically activate voice input when opening the AI assistant.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 3. Notifications */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="h-5 w-5 text-yellow-500" />
                            <h3 className="font-bold text-lg text-white">System Alerts</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-4 pointer-events-none opacity-60">
                                <Toggle
                                    label={<span className="flex items-center gap-2">Daily Briefing <Lock className="w-3 h-3 text-gray-500" /></span>}
                                    checked={false}
                                    onChange={() => { }}
                                    disabled={true}
                                />
                                <Toggle
                                    label={<span className="flex items-center gap-2">Streak Maintenance Reminders <Lock className="w-3 h-3 text-gray-500" /></span>}
                                    checked={false}
                                    onChange={() => { }}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </Card>

                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">

                    {/* 4. Plan Summary */}
                    <Card className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 bg-cyan-500/5 rounded-full blur-2xl" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            <h3 className="font-bold text-lg text-white">Subscription</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Current Plan</p>
                                <p className="text-xl font-bold text-cyan-400 font-mono">{subscription?.plan?.replace('_', ' ') || 'FREE TIER'}</p>
                            </div>

                            {subscription?.nextBillingAt && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Renewal Date</p>
                                    <p className="text-sm text-gray-300 font-mono">{new Date(subscription.nextBillingAt).toLocaleDateString()}</p>
                                </div>
                            )}

                            <Button
                                variant="scanline"
                                className="w-full justify-center"
                                onClick={() => router.push('/dashboard/billing')}
                            >
                                MANAGE SUBSCRIPTION
                            </Button>
                        </div>
                    </Card>

                    {/* 5. Security & Passwords */}
                    <Card className="p-6 border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <h3 className="font-bold text-lg text-white">Security</h3>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setChangePasswordModal(true)}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 border border-white/10 rounded-md hover:bg-white/5 transition-colors"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Change Password
                            </button>
                            <p className="text-[10px] text-gray-500 px-1">
                                Update your security credentials.
                            </p>
                        </div>
                    </Card>

                    {/* 6. Danger Zone */}
                    <Card className="p-6 border-red-900/20 bg-red-950/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="h-5 w-5 text-red-500" />
                            <h3 className="font-bold text-lg text-red-500">Danger Zone</h3>
                        </div>

                        <div className="space-y-3">
                            <button
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                onClick={() => setLogoutAllModal(true)}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out All Devices
                            </button>

                            <button
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-500 border border-transparent rounded-md hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/10 transition-colors"
                                onClick={() => setDeleteModal(true)}
                                title="Permanently delete account"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Information
                            </button>

                        </div>
                    </Card>

                    <div className="text-center">
                        <p className="text-xs text-gray-600 font-mono">Taskey System v1.0.0</p>
                        <p className="text-xs text-gray-600 font-mono">Session ID: {user?.id?.slice(0, 8)}</p>
                    </div>

                </div>
            </div>

            {/* Change Password Modal */}
            <ConfirmationModal
                isOpen={changePasswordModal}
                onClose={() => { setChangePasswordModal(false); setIsPwdOtpSent(false); setPwdOtp(""); setPwdError(""); }}
                onConfirm={isPwdOtpSent ? finalizeChangePassword : initiateChangePassword}
                title="Change Password"
                message={isPwdOtpSent ? "Enter the security code sent to your email." : "Enter your current password and a new secure password."}
                confirmText={isPwdOtpSent ? "Verify & Update" : "Next (Send OTP)"}
                variant="default"
            >
                <div className="space-y-4 mt-4">
                    {pwdError && (
                        <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-md text-red-200 text-xs font-mono text-center animate-in fade-in slide-in-from-top-1">
                            {pwdError}
                        </div>
                    )}
                    {!isPwdOtpSent ? (
                        <>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-xs text-gray-500 uppercase font-mono">Current Password</label>
                                    <a href="/forgot-password" className="text-[10px] text-cyan-500 hover:underline">Forgot password?</a>
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                    value={pwdData.oldPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, oldPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase font-mono">New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                    value={pwdData.newPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase font-mono">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                    value={pwdData.confirmPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1 animate-in fade-in">
                            <label className="text-xs text-cyan-400 uppercase font-mono">Security OTP Code</label>
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-cyan-500/50 rounded px-3 py-2 text-white text-lg tracking-widest text-center focus:border-cyan-500 focus:outline-none"
                                placeholder="0 0 0 0 0 0"
                                value={pwdOtp}
                                onChange={(e) => setPwdOtp(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </ConfirmationModal>



            <ConfirmationModal
                isOpen={logoutAllModal}
                onClose={() => setLogoutAllModal(false)}
                onConfirm={handleLogoutAll}
                title="Disconnect All Devices"
                message="This will invalidate all active sessions across all your devices. You will need to log in again."
                confirmText="Log Out All"
                variant="danger"
            />

            {/* Delete Account Modal */}
            <ConfirmationModal
                isOpen={deleteModal}
                onClose={() => { setDeleteModal(false); setIsDeleteOtpSent(false); setDeleteOtp(""); setDeleteConfirmText(""); setDeleteError(""); }}
                onConfirm={isDeleteOtpSent ? finalizeDeleteAccount : initiateDeleteAccount}
                title="Delete Account"
                message="WARNING: This action is irreversible. All your data will be permanently erased."
                confirmText={isDeleteOtpSent ? "Confirm Deletion" : "Send OTP to Delete"}
                variant="danger"
            >
                <div className="mt-4 space-y-4">
                    {deleteError && (
                        <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-md text-red-200 text-xs font-mono text-center animate-in fade-in slide-in-from-top-1">
                            {deleteError}
                        </div>
                    )}
                    {!isDeleteOtpSent ? (
                        <>
                            <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-xs text-red-200">
                                This will remove your account, subscription, and all data immediately.
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-1">Type DELETE to continue</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    placeholder="DELETE"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1 animate-in fade-in">
                            <label className="text-xs text-red-400 uppercase font-mono">Security OTP Code</label>
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-red-500/50 rounded px-3 py-2 text-white text-lg tracking-widest text-center focus:border-red-500 focus:outline-none"
                                placeholder="0 0 0 0 0 0"
                                value={deleteOtp}
                                onChange={(e) => setDeleteOtp(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </ConfirmationModal>
        </div>
    );
}
