import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/analytics.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';
import 'add_expense.dart';

class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({super.key});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  static const _pageSize = 40;

  String _query = '';
  String? _category;
  int _visible = _pageSize;

  Future<void> _confirmDelete(Expense expense) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete expense?'),
        content: Text('“${expense.description}” · ${formatInrAuto(expense.amount)}'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: context.colors.negative),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    try {
      await AppScope.of(context).expenses.remove(expense.id);
      if (mounted) showMessage(context, 'Expense deleted');
    } on ApiException catch (e) {
      if (mounted) showMessage(context, e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = AppScope.of(context).expenses;
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final c = context.colors;
        final needle = _query.trim().toLowerCase();
        final filtered = store.expenses
            .where((e) => (_category == null || e.category == _category) && (needle.isEmpty || e.description.toLowerCase().contains(needle)))
            .toList();
        final groups = _groupByDay(filtered.take(_visible));
        final isFiltered = needle.isNotEmpty || _category != null;

        return Scaffold(
          body: SafeArea(
            bottom: false,
            child: RefreshIndicator(
              onRefresh: store.load,
              child: CustomScrollView(
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                    sliver: SliverList.list(children: [
                      PageTitle(
                        'Expenses',
                        subtitle: store.isLoading
                            ? 'Loading…'
                            : '${filtered.length} ${filtered.length == 1 ? 'expense' : 'expenses'} · ${formatInr(sumOf(filtered))}',
                      ),
                      if (store.error != null) ErrorBanner(store.error!, onRetry: store.load),
                      TextField(
                        onChanged: (v) => setState(() {
                          _query = v;
                          _visible = _pageSize;
                        }),
                        decoration: const InputDecoration(
                          hintText: 'Search descriptions',
                          prefixIcon: Icon(Icons.search, size: 20),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 36,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            for (final option in [null, ...categories])
                              Padding(
                                padding: const EdgeInsets.only(right: 6),
                                child: ChoiceChip(
                                  label: Text(option ?? 'All'),
                                  selected: _category == option,
                                  showCheckmark: false,
                                  visualDensity: VisualDensity.compact,
                                  selectedColor: c.foreground,
                                  backgroundColor: c.surface,
                                  side: BorderSide(color: _category == option ? c.foreground : c.border),
                                  labelStyle: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: _category == option ? c.background : c.foreground2,
                                  ),
                                  onSelected: (_) => setState(() {
                                    _category = option;
                                    _visible = _pageSize;
                                  }),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                    ]),
                  ),
                  if (store.isLoading)
                    const SliverToBoxAdapter(child: LoadingBlock())
                  else if (filtered.isEmpty)
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverToBoxAdapter(
                        child: AppCard(
                          padding: EdgeInsets.zero,
                          child: isFiltered
                              ? const EmptyState(icon: Icons.search_off, title: 'No matching expenses', message: 'Try a different search or category.')
                              : EmptyState(
                                  icon: Icons.receipt_long_outlined,
                                  title: 'No expenses yet',
                                  message: 'Each expense you record is saved to this device’s account.',
                                  action: FilledButton.icon(
                                    onPressed: () => showAddExpenseSheet(context),
                                    icon: const Icon(Icons.add, size: 18),
                                    label: const Text('Add expense'),
                                  ),
                                ),
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                      sliver: SliverList.builder(
                        itemCount: groups.length + (filtered.length > _visible ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == groups.length) {
                            return Center(
                              child: OutlinedButton(
                                onPressed: () => setState(() => _visible += _pageSize),
                                child: Text('Show more (${filtered.length - _visible} remaining)'),
                              ),
                            );
                          }
                          final group = groups[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                SectionLabel(group.label, trailing: formatInr(group.total)),
                                DividedCard(children: [
                                  for (final expense in group.expenses)
                                    Dismissible(
                                      key: ValueKey(expense.id),
                                      direction: DismissDirection.endToStart,
                                      confirmDismiss: (_) async {
                                        await _confirmDelete(expense);
                                        return false;
                                      },
                                      background: Container(
                                        color: c.negativeSoft,
                                        alignment: Alignment.centerRight,
                                        padding: const EdgeInsets.only(right: 20),
                                        child: Icon(Icons.delete_outline, color: c.negative),
                                      ),
                                      child: InkWell(
                                        onLongPress: () => _confirmDelete(expense),
                                        child: ExpenseTile(expense: expense),
                                      ),
                                    ),
                                ]),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  List<_DayGroup> _groupByDay(Iterable<Expense> expenses) {
    final today = dateOnly(DateTime.now());
    final groups = <DateTime, _DayGroup>{};
    for (final e in expenses) {
      final day = dateOnly(e.date);
      final label = day == today
          ? 'Today'
          : day == today.subtract(const Duration(days: 1))
              ? 'Yesterday'
              : formatLongDate(day);
      final group = groups.putIfAbsent(day, () => _DayGroup(label));
      group.expenses.add(e);
      group.total += e.amount;
    }
    return groups.values.toList();
  }
}

class _DayGroup {
  _DayGroup(this.label);
  final String label;
  final List<Expense> expenses = [];
  double total = 0;
}
