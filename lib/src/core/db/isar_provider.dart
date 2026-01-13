import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:careo/src/features/people/data/models/person_model.dart';
import 'package:careo/src/features/interactions/data/models/interaction_model.dart';
import 'package:careo/src/features/tasks/data/models/task_model.dart';
// Import other models here as they are created

class IsarProvider {
  late Future<Isar> db;

  IsarProvider() {
    db = openDB();
  }

  Future<Isar> openDB() async {
    const dbName = 'careo_db_v1';
    if (Isar.instanceNames.contains(dbName)) {
      return Future.value(Isar.getInstance(dbName)!);
    }
    final dir = await getApplicationDocumentsDirectory();
    return await Isar.open(
      [PersonModelSchema, InteractionModelSchema, TaskModelSchema],
      directory: dir.path,
      name: dbName,
      inspector: true,
    );
  }
}
