import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import ConversationItem from '../components/ConversationItem';
import { getConversations } from '../../../api/ai.api';
import { useTheme } from '../../../context/ThemeContext';

export default function ConversationsScreen({ navigation }) {
    const [conversations, setConversations] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { theme } = useTheme();

    const fetchConversations = async () => {
        try {
            const { data } = await getConversations();
            setConversations(data.data || data);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConversations();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.localHeader}>
                <Text style={[styles.localHeaderTitle, { color: theme.text }]}>AI ASSISTANT</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.cyan }]}
                    onPress={() => navigation.navigate('Chat')}
                >
                    <Icon name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.cyan} />}
                renderItem={({ item }) => (
                    <ConversationItem
                        conversation={item}
                        onPress={() => navigation.navigate('Chat', { conversationId: item._id })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Icon name="message-square" size={48} color={theme.textDim} />
                        <Text style={[styles.emptyText, { color: theme.textDim }]}>No conversations yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    localHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 70,
    },
    localHeaderTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: { padding: 20, paddingBottom: 150 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16 },
});
