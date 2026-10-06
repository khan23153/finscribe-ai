import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme.dart';
import 'data/api_client.dart';
import 'data/stores.dart';
import 'ui/shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  final prefs = await SharedPreferences.getInstance();
  final api = ApiClient();
  final expenses = ExpenseStore(api);
  final local = LocalStore(prefs);

  runApp(FinScribeApp(api: api, expenses: expenses, local: local));
}

class FinScribeApp extends StatelessWidget {
  const FinScribeApp({super.key, required this.api, required this.expenses, required this.local});

  final ApiClient api;
  final ExpenseStore expenses;
  final LocalStore local;

  @override
  Widget build(BuildContext context) {
    return AppScope(
      api: api,
      expenses: expenses,
      local: local,
      child: ListenableBuilder(
        listenable: local,
        builder: (context, _) => MaterialApp(
          title: 'FinScribe',
          debugShowCheckedModeBanner: false,
          theme: buildTheme(Brightness.light),
          darkTheme: buildTheme(Brightness.dark),
          themeMode: local.themeMode,
          home: const AppShell(),
        ),
      ),
    );
  }
}
