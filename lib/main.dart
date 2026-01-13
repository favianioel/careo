import 'package:flutter/material.dart';
import 'package:careo/app.dart';
import 'package:careo/src/core/db/isar_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Isar
  await IsarProvider().openDB();

  runApp(const ProviderScope(child: CareoApp()));
}
