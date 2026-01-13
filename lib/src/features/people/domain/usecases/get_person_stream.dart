import 'package:careo/src/features/people/domain/entities/person.dart';
import 'package:careo/src/features/people/domain/repositories/people_repository.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GetPersonStream {
  final PeopleRepository repository;

  GetPersonStream(this.repository);

  Stream<Person?> call(int id) {
    return repository.watchPerson(id);
  }
}

final getPersonStreamProvider = StreamProvider.family<Person?, int>((ref, id) {
  final repository = ref.watch(peopleRepositoryProvider);
  return GetPersonStream(repository).call(id);
});
