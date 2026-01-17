import { IconSymbol } from '@/components/ui/icon-symbol';
import { DatabaseService, Person } from '@/services/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PeopleScreen() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const data = DatabaseService.getPeople();
        setPeople(data);
      } catch (e) {
        console.error(e);
      }
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relationships</Text>
        <TouchableOpacity onPress={() => router.push('/people/add')}>
          <IconSymbol name="plus" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {people.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="person.2.fill" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No relationships yet.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/people/add')}
          >
            <IconSymbol name="plus" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add Relationship</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push(`/people/${item.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemStatus}>{item.status}</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color="#CCC" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemStatus: {
    fontSize: 14,
    color: '#666',
  },
});
