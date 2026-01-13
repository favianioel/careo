import 'package:isar/isar.dart';
import 'package:careo/src/features/tasks/domain/entities/task.dart';

part 'task_model.g.dart';

@collection
class TaskModel {
  Id id = Isar.autoIncrement;

  late String title;
  String? description;
  @Index()
  late DateTime dueDate;
  bool isCompleted = false;
  int? relatedPersonId;
  late String type;

  Task toEntity() {
    return Task(
      id: id,
      title: title,
      description: description,
      dueDate: dueDate,
      isCompleted: isCompleted,
      relatedPersonId: relatedPersonId,
      type: type,
    );
  }

  static TaskModel fromEntity(Task task) {
    return TaskModel()
      ..title = task.title
      ..description = task.description
      ..dueDate = task.dueDate
      ..isCompleted = task.isCompleted
      ..relatedPersonId = task.relatedPersonId
      ..type = task.type;
  }
}
