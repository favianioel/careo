import 'package:careo/src/features/people/domain/entities/person.dart';
import 'package:careo/src/features/people/domain/usecases/get_people_stream.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PipelinePage extends ConsumerStatefulWidget {
  const PipelinePage({super.key});

  @override
  ConsumerState<PipelinePage> createState() => _PipelinePageState();
}

class _PipelinePageState extends ConsumerState<PipelinePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pipeline'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Evangelism'),
            Tab(text: 'Support Raising'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _PipelineBoard(
            type: 'Evangelism',
            stages: const [
              'Identify',
              'Engage',
              'Share',
              'Follow-Up',
              'Disciple',
            ],
          ),
          _PipelineBoard(
            type: 'Support Raising',
            stages: const [
              'Identify',
              'Cultivate',
              'Ask',
              'Will Decide',
              'Partner',
            ],
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex:
            2, // Assuming this is a new 3rd tab? Or replacing "People"?
        // Actually, let's keep it separate or integrating into main nav?
        // For now, I'll add back button logic or assume it is a top level destination.
        onDestinationSelected: (index) {
          if (index == 0) context.go('/');
          if (index == 1) context.go('/people');
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.people), label: 'People'),
          // For now just 2 items in main nav of other pages, this might be a sub-feature or 3rd item?
          // User asked for "Pipeline". I'll add it as a new route.
          NavigationDestination(
            icon: Icon(Icons.view_kanban),
            label: 'Pipeline',
          ),
        ],
      ),
    );
  }
}

class _PipelineBoard extends ConsumerWidget {
  final String type;
  final List<String> stages;

  const _PipelineBoard({required this.type, required this.stages});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final peopleAsync = ref.watch(getPeopleStreamProvider);
    // Remove unused screenWidth

    return peopleAsync.when(
      data: (allPeople) {
        final pipelinePeople = allPeople
            .where((p) => p.pipelineType == type)
            .toList();

        return PageView.builder(
          controller: PageController(viewportFraction: 0.85),
          itemCount: stages.length,
          itemBuilder: (context, index) {
            final stage = stages[index];
            final peopleInStage = pipelinePeople
                .where((p) => (p.pipelineStage ?? 'Identify') == stage)
                .toList();

            return Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 4.0,
                vertical: 8.0,
              ),
              child: _PipelineColumn(
                stage: stage,
                people: peopleInStage,
                onDrop: (personId) {
                  _movePerson(ref, personId, stage);
                },
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }

  Future<void> _movePerson(WidgetRef ref, int personId, String newStage) async {
    final repo = ref.read(peopleRepositoryProvider);
    final person = await repo.getPerson(personId);
    if (person != null) {
      final updated = Person(
        id: person.id,
        name: person.name,
        status: person.status,
        nickname: person.nickname,
        tags: person.tags,
        birthday: person.birthday,
        anniversary: person.anniversary,
        photoPath: person.photoPath,
        email: person.email,
        phone: person.phone,
        address: person.address,
        pipelineType: person.pipelineType,
        pipelineStage: newStage,
      );
      await repo.savePerson(updated);
    }
  }
}

class _PipelineColumn extends StatelessWidget {
  final String stage;
  final List<Person> people;
  final Function(int) onDrop;

  const _PipelineColumn({
    required this.stage,
    required this.people,
    required this.onDrop,
  });

  @override
  Widget build(BuildContext context) {
    return DragTarget<int>(
      onAccept: (data) => onDrop(data),
      builder: (context, candidateData, rejectedData) {
        return Container(
          // Width is handled by PageView viewportFraction
          decoration: BoxDecoration(
            color: candidateData.isNotEmpty
                ? Theme.of(
                    context,
                  ).colorScheme.primaryContainer.withOpacity(0.5)
                : Theme.of(
                    context,
                  ).colorScheme.surfaceContainerHighest.withOpacity(0.3),
            borderRadius: BorderRadius.circular(16),
            border: candidateData.isNotEmpty
                ? Border.all(color: Theme.of(context).primaryColor, width: 2)
                : null,
          ),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 12.0,
                  horizontal: 16.0,
                ),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      stage,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Theme.of(
                          context,
                        ).colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${people.length}',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: people.isEmpty
                    ? const Center(
                        child: Text(
                          'Empty Stage',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(8),
                        itemCount: people.length,
                        itemBuilder: (context, index) {
                          final person = people[index];
                          return Draggable<int>(
                            data: person.id,
                            feedback: Material(
                              elevation: 4,
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                width:
                                    MediaQuery.of(context).size.width *
                                    0.7, // Good feedback width
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Theme.of(context).cardColor,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  person.name,
                                  style: Theme.of(
                                    context,
                                  ).textTheme.titleMedium,
                                ),
                              ),
                            ),
                            childWhenDragging: Opacity(
                              opacity: 0.5,
                              child: _PersonCard(person: person),
                            ),
                            child: _PersonCard(person: person),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PersonCard extends StatelessWidget {
  final Person person;
  const _PersonCard({required this.person});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ListTile(
        title: Text(person.name),
        subtitle: Text(person.status),
        onTap: () => context.push('/people/${person.id}'),
      ),
    );
  }
}
