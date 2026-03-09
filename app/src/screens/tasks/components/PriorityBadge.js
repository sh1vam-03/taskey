import React from 'react';
import Badge from '../../../components/common/Badge';
import { useTheme } from '../../../context/ThemeContext';

export default function PriorityBadge({ priority }) {
    const { theme } = useTheme();
    let color = theme.text;
    let bgColor = theme.surface;

    if (priority === 'HIGH') {
        color = theme.priorityHigh;
        bgColor = theme.priorityHigh + '22';
    } else if (priority === 'MEDIUM') {
        color = theme.priorityMedium;
        bgColor = theme.priorityMedium + '22';
    } else if (priority === 'LOW') {
        color = theme.priorityLow;
        bgColor = theme.priorityLow + '22';
    }

    return <Badge text={priority} color={color} bgColor={bgColor} />;
}
