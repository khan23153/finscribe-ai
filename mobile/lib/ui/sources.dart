import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/theme.dart';
import '../data/models.dart';
import 'widgets.dart';

Future<void> openLink(BuildContext context, String url) async {
  final uri = Uri.tryParse(url);
  if (uri == null || !(uri.scheme == 'https' || uri.scheme == 'http')) return;
  final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!opened && context.mounted) showMessage(context, 'Could not open the link');
}

class SourceList extends StatelessWidget {
  const SourceList({super.key, required this.sources, this.title = 'Sources'});

  final List<Source> sources;
  final String title;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: c.muted)),
        const SizedBox(height: 6),
        for (var i = 0; i < sources.length; i++)
          InkWell(
            onTap: () => openLink(context, sources[i].url),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  SizedBox(width: 20, child: Text('${i + 1}.', style: TextStyle(fontSize: 13, color: c.subtle))),
                  Expanded(
                    child: Text(sources[i].title,
                        maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13.5, color: c.accent)),
                  ),
                  Icon(Icons.open_in_new, size: 14, color: c.accent),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
