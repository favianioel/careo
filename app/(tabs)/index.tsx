import { IconSymbol } from '@/components/ui/icon-symbol';
import { DatabaseService, Task } from '@/services/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split('T')[0];
      // Seed some data if empty for demo purposes (remove in prod)
      try {
        const currentTasks = DatabaseService.getTasks(today);
        if (currentTasks.length === 0) {
          // Check if we already seeded specific demo tasks to avoid dupes across days if logic changes
          // For now simple check
          try {
            DatabaseService.addTask({
              title: 'Pray for Team',
              description: 'Spend 15 mins in prayer',
              dueDate: today,
              isCompleted: false,
              type: 'manual'
            });
            DatabaseService.addTask({
              title: 'Call John Doe',
              description: 'Follow up on meeting',
              dueDate: today,
              isCompleted: false,
              type: 'manual'
            });
            setTasks(DatabaseService.getTasks(today));
          } catch (e) {
            // Ignore if fails (e.g. constraints)
            setTasks(DatabaseService.getTasks(today));
          }
        } else {
          setTasks(currentTasks);
        }
      } catch (e) {
        console.error(e);
      }
    }, [])
  );

  const toggleTask = (task: Task) => {
    try {
      DatabaseService.toggleTask(task.id, !task.isCompleted);
      const today = new Date().toISOString().split('T')[0];
      setTasks(DatabaseService.getTasks(today));
    } catch (e) {
      console.error('Failed to toggle task', e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Care Plan</Text>
        <TouchableOpacity onPress={() => router.push('/tasks/add')}>
          <IconSymbol name="plus.circle.fill" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Today's Priorities</Text>

        {tasks.length === 0 ? (
          <View style={styles.card}>
            <IconSymbol name="checkmark.circle" size={48} color="grey" />
            <Text style={styles.cardTitle}>All caught up!</Text>
            <Text style={styles.cardText}>Take a moment to pray for your team.</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => toggleTask(task)}
              >
                <View style={[styles.checkbox, !!task.isCompleted && styles.checkedBox]}>
                  {!!task.isCompleted && <IconSymbol name="checkmark" size={14} color="#FFF" />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, !!task.isCompleted && styles.completedText]}>{task.title}</Text>
                  {task.description && (
                    <Text style={styles.taskSubtitle}>{task.description}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Birthdays & Anniversaries</Text>
        <View style={[styles.card, styles.birthdayCard]}>
          <Text style={styles.cardText}>No birthdays today.</Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/people')}
        >
          <Text style={styles.buttonText}>View All Relationships</Text>
        </TouchableOpacity>

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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  birthdayCard: {
    padding: 16,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  cardText: {
    marginTop: 4,
    color: '#666',
  },
  spacer: {
    height: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
});
