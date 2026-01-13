import 'package:careo/src/features/tasks/domain/entities/task.dart';
import 'package:careo/src/features/tasks/domain/repositories/tasks_repository.dart';
import 'package:careo/src/features/tasks/data/repositories/isar_tasks_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GetIncompleteTasksStream {
  final TasksRepository repository;

  GetIncompleteTasksStream(this.repository);

  Stream<List<Task>> call() {
    return repository.watchIncompleteTasks();
  }
}

final getIncompleteTasksStreamProvider = StreamProvider<List<Task>>((ref) {
  final repository = ref.watch(tasksRepositoryProvider);
  return GetIncompleteTasksStream(repository).call();
});
