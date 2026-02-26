import Card from '@/components/ui/Card';
import { CheckSquare, Flame, BrainCircuit, Activity } from 'lucide-react';

export default function OverviewCards({ data }) {
    const cards = [
        {
            label: "Today Tasks",
            value: data?.todayTasks || 0,
            icon: Activity,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10"
        },
        {
            label: "Completed",
            value: data?.completedTasks || 0,
            icon: CheckSquare,
            color: "text-green-400",
            bg: "bg-green-500/10"
        },
        {
            label: "Behavior Score",
            value: data?.behaviorScore || 0,
            icon: BrainCircuit,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
        {
            label: "Current Streak",
            value: data?.currentStreak || 0,
            icon: Flame,
            color: "text-orange-400",
            bg: "bg-orange-500/10"
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <Card key={idx} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div>
                            <p className="text-sm font-medium text-gray-400 font-mono uppercase tracking-wider mb-1">
                                {card.label}
                            </p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">
                                {card.value}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg} border border-white/5 group-hover:scale-110 transition-transform`}>
                            <Icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
