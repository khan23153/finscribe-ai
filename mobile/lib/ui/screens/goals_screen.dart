import 'dart:math';

import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';
import 'add_expense.dart' show amountInputFormatters;

class GoalsScreen extends StatelessWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final local = AppScope.of(context).local;
    return ListenableBuilder(
      listenable: local,
      builder: (context, _) {
        final goals = local.goals;
        final saved = goals.fold<double>(0, (t, g) => t + g.current);
        final target = goals.fold<double>(0, (t, g) => t + g.target);

        return Scaffold(
          appBar: AppBar(title: const Text('Goals')),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => showAppSheet(context, title: 'New goal', child: const _GoalForm()),
            icon: const Icon(Icons.add),
            label: const Text('New goal'),
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 96),
            children: [
              Text(
                goals.isEmpty
                    ? 'Set savings targets and track progress. Stored on this device.'
                    : '${formatInr(saved)} saved of ${formatInr(target)}',
                style: TextStyle(fontSize: 14, color: context.colors.muted),
              ),
              const SizedBox(height: 16),
              if (goals.isEmpty)
                const AppCard(
                  padding: EdgeInsets.zero,
                  child: EmptyState(
                    icon: Icons.track_changes_outlined,
                    title: 'No goals yet',
                    message: 'A goal with a date tells you how much to set aside each month.',
                  ),
                )
              else
                for (final goal in goals) ...[_GoalCard(goal: goal), const SizedBox(height: 12)],
            ],
          ),
        );
      },
    );
  }
}

class _GoalCard extends StatelessWidget {
  const _GoalCard({required this.goal});

  final Goal goal;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final local = AppScope.of(context).local;
    final progress = min(goal.current / goal.target, 1.0);
    final now = DateTime.now();
    final complete = progress >= 1;
    final monthsLeft = goal.deadline.isBefore(now)
        ? 0
        : max(1, (goal.deadline.year - now.year) * 12 + goal.deadline.month - now.month);
    final monthly = monthsLeft > 0 ? (goal.target - goal.current) / monthsLeft : null;
    final behind = !complete && _isBehind(goal, progress, now);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconTile(goalIcons[goal.icon] ?? Icons.flag_outlined, size: 40, accent: true),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(goal.name,
                              maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleMedium),
                        ),
                        const SizedBox(width: 8),
                        Pill(
                          complete ? 'Complete' : behind ? 'Behind' : 'On track',
                          tone: behind ? PillTone.warning : PillTone.positive,
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'By ${formatLongDate(goal.deadline)}${complete ? '' : monthsLeft > 0 ? ' · $monthsLeft ${monthsLeft == 1 ? 'month' : 'months'} left' : ' · Past due'}',
                      style: TextStyle(fontSize: 12.5, color: c.muted),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: Icon(Icons.more_vert, color: c.muted, size: 20),
                onSelected: (_) => local.removeGoal(goal.id),
                itemBuilder: (_) => const [PopupMenuItem(value: 'delete', child: Text('Delete goal'))],
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Expanded(
                child: Text(formatInr(goal.current),
                    style: TextStyle(fontSize: 21, fontWeight: FontWeight.w600, color: c.foreground, fontFeatures: tabularFigures)),
              ),
              Text('of ${formatInr(goal.target)}', style: TextStyle(fontSize: 13, color: c.muted)),
            ],
          ),
          const SizedBox(height: 8),
          ProgressBar(value: progress),
          const SizedBox(height: 8),
          Text(
            complete
                ? 'Target reached.'
                : monthly != null
                    ? '${(progress * 100).round()}% there · save about ${formatInr(monthly)}/month to finish on time'
                    : '${(progress * 100).round()}% there',
            style: TextStyle(fontSize: 12.5, color: c.muted),
          ),
          if (!complete) ...[
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => showAppSheet(context, title: 'Add to ${goal.name}', child: _AddSavingsForm(goal: goal)),
                child: const Text('Add savings'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  static bool _isBehind(Goal goal, double progress, DateTime now) {
    final span = goal.deadline.difference(goal.createdAt).inSeconds;
    if (span <= 0) return now.isAfter(goal.deadline);
    final elapsed = (now.difference(goal.createdAt).inSeconds / span).clamp(0.0, 1.0);
    return progress < elapsed;
  }
}

class _GoalForm extends StatefulWidget {
  const _GoalForm();

  @override
  State<_GoalForm> createState() => _GoalFormState();
}

class _GoalFormState extends State<_GoalForm> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _target = TextEditingController();
  final _current = TextEditingController();
  DateTime _deadline = DateTime(DateTime.now().year, DateTime.now().month + 6, DateTime.now().day);
  String _icon = 'home';

  @override
  void dispose() {
    _name.dispose();
    _target.dispose();
    _current.dispose();
    super.dispose();
  }

  void _save() {
    if (!_formKey.currentState!.validate()) return;
    final target = double.parse(_target.text);
    AppScope.of(context).local.addGoal(Goal(
          id: newId(),
          name: _name.text.trim(),
          target: target,
          current: min(double.tryParse(_current.text) ?? 0, target),
          deadline: _deadline,
          icon: _icon,
          createdAt: DateTime.now(),
        ));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _name,
            autofocus: true,
            maxLength: 80,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(labelText: 'Name', hintText: 'e.g. Emergency fund', counterText: ''),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Give the goal a name' : null,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _target,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: amountInputFormatters,
                  decoration: const InputDecoration(labelText: 'Target', prefixText: '₹ '),
                  validator: (v) => (double.tryParse(v ?? '') ?? 0) <= 0 ? 'Required' : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _current,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: amountInputFormatters,
                  decoration: const InputDecoration(labelText: 'Already saved', prefixText: '₹ ', hintText: '0'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _deadline,
                firstDate: DateTime.now(),
                lastDate: DateTime(DateTime.now().year + 50),
              );
              if (picked != null) setState(() => _deadline = picked);
            },
            icon: const Icon(Icons.event_outlined, size: 18),
            label: Text('Target date: ${formatLongDate(_deadline)}'),
            style: OutlinedButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          const SizedBox(height: 16),
          Text('Icon', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: c.foreground2)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              for (final entry in goalIcons.entries)
                InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => setState(() => _icon = entry.key),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: _icon == entry.key ? c.accentSoft : null,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _icon == entry.key ? c.accent : c.border),
                    ),
                    child: Icon(entry.value, size: 18, color: _icon == entry.key ? c.accent : c.muted),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 22),
          FilledButton(onPressed: _save, child: const Text('Create goal')),
        ],
      ),
    );
  }
}

class _AddSavingsForm extends StatefulWidget {
  const _AddSavingsForm({required this.goal});

  final Goal goal;

  @override
  State<_AddSavingsForm> createState() => _AddSavingsFormState();
}

class _AddSavingsFormState extends State<_AddSavingsForm> {
  final _amount = TextEditingController();

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _amount,
          autofocus: true,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: amountInputFormatters,
          decoration: InputDecoration(
            labelText: 'Amount',
            prefixText: '₹ ',
            helperText: '${formatInr(widget.goal.target - widget.goal.current)} to go',
          ),
        ),
        const SizedBox(height: 20),
        FilledButton(
          onPressed: () {
            final amount = double.tryParse(_amount.text) ?? 0;
            if (amount <= 0) return;
            AppScope.of(context).local.addToGoal(widget.goal.id, amount);
            Navigator.pop(context);
          },
          child: const Text('Add savings'),
        ),
      ],
    );
  }
}
