import 'package:careo/src/core/services/calendar_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MockCalendarService implements CalendarService {
  @override
  Future<String?> createEvent({
    required String title,
    required DateTime startTime,
    required DateTime endTime,
    String? description,
    String? location,
  }) async {
    // Mock implementation
    print('Mock Calendar: Created event $title from $startTime to $endTime');
    return 'mock_event_id_${DateTime.now().millisecondsSinceEpoch}';
  }

  @override
  Future<List> getCalendars() async {
    return ['Default Mock Calendar'];
  }

  @override
  Future<bool> requestPermissions() async {
    print('Mock Calendar: Permissions granted');
    return true;
  }
}

final calendarServiceProvider = Provider<CalendarService>((ref) {
  return MockCalendarService();
});
