import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/analytics.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  ReportPeriod _period = ReportPeriod.month;
  String? _summary;
  String? _summaryError;
  bool _generating = false;

  Future<void> _generate(List<Expense> expenses, List<CategoryShare> shares, double total) async {
    setState(() {
      _generating = true;
      _summary = null;
      _summaryError = null;
    });
    final categorySummary =
        shares.map((s) => '${s.category}: ₹${s.amount.toStringAsFixed(2)} (${s.count} transactions)').join('; ');
    try {
      final reply = await AppScope.of(context).api.askAi('report', [
        ChatMessage(
          fromUser: true,
          text: 'Period: ${_period.apiLabel}. Total recorded expenses: ₹${total.toStringAsFixed(2)} across '
              '${expenses.length} transactions. Categories: $categorySummary. '
              'Give three observations and two practical recommendations.',
        ),
      ]);
      if (mounted) setState(() => _summary = reply.text);
    } on ApiException catch (e) {
      if (mounted) setState(() => _summaryError = e.message);
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = AppScope.of(context).expenses;
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final c = context.colors;
        final start = _period.start(DateTime.now());
        final expenses = store.expenses.where((e) => !e.date.isBefore(start)).toList();
        final total = sumOf(expenses);
        final shares = byCategory(expenses);
        final largest = expenses.isEmpty ? null : expenses.reduce((a, b) => b.amount > a.amount ? b : a);

        return Scaffold(
          body: SafeArea(
            bottom: false,
            child: RefreshIndicator(
              onRefresh: store.load,
              child: ListView(
                padding: pagePadding,
                children: [
                  const PageTitle('Reports', subtitle: 'Totals and patterns from what you have recorded.'),
                  SegmentedButton<ReportPeriod>(
                    segments: [
                      for (final p in ReportPeriod.values) ButtonSegment(value: p, label: Text(p.label)),
                    ],
                    selected: {_period},
                    showSelectedIcon: false,
                    onSelectionChanged: (s) => setState(() {
                      _period = s.first;
                      _summary = null;
                      _summaryError = null;
                    }),
                  ),
                  const SizedBox(height: 16),
                  if (store.error != null) ErrorBanner(store.error!, onRetry: store.load),
                  if (store.isLoading)
                    const LoadingBlock()
                  else ...[
                    StatGrid(children: [
                      StatBlock(label: 'Total spent', value: formatInr(total)),
                      StatBlock(label: 'Transactions', value: '${expenses.length}'),
                      StatBlock(
                        label: 'Average',
                        value: formatInr(expenses.isEmpty ? 0 : total / expenses.length),
                        detail: 'per transaction',
                      ),
                      StatBlock(
                        label: 'Largest',
                        value: largest == null ? '—' : formatInr(largest.amount),
                        detail: largest == null ? null : '${largest.description} · ${formatShortDate(largest.date)}',
                      ),
                    ]),
                    const SizedBox(height: 14),
                    AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const CardTitle('By category', subtitle: 'Share of spending in this period'),
                          const SizedBox(height: 16),
                          if (shares.isEmpty)
                            const EmptyState(
                              icon: Icons.pie_chart_outline,
                              title: 'No spending in this period',
                              message: 'Pick a longer period or record an expense.',
                            )
                          else
                            CategoryBars(rows: shares, total: total),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const CardTitle('Written summary', subtitle: 'Generated from this period’s totals'),
                          const SizedBox(height: 14),
                          if (_summaryError != null) ErrorBanner(_summaryError!),
                          if (_summary != null) ...[
                            ProseText(_summary!),
                            Text('AI-generated from category totals only. Check figures before acting on them.',
                                style: TextStyle(fontSize: 12, color: c.muted)),
                          ] else
                            OutlinedButton.icon(
                              onPressed: _generating || expenses.isEmpty ? null : () => _generate(expenses, shares, total),
                              icon: _generating
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                  : const Icon(Icons.notes, size: 18),
                              label: Text(_generating ? 'Writing…' : 'Generate summary'),
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
