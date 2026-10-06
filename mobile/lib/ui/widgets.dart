import 'package:flutter/material.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../data/models.dart';

const pagePadding = EdgeInsets.fromLTRB(16, 20, 16, 32);

class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.padding = const EdgeInsets.all(18), this.onTap});

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Material(
      color: c.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: c.border)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(onTap: onTap, child: Padding(padding: padding, child: child)),
    );
  }
}

class CardTitle extends StatelessWidget {
  const CardTitle(this.title, {super.key, this.subtitle, this.trailing});

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: theme.textTheme.titleMedium?.copyWith(fontSize: 14)),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: theme.textTheme.bodySmall),
              ],
            ],
          ),
        ),
        ?trailing,
      ],
    );
  }
}

class PageTitle extends StatelessWidget {
  const PageTitle(this.title, {super.key, this.subtitle, this.action});

  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.headlineSmall),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(subtitle!, style: theme.textTheme.bodyMedium?.copyWith(color: context.colors.muted)),
                ],
              ],
            ),
          ),
          if (action != null) ...[const SizedBox(width: 12), action!],
        ],
      ),
    );
  }
}

class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key, this.trailing});

  final String text;
  final String? trailing;

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: context.colors.muted);
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
      child: Row(
        children: [
          Expanded(child: Text(text, style: style)),
          if (trailing != null) Text(trailing!, style: style.copyWith(fontFeatures: tabularFigures)),
        ],
      ),
    );
  }
}

class StatBlock extends StatelessWidget {
  const StatBlock({super.key, required this.label, required this.value, this.detail});

  final String label;
  final String value;
  final String? detail;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 12.5, color: c.muted)),
        const SizedBox(height: 4),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: c.foreground, fontFeatures: tabularFigures),
        ),
        if (detail != null) ...[
          const SizedBox(height: 2),
          Text(detail!, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: c.muted)),
        ],
      ],
    );
  }
}

/// A grid of stats separated by hairlines, inside one card.
class StatGrid extends StatelessWidget {
  const StatGrid({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i += 2) {
      if (i > 0) rows.add(Divider(color: c.border, height: 1));
      rows.add(IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: Padding(padding: const EdgeInsets.all(16), child: children[i])),
            VerticalDivider(color: c.border, width: 1),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: i + 1 < children.length ? children[i + 1] : const SizedBox(),
              ),
            ),
          ],
        ),
      ));
    }
    return AppCard(padding: EdgeInsets.zero, child: Column(children: rows));
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, this.message, this.action});

  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: c.surface2,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: c.border),
            ),
            child: Icon(icon, size: 19, color: c.muted),
          ),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: c.foreground)),
          if (message != null) ...[
            const SizedBox(height: 4),
            Text(message!, textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: c.muted, height: 1.4)),
          ],
          if (action != null) ...[const SizedBox(height: 16), action!],
        ],
      ),
    );
  }
}

class ErrorBanner extends StatelessWidget {
  const ErrorBanner(this.message, {super.key, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
      decoration: BoxDecoration(color: c.negativeSoft, borderRadius: BorderRadius.circular(10)),
      child: Row(
        children: [
          Icon(Icons.error_outline, size: 18, color: c.negative),
          const SizedBox(width: 10),
          Expanded(child: Text(message, style: TextStyle(color: c.negative, fontSize: 13.5))),
          if (onRetry != null)
            TextButton(
              onPressed: onRetry,
              style: TextButton.styleFrom(foregroundColor: c.negative),
              child: const Text('Retry'),
            ),
        ],
      ),
    );
  }
}

enum PillTone { neutral, positive, warning }

class Pill extends StatelessWidget {
  const Pill(this.text, {super.key, this.tone = PillTone.neutral});

  final String text;
  final PillTone tone;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final (bg, fg) = switch (tone) {
      PillTone.neutral => (c.surface2, c.foreground2),
      PillTone.positive => (c.accentSoft, c.positive),
      PillTone.warning => (c.warningSoft, c.warning),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500, color: fg)),
    );
  }
}

class IconTile extends StatelessWidget {
  const IconTile(this.icon, {super.key, this.size = 38, this.accent = false});

  final IconData icon;
  final double size;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: accent ? c.accentSoft : c.surface2,
        borderRadius: BorderRadius.circular(10),
        border: accent ? null : Border.all(color: c.border),
      ),
      child: Icon(icon, size: size * 0.45, color: accent ? c.accent : c.foreground2),
    );
  }
}

class ExpenseTile extends StatelessWidget {
  const ExpenseTile({super.key, required this.expense, this.trailing});

  final Expense expense;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          IconTile(iconForCategory(expense.category)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  expense.description,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w500, color: c.foreground),
                ),
                const SizedBox(height: 2),
                Text('${expense.category} · ${formatShortDate(expense.date)}',
                    style: TextStyle(fontSize: 12.5, color: c.muted)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '−${formatInrAuto(expense.amount)}',
            style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w500, color: c.foreground, fontFeatures: tabularFigures),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Children separated by hairline dividers, inside one card.
class DividedCard extends StatelessWidget {
  const DividedCard({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const Divider(),
            children[i],
          ],
        ],
      ),
    );
  }
}

class ProgressBar extends StatelessWidget {
  const ProgressBar({super.key, required this.value, this.color, this.height = 8});

  final double value;
  final Color? color;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: LinearProgressIndicator(
        value: value.clamp(0, 1).toDouble(),
        minHeight: height,
        backgroundColor: c.surface2,
        color: color ?? c.accent,
      ),
    );
  }
}

class TrendPoint {
  const TrendPoint(this.label, this.amount);
  final String label;
  final double amount;
}

