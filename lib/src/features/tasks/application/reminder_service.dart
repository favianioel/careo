import 'package:careo/src/features/interactions/data/repositories/isar_interactions_repository.dart';
import 'package:careo/src/features/interactions/domain/repositories/interactions_repository.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';
import 'package:careo/src/features/people/domain/repositories/people_repository.dart';
import 'package:careo/src/features/tasks/data/repositories/isar_tasks_repository.dart';
import 'package:careo/src/features/tasks/domain/entities/task.dart';
import 'package:careo/src/features/tasks/domain/repositories/tasks_repository.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ReminderService {
  final PeopleRepository peopleRepo;
  final InteractionsRepository interactionsRepo;
  final TasksRepository tasksRepo;

  ReminderService({
    required this.peopleRepo,
    required this.interactionsRepo,
    required this.tasksRepo,
  });

  // Frequency Configuration (Days)
  static const Map<String, int> _frequencies = {
    'Disciple': 7,
    'Family': 7,
    'Partner': 14,
    'Mentor': 14,
    'Friend': 30,
  };

  Future<void> runChecks() async {
    debugPrint('Running Reminder Checks...');
    final people = await peopleRepo.getAllPeople();
    final tasks = await tasksRepo.getIncompleteTasks();

    for (final person in people) {
      if (person.id == null) continue;

      // 1. Determine Frequency
      final days = _frequencies[person.status] ?? 30; // Default 30 days
      final cutoffDate = DateTime.now().subtract(Duration(days: days));

      // 2. Get Last Interaction
      final interactions = await interactionsRepo.getInteractionsForPerson(
        person.id!,
      );

      DateTime lastContact = DateTime(2000); // Very old if never contacted
      if (interactions.isNotEmpty) {
        lastContact = interactions.first.date;
      }

      // 3. Check if Overdue
      if (lastContact.isBefore(cutoffDate)) {
        // Overdue!

        // 4. Check if Task already exists
        final hasActiveTask = tasks.any(
          (t) => t.relatedPersonId == person.id && t.type == 'reminder',
        );

        if (!hasActiveTask) {
          debugPrint('Creating reminder for ${person.name}');
          final newTask = Task(
            title: 'Connect with ${person.name}',
            description: 'It has been $days days since you last connected.',
            dueDate: DateTime.now(), // Due today
            relatedPersonId: person.id,
            type: 'reminder',
          );
          await tasksRepo.saveTask(newTask);
        }
      }
    }
  }
}

final reminderServiceProvider = Provider<ReminderService>((ref) {
  return ReminderService(
    peopleRepo: ref.watch(peopleRepositoryProvider),
    interactionsRepo: ref.watch(interactionsRepositoryProvider),
    tasksRepo: ref.watch(tasksRepositoryProvider),
  );
});
