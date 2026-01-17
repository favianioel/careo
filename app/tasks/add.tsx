import { IconSymbol } from '@/components/ui/icon-symbol';
import { DatabaseService } from '@/services/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddTaskScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const TEMPLATES = [
        { label: 'Prayer', icon: 'heart', title: 'Pray for...', desc: 'Spend time in prayer for specific needs.' },
        { label: 'Follow-up', icon: 'phone.fill', title: 'Follow up with...', desc: 'Check in on how they are doing.' },
        { label: 'Thank You', icon: 'envelope.fill', title: 'Send Thank You', desc: 'Write a note of appreciation.' },
        { label: 'Meeting', icon: 'calendar', title: 'Schedule Meeting', desc: 'Plan a time to connect.' },
    ];

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter a task title');
            return;
        }

        try {
            DatabaseService.addTask({
                title,
                description,
                dueDate: dueDate.toISOString().split('T')[0],
                isCompleted: false,
                type: 'manual',
            });
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save task');
        }
    };

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        setTitle(template.title);
        setDescription(template.desc);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'New Task',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Templates */}
                <Text style={styles.sectionTitle}>Quick Start</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateContainer}>
                    {TEMPLATES.map((t) => (
                        <TouchableOpacity key={t.label} style={styles.templateCard} onPress={() => applyTemplate(t)}>
                            <View style={styles.iconCircle}>
                                <IconSymbol name={t.icon as any} size={20} color="#007AFF" />
                            </View>
                            <Text style={styles.templateLabel}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.divider} />

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="What needs to be done?"
                        autoFocus
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Details</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add extra context..."
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Due Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                        <IconSymbol name="calendar" size={20} color="#666" />
                        <Text style={styles.dateText}>
                            {dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={dueDate}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    content: { padding: 16 },
    saveButton: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },

    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

    templateContainer: { gap: 12, paddingBottom: 8 },
    templateCard: { alignItems: 'center', marginRight: 12 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    templateLabel: { fontSize: 12, color: '#333' },

    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 24 },

    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFF' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },

    dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, backgroundColor: '#FFF' },
    dateText: { fontSize: 16, color: '#333' },
});