/// Single-series column chart; the last (current) period is highlighted.
/// Tap a column to see its value.
class TrendChart extends StatefulWidget {
  const TrendChart({super.key, required this.points, this.height = 150});

  final List<TrendPoint> points;
  final double height;

  @override
  State<TrendChart> createState() => _TrendChartState();
}

class _TrendChartState extends State<TrendChart> {
  int? _selected;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final points = widget.points;
    final maxValue = points.fold<double>(1, (m, p) => p.amount > m ? p.amount : m);
    final shown = _selected ?? points.length - 1;

    return Column(
      children: [
        SizedBox(
          height: widget.height,
          child: Container(
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borderStrong))),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (var i = 0; i < points.length; i++)
                  Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => setState(() => _selected = _selected == i ? null : i),
                      child: Semantics(
                        label: '${points[i].label}: ${formatInr(points[i].amount)}',
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 5),
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              final available = constraints.maxHeight - 26;
                              final barHeight = points[i].amount > 0
                                  ? (points[i].amount / maxValue * available).clamp(3.0, available)
                                  : 0.0;
                              return Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  if (i == shown)
                                    Container(
                                      margin: const EdgeInsets.only(bottom: 5),
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(color: c.foreground, borderRadius: BorderRadius.circular(5)),
                                      child: Text(
                                        formatCompactInr(points[i].amount),
                                        maxLines: 1,
                                        style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: c.background),
                                      ),
                                    ),
                                  Container(
                                    height: barHeight,
                                    constraints: const BoxConstraints(maxWidth: 34),
                                    decoration: BoxDecoration(
                                      color: i == points.length - 1 ? c.accent : c.accent.withValues(alpha: 0.3),
                                      borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            for (var i = 0; i < points.length; i++)
              Expanded(
                child: Text(
                  points[i].label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: i == shown ? c.foreground : c.muted,
                    fontWeight: i == shown ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class CategoryShare {
  const CategoryShare(this.category, this.amount, [this.count]);
  final String category;
  final double amount;
  final int? count;
}

class CategoryBars extends StatelessWidget {
  const CategoryBars({super.key, required this.rows, required this.total});

  final List<CategoryShare> rows;
  final double total;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      children: [
        for (final row in rows)
          Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text.rich(
                        TextSpan(children: [
                          TextSpan(text: row.category),
                          if (row.count != null) TextSpan(text: ' · ${row.count}', style: TextStyle(color: c.muted)),
                        ]),
                        style: TextStyle(fontSize: 13.5, color: c.foreground2),
                      ),
                    ),
                    Text(formatInr(row.amount),
                        style: TextStyle(
                            fontSize: 13.5, fontWeight: FontWeight.w600, color: c.foreground, fontFeatures: tabularFigures)),
                    SizedBox(
                      width: 44,
                      child: Text(
                        '${total > 0 ? (row.amount / total * 100).round() : 0}%',
                        textAlign: TextAlign.right,
                        style: TextStyle(fontSize: 13, color: c.muted, fontFeatures: tabularFigures),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ProgressBar(value: total > 0 ? row.amount / total : 0, height: 6),
              ],
            ),
          ),
      ],
    );
  }
}

/// Renders model output: paragraphs, bullet lists, and **bold** spans.
class ProseText extends StatelessWidget {
  const ProseText(this.text, {super.key});

  final String text;

  static final _bullet = RegExp(r'^\s*([-*•]|\d+[.)])\s+');

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final base = TextStyle(fontSize: 14, height: 1.5, color: c.foreground2);
    final blocks = text.trim().split(RegExp(r'\n{2,}'));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final block in blocks) ...[
          ..._renderBlock(block, base, c),
          const SizedBox(height: 10),
        ],
      ],
    );
  }

  List<Widget> _renderBlock(String block, TextStyle base, AppColors c) {
    final lines = block.split('\n').where((l) => l.trim().isNotEmpty).toList();
    if (lines.isNotEmpty && lines.every(_bullet.hasMatch)) {
      return [
        for (final line in lines)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 9, right: 10),
                  child: Container(width: 4, height: 4, decoration: BoxDecoration(color: c.subtle, shape: BoxShape.circle)),
                ),
                Expanded(child: Text.rich(_inline(line.replaceFirst(_bullet, ''), c), style: base)),
              ],
            ),
          ),
      ];
    }
    return [Text.rich(_inline(block.replaceAll(RegExp(r'^#{1,6}\s+', multiLine: true), ''), c), style: base)];
  }

  TextSpan _inline(String text, AppColors c) {
    final parts = text.split(RegExp(r'(\*\*[^*]+\*\*)'));
    final matches = RegExp(r'\*\*([^*]+)\*\*').allMatches(text).map((m) => m.group(1)!).toList();
    final spans = <TextSpan>[];
    for (var i = 0; i < parts.length; i++) {
      spans.add(TextSpan(text: parts[i]));
      if (i < matches.length) {
        spans.add(TextSpan(text: matches[i], style: TextStyle(fontWeight: FontWeight.w600, color: c.foreground)));
      }
    }
    return TextSpan(children: spans);
  }
}

class LoadingBlock extends StatelessWidget {
  const LoadingBlock({super.key, this.height = 160});

  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: const Center(child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4))),
    );
  }
}

/// Opens a bottom sheet that rises above the keyboard.
Future<T?> showAppSheet<T>(BuildContext context, {required String title, required Widget child}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (context) {
      final c = context.colors;
      return Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(title, style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: c.foreground)),
              const SizedBox(height: 18),
              child,
            ],
          ),
        ),
      );
    },
  );
}

void showMessage(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}
