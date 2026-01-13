import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:careo/src/features/people/domain/entities/person.dart';
import 'package:careo/src/features/people/data/repositories/isar_people_repository.dart';

class AddPersonPage extends ConsumerStatefulWidget {
  final int? personId;
  const AddPersonPage({super.key, this.personId});

  @override
  ConsumerState<AddPersonPage> createState() => _AddPersonPageState();
}

class _AddPersonPageState extends ConsumerState<AddPersonPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _statusController = TextEditingController(text: 'Partner');
  final _privateNotesController = TextEditingController();

  String? _selectedPipelineType;
  static const _evangelismFirstStage = 'Identify';
  static const _supportFirstStage = 'Identify';

  bool _isSaving = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    if (widget.personId != null) {
      _loadPerson();
    } else {
      _isLoading = false;
    }
  }

  Future<void> _loadPerson() async {
    try {
      final repo = ref.read(peopleRepositoryProvider);
      final person = await repo.getPerson(widget.personId!);
      if (person != null) {
        _nameController.text = person.name;
        _statusController.text = person.status;
        _privateNotesController.text = person.privateNotes ?? '';
        if (mounted) {
          setState(() {
            _selectedPipelineType = person.pipelineType;
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading person: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _statusController.dispose();
    _privateNotesController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final repository = ref.read(peopleRepositoryProvider);

      debugPrint('Saving Person. ID from widget: ${widget.personId}');

      String? stage;
      if (_selectedPipelineType == 'Evangelism') stage = _evangelismFirstStage;
      if (_selectedPipelineType == 'Support Raising')
        stage = _supportFirstStage;

      // Preserve stage if just editing details but keeping pipeline
      if (widget.personId != null) {
        final existing = await repository.getPerson(widget.personId!);
        if (existing?.pipelineType == _selectedPipelineType) {
          stage = existing?.pipelineStage;
        }
      }

      final person = Person(
        id: widget.personId,
        name: _nameController.text,
        status: _statusController.text,
        pipelineType: _selectedPipelineType,
        pipelineStage: stage ?? 'Identify',
        privateNotes: _privateNotesController.text.isNotEmpty
            ? _privateNotesController.text
            : null,
      );

      debugPrint('Person Entity ID: ${person.id}');

      await repository.savePerson(person);

      if (mounted) {
        context.pop(); // Go back to list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error saving: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final isEditing = widget.personId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Relationship' : 'Add Relationship'),
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
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter a name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _statusController.text,
              decoration: const InputDecoration(
                labelText: 'Status',
                border: OutlineInputBorder(),
              ),
              items: [
                'Partner',
                'Friend',
                'Family',
                'Mentor',
                'Disciple',
              ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (val) {
                if (val != null) {
                  _statusController.text = val;
                }
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _privateNotesController,
              decoration: const InputDecoration(
                labelText: 'Sensitive Notes (Locked)',
                border: OutlineInputBorder(),
                helperText: 'Visible only after tapping to reveal',
                suffixIcon: Icon(Icons.lock_outline),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedPipelineType,
              decoration: const InputDecoration(
                labelText: 'Pipeline (Optional)',
                border: OutlineInputBorder(),
                helperText: 'Track their journey in a pipeline',
              ),
              items: [
                const DropdownMenuItem(value: null, child: Text('None')),
                const DropdownMenuItem(
                  value: 'Evangelism',
                  child: Text('Evangelism'),
                ),
                const DropdownMenuItem(
                  value: 'Support Raising',
                  child: Text('Support Raising'),
                ),
              ],
              onChanged: (val) {
                setState(() => _selectedPipelineType = val);
              },
            ),
          ],
        ),
      ),
    );
  }
}
