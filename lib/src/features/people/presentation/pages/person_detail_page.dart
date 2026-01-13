import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:careo/src/features/people/domain/usecases/get_person_stream.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';
import 'package:careo/src/features/interactions/domain/usecases/get_person_interactions_stream.dart';
import 'package:intl/intl.dart';

class PersonDetailPage extends ConsumerWidget {
  final int personId;

  const PersonDetailPage({super.key, required this.personId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final personAsync = ref.watch(getPersonStreamProvider(personId));
    final interactionsAsync = ref.watch(
      getPersonInteractionsStreamProvider(personId),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              context.push('/people/$personId/edit');
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Delete Relationship?'),
                  content: const Text('This cannot be undone.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text(
                        'Delete',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              );

              if (confirm == true) {
                await ref.read(peopleRepositoryProvider).deletePerson(personId);
                if (context.mounted) context.go('/people');
              }
            },
          ),
        ],
      ),
      body: personAsync.when(
        data: (person) {
          if (person == null) {
            return const Center(child: Text('Person not found'));
          }
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              Center(
                child: CircleAvatar(
                  radius: 50,
                  child: Text(
                    person.name[0],
                    style: const TextStyle(fontSize: 40),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  person.name,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ),
              Center(
                child: Chip(
                  label: Text(person.status),
                  backgroundColor: Theme.of(
                    context,
                  ).colorScheme.primaryContainer,
                ),
              ),
              if (person.privateNotes != null &&
                  person.privateNotes!.isNotEmpty) ...[
                const Divider(height: 32),
                _buildSectionHeader('Sensitive Notes'),
                _PrivacyGuard(content: person.privateNotes!),
              ],
              const Divider(height: 32),
              _buildSectionHeader('Interactions'),
              interactionsAsync.when(
                data: (interactions) {
                  if (interactions.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: Text('No interactions recorded yet.'),
                      ),
                    );
                  }
                  return ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: interactions.length,
                    itemBuilder: (context, index) {
                      final interaction = interactions[index];
                      return ListTile(
                        leading: Icon(_getIconForType(interaction.type)),
                        title: Text(interaction.type),
                        subtitle: Text(interaction.notes ?? ''),
                        trailing: Text(
                          DateFormat('MMM d').format(interaction.date),
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, s) =>
                    Center(child: Text('Error loading history: $e')),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  context.push('/people/$personId/interaction/add');
                },
                icon: const Icon(Icons.add_comment),
                label: const Text('Log Interaction'),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
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

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'call':
        return Icons.phone;
      case 'coffee':
        return Icons.local_cafe;
      case 'prayer':
        return Icons.volunteer_activism;
      case 'meeting':
        return Icons.groups;
      default:
        return Icons.event_note;
    }
  }
}

class _PrivacyGuard extends StatefulWidget {
  final String content;
  const _PrivacyGuard({required this.content});

  @override
  State<_PrivacyGuard> createState() => _PrivacyGuardState();
}

class _PrivacyGuardState extends State<_PrivacyGuard> {
  bool _isRevealed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isRevealed = !_isRevealed;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _isRevealed
              ? Theme.of(
                  context,
                ).colorScheme.surfaceContainerHighest.withOpacity(0.3)
              : Theme.of(context).colorScheme.errorContainer.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _isRevealed
                ? Colors.transparent
                : Theme.of(context).colorScheme.error.withOpacity(0.5),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _isRevealed ? Icons.lock_open : Icons.lock,
                  size: 16,
                  color: _isRevealed
                      ? Colors.grey
                      : Theme.of(context).colorScheme.error,
                ),
                const SizedBox(width: 8),
                Text(
                  _isRevealed ? 'Tap to Hide' : 'Tap to Reveal',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: _isRevealed
                        ? Colors.grey
                        : Theme.of(context).colorScheme.error,
                  ),
                ),
              ],
            ),
            if (_isRevealed) ...[
              const SizedBox(height: 12),
              Text(widget.content),
            ],
          ],
        ),
      ),
    );
  }
}
