import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:careo/src/features/people/presentation/pages/people_list_page.dart';
import 'package:careo/src/features/people/presentation/pages/add_person_page.dart';
import 'package:careo/src/features/people/presentation/pages/person_detail_page.dart';
import 'package:careo/src/features/interactions/presentation/pages/log_interaction_page.dart';
import 'package:careo/src/features/pipeline/presentation/pages/pipeline_page.dart';
import 'package:careo/src/features/dashboard/presentation/pages/dashboard_page.dart';

// Placeholder screens for testing routing
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Careo')),
      body: Center(child: const Text('Home Screen')),
    );
  }
}

final goRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const DashboardPage()),
    GoRoute(
      path: '/people',
      builder: (context, state) => const PeopleListPage(),
      routes: [
        GoRoute(
          path: 'add',
          builder: (context, state) => const AddPersonPage(),
        ),
        GoRoute(
          path: ':id',
          builder: (context, state) {
            final id = int.parse(state.pathParameters['id']!);
            return PersonDetailPage(personId: id);
          },
          routes: [
            GoRoute(
              path: 'edit',
              builder: (context, state) {
                final id = int.parse(state.pathParameters['id']!);
                return AddPersonPage(personId: id);
              },
            ),
            GoRoute(
              path: 'interaction/add',
              builder: (context, state) {
                final id = int.parse(state.pathParameters['id']!);
                return LogInteractionPage(personId: id);
              },
            ),
          ],
        ),
      ],
    ),
    GoRoute(
      path: '/pipeline',
      builder: (context, state) => const PipelinePage(),
    ),
    // Add more routes here
  ],
);
