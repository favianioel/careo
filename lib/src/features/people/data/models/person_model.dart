import 'package:isar/isar.dart';
import 'package:careo/src/features/people/domain/entities/person.dart';

part 'person_model.g.dart';

@collection
class PersonModel {
  Id id = Isar.autoIncrement;

  late String name;
  String? nickname;
  List<String>? tags;
  late String status;
  DateTime? birthday;
  DateTime? anniversary;
  String? photoPath;
  String? email;
  String? phone;
  String? address;

  String? pipelineType;
  String? pipelineStage;
  String? privateNotes;

  // Mapper to Domain Entity
  Person toEntity() {
    return Person(
      id: id,
      name: name,
      nickname: nickname,
      tags: tags ?? [],
      status: status,
      birthday: birthday,
      anniversary: anniversary,
      photoPath: photoPath,
      email: email,
      phone: phone,
      address: address,
      pipelineType: pipelineType,
      pipelineStage: pipelineStage,
      privateNotes: privateNotes,
    );
  }

  // Mapper from Domain Entity
  static PersonModel fromEntity(Person person) {
    final model = PersonModel()
      ..name = person.name
      ..nickname = person.nickname
      ..tags = person.tags
      ..status = person.status
      ..birthday = person.birthday
      ..anniversary = person.anniversary
      ..photoPath = person.photoPath
      ..email = person.email
      ..phone = person.phone
      ..address = person.address
      ..pipelineType = person.pipelineType
      ..pipelineStage = person.pipelineStage
      ..privateNotes = person.privateNotes;

    if (person.id != null) {
      model.id = person.id!;
    }
    return model;
  }
}
