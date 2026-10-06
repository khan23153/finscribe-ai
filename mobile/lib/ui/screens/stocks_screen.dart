import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../sources.dart';
import '../widgets.dart';

const _suggestions = ['Reliance Industries', 'TCS', 'HDFC Bank', 'Infosys', 'Tata Motors', 'NIFTY 50 index funds'];

class StocksScreen extends StatefulWidget {
  const StocksScreen({super.key});

  @override
  State<StocksScreen> createState() => _StocksScreenState();
}

class _StocksScreenState extends State<StocksScreen> {
  final _query = TextEditingController();
  String? _subject;
  AiReply? _result;
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _research(String subject) async {
    final trimmed = subject.trim();
    if (trimmed.isEmpty || _loading) return;
    FocusScope.of(context).unfocus();
    _query.text = trimmed;
    setState(() {
      _subject = trimmed;
      _loading = true;
      _result = null;
      _error = null;
    });
    try {
      final reply = await AppScope.of(context).api.askAi('stocks', [
        ChatMessage(
          fromUser: true,
          text: 'Research $trimmed for an Indian retail investor. Summarize current public information, '
              'distinguish short-term uncertainty from long-term factors, and give three key points.',
        ),
      ]);
      if (mounted) setState(() => _result = reply);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Scaffold(
      appBar: AppBar(title: const Text('Stock research')),
      body: ListView(
        padding: pagePadding,
        children: [
          Text('A source-linked briefing on any listed Indian company, compiled from a live web search.',
              style: TextStyle(fontSize: 14, color: c.muted)),
          const SizedBox(height: 16),
          TextField(
            controller: _query,
            maxLength: 120,
            textInputAction: TextInputAction.search,
            onSubmitted: _research,
            decoration: InputDecoration(
              hintText: 'Company name or NSE symbol',
              counterText: '',
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: IconButton(
                onPressed: _loading ? null : () => _research(_query.text),
                icon: Icon(Icons.arrow_forward, color: c.accent),
                tooltip: 'Research',
              ),
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final s in _suggestions)
                ActionChip(
                  label: Text(s),
                  onPressed: _loading ? null : () => _research(s),
                  backgroundColor: c.surface,
                  side: BorderSide(color: c.border),
                  labelStyle: TextStyle(fontSize: 13, color: c.foreground2),
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
          const SizedBox(height: 18),
          if (_error != null) ErrorBanner(_error!, onRetry: _subject == null ? null : () => _research(_subject!)),
          if (_loading)
            const AppCard(child: LoadingBlock(height: 200))
          else if (_result != null)
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_subject!, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 2),
                  Text('AI briefing · verify against the sources below', style: TextStyle(fontSize: 12, color: c.muted)),
                  const SizedBox(height: 14),
                  ProseText(_result!.text),
                  if (_result!.sources.isNotEmpty) ...[
                    const Divider(height: 24),
                    SourceList(sources: _result!.sources),
                  ],
                ],
              ),
            )
          else if (_error == null)
            const AppCard(
              padding: EdgeInsets.zero,
              child: EmptyState(
                icon: Icons.show_chart,
                title: 'Search for a company',
                message: 'You’ll get recent developments, long-term factors, and key points with links to where they came from.',
              ),
            ),
          const SizedBox(height: 16),
          Text(
            'For education only. FinScribe is not a registered investment adviser and does not show live prices. '
            'Market investments carry risk; read all related documents before investing.',
            style: TextStyle(fontSize: 12, color: c.muted, height: 1.45),
          ),
        ],
      ),
    );
  }
}
