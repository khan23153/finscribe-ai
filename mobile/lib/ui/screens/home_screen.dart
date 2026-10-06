import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/analytics.dart';
import '../../data/stores.dart';
import '../widgets.dart';
import 'add_expense.dart';
import 'settings_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.onSeeAll, required this.onOpenReports});

  final VoidCallback onSeeAll;
  final VoidCallback onOpenReports;

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    return ListenableBuilder(
      listenable: Listenable.merge([scope.expenses, scope.local]),
      builder: (context, _) {
        final store = scope.expenses;
        final c = context.colors;
        final now = DateTime.now();
        final expenses = store.expenses;
        final thisMonth = expenses.where((e) => isSameMonth(e.date, now)).toList();
        final lastMonth = DateTime(now.year, now.month - 1);
        // Month-to-date versus the same days of last month.
        final previous = expenses.where((e) => isSameMonth(e.date, lastMonth) && e.date.day <= now.day);
        final total = sumOf(thisMonth);
        final previousTotal = sumOf(previous);
        final shares = byCategory(thisMonth);
        final budget = scope.local.monthlyBudget;

        return Scaffold(
          body: SafeArea(
            bottom: false,
            child: RefreshIndicator(
              onRefresh: store.load,
              child: ListView(
                padding: pagePadding,
                children: [
                  Text(formatMonthYear(now), style: TextStyle(fontSize: 13, color: c.muted)),
                  const SizedBox(height: 2),
                  Text(_greeting(now), style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 18),
                  if (store.error != null) ErrorBanner(store.error!, onRetry: store.load),
                  AppCard(
                    child: store.isLoading
                        ? const LoadingBlock(height: 120)
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Spent this month', style: TextStyle(fontSize: 13, color: c.muted)),
                              const SizedBox(height: 4),
                              Text(
                                formatInr(total),
                                style: TextStyle(
                                  fontSize: 34,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: -0.8,
                                  color: c.foreground,
                                  fontFeatures: tabularFigures,
                                ),
                              ),
                              const SizedBox(height: 6),
                              _Comparison(total: total, previousTotal: previousTotal),
                              const SizedBox(height: 16),
                              if (budget != null) _BudgetMeter(spent: total, budget: budget) else _SetBudgetLink(),
                              const SizedBox(height: 16),
                              const Divider(),
                              const SizedBox(height: 14),
                              Row(
                                children: [
                                  Expanded(child: StatBlock(label: 'Transactions', value: '${thisMonth.length}')),
                                  Expanded(child: StatBlock(label: 'Daily avg.', value: formatInr(total / now.day))),
                                  Expanded(
                                    child: StatBlock(label: 'Top category', value: shares.isEmpty ? '—' : shares.first.category),
                                  ),
                                ],
                              ),
                            ],
                          ),
                  ),
                  const SizedBox(height: 14),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const CardTitle('Monthly spending', subtitle: 'Last six months · tap a bar'),
                        const SizedBox(height: 16),
                        if (store.isLoading)
                          const LoadingBlock(height: 150)
                        else if (expenses.isEmpty)
                          const EmptyState(
                            icon: Icons.bar_chart_outlined,
                            title: 'No history yet',
                            message: 'Monthly totals appear as you record expenses.',
                          )
                        else
                          TrendChart(points: monthlyTrend(expenses, now)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CardTitle(
                          'Where it went',
                          subtitle: 'This month, by category',
                          trailing: shares.length > 4
                              ? TextButton(onPressed: onOpenReports, child: const Text('All'))
                              : null,
                        ),
                        const SizedBox(height: 16),
                        if (store.isLoading)
                          const LoadingBlock(height: 100)
                        else if (shares.isEmpty)
                          const EmptyState(icon: Icons.pie_chart_outline, title: 'Nothing this month')
                        else
                          CategoryBars(rows: shares.take(4).toList(), total: total),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      const Expanded(child: SectionLabel('Recent activity')),
                      if (expenses.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: TextButton(onPressed: onSeeAll, child: const Text('See all')),
                        ),
                    ],
                  ),
                  if (!store.isLoading && expenses.isEmpty)
                    AppCard(
                      padding: EdgeInsets.zero,
                      child: EmptyState(
                        icon: Icons.receipt_long_outlined,
                        title: 'No expenses yet',
                        message: 'Record what you spend and FinScribe builds your monthly picture.',
                        action: FilledButton.icon(
                          onPressed: () => showAddExpenseSheet(context),
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Add your first expense'),
                        ),
                      ),
                    )
                  else if (expenses.isNotEmpty)
                    DividedCard(children: [for (final e in expenses.take(5)) ExpenseTile(expense: e)]),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  static String _greeting(DateTime now) => now.hour < 12
      ? 'Good morning'
      : now.hour < 17
          ? 'Good afternoon'
          : 'Good evening';
}

class _Comparison extends StatelessWidget {
  const _Comparison({required this.total, required this.previousTotal});

  final double total;
  final double previousTotal;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final style = TextStyle(fontSize: 13, color: c.muted);
    if (previousTotal <= 0) return Text('Nothing recorded by this point last month', style: style);

    final change = (total - previousTotal) / previousTotal * 100;
    final up = change > 0;
    return Row(
      children: [
        Icon(up ? Icons.arrow_outward : Icons.south_east, size: 14, color: up ? c.negative : c.positive),
        const SizedBox(width: 2),
        Text('${change.abs().round()}%',
            style: style.copyWith(color: up ? c.negative : c.positive, fontWeight: FontWeight.w600)),
        const SizedBox(width: 6),
        Flexible(child: Text('vs. ${formatInr(previousTotal)} by this point last month', style: style)),
      ],
    );
  }
}

class _BudgetMeter extends StatelessWidget {
  const _BudgetMeter({required this.spent, required this.budget});

  final double spent;
  final double budget;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final ratio = spent / budget;
    final remaining = budget - spent;
    final color = ratio >= 1 ? c.negative : ratio >= 0.8 ? c.warning : c.accent;
    return Column(
      children: [
        ProgressBar(value: ratio, color: color),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Text(
                remaining >= 0 ? '${formatInr(remaining)} left' : '${formatInr(-remaining)} over budget',
                style: TextStyle(fontSize: 13, color: remaining < 0 ? c.negative : c.foreground2),
              ),
            ),
            Text('of ${formatInr(budget)}', style: TextStyle(fontSize: 13, color: c.muted, fontFeatures: tabularFigures)),
          ],
        ),
      ],
    );
  }
}

class _SetBudgetLink extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
      child: Text.rich(
        TextSpan(children: [
          TextSpan(
            text: 'Set a monthly budget',
            style: TextStyle(color: context.colors.accent, fontWeight: FontWeight.w600),
          ),
          const TextSpan(text: ' to track what you have left.'),
        ]),
        style: TextStyle(fontSize: 13, color: context.colors.muted),
      ),
    );
  }
}
