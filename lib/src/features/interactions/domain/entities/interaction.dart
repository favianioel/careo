import 'package:careo/src/features/people/domain/entities/person.dart';

class Interaction {
  final int? id;
  final int personId; // Link to Person
  final DateTime date;
  final String type; // call, coffee, prayer, etc.
  final String? notes;
  final String? calendarEventId;

  Interaction({
    this.id,
    required this.personId,
    required this.date,
    required this.type,
    this.notes,
    this.calendarEventId,
  });
}
