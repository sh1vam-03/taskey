import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { getDayCalendar } from '../../api/schedule.api';

export default function CalendarScreen({ navigation }) {
    const [view, setView] = useState('day'); // 'day', 'week', 'month'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        fetchData();
    }, [selectedDate, view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const { data: res } = await getDayCalendar(formattedDate);
            const calendarData = res?.data || res;
            setData(calendarData?.days?.[formattedDate] || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderTabs = () => (
        <View style={[styles.tabs, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {['day', 'week', 'month'].map(t => (
                <TouchableOpacity
                    key={t}
                    style={[styles.tab, view === t && { backgroundColor: theme.cyan }]}
                    onPress={() => setView(t)}
                >
                    <Text style={[styles.tabText, { color: view === t ? '#000000' : theme.textDim }]}>
                        {t.toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderDayView = () => (
        <ScrollView contentContainerStyle={styles.viewContent}>
            <Text style={[styles.viewTitle, { color: theme.text }]}>{format(selectedDate, 'EEEE, MMMM do')}</Text>
            {data.length > 0 ? (
                data.map((item, idx) => (
                    <View key={idx} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={[styles.timeLabel, { borderRightColor: theme.border }]}>
                            <Text style={[styles.timeText, { color: theme.cyan }]}>{item.time}</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[styles.cardCategory, { color: theme.textDim }]}>{item.category || 'Focus'}</Text>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.empty}>
                    <Icon name="calendar" size={40} color={theme.textDim} />
                    <Text style={[styles.emptyText, { color: theme.textDim }]}>No events scheduled</Text>
                </View>
            )}
        </ScrollView>
    );

    const renderWeekView = () => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        return (
            <ScrollView contentContainerStyle={styles.viewContent}>
                {days.map((day, idx) => (
                    <View key={idx} style={[styles.weekDayRow, { borderBottomColor: theme.border }]}>
                        <View style={[styles.weekDayLabel, isSameDay(day, new Date()) && { backgroundColor: theme.cyanDim, borderRadius: 8, padding: 4 }]}>
                            <Text style={[styles.weekDayName, { color: theme.textDim }]}>{format(day, 'EEE')}</Text>
                            <Text style={[styles.weekDayNum, { color: theme.text }]}>{format(day, 'd')}</Text>
                        </View>
                        <View style={styles.weekDayEvents}>
                            <Text style={[styles.emptyTextSmall, { color: theme.textDim }]}>No events</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    };

    const renderMonthView = () => {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        const days = eachDayOfInterval({ start, end });
        // Fill grid with leading empty spaces if needed
        const firstDay = start.getDay(); // 0 is Sunday
        const leading = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);

        return (
            <View style={styles.viewContent}>
                <View style={styles.monthHeader}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <Text key={i} style={[styles.monthDayHeader, { color: theme.textDim }]}>{d}</Text>
                    ))}
                </View>
                <View style={styles.monthGrid}>
                    {[...leading, ...days].map((day, idx) => (
                        <View key={idx} style={styles.monthDayCell}>
                            {day && (
                                <Text style={[
                                    styles.monthDayText,
                                    { color: theme.text },
                                    isSameDay(day, selectedDate) && { color: theme.cyan, fontWeight: 'bold', textDecorationLine: 'underline' }
                                ]}>
                                    {format(day, 'd')}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{format(selectedDate, 'MMMM yyyy')}</Text>
                <TouchableOpacity style={styles.backBtn}>
                    <Icon name="search" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {renderTabs()}

            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    backBtn: { padding: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    tabs: {
        flexDirection: 'row',
        margin: 16,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabText: { fontSize: 12, fontWeight: 'bold' },
    viewContent: { padding: 16 },
    viewTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
    },
    timeLabel: { width: 60, borderRightWidth: 1, marginRight: 16 },
    timeText: { fontSize: 12, fontWeight: 'bold' },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
    cardCategory: { fontSize: 12 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 12 },
    weekDayRow: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 16 },
    weekDayLabel: { width: 50, alignItems: 'center' },
    weekDayName: { fontSize: 12 },
    weekDayNum: { fontSize: 18, fontWeight: 'bold' },
    weekDayEvents: { flex: 1, marginLeft: 16, justifyContent: 'center' },
    emptyTextSmall: { fontSize: 12 },
    monthHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    monthDayHeader: { fontSize: 12, width: 40, textAlign: 'center' },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    monthDayCell: { width: '14.28%', height: 60, alignItems: 'center', justifyContent: 'center' },
    monthDayText: { fontSize: 14 },
});
