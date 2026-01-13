import 'package:isar/isar.dart';
import 'package:careo/src/core/db/isar_provider.dart';
import 'package:careo/src/features/tasks/data/models/task_model.dart';
import 'package:careo/src/features/tasks/domain/entities/task.dart';
import 'package:careo/src/features/tasks/domain/repositories/tasks_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class IsarTasksRepository implements TasksRepository {
  final IsarProvider isarProvider;

  IsarTasksRepository(this.isarProvider);

  Future<Isar> get db => isarProvider.db;

  @override
  Future<int> saveTask(Task task) async {
    final isar = await db;
    final model = TaskModel.fromEntity(task);
    return await isar.writeTxn(() async {
      return await isar.taskModels.put(model);
    });
  }

  @override
  Future<void> deleteTask(int id) async {
    final isar = await db;
    await isar.writeTxn(() async {
      await isar.taskModels.delete(id);
    });
  }

  @override
  Future<List<Task>> getIncompleteTasks() async {
    final isar = await db;
    final models = await isar.taskModels
        .filter()
        .isCompletedEqualTo(false)
        .sortByDueDate()
        .findAll();
    return models.map((e) => e.toEntity()).toList();
  }

  @override
  Stream<List<Task>> watchIncompleteTasks() async* {
    final isar = await db;
    final query = isar.taskModels
        .filter()
        .isCompletedEqualTo(false)
        .sortByDueDate();

    yield* query
        .watch(fireImmediately: true)
        .map((models) => models.map((e) => e.toEntity()).toList());
  }

  @override
  Future<void> completeTask(int id) async {
    final isar = await db;
    await isar.writeTxn(() async {
      final task = await isar.taskModels.get(id);
      if (task != null) {
        task.isCompleted = true;
        await isar.taskModels.put(task);
      }
    });
  }
}

final tasksRepositoryProvider = Provider<TasksRepository>((ref) {
  return IsarTasksRepository(IsarProvider());
});
