import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:careo/src/features/people/domain/usecases/get_people_stream.dart';

class PeopleListPage extends ConsumerWidget {
  const PeopleListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final peopleAsync = ref.watch(getPeopleStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Relationships'), // "Relationships" not "Contacts"
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              context.go('/people/add');
            },
          ),
        ],
      ),
      body: peopleAsync.when(
        data: (people) {
          if (people.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.people_outline,
                    size: 64,
                    color: Colors.grey,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No relationships yet.',
                    style: TextStyle(fontSize: 18),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => context.go('/people/add'),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Relationship'),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            itemCount: people.length,
            itemBuilder: (context, index) {
              final person = people[index];
              return ListTile(
                leading: CircleAvatar(child: Text(person.name[0])),
                title: Text(person.name),
                subtitle: Text(person.status),
                trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                onTap: () {
                  context.go('/people/${person.id}');
                },
              );
            },
          );
        },
        error: (err, stack) => Center(child: Text('Error: $err')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 1, // People tab
        onDestinationSelected: (index) {
          if (index == 0) context.go('/');
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
}
