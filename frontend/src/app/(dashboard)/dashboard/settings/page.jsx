'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import billingService from '@/services/billing.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import {
    Settings, User, CreditCard, Bell, Shield, LogOut,
    Trash2, Cpu, Mic, Volume2
} from 'lucide-react';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { toast, success, error } = useToast();
    const router = useRouter();

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoutModal, setLogoutModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    // AI Preferences (Local State)
    const [aiPrefs, setAiPrefs] = useState({
        voiceAutoStart: false,
        responseStyle: 'PROFESSIONAL',
        dailyDigest: true,
        streakReminders: true
    });

    useEffect(() => {
        const loadData = async () => {
            // Load Prefs from LocalStorage
            const savedPrefs = localStorage.getItem('taskey_ai_prefs');
            if (savedPrefs) setAiPrefs(JSON.parse(savedPrefs));

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

    const updatePref = (key, value) => {
        const newPrefs = { ...aiPrefs, [key]: value };
        setAiPrefs(newPrefs);
        localStorage.setItem('taskey_ai_prefs', JSON.stringify(newPrefs));
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleDeleteAccount = async () => {
        try {
            // Import dynamically or assume authService is available via context if we extended it? 
            // Since we updated authService directly, we should import it.
            // But optimal way is to expose it via useAuth if used often.
            // For now, let's use the one attached to the component or import specifically if needed.
            // Wait, we updated the service file, but did we update context? 
            // The context usually wraps authActions. 
            // Let's import authService directly at top of file for this specific action if context doesn't have it.

            // To be safe/clean, I will add `import authService` at the top in a separate edit 
            // OR I can use the existing `logout` as reference.
            // Actually, we modified `authService` file. We need to import it.

            const { default: authService } = await import('@/services/auth.service');
            await authService.deleteAccount();

            success("Account deleted successfully.");
            window.location.href = '/signup';
        } catch (err) {
            console.error(err);
            error("Failed to delete account. Please try again.");
        }
    };

    if (loading) return <SkeletonLoader type="card" className="h-96" />;

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
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Display Name</label>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono">
                                    {user?.name}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Neural ID (Email)</label>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-500">* Profile editing is managed by the central authority. Contact support for changes.</p>
                    </Card>

                    {/* 2. AI Preferences */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu className="h-5 w-5 text-purple-500" />
                            <h3 className="font-bold text-lg text-white">AI Interface</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-gray-200">Response Style</label>
                                    <p className="text-xs text-gray-500">Adjust the personality of your AI assistant.</p>
                                </div>
                                <select
                                    className="bg-black/20 border border-white/10 rounded-md text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500 p-2"
                                    value={aiPrefs.responseStyle}
                                    onChange={(e) => updatePref('responseStyle', e.target.value)}
                                >
                                    <option value="PROFESSIONAL">Professional (Concise)</option>
                                    <option value="MOTIVATIONAL">Motivational (Supportive)</option>
                                    <option value="MINIMAL">Minimal (Data Only)</option>
                                </select>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <Toggle
                                    label="Voice Mode Auto-Start"
                                    checked={aiPrefs.voiceAutoStart}
                                    onChange={(val) => updatePref('voiceAutoStart', val)}
                                />
                                <p className="text-xs text-gray-500 mt-1 ml-1">Automatically activate voice input when opening the AI assistant.</p>
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
                            <Toggle
                                label="Daily Briefing"
                                checked={aiPrefs.dailyDigest}
                                onChange={(val) => updatePref('dailyDigest', val)}
                            />
                            <Toggle
                                label="Streak Maintenance Reminders"
                                checked={aiPrefs.streakReminders}
                                onChange={(val) => updatePref('streakReminders', val)}
                            />
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

                    {/* 5. Danger Zone */}
                    <Card className="p-6 border-red-900/20 bg-red-950/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="h-5 w-5 text-red-500" />
                            <h3 className="font-bold text-lg text-red-500">Danger Zone</h3>
                        </div>

                        <div className="space-y-3">
                            <button
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                onClick={() => setLogoutModal(true)}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Disconnect Session (Log Out)
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

            <ConfirmationModal
                isOpen={logoutModal}
                onClose={() => setLogoutModal(false)}
                onConfirm={handleLogout}
                title="Disconnect Session"
                message="Are you sure you want to terminate your current neural session?"
                confirmText="Log Out"
                variant="danger"
            />

            <ConfirmationModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="WARNING: This action is irreversible. All your data, including tasks, schedules, and AI history will be permanently erased."
                confirmText="Permanently Delete"
                variant="danger"
            />
        </div>
    );
}
