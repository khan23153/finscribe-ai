import 'dart:convert';

import 'package:finscribe/core/format.dart';
import 'package:finscribe/data/api_client.dart';
import 'package:finscribe/data/stores.dart';
import 'package:finscribe/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Boots the app against an in-memory fake of the expenses API.
Future<List<Map<String, dynamic>>> pumpApp(WidgetTester tester) async {
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);

  FlutterSecureStorage.setMockInitialValues({});
  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();

  final today = toIsoDate(DateTime.now());
  final server = <Map<String, dynamic>>[
    {'id': '1', 'description': 'Groceries', 'amount': 1200, 'category': 'Food', 'date': '${today}T00:00:00.000Z'},
    {'id': '2', 'description': 'Electricity', 'amount': 800, 'category': 'Bills', 'date': '${today}T00:00:00.000Z'},
  ];

  final api = ApiClient(client: MockClient((request) async {
    final json = {'content-type': 'application/json; charset=utf-8'};
    if (request.url.path == '/api/expenses' && request.method == 'GET') {
      return http.Response(jsonEncode({'expenses': server}), 200, headers: json);
    }
    if (request.url.path == '/api/expenses' && request.method == 'POST') {
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      final created = {...body, 'id': '${server.length + 1}', 'date': '${body['date']}T00:00:00.000Z'};
      server.insert(0, created);
      return http.Response(jsonEncode({'expense': created}), 201, headers: json);
    }
    return http.Response(jsonEncode({'error': 'Not found'}), 404, headers: json);
  }));

  await tester.pumpWidget(FinScribeApp(api: api, expenses: ExpenseStore(api), local: LocalStore(prefs)));
  await tester.pumpAndSettle();
  return server;
}

void main() {
  testWidgets('Home shows this month’s total from the server', (tester) async {
    await pumpApp(tester);
    expect(find.text('Spent this month'), findsOneWidget);
    expect(find.text('₹2,000'), findsWidgets);
    await tester.scrollUntilVisible(find.text('Groceries'), 300, scrollable: find.byType(Scrollable).first);
    expect(find.text('Groceries'), findsOneWidget);
  });

  testWidgets('adding an expense posts it and updates Home', (tester) async {
    final server = await pumpApp(tester);

    await tester.tap(find.byTooltip('Add expense'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextFormField, 'Amount'), '250');
    await tester.enterText(find.widgetWithText(TextFormField, 'Description'), 'Auto ride');
    await tester.tap(find.text('Transport'));
    await tester.tap(find.text('Save expense'));
    await tester.pumpAndSettle();

    expect(server.first['description'], 'Auto ride');
    expect(server.first['category'], 'Transport');
    expect(find.text('₹2,250'), findsWidgets);
  });

  testWidgets('loan calculator shows the EMI for the default loan', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Loan calculator'));
    await tester.pumpAndSettle();
    // ₹10,00,000 at 8.5% for 120 months; the web calculator gives the same figure.
    expect(find.text('₹12,399'), findsOneWidget);
  });

  testWidgets('goals are saved on the device', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Goals'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('New goal'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextFormField, 'Name'), 'Emergency fund');
    await tester.enterText(find.widgetWithText(TextFormField, 'Target'), '100000');
    await tester.tap(find.text('Create goal'));
    await tester.pumpAndSettle();

    expect(find.text('Emergency fund'), findsOneWidget);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('goals'), contains('Emergency fund'));
  });
}
