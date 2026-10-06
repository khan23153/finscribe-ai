import 'dart:math';

import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';

class _Row {
  const _Row(this.label, this.principal, this.interest, this.balance);
  final String label;
  final double principal;
  final double interest;
  final double balance;
}

class LoanScreen extends StatefulWidget {
  const LoanScreen({super.key});

  @override
  State<LoanScreen> createState() => _LoanScreenState();
}

class _LoanScreenState extends State<LoanScreen> {
  double _amount = 1000000;
  double _rate = 8.5;
  int _months = 120;
  bool _yearly = true;
  String? _analysis;
  String? _analysisError;
  bool _analysing = false;

  ({double emi, double total, double interest, List<_Row> monthly, List<_Row> yearly}) _calculate() {
    final r = _rate / 12 / 100;
    final n = _months;
    final emi = r == 0 ? _amount / n : _amount * r * pow(1 + r, n) / (pow(1 + r, n) - 1);
    final monthly = <_Row>[];
    var balance = _amount;
    for (var m = 1; m <= n; m++) {
      final interest = balance * r;
      final principal = emi - interest;
      balance = max(balance - principal, 0);
      monthly.add(_Row('$m', principal, interest, balance));
    }
    final yearly = <_Row>[];
    for (var i = 0; i < monthly.length; i += 12) {
      final slice = monthly.sublist(i, min(i + 12, monthly.length));
      yearly.add(_Row(
        'Year ${i ~/ 12 + 1}',
        slice.fold(0, (t, x) => t + x.principal),
        slice.fold(0, (t, x) => t + x.interest),
        slice.last.balance,
      ));
    }
    final total = emi * n;
    return (emi: emi, total: total, interest: total - _amount, monthly: monthly, yearly: yearly);
  }

