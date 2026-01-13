import 'package:careo/src/features/tasks/domain/entities/task.dart';

abstract class TasksRepository {
  Future<int> saveTask(Task task);
  Future<void> deleteTask(int id);
  Future<List<Task>> getIncompleteTasks();
  Stream<List<Task>> watchIncompleteTasks();
  Future<void> completeTask(int id);
}
