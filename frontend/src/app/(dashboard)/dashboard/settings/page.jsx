import Card from '@/components/ui/Card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-cyan-500" />
                    System Configuration
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                    Manage your preferences and account settings.
                </p>
            </div>

            <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10 bg-transparent">
                <div className="p-4 rounded-full bg-white/5">
                    <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Preferences Module</h3>
                <p className="text-gray-500 max-w-sm">
                    Settings configuration panel is currently locked. Updates coming in the next system patch.
                </p>
            </Card>
        </div>
    );
}
