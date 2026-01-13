import 'package:careo/src/features/interactions/domain/entities/interaction.dart';
import 'package:careo/src/features/interactions/data/repositories/isar_interactions_repository.dart';
import 'package:careo/src/core/services/mock_calendar_service.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class LogInteractionPage extends ConsumerStatefulWidget {
  final int personId;
  const LogInteractionPage({super.key, required this.personId});

  @override
  ConsumerState<LogInteractionPage> createState() => _LogInteractionPageState();
}

class _LogInteractionPageState extends ConsumerState<LogInteractionPage> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  String _selectedType = 'Call';
  DateTime _selectedDate = DateTime.now();
  bool _addToCalendar = false;
  bool _isSaving = false;

  final List<String> _types = [
    'Call',
    'Coffee',
    'Prayer',
    'Meeting',
    'Message',
  ];

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_selectedDate),
      );
      if (time != null) {
        setState(() {
          _selectedDate = DateTime(
            picked.year,
            picked.month,
            picked.day,
            time.hour,
            time.minute,
          );
        });
      } else {
        setState(() => _selectedDate = picked);
      }
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    try {
      final repo = ref.read(interactionsRepositoryProvider);
      String? calendarEventId;

      if (_addToCalendar) {
        final calendarService = ref.read(calendarServiceProvider);
        // Fetch person name for the event title
        final personRepo = ref.read(peopleRepositoryProvider);
        final person = await personRepo.getPerson(widget.personId);
        final personName = person?.name ?? 'Unknown';

        calendarEventId = await calendarService.createEvent(
          title: '$_selectedType with $personName',
          startTime: _selectedDate,
          endTime: _selectedDate.add(const Duration(hours: 1)),
          description: _notesController.text,
        );
      }

      final interaction = Interaction(
        personId: widget.personId,
        date: _selectedDate,
        type: _selectedType,
        notes: _notesController.text,
        calendarEventId: calendarEventId,
      );

      await repo.saveInteraction(interaction);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Log Interaction'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _isSaving ? null : _save,
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            DropdownButtonFormField<String>(
              value: _selectedType,
              decoration: const InputDecoration(
                labelText: 'Type',
                border: OutlineInputBorder(),
              ),
              items: _types
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedType = v!),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('Date & Time'),
              subtitle: Text(DateFormat.yMMMd().add_jm().format(_selectedDate)),
              trailing: const Icon(Icons.calendar_today),
              onTap: _pickDate,
              shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey.shade400),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            CheckboxListTile(
              value: _addToCalendar,
              title: const Text('Add to Device Calendar'),
              onChanged: (val) => setState(() => _addToCalendar = val ?? false),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
            ),
          ],
        ),
      ),
    );
  }
}
