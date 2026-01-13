import 'package:isar/isar.dart';
import 'package:careo/src/features/interactions/domain/entities/interaction.dart';

part 'interaction_model.g.dart';

@collection
class InteractionModel {
  Id id = Isar.autoIncrement;

  @Index()
  late int personId;

  late DateTime date;
  late String type;
  String? notes;
  String? calendarEventId;

  Interaction toEntity() {
    return Interaction(
      id: id,
      personId: personId,
      date: date,
      type: type,
      notes: notes,
      calendarEventId: calendarEventId,
    );
  }

  static InteractionModel fromEntity(Interaction interaction) {
    return InteractionModel()
      ..personId = interaction.personId
      ..date = interaction.date
      ..type = interaction.type
      ..notes = interaction.notes
      ..calendarEventId = interaction.calendarEventId;
  }
}
