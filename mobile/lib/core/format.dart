import 'package:intl/intl.dart';

final _inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
final _inrPrecise = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
final _inrCompact = NumberFormat.compactCurrency(locale: 'en_IN', symbol: '₹', decimalDigits: 1);

String formatInr(num amount, {bool precise = false}) =>
    (precise ? _inrPrecise : _inr).format(amount);

/// Whole rupees unless the amount has paise.
String formatInrAuto(num amount) => formatInr(amount, precise: amount % 1 != 0);

String formatCompactInr(num amount) => _inrCompact.format(amount);

String formatShortDate(DateTime date) => DateFormat('d MMM').format(date);

String formatLongDate(DateTime date) => DateFormat('d MMM y').format(date);

String formatMonthYear(DateTime date) => DateFormat('MMMM y').format(date);

String formatMonthShort(DateTime date) => DateFormat('MMM').format(date);

/// `yyyy-MM-dd`, the format the server expects for dates.
String toIsoDate(DateTime date) => DateFormat('yyyy-MM-dd').format(date);

DateTime dateOnly(DateTime date) => DateTime(date.year, date.month, date.day);
