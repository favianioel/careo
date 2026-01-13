import 'package:careo/src/features/tasks/application/reminder_service.dart';
import 'package:careo/src/features/tasks/domain/usecases/get_incomplete_tasks_stream.dart';
import 'package:careo/src/features/tasks/data/repositories/isar_tasks_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:careo/src/features/tasks/domain/entities/task.dart';

class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  @override
  void initState() {
    super.initState();
    // Run reminder checks on startup
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(reminderServiceProvider).runChecks();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tasksAsync = ref.watch(getIncompleteTasksStreamProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Daily Care Plan')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader('Today\'s Priorities'),

            tasksAsync.when(
              data: (tasks) {
                if (tasks.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              size: 48,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'All caught up!',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text('Take a moment to pray for your team.'),
                          ],
                        ),
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tasks.length,
                  itemBuilder: (context, index) {
                    final task = tasks[index];
                    return _buildTaskCard(task);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Text('Error: $e'),
            ),

            const SizedBox(height: 24),
            _buildSectionHeader('Birthdays & Anniversaries'),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('No birthdays today.'),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/people'),
              child: const Text('View All Relationships'),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          if (index == 1) context.go('/people');
          if (index == 2) context.go('/pipeline');
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.people), label: 'People'),
          NavigationDestination(
            icon: Icon(Icons.view_kanban),
            label: 'Pipeline',
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildTaskCard(Task task) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8.0),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.orange.withOpacity(0.1),
          child: const Icon(Icons.notifications_active, color: Colors.orange),
        ),
        title: Text(task.title),
        subtitle: Text(task.description ?? ''),
        trailing: Checkbox(
          value: task.isCompleted,
          onChanged: (v) {
            if (v == true && task.id != null) {
              ref.read(tasksRepositoryProvider).completeTask(task.id!);
            }
          },
        ),
        onTap: () {
          if (task.relatedPersonId != null) {
            context.push('/people/${task.relatedPersonId}');
          }
        },
      ),
    );
  }
}
