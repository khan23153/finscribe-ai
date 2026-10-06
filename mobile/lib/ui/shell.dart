import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../data/stores.dart';
import 'screens/add_expense.dart';
import 'screens/expenses_screen.dart';
import 'screens/home_screen.dart';
import 'screens/more_screen.dart';
import 'screens/reports_screen.dart';

/// Bottom-tab layout: Home, Expenses, Add, Reports, More.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  // Index into the NavigationBar; 2 is the Add action, not a page.
  int _index = 0;
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_started) {
      _started = true;
      AppScope.of(context).expenses.load();
    }
  }

  void _select(int index) {
    if (index == 2) {
      showAddExpenseSheet(context);
      return;
    }
    setState(() => _index = index);
  }

  void _goToTab(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final pages = [
      HomeScreen(onSeeAll: () => _goToTab(1), onOpenReports: () => _goToTab(3)),
      const ExpensesScreen(),
      const SizedBox.shrink(),
      const ReportsScreen(),
      const MoreScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(border: Border(top: BorderSide(color: c.border))),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _select,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            const NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined),
              selectedIcon: Icon(Icons.receipt_long),
              label: 'Expenses',
            ),
            NavigationDestination(
              icon: Container(
                width: 46,
                height: 38,
                decoration: BoxDecoration(color: c.accent, borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.add, color: c.accentForeground, size: 24),
              ),
              label: '',
              tooltip: 'Add expense',
            ),
            const NavigationDestination(
              icon: Icon(Icons.bar_chart_outlined),
              selectedIcon: Icon(Icons.bar_chart),
              label: 'Reports',
            ),
            const NavigationDestination(icon: Icon(Icons.more_horiz), label: 'More'),
          ],
        ),
      ),
    );
  }
}
