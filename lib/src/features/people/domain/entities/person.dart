class Person {
  final int? id;
  final String name;
  final String? nickname;
  final List<String> tags;
  final String status; // active, paused, etc.
  final DateTime? birthday;
  final DateTime? anniversary;
  final String? photoPath;

  // Contact Info
  final String? email;
  final String? phone;
  final String? address;

  // Pipeline
  final String? pipelineType; // 'evangelism' or 'support'
  final String? pipelineStage;

  // Privacy
  final String? privateNotes;

  Person({
    this.id,
    required this.name,
    this.nickname,
    this.tags = const [],
    this.status = 'active',
    this.birthday,
    this.anniversary,
    this.photoPath,
    this.email,
    this.phone,
    this.address,
    this.pipelineType,
    this.pipelineStage,
    this.privateNotes,
  });
}
