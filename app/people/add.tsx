import { IconSymbol } from '@/components/ui/icon-symbol';
import { DatabaseService } from '@/services/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddPersonScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Core
    const [name, setName] = useState('');
    const [status, setStatus] = useState('Partner');
    const [notes, setNotes] = useState('');

    // Contact
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Personal
    const [birthday, setBirthday] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [spouseName, setSpouseName] = useState('');
    const [childrenNames, setChildrenNames] = useState('');
    const [interests, setInterests] = useState('');

    // Ministry
    const [prayerRequests, setPrayerRequests] = useState('');
    const [pipeline, setPipeline] = useState<string | null>(null);
    const [stage, setStage] = useState<string | null>(null);

    const STAGES = {
        Evangelism: ['Identify', 'Engage', 'Share', 'Follow-Up', 'Disciple'],
        'Support Raising': ['Identify', 'Cultivate', 'Ask', 'Will Decide', 'Partner'],
    };

    // Load existing person if editing
    useEffect(() => {
        if (id) {
            const person = DatabaseService.getPerson(Number(id));
            if (person) {
                setName(person.name);
                setStatus(person.status);
                setNotes(person.privateNotes || '');
                setEmail(person.email || '');
                setPhone(person.phone || '');
                setAddress(person.address || '');
                setBirthday(person.birthday ? new Date(person.birthday) : null);
                setSpouseName(person.spouseName || '');
                setChildrenNames(person.childrenNames || '');
                setInterests(person.interests || '');
                setPrayerRequests(person.prayerRequests || '');
                setPipeline(person.pipelineType || null);
                setStage(person.pipelineStage || null);
            }
        }
    }, [id]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter a name');
            return;
        }

        const personData = {
            name,
            status,
            privateNotes: notes,
            email,
            phone,
            address,
            birthday: birthday ? birthday.toISOString().split('T')[0] : undefined,
            spouseName,
            childrenNames,
            interests,
            prayerRequests,
            pipelineType: pipeline ?? undefined,
            pipelineStage: stage ?? undefined,
        };

        try {
            if (id) {
                DatabaseService.updatePerson({ id: Number(id), ...personData });
            } else {
                DatabaseService.addPerson(personData);
            }
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save relationship');
        }
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setBirthday(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: id ? 'Edit Relationship' : 'Add Relationship',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* 1. Core Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Info</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                            {['Partner', 'Friend', 'Family', 'Mentor', 'Disciple'].map((s) => (
                                <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipSelected]} onPress={() => setStatus(s)}>
                                    <Text style={[styles.chipText, status === s && styles.chipTextSelected]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* 2. Contact Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Details</Text>
                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 234 567 8900" keyboardType="phone-pad" />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street Address" />
                    </View>
                </View>

                {/* 3. Personal & Family */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Family & Personal</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Birthday</Text>
                        <TouchableOpacity onPress={toggleDatePicker} style={styles.dateInput}>
                            <IconSymbol name="calendar" size={20} color="#666" />
                            <Text style={styles.dateText}>
                                {birthday ? birthday.toLocaleDateString() : 'Select Birthday'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={birthday || new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Spouse Name</Text>
                            <TextInput style={styles.input} value={spouseName} onChangeText={setSpouseName} placeholder="Spouse" />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Children</Text>
                        <TextInput style={styles.input} value={childrenNames} onChangeText={setChildrenNames} placeholder="Comma separated names" />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Interests / Connection Points</Text>
                        <TextInput style={styles.input} value={interests} onChangeText={setInterests} placeholder="Hobbies, interests, how we met..." multiline numberOfLines={2} />
                    </View>
                </View>

                {/* 4. Ministry & Pipeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ministry & Pipeline</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Prayer Requests</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={prayerRequests} onChangeText={setPrayerRequests} placeholder="Current prayer needs..." multiline numberOfLines={3} />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Sensitive Notes (Locked)</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Visible only after tapping to reveal" multiline numberOfLines={3} />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Pipeline</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                            {['None', 'Evangelism', 'Support Raising'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.chip, (pipeline === p || (p === 'None' && pipeline === null)) && styles.chipSelected]}
                                    onPress={() => {
                                        if (p === 'None') { setPipeline(null); setStage(null); }
                                        else {
                                            setPipeline(p);
                                            if (stage === null || !STAGES[p as keyof typeof STAGES].includes(stage)) {
                                                setStage(STAGES[p as keyof typeof STAGES][0]);
                                            }
                                        }
                                    }}
                                >
                                    <Text style={[styles.chipText, (pipeline === p || (p === 'None' && pipeline === null)) && styles.chipTextSelected]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {pipeline && stage && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Stage</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                                {STAGES[pipeline as keyof typeof STAGES].map((s) => (
                                    <TouchableOpacity key={s} style={[styles.chip, stage === s && styles.chipSelected]} onPress={() => setStage(s)}>
                                        <Text style={[styles.chipText, stage === s && styles.chipTextSelected]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    content: { padding: 16, paddingBottom: 40 },
    saveButton: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },

    section: { marginBottom: 24, backgroundColor: '#FFF', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },

    formGroup: { marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12 },

    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },

    dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, backgroundColor: '#FAFAFA' },
    dateText: { fontSize: 16, color: '#333' },

    chipContainer: { flexDirection: 'row', gap: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: 'transparent' },
    chipSelected: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
    chipText: { fontSize: 14, color: '#333' },
    chipTextSelected: { color: '#2196F3', fontWeight: '600' },
});
