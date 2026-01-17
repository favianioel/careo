import { DatabaseService } from '@/services/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const INTERACTION_TYPES = ['Call', 'Coffee', 'Prayer', 'Meeting', 'Text', 'Email'];

export default function AddInteractionScreen() {
    const router = useRouter();
    const { personId, interactionId } = useLocalSearchParams();

    const [type, setType] = useState('Call');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [mode, setMode] = useState<'date' | 'time'>('date');

    const [addToCalendar, setAddToCalendar] = useState(false);
    const isFuture = date > new Date();

    useEffect(() => {
        if (interactionId) {
            const interaction = DatabaseService.getInteraction(Number(interactionId));
            if (interaction) {
                setType(interaction.type);
                setNotes(interaction.notes || '');
                setDate(new Date(interaction.date));
                // Set personId from interaction if not in params (though it should be)
            }
        }
        (async () => {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                // Handle permission denial if needed
            }
        })();
    }, [interactionId]);

    const getDefaultCalendarId = async () => {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar =
            calendars.find((each) => each.source.name === 'Default') ||
            calendars.find((each) => each.isPrimary) ||
            calendars[0];
        return defaultCalendar?.id;
    };

    const handleDelete = () => {
        if (!interactionId) return;

        Alert.alert('Delete Interaction?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    try {
                        DatabaseService.deleteInteraction(Number(interactionId));
                        router.back();
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Error', 'Failed to delete interaction');
                    }
                }
            }
        ]);
    };

    const handleSave = async () => {
        try {
            const currentPersonId = personId ? Number(personId) : (interactionId ? DatabaseService.getInteraction(Number(interactionId))?.personId : null);

            if (!currentPersonId) return;

            if (interactionId) {
                // Update existing
                DatabaseService.updateInteraction({
                    id: Number(interactionId),
                    personId: currentPersonId,
                    type,
                    notes,
                    date: date.toISOString(),
                });
            } else {
                // Create new
                DatabaseService.addInteraction({
                    personId: currentPersonId,
                    type,
                    notes,
                    date: date.toISOString(),
                });
            }

            // 2. Add to Calendar if requested (Only for new or if explicit intent? Keep simple for now)
            if (isFuture && addToCalendar) {
                const calendarId = await getDefaultCalendarId();
                if (calendarId) {
                    await Calendar.createEventAsync(calendarId, {
                        title: `${type} with Person #${currentPersonId}`, // ideally fetch Name
                        startDate: date,
                        endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour default
                        notes: notes,
                        timeZone: 'GMT',
                    });
                    Alert.alert('Success', 'Event added to calendar');
                } else {
                    Alert.alert('Warning', 'Could not find a calendar to add event to.');
                }
            }

            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save interaction');
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const showMode = (currentMode: 'date' | 'time') => {
        setShowDatePicker(true);
        setMode(currentMode);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: interactionId ? 'Edit Interaction' : 'Log Interaction',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.chipContainer}>
                        {INTERACTION_TYPES.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, type === t && styles.chipSelected]}
                                onPress={() => setType(t)}
                            >
                                <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date & Time</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={[styles.dateButton, { flex: 1 }]}
                            onPress={() => showMode('date')}
                        >
                            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.dateButton, { flex: 1 }]}
                            onPress={() => showMode('time')}
                        >
                            <Text style={styles.dateText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode={mode}
                            is24Hour={true}
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                </View>

                {isFuture && !interactionId && (
                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Add to System Calendar</Text>
                        <Switch value={addToCalendar} onValueChange={setAddToCalendar} />
                    </View>
                )}

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="What happened? (or plan)"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {interactionId && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>Delete Interaction</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    content: { padding: 16 },
    saveButton: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: 'transparent' },
    chipSelected: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
    chipText: { fontSize: 14, color: '#333' },
    chipTextSelected: { color: '#2196F3', fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    dateButton: { padding: 12, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8 },
    dateText: { fontSize: 16 },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 16, backgroundColor: '#F9F9F9', borderRadius: 8 },
    deleteButton: { marginTop: 20, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#FF3B30', alignItems: 'center' },
    deleteButtonText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
});
