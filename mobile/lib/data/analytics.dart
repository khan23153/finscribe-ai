import '../core/format.dart';
import '../ui/widgets.dart';
import 'models.dart';

bool isSameMonth(DateTime a, DateTime b) => a.year == b.year && a.month == b.month;

double sumOf(Iterable<Expense> expenses) => expenses.fold(0, (total, e) => total + e.amount);

List<CategoryShare> byCategory(Iterable<Expense> expenses) {
  final totals = <String, double>{};
  final counts = <String, int>{};
  for (final e in expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
    counts[e.category] = (counts[e.category] ?? 0) + 1;
  }
  return totals.entries.map((e) => CategoryShare(e.key, e.value, counts[e.key])).toList()
    ..sort((a, b) => b.amount.compareTo(a.amount));
}

List<TrendPoint> monthlyTrend(List<Expense> expenses, DateTime now, {int months = 6}) {
  return List.generate(months, (i) {
    final month = DateTime(now.year, now.month - (months - 1 - i));
    return TrendPoint(formatMonthShort(month), sumOf(expenses.where((e) => isSameMonth(e.date, month))));
  });
}

enum ReportPeriod { week, month, quarter, year }

extension ReportPeriodX on ReportPeriod {
  String get label => switch (this) {
        ReportPeriod.week => 'Week',
        ReportPeriod.month => 'Month',
        ReportPeriod.quarter => '3 months',
        ReportPeriod.year => 'Year',
      };

  /// Matches `startOfPeriod` in the web app (src/lib/expenses.ts).
  DateTime start(DateTime now) {
    final today = dateOnly(now);
    return switch (this) {
      ReportPeriod.week => today.subtract(Duration(days: today.weekday - 1)),
      ReportPeriod.month => DateTime(now.year, now.month),
      ReportPeriod.quarter => DateTime(now.year, now.month - 2),
      ReportPeriod.year => DateTime(now.year),
    };
  }

  String get apiLabel => switch (this) {
        ReportPeriod.week => 'This Week',
        ReportPeriod.month => 'This Month',
        ReportPeriod.quarter => 'Last 3 Months',
        ReportPeriod.year => 'This Year',
      };
}
