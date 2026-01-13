import 'package:careo/src/features/people/domain/entities/person.dart';
import 'package:careo/src/features/people/domain/repositories/people_repository.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GetPeopleStream {
  final PeopleRepository repository;

  GetPeopleStream(this.repository);

  Stream<List<Person>> call() {
    return repository.watchAllPeople();
  }
}

final getPeopleStreamProvider = StreamProvider<List<Person>>((ref) {
  final repository = ref.watch(peopleRepositoryProvider);
  return GetPeopleStream(repository).call();
});
