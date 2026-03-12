const common = {
    cyan: '#06b6d4',
    cyanDim: '#06b6d422',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    priorityHigh: '#ef4444',
    priorityMedium: '#f59e0b',
    priorityLow: '#10b981',
};

export const darkTheme = {
    ...common,
    bg: '#000000',
    surface: '#0a0a0a',
    border: '#1f1f1f',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    textDim: '#71717a',
};

export const lightTheme = {
    ...common,
    bg: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    textDim: '#94a3b8',
};

// Legacy export for backward compatibility during migration
export const colors = darkTheme;
