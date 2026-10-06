import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../widgets.dart';
import 'assistant_screen.dart';
import 'goals_screen.dart';
import 'ledger_screen.dart';
import 'loan_screen.dart';
import 'news_screen.dart';
import 'settings_screen.dart';
import 'stocks_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: pagePadding,
          children: [
            const PageTitle('More'),
            const SectionLabel('Planning'),
            DividedCard(children: [
              _Item(Icons.track_changes_outlined, 'Goals', 'Savings targets', (_) => const GoalsScreen()),
              _Item(Icons.contacts_outlined, 'Ledger', 'Money in and out with people', (_) => const LedgerScreen()),
              _Item(Icons.calculate_outlined, 'Loan calculator', 'EMI and repayment schedule', (_) => const LoanScreen()),
            ]),
            const SizedBox(height: 22),
            const SectionLabel('Markets and help'),
            DividedCard(children: [
              _Item(Icons.chat_bubble_outline, 'Assistant', 'Ask finance questions', (_) => const AssistantScreen()),
              _Item(Icons.show_chart, 'Stock research', 'Briefings with sources', (_) => const StocksScreen()),
              _Item(Icons.newspaper_outlined, 'News', 'Indian finance headlines', (_) => const NewsScreen()),
            ]),
            const SizedBox(height: 22),
            DividedCard(children: [
              _Item(Icons.settings_outlined, 'Settings', 'Budget, theme, and device', (_) => const SettingsScreen()),
            ]),
          ],
        ),
      ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item(this.icon, this.title, this.subtitle, this.builder);

  final IconData icon;
  final String title;
  final String subtitle;
  final WidgetBuilder builder;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      leading: IconTile(icon, size: 36),
      title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12.5, color: c.muted)),
      trailing: Icon(Icons.chevron_right, color: c.subtle),
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: builder)),
    );
  }
}
