import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';

Future<void> showAddExpenseSheet(BuildContext context) async {
  final saved = await showAppSheet<bool>(context, title: 'Add expense', child: const _AddExpenseForm());
  if (saved == true && context.mounted) showMessage(context, 'Expense saved');
}

final amountInputFormatters = [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}'))];

class _AddExpenseForm extends StatefulWidget {
  const _AddExpenseForm();

  @override
  State<_AddExpenseForm> createState() => _AddExpenseFormState();
}

class _AddExpenseFormState extends State<_AddExpenseForm> {
  final _formKey = GlobalKey<FormState>();
  final _amount = TextEditingController();
  final _description = TextEditingController();
  String _category = categories.first;
  DateTime _date = dateOnly(DateTime.now());
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _amount.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2000),
      lastDate: dateOnly(DateTime.now()),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await AppScope.of(context).expenses.add(
            description: _description.text.trim(),
            amount: double.parse(_amount.text),
            category: _category,
            date: toIsoDate(_date),
          );
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() {
        _saving = false;
        _error = e.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_error != null) ErrorBanner(_error!),
          TextFormField(
            controller: _amount,
            autofocus: true,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: amountInputFormatters,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600, fontFeatures: tabularFigures),
            decoration: InputDecoration(
              labelText: 'Amount',
              hintText: '0',
              prefixText: '₹ ',
              prefixStyle: TextStyle(fontSize: 22, color: c.muted),
            ),
            validator: (v) {
              final value = double.tryParse(v ?? '');
              if (value == null || value <= 0) return 'Enter an amount above zero';
              if (value > 100000000) return 'Amount is too large';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _description,
            textCapitalization: TextCapitalization.sentences,
            maxLength: 160,
            decoration: const InputDecoration(labelText: 'Description', hintText: 'e.g. Groceries', counterText: ''),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Add a short description' : null,
          ),
          const SizedBox(height: 16),
          Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: c.foreground2)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final category in categories)
                ChoiceChip(
                  label: Text(category),
                  avatar: Icon(iconForCategory(category), size: 16),
                  selected: _category == category,
                  showCheckmark: false,
                  onSelected: (_) => setState(() => _category = category),
                  selectedColor: c.accentSoft,
                  side: BorderSide(color: _category == category ? c.accent : c.border),
                  labelStyle: TextStyle(
                    fontSize: 13,
                    color: _category == category ? c.accent : c.foreground2,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _pickDate,
            icon: const Icon(Icons.calendar_today_outlined, size: 17),
            label: Text(isToday(_date) ? 'Today' : formatLongDate(_date)),
            style: OutlinedButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.2))
                : const Text('Save expense'),
          ),
        ],
      ),
    );
  }
}

bool isToday(DateTime date) => dateOnly(date) == dateOnly(DateTime.now());
