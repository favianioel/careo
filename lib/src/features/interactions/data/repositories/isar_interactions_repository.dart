import 'package:isar/isar.dart';
import 'package:careo/src/core/db/isar_provider.dart';
import 'package:careo/src/features/interactions/data/models/interaction_model.dart';
import 'package:careo/src/features/interactions/domain/entities/interaction.dart';
import 'package:careo/src/features/interactions/domain/repositories/interactions_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class IsarInteractionsRepository implements InteractionsRepository {
  final IsarProvider isarProvider;

  IsarInteractionsRepository(this.isarProvider);

  Future<Isar> get db => isarProvider.db;

  @override
  Future<int> saveInteraction(Interaction interaction) async {
    final isar = await db;
    final model = InteractionModel.fromEntity(interaction);
    return await isar.writeTxn(() async {
      return await isar.interactionModels.put(model);
    });
  }

  @override
  Future<void> deleteInteraction(int id) async {
    final isar = await db;
    await isar.writeTxn(() async {
      await isar.interactionModels.delete(id);
    });
  }

  @override
  Future<List<Interaction>> getInteractionsForPerson(int personId) async {
    final isar = await db;
    final models = await isar.interactionModels
        .where()
        .personIdEqualTo(personId)
        .sortByDateDesc()
        .findAll();
    return models.map((e) => e.toEntity()).toList();
  }

  @override
  Stream<List<Interaction>> watchInteractionsForPerson(int personId) async* {
    final isar = await db;
    final query = isar.interactionModels
        .where()
        .personIdEqualTo(personId)
        .sortByDateDesc();

    yield* query
        .watch(fireImmediately: true)
        .map((models) => models.map((e) => e.toEntity()).toList());
  }
}

final interactionsRepositoryProvider = Provider<InteractionsRepository>((ref) {
  return IsarInteractionsRepository(IsarProvider());
});
