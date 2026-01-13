import 'package:careo/src/features/interactions/domain/entities/interaction.dart';

abstract class InteractionsRepository {
  Future<int> saveInteraction(Interaction interaction);
  Future<void> deleteInteraction(int id);
  Stream<List<Interaction>> watchInteractionsForPerson(int personId);
  Future<List<Interaction>> getInteractionsForPerson(int personId);
}
