import 'package:flutter/material.dart';

import '../../core/config.dart';
import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/stores.dart';
import '../widgets.dart';
import 'add_expense.dart' show amountInputFormatters;

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final local = AppScope.of(context).local;
    return ListenableBuilder(
      listenable: local,
      builder: (context, _) {
        final c = context.colors;
        return Scaffold(
          appBar: AppBar(title: const Text('Settings')),
          body: ListView(
            padding: pagePadding,
            children: [
              const SectionLabel('Budget'),
              DividedCard(children: [
                _AmountTile(
                  label: 'Monthly spending budget',
                  value: local.monthlyBudget,
                  onSave: local.setMonthlyBudget,
                ),
                _AmountTile(label: 'Monthly income', value: local.monthlyIncome, onSave: local.setMonthlyIncome),
              ]),
              Padding(
                padding: const EdgeInsets.fromLTRB(4, 8, 4, 0),
                child: Text('Used on Home to show how much of your month is left. Stored on this device.',
                    style: TextStyle(fontSize: 12.5, color: c.muted)),
              ),
              const SizedBox(height: 24),
              const SectionLabel('Appearance'),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('Theme', style: TextStyle(fontSize: 15, color: c.foreground)),
                    const SizedBox(height: 12),
                    SegmentedButton<ThemeMode>(
                      segments: const [
                        ButtonSegment(value: ThemeMode.system, label: Text('System')),
                        ButtonSegment(value: ThemeMode.light, label: Text('Light')),
                        ButtonSegment(value: ThemeMode.dark, label: Text('Dark')),
                      ],
                      selected: {local.themeMode},
                      showSelectedIcon: false,
                      onSelectionChanged: (s) => local.setThemeMode(s.first),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const SectionLabel('About this device'),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('No sign-in needed', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: c.foreground)),
                    const SizedBox(height: 4),
                    Text(
                      'Your expenses are saved to FinScribe under a private key created on this phone. '
                      'Uninstalling the app or clearing its data removes the key, and those expenses can no longer be opened. '
                      'Goals and the ledger are stored only on this phone.',
                      style: TextStyle(fontSize: 13, height: 1.45, color: c.foreground2),
                    ),
                    const SizedBox(height: 12),
                    Text('Server: ${Uri.parse(AppConfig.apiBaseUrl).host}', style: TextStyle(fontSize: 12, color: c.muted)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AmountTile extends StatelessWidget {
  const _AmountTile({required this.label, required this.value, required this.onSave});

  final String label;
  final double? value;
  final Future<void> Function(double?) onSave;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      title: Text(label, style: const TextStyle(fontSize: 15)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value == null ? 'Not set' : formatInr(value!),
            style: TextStyle(fontSize: 14.5, color: value == null ? c.muted : c.foreground, fontFeatures: tabularFigures),
          ),
          const SizedBox(width: 4),
          Icon(Icons.chevron_right, color: c.subtle, size: 20),
        ],
      ),
      onTap: () => showAppSheet(context, title: label, child: _AmountForm(initial: value, onSave: onSave)),
    );
  }
}

class _AmountForm extends StatefulWidget {
  const _AmountForm({required this.initial, required this.onSave});

  final double? initial;
  final Future<void> Function(double?) onSave;

  @override
  State<_AmountForm> createState() => _AmountFormState();
}

class _AmountFormState extends State<_AmountForm> {
  late final _controller = TextEditingController(text: widget.initial?.round().toString() ?? '');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _controller,
          autofocus: true,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: amountInputFormatters,
          decoration: const InputDecoration(labelText: 'Amount', prefixText: '₹ ', hintText: 'Leave empty to clear'),
        ),
        const SizedBox(height: 20),
        FilledButton(
          onPressed: () async {
            await widget.onSave(double.tryParse(_controller.text));
            if (context.mounted) Navigator.pop(context);
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