  Future<void> _analyse(double emi) async {
    setState(() {
      _analysing = true;
      _analysis = null;
      _analysisError = null;
    });
    try {
      final reply = await AppScope.of(context).api.askAi('emi', [
        ChatMessage(
          fromUser: true,
          text: 'Loan: ₹${_amount.round()}, EMI: ₹${emi.round()}, tenure: $_months months, rate: $_rate%. '
              'Is this affordable? Give 3 tips.',
        ),
      ]);
      if (mounted) setState(() => _analysis = reply.text);
    } on ApiException catch (e) {
      if (mounted) setState(() => _analysisError = e.message);
    } finally {
      if (mounted) setState(() => _analysing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final result = _calculate();
    final rows = _yearly ? result.yearly : result.monthly;
    final principalShare = result.total > 0 ? _amount / result.total : 1.0;
    final header = TextStyle(fontSize: 12, color: c.muted, fontWeight: FontWeight.w500);
    final cell = TextStyle(fontSize: 13, color: c.foreground, fontFeatures: tabularFigures);

    return Scaffold(
      appBar: AppBar(title: const Text('Loan calculator')),
      body: ListView(
        padding: pagePadding,
        children: [
          AppCard(
            child: Column(
              children: [
                _SliderField(
                  label: 'Loan amount',
                  value: formatInr(_amount),
                  slider: Slider(
                    value: _amount.clamp(10000, 10000000).toDouble(),
                    min: 10000,
                    max: 10000000,
                    divisions: 999,
                    onChanged: (v) => setState(() => _amount = (v / 10000).round() * 10000),
                  ),
                ),
                _SliderField(
                  label: 'Interest rate',
                  value: '${_rate.toStringAsFixed(2)}% p.a.',
                  slider: Slider(
                    value: _rate,
                    max: 36,
                    divisions: 144,
                    onChanged: (v) => setState(() => _rate = (v * 4).round() / 4),
                  ),
                ),
                _SliderField(
                  label: 'Tenure',
                  value: _months >= 12
                      ? '$_months months · ${(_months / 12).toStringAsFixed(_months % 12 == 0 ? 0 : 1)} yrs'
                      : '$_months months',
                  slider: Slider(
                    value: _months.toDouble(),
                    min: 1,
                    max: 360,
                    divisions: 359,
                    onChanged: (v) => setState(() => _months = v.round()),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Monthly instalment', style: TextStyle(fontSize: 13, color: c.muted)),
                const SizedBox(height: 4),
                Text(formatInr(result.emi),
                    style: TextStyle(
                        fontSize: 32, fontWeight: FontWeight.w600, letterSpacing: -0.6, color: c.foreground, fontFeatures: tabularFigures)),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: SizedBox(
                    height: 10,
                    child: Row(children: [
                      Expanded(flex: (principalShare * 1000).round(), child: Container(color: c.accent)),
                      const SizedBox(width: 2),
                      Expanded(
                        flex: max(1, ((1 - principalShare) * 1000).round()),
                        child: Container(color: c.foreground2.withValues(alpha: 0.35)),
                      ),
                    ]),
                  ),
                ),
                const SizedBox(height: 14),
                _Legend(color: c.accent, label: 'Principal', value: formatInr(_amount)),
                _Legend(color: c.foreground2.withValues(alpha: 0.35), label: 'Interest', value: formatInr(result.interest)),
                const Divider(height: 20),
                _Legend(label: 'Total repayment', value: formatInr(result.total), bold: true),
                const SizedBox(height: 16),
                if (_analysisError != null) ErrorBanner(_analysisError!),
                if (_analysis != null)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: c.surface2,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: c.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Affordability notes · AI-generated, educational only',
                            style: TextStyle(fontSize: 12, color: c.muted, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 8),
                        ProseText(_analysis!),
                      ],
                    ),
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _analysing ? null : () => _analyse(result.emi),
                      child: Text(_analysing ? 'Analysing…' : 'Explain affordability'),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              const Expanded(child: SectionLabel('Repayment schedule')),
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment(value: true, label: Text('Yearly')),
                    ButtonSegment(value: false, label: Text('Monthly')),
                  ],
                  selected: {_yearly},
                  showSelectedIcon: false,
                  onSelectionChanged: (s) => setState(() => _yearly = s.first),
                ),
              ),
            ],
          ),
          AppCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                Container(
                  color: c.surface2,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  child: Row(children: [
                    Expanded(flex: 3, child: Text(_yearly ? 'Period' : 'Month', style: header)),
                    Expanded(flex: 4, child: Text('Principal', textAlign: TextAlign.right, style: header)),
                    Expanded(flex: 4, child: Text('Interest', textAlign: TextAlign.right, style: header)),
                    Expanded(flex: 4, child: Text('Balance', textAlign: TextAlign.right, style: header)),
                  ]),
                ),
                for (final row in rows.take(_yearly ? rows.length : 120)) ...[
                  const Divider(),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    child: Row(children: [
                      Expanded(flex: 3, child: Text(row.label, style: cell.copyWith(color: c.foreground2))),
                      Expanded(flex: 4, child: Text(formatInr(row.principal), textAlign: TextAlign.right, style: cell)),
                      Expanded(
                        flex: 4,
                        child: Text(formatInr(row.interest), textAlign: TextAlign.right, style: cell.copyWith(color: c.muted)),
                      ),
                      Expanded(
                        flex: 4,
                        child: Text(formatInr(row.balance),
                            textAlign: TextAlign.right, style: cell.copyWith(fontWeight: FontWeight.w600)),
                      ),
                    ]),
                  ),
                ],
                if (!_yearly && rows.length > 120)
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text('Showing the first 120 months. Switch to Yearly for the full term.',
                        style: TextStyle(fontSize: 12, color: c.muted)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SliderField extends StatelessWidget {
  const _SliderField({required this.label, required this.value, required this.slider});

  final String label;
  final String value;
  final Widget slider;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      children: [
        Row(children: [
          Expanded(child: Text(label, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w500, color: c.foreground2))),
          Text(value,
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: c.foreground, fontFeatures: tabularFigures)),
        ]),
        slider,
      ],
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend({this.color, required this.label, required this.value, this.bold = false});

  final Color? color;
  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(children: [
        if (color != null) ...[
          Container(width: 10, height: 10, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
          const SizedBox(width: 8),
        ],
        Expanded(child: Text(label, style: TextStyle(fontSize: 14, color: c.foreground2))),
        Text(value,
            style: TextStyle(
                fontSize: 14, fontWeight: bold ? FontWeight.w700 : FontWeight.w600, color: c.foreground, fontFeatures: tabularFigures)),
      ]),
    );
  }
}
