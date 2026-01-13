class Task {
  final int? id;
  final String title;
  final String? description;
  final DateTime dueDate;
  final bool isCompleted;
  final int? relatedPersonId;
  final String type; // manual, birthday, frequency, etc.

  Task({
    this.id,
    required this.title,
    this.description,
    required this.dueDate,
    this.isCompleted = false,
    this.relatedPersonId,
    required this.type,
  });
}
