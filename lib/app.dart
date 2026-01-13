import 'package:flutter/material.dart';
import 'package:careo/src/core/routing/app_router.dart';

class CareoApp extends StatelessWidget {
  const CareoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Careo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal,
        ), // Warm/Professional tone
        useMaterial3: true,
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 0),
        ),
      ),
      routerConfig: goRouter,
    );
  }
}
