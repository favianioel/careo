import { IconSymbol } from '@/components/ui/icon-symbol';
import { DatabaseService, Interaction, Person } from '@/services/database';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, LayoutAnimation, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PersonDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [person, setPerson] = useState<Person | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [notesRevealed, setNotesRevealed] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (id) {
                const personId = Number(id);
                setPerson(DatabaseService.getPerson(personId));
                setInteractions(DatabaseService.getInteractions(personId));
            }
        }, [id])
    );

    const toggleNotes = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setNotesRevealed(!notesRevealed);
    };

    const handleDelete = () => {
        Alert.alert('Delete Relationship?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    if (person?.id) {
                        DatabaseService.deletePerson(person.id);
                        router.back();
                    }
                }
            }
        ]);
    };

    const handleCall = () => {
        if (person?.phone) Linking.openURL(`tel:${person.phone}`);
    };

    const handleEmail = () => {
        if (person?.email) Linking.openURL(`mailto:${person.email}`);
    };

    if (!person) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Profile' }} />
                <View style={styles.content}>
                    <Text>Loading or not found...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Profile',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <TouchableOpacity onPress={() => router.push(`/people/add?id=${id}`)}>
                                <IconSymbol name="pencil" size={24} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete}>
                                <IconSymbol name="trash" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Header Profile */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{person.name[0]}</Text>
                    </View>
                    <Text style={styles.name}>{person.name}</Text>
                    <View style={styles.statusChip}>
                        <Text style={styles.statusText}>{person.status}</Text>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        {person.phone && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                                <IconSymbol name="phone.fill" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        {person.email && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                                <IconSymbol name="envelope.fill" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Contact & Personal Details */}
                <View style={styles.card}>
                    {person.email && <DetailRow icon="envelope" label="Email" value={person.email} />}
                    {person.phone && <DetailRow icon="phone" label="Phone" value={person.phone} />}
                    {person.address && <DetailRow icon="mappin.and.ellipse" label="Address" value={person.address} />}
                    {person.birthday && <DetailRow icon="gift" label="Birthday" value={new Date(person.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} />}
                    {person.spouseName && <DetailRow icon="heart" label="Spouse" value={person.spouseName} />}
                    {person.childrenNames && <DetailRow icon="figure.2.and.child.holdinghands" label="Children" value={person.childrenNames} />}
                    {person.interests && <DetailRow icon="star" label="Interests" value={person.interests} />}
                </View>

                {/* Ministry Details */}
                {(person.prayerRequests || person.pipelineType) && (
                    <View style={styles.card}>
                        <Text style={styles.sectionHeader}>Ministry & Pipeline</Text>
                        {person.pipelineType && (
                            <View style={styles.pipelineInfo}>
                                <Text style={styles.pipelineLabel}>Pipeline:</Text>
                                <Text style={styles.pipelineValue}>{person.pipelineType} - {person.pipelineStage}</Text>
                            </View>
                        )}
                        {person.prayerRequests && (
                            <View style={styles.prayerSection}>
                                <Text style={styles.prayerLabel}>Prayer Requests:</Text>
                                <Text style={styles.prayerText}>{person.prayerRequests}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Sensitive Notes */}
                {person.privateNotes && (
                    <TouchableOpacity
                        style={[styles.card, styles.privacyGuard, notesRevealed ? styles.privacyRevealed : styles.privacyHidden]}
                        onPress={toggleNotes}
                        activeOpacity={0.8}
                    >
                        <View style={styles.privacyHeader}>
                            <IconSymbol
                                name={notesRevealed ? 'lock.open.fill' : 'lock.fill'}
                                size={16}
                                color={notesRevealed ? '#666' : '#D32F2F'}
                            />
                            <Text style={[styles.privacyLabel, { color: notesRevealed ? '#666' : '#D32F2F' }]}>
                                {notesRevealed ? 'Tap to Hide Sensitive Notes' : 'Tap to Reveal Sensitive Notes'}
                            </Text>
                        </View>
                        {notesRevealed && (
                            <Text style={styles.notesText}>{person.privateNotes}</Text>
                        )}
                    </TouchableOpacity>
                )}

                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>Interactions</Text>

                {interactions.length === 0 ? (
                    <View style={styles.emptyInteractions}>
                        <Text style={styles.emptyText}>No interactions recorded yet.</Text>
                    </View>
                ) : (
                    <View style={styles.interactionList}>
                        {interactions.map((interaction) => (
                            <TouchableOpacity
                                key={interaction.id}
                                style={styles.interactionItem}
                                onPress={() => router.push(`/people/interactions/add?personId=${person.id}&interactionId=${interaction.id}`)}
                            >
                                <View style={styles.interactionHeader}>
                                    <Text style={styles.interactionType}>{interaction.type}</Text>
                                    <Text style={styles.interactionDate}>{new Date(interaction.date).toLocaleDateString()} {new Date(interaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                {interaction.notes && (
                                    <Text style={styles.interactionNotes}>{interaction.notes}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.logButton}
                    onPress={() => router.push(`/people/interactions/add?personId=${person.id}`)}
                >
                    <IconSymbol name="text.bubble.fill" size={20} color="#FFF" />
                    <Text style={styles.logButtonText}>Log Interaction</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

function DetailRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    if (!value) return null;
    return (
        <View style={styles.detailRow}>
            <IconSymbol name={icon} size={18} color="#666" style={{ width: 24 }} />
            <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    content: { padding: 16, paddingBottom: 40 },

    profileHeader: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: '#2196F3' },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    statusChip: { backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
    statusText: { fontSize: 14, fontWeight: '500' },

    quickActions: { flexDirection: 'row', gap: 16 },
    actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center' },

    card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
    detailLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
    detailValue: { fontSize: 16, color: '#333' },

    pipelineInfo: { marginBottom: 12 },
    pipelineLabel: { fontSize: 14, fontWeight: 'bold', color: '#555' },
    pipelineValue: { fontSize: 16, color: '#2196F3' },

    prayerSection: { marginTop: 8 },
    prayerLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 4 },
    prayerText: { fontSize: 15, color: '#333', fontStyle: 'italic', lineHeight: 22 },

    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 24 },

    privacyGuard: { borderWidth: 1, borderColor: 'transparent' },
    privacyHidden: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    privacyRevealed: { backgroundColor: '#FFF', borderColor: '#EEE' },
    privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    privacyLabel: { fontSize: 12, fontWeight: 'bold' },
    notesText: { fontSize: 16, lineHeight: 22, color: '#333' },

    emptyInteractions: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#666' },

    interactionList: { gap: 12 },
    interactionItem: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
    interactionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    interactionType: { fontWeight: 'bold', color: '#2196F3' },
    interactionDate: { fontSize: 12, color: '#999' },
    interactionNotes: { color: '#555' },

    logButton: { flexDirection: 'row', backgroundColor: '#2196F3', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 24, marginTop: 24, gap: 8 },
    logButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
