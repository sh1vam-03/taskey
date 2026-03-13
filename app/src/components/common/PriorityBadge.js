import React from 'react';
import Badge from './Badge';

const PRIORITY_MAP = {
    HIGH: { variant: 'red', text: 'HIGH' },
    MEDIUM: { variant: 'orange', text: 'MEDIUM' },
    LOW: { variant: 'cyan', text: 'LOW' },
};

export default function PriorityBadge({ priority, size = 'md' }) {
    const key = (priority || 'MEDIUM').toUpperCase();
    const config = PRIORITY_MAP[key] || PRIORITY_MAP.MEDIUM;

    return (
        <Badge
            text={config.text}
            variant={config.variant}
            size={size}
        />
    );
}
