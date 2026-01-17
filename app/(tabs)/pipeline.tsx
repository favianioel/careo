import { DatabaseService, Person } from '@/services/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STAGE_WIDTH = SCREEN_WIDTH * 0.85;

const PIPELINES = {
    Evangelism: ['Identify', 'Engage', 'Share', 'Follow-Up', 'Disciple'],
    'Support Raising': ['Identify', 'Cultivate', 'Ask', 'Will Decide', 'Partner'],
};

export default function PipelineScreen() {
    const router = useRouter();
    const [activePipeline, setActivePipeline] = useState<keyof typeof PIPELINES>('Evangelism');
    const [people, setPeople] = useState<Person[]>([]);

    useFocusEffect(
        useCallback(() => {
            try {
                setPeople(DatabaseService.getPeople());
            } catch (e) {
                console.error(e);
            }
        }, [])
    );

    const pipelinePeople = useMemo(() =>
        people.filter(p => p.pipelineType === activePipeline),
        [people, activePipeline]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Tabs */}
            <View style={styles.header}>
                <View style={styles.tabContainer}>
                    {(Object.keys(PIPELINES) as Array<keyof typeof PIPELINES>).map((pipeline) => (
                        <TouchableOpacity
                            key={pipeline}
                            style={[styles.tab, activePipeline === pipeline && styles.activeTab]}
                            onPress={() => setActivePipeline(pipeline)}
                        >
                            <Text style={[styles.tabText, activePipeline === pipeline && styles.activeTabText]}>
                                {pipeline}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Kanban Board */}
            <ScrollView
                horizontal
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={STAGE_WIDTH + 16} // Width + margin
                contentContainerStyle={styles.boardContent}
                showsHorizontalScrollIndicator={false}
            >
                {PIPELINES[activePipeline].map((stage) => {
                    const stagePeople = pipelinePeople.filter(p => (p.pipelineStage || 'Identify') === stage);

                    return (
                        <View key={stage} style={styles.column}>
                            <View style={styles.columnHeader}>
                                <Text style={styles.columnTitle}>{stage}</Text>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{stagePeople.length}</Text>
                                </View>
                            </View>

                            <ScrollView style={styles.columnList}>
                                {stagePeople.map((person) => (
                                    <TouchableOpacity
                                        key={person.id}
                                        style={styles.card}
                                        onPress={() => router.push(`/people/${person.id}`)}
                                    >
                                        <Text style={styles.cardTitle}>{person.name}</Text>
                                        <Text style={styles.cardSubtitle}>{person.status}</Text>
                                    </TouchableOpacity>
                                ))}
                                {stagePeople.length === 0 && (
                                    <Text style={styles.emptyText}>Empty Stage</Text>
                                )}
                            </ScrollView>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FFF',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#E3F2FD',
    },
    tabText: {
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#2196F3',
    },
    boardContent: {
        padding: 8,
        gap: 8,
    },
    column: {
        width: STAGE_WIDTH,
        backgroundColor: 'rgba(230, 230, 230, 0.5)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginRight: 8,
    },
    columnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#E0E0E0',
    },
    columnTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    countBadge: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    countText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    columnList: {
        padding: 8,
    },
    card: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
    },
    cardTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
        fontStyle: 'italic',
    },
});