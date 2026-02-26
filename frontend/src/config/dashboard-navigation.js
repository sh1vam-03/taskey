import {
    LayoutDashboard,
    CalendarCheck,
    CalendarRange,
    CheckSquare,
    CalendarDays,
    Bot,
    BrainCircuit,
    TrendingUp,
    Flame,
    CreditCard,
    BarChart3,
    Settings
} from 'lucide-react';

export const dashboardNavigation = [
    {
        section: "Primary",
        items: [
            { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
            { name: "Today", href: "/dashboard/today", icon: CalendarCheck },
            { name: "Calendar", href: "/dashboard/calendar", icon: CalendarRange },
            { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
            { name: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
        ],
    },
    {
        section: "Intelligence",
        items: [
            { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
            { name: "Behavior Score", href: "/dashboard/behavior", icon: BrainCircuit },
            { name: "Performance", href: "/dashboard/performance", icon: TrendingUp },
            { name: "Streaks", href: "/dashboard/streaks", icon: Flame },
        ],
    },
    {
        section: "Account",
        items: [
            { name: "Billing & Usage", href: "/dashboard/billing", icon: CreditCard },
            { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ],
    },
];
