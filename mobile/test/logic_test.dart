import 'dart:convert';

import 'package:finscribe/core/format.dart';
import 'package:finscribe/data/analytics.dart';
import 'package:finscribe/data/api_client.dart';
import 'package:finscribe/data/models.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Expense.fromJson', () {
    test('reads the calendar day in UTC so it does not shift by timezone', () {
      final e = Expense.fromJson({
        'id': 'a',
        'description': 'Tea',
        'amount': 40,
        'category': 'Food',
        'date': '2026-10-06T00:00:00.000Z',
      });
      expect(e.date, DateTime(2026, 10, 6));
      expect(e.amount, 40.0);
    });
  });

  group('format', () {
    test('uses Indian digit grouping', () {
      expect(formatInr(1234567), '₹12,34,567');
      expect(formatInrAuto(12.5), '₹12.50');
      expect(toIsoDate(DateTime(2026, 1, 5)), '2026-01-05');
    });
  });

  group('analytics', () {
    test('week starts on Monday, matching the web app', () {
      // 8 Oct 2026 is a Thursday.
      expect(ReportPeriod.week.start(DateTime(2026, 10, 8, 15)), DateTime(2026, 10, 5));
      expect(ReportPeriod.quarter.start(DateTime(2026, 1, 20)), DateTime(2025, 11));
    });

    test('groups by category, largest first', () {
      final expenses = [
        Expense(id: '1', description: 'a', amount: 100, category: 'Food', date: DateTime(2026)),
        Expense(id: '2', description: 'b', amount: 300, category: 'Bills', date: DateTime(2026)),
        Expense(id: '3', description: 'c', amount: 50, category: 'Food', date: DateTime(2026)),
      ];
      final shares = byCategory(expenses);
      expect(shares.map((s) => s.category), ['Bills', 'Food']);
      expect(shares.last.amount, 150);
      expect(shares.last.count, 2);
    });
  });

  group('ApiClient', () {
    setUp(() => FlutterSecureStorage.setMockInitialValues({}));

    test('sends a stable device key the server accepts', () async {
      final keys = <String>[];
      final api = ApiClient(client: MockClient((request) async {
        keys.add(request.headers['x-finscribe-device-key']!);
        return http.Response(jsonEncode({'expenses': []}), 200);
      }));

      await api.fetchExpenses();
      await api.fetchExpenses();
      // A fresh client reads the stored key instead of generating a new one.
      await ApiClient(client: MockClient((request) async {
        keys.add(request.headers['x-finscribe-device-key']!);
        return http.Response(jsonEncode({'expenses': []}), 200);
      })).fetchExpenses();

      expect(keys.toSet(), hasLength(1));
      // Mirrors deviceKeyPattern in src/lib/request-user.ts.
      expect(RegExp(r'^[A-Za-z0-9_-]{43,128}$').hasMatch(keys.first), isTrue);
    });

    test('surfaces the server error message', () async {
      final api = ApiClient(client: MockClient((_) async => http.Response(jsonEncode({'error': 'Too many requests'}), 429)));
      expect(
        api.askAi('assistant', const [ChatMessage(fromUser: true, text: 'hi')]),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', 'Too many requests')),
      );
    });

    test('parses AI sources', () async {
      final api = ApiClient(client: MockClient((_) async => http.Response(
            jsonEncode({
              'reply': 'Answer',
              'sources': [
                {'title': 'RBI', 'url': 'https://rbi.org.in'},
              ],
            }),
            200,
            headers: {'content-type': 'application/json; charset=utf-8'},
          )));
      final reply = await api.askAi('stocks', const [ChatMessage(fromUser: true, text: 'TCS')]);
      expect(reply.text, 'Answer');
      expect(reply.sources.single.url, 'https://rbi.org.in');
    });
  });
}
