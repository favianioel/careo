abstract class CalendarService {
  Future<bool> requestPermissions();
  Future<List<dynamic>>
  getCalendars(); // dynamic for now, represents Calendar object
  Future<String?> createEvent({
    required String title,
    required DateTime startTime,
    required DateTime endTime,
    String? description,
    String? location,
  });
}
