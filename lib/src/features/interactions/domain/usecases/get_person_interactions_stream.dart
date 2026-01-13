import 'package:careo/src/features/interactions/domain/entities/interaction.dart';
import 'package:careo/src/features/interactions/domain/repositories/interactions_repository.dart';
import 'package:careo/src/features/interactions/data/repositories/isar_interactions_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GetPersonInteractionsStream {
  final InteractionsRepository repository;

  GetPersonInteractionsStream(this.repository);

  Stream<List<Interaction>> call(int personId) {
    return repository.watchInteractionsForPerson(personId);
  }
}

final getPersonInteractionsStreamProvider =
    StreamProvider.family<List<Interaction>, int>((ref, personId) {
      final repository = ref.watch(interactionsRepositoryProvider);
      return GetPersonInteractionsStream(repository).call(personId);
    });
