import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';

const _prompts = [
  'Help me build a simple monthly budget',
  'How is a loan EMI calculated?',
  'What is a sensible emergency fund?',
];

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _sending = false;

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _send(String text) async {
    final content = text.trim();
    if (content.isEmpty || _sending) return;
    setState(() {
      _messages.add(ChatMessage(fromUser: true, text: content));
      _sending = true;
      _input.clear();
    });
    _scrollToEnd();

    String reply;
    try {
      // The API accepts at most 20 messages; send the most recent context.
      final history = _messages.length > 20 ? _messages.sublist(_messages.length - 20) : _messages;
      reply = (await AppScope.of(context).api.askAi('assistant', history)).text;
    } on ApiException catch (e) {
      reply = e.message;
    }
    if (!mounted) return;
    setState(() {
      _messages.add(ChatMessage(fromUser: false, text: reply));
      _sending = false;
    });
    _scrollToEnd();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Assistant'),
            Text('Educational guidance only. Not financial advice.',
                style: TextStyle(fontSize: 12, color: c.muted, fontWeight: FontWeight.w400)),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? ListView(
                    padding: pagePadding,
                    children: [
                      Text(
                        'Ask general questions about budgeting, loans, saving, or investing concepts. '
                        'The assistant only knows figures you type here.',
                        style: TextStyle(fontSize: 14, height: 1.5, color: c.foreground2),
                      ),
                      const SizedBox(height: 16),
                      for (final prompt in _prompts) ...[
                        AppCard(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                          onTap: () => _send(prompt),
                          child: Text(prompt, style: TextStyle(fontSize: 14, color: c.foreground2)),
                        ),
                        const SizedBox(height: 8),
                      ],
                    ],
                  )
                : ListView.builder(
                    controller: _scroll,
                    padding: pagePadding,
                    itemCount: _messages.length + (_sending ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length) {
                        return const Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 8),
                            child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                          ),
                        );
                      }
                      final message = _messages[index];
                      if (message.fromUser) {
                        return Align(
                          alignment: Alignment.centerRight,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 16, left: 48),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                            decoration: BoxDecoration(
                              color: c.surface2,
                              border: Border.all(color: c.border),
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(14),
                                topRight: Radius.circular(14),
                                bottomLeft: Radius.circular(14),
                                bottomRight: Radius.circular(4),
                              ),
                            ),
                            child: Text(message.text, style: TextStyle(fontSize: 14, color: c.foreground)),
                          ),
                        );
                      }
                      return Padding(padding: const EdgeInsets.only(bottom: 10), child: ProseText(message.text));
                    },
                  ),
          ),
          Container(
            decoration: BoxDecoration(color: c.surface, border: Border(top: BorderSide(color: c.border))),
            padding: EdgeInsets.fromLTRB(12, 10, 12, 10 + MediaQuery.paddingOf(context).bottom),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: TextField(
                    controller: _input,
                    minLines: 1,
                    maxLines: 5,
                    maxLength: 4000,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(hintText: 'Ask about budgeting, loans, saving…', counterText: ''),
                    onSubmitted: _send,
                  ),
                ),
                const SizedBox(width: 8),
                ListenableBuilder(
                  listenable: _input,
                  builder: (context, _) => IconButton.filled(
                    onPressed: _sending || _input.text.trim().isEmpty ? null : () => _send(_input.text),
                    icon: const Icon(Icons.arrow_upward),
                    style: IconButton.styleFrom(
                      backgroundColor: c.accent,
                      foregroundColor: c.accentForeground,
                      disabledBackgroundColor: c.surface2,
                      fixedSize: const Size(46, 46),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    tooltip: 'Send',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
