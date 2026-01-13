import 'package:careo/src/features/people/domain/entities/person.dart';

abstract class PeopleRepository {
  Future<List<Person>> getAllPeople();
  Stream<List<Person>> watchAllPeople();
  Future<int> savePerson(Person person);
  Future<void> deletePerson(int id);
  Future<Person?> getPerson(int id);
  Stream<Person?> watchPerson(int id);
}
