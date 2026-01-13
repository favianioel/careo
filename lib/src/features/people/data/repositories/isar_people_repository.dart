import 'package:isar/isar.dart';
import 'package:careo/src/core/db/isar_provider.dart';
import 'package:careo/src/features/people/data/models/person_model.dart';
import 'package:careo/src/features/people/domain/entities/person.dart';
import 'package:careo/src/features/people/domain/repositories/people_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class IsarPeopleRepository implements PeopleRepository {
  final IsarProvider isarProvider;

  IsarPeopleRepository(this.isarProvider);

  Future<Isar> get db => isarProvider.db;

  @override
  Future<List<Person>> getAllPeople() async {
    final isar = await db;
    final models = await isar.personModels.where().findAll();
    return models.map((e) => e.toEntity()).toList();
  }

  @override
  Stream<List<Person>> watchAllPeople() async* {
    final isar = await db;
    yield* isar.personModels
        .where()
        .watch(fireImmediately: true)
        .map((models) => models.map((e) => e.toEntity()).toList());
  }

  @override
  Future<int> savePerson(Person person) async {
    final isar = await db;
    final model = PersonModel.fromEntity(person);
    return await isar.writeTxn(() async {
      return await isar.personModels.put(model);
    });
  }

  @override
  Future<void> deletePerson(int id) async {
    final isar = await db;
    await isar.writeTxn(() async {
      await isar.personModels.delete(id);
    });
  }

  @override
  Future<Person?> getPerson(int id) async {
    final isar = await db;
    final model = await isar.personModels.get(id);
    return model?.toEntity();
  }

  @override
  Stream<Person?> watchPerson(int id) async* {
    final isar = await db;
    final query = isar.personModels.where().idEqualTo(id);
    yield* query.watch(fireImmediately: true).map((list) {
      if (list.isNotEmpty) {
        return list.first.toEntity();
      }
      return null;
    });
  }
}

final peopleRepositoryProvider = Provider<PeopleRepository>((ref) {
  return IsarPeopleRepository(IsarProvider());
});
