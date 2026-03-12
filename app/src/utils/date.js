import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
    if (!dateString) return '';
    return format(new Date(dateString), formatStr);
};

export const getRelativeDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Overdue';
    return format(date, 'MMM d');
};

export const formatTime = (timeString) => {
    if (!timeString) return '';
    // Assumes HH:mm:ss format
    const [hours, minutes] = timeString.split(':');
    const d = new Date();
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return format(d, 'h:mm a');
};
