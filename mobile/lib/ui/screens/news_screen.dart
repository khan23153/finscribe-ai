import 'dart:convert';

import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../sources.dart';
import '../widgets.dart';

const _tabs = ['All', 'Markets', 'Economy', 'Banking', 'RBI', 'Crypto'];

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  List<NewsItem> _items = [];
  List<Source> _sources = [];
  String _tab = 'All';
  String? _error;
  bool _loading = true;
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_started) {
      _started = true;
      _load();
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final reply = await AppScope.of(context).api.askAi('news', const [
        ChatMessage(
          fromUser: true,
          text: 'Find eight recent, verifiable Indian financial news items. Use ISO 8601 dates in publishedAt '
              'and the required categories and sentiment values.',
        ),
      ]);
      final decoded = jsonDecode(reply.text);
      final items = decoded is List ? decoded.map(NewsItem.tryParse).whereType<NewsItem>().toList() : <NewsItem>[];
      if (items.isEmpty) throw const ApiException('The news service returned an invalid response.');
      if (mounted) {
        setState(() {
          _items = items;
          _sources = reply.sources;
        });
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } on FormatException {
      if (mounted) setState(() => _error = 'The news service returned an invalid response.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final items = _tab == 'All' ? _items : _items.where((i) => i.category == _tab).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('News'),
        actions: [
          IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh), tooltip: 'Refresh'),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: pagePadding,
          children: [
            SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (final tab in _tabs)
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(
                        label: Text(tab),
                        selected: _tab == tab,
                        showCheckmark: false,
                        visualDensity: VisualDensity.compact,
                        selectedColor: c.foreground,
                        backgroundColor: c.surface,
                        side: BorderSide(color: _tab == tab ? c.foreground : c.border),
                        labelStyle: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: _tab == tab ? c.background : c.foreground2,
                        ),
                        onSelected: (_) => setState(() => _tab = tab),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (_error != null) ErrorBanner(_error!, onRetry: _load),
            if (_loading)
              const AppCard(child: LoadingBlock(height: 260))
            else if (items.isEmpty)
              AppCard(
                padding: EdgeInsets.zero,
                child: EmptyState(
                  icon: Icons.newspaper_outlined,
                  title: 'No stories here',
                  message: _error != null ? 'Try refreshing in a moment.' : 'Nothing in this category from the latest briefing.',
                ),
              )
            else
              DividedCard(children: [for (final item in items) _NewsTile(item: item)]),
            if (!_loading && _sources.isNotEmpty) ...[
              const SizedBox(height: 18),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: SourceList(sources: _sources, title: 'Sources for this briefing'),
              ),
            ],
            const SizedBox(height: 14),
            Text('Summaries are AI-generated from search results and may contain errors. Open the sources to confirm.',
                style: TextStyle(fontSize: 12, color: c.muted)),
          ],
        ),
      ),
    );
  }
}

class _NewsTile extends StatelessWidget {
  const _NewsTile({required this.item});

  final NewsItem item;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final (sentimentLabel, sentimentColor) = switch (item.sentiment) {
      'positive' => ('Positive', c.positive),
      'negative' => ('Negative', c.negative),
      _ => ('Neutral', c.muted),
    };
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text.rich(
            TextSpan(children: [
              TextSpan(text: item.category, style: TextStyle(fontWeight: FontWeight.w600, color: c.foreground2)),
              if (item.publishedAt != null) TextSpan(text: ' · ${formatLongDate(item.publishedAt!)}'),
              const TextSpan(text: ' · '),
              TextSpan(text: sentimentLabel, style: TextStyle(color: sentimentColor)),
            ]),
            style: TextStyle(fontSize: 12, color: c.muted),
          ),
          const SizedBox(height: 6),
          Text(item.title, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, height: 1.3, color: c.foreground)),
          const SizedBox(height: 4),
          Text(item.summary, style: TextStyle(fontSize: 13.5, height: 1.45, color: c.foreground2)),
        ],
      ),
    );
  }
}
