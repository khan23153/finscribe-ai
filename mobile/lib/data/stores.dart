import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'models.dart';

String newId() {
  final random = Random.secure();
  return List.generate(16, (_) => random.nextInt(256).toRadixString(16).padLeft(2, '0')).join();
}

/// Expenses live on the server; this keeps an in-memory copy for the UI.
class ExpenseStore extends ChangeNotifier {
  ExpenseStore(this._api);

  final ApiClient _api;
  List<Expense> _expenses = [];
  bool _loading = false;
  bool _loaded = false;
  String? _error;

  List<Expense> get expenses => _expenses;
  bool get isLoading => _loading && !_loaded;
  bool get isRefreshing => _loading;
  String? get error => _error;

  Future<void> load() async {
    if (_loading) return;
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _expenses = (await _api.fetchExpenses())..sort(_byDateDesc);
      _loaded = true;
    } on ApiException catch (e) {
      _error = e.message;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> add({
    required String description,
    required double amount,
    required String category,
    required String date,
  }) async {
    final expense = await _api.createExpense(
      description: description,
      amount: amount,
      category: category,
      date: date,
    );
    _expenses = [expense, ..._expenses]..sort(_byDateDesc);
    notifyListeners();
  }

  Future<void> remove(String id) async {
    await _api.deleteExpense(id);
    _expenses = _expenses.where((e) => e.id != id).toList();
    notifyListeners();
  }

  static int _byDateDesc(Expense a, Expense b) => b.date.compareTo(a.date);
}

/// Goals, ledger, and preferences stay on the device, as they do on the web.
class LocalStore extends ChangeNotifier {
  LocalStore(this._prefs) {
    _goals = _readList('goals', Goal.fromJson);
    _contacts = _readList('ledger_contacts', LedgerContact.fromJson);
    _entries = _readList('ledger_entries', LedgerEntry.fromJson);
  }

  final SharedPreferences _prefs;
  late List<Goal> _goals;
  late List<LedgerContact> _contacts;
  late List<LedgerEntry> _entries;

  List<Goal> get goals => _goals;
  List<LedgerContact> get contacts => _contacts;
  List<LedgerEntry> get entries => _entries;

  double? get monthlyBudget => _prefs.getDouble('budget');
  double? get monthlyIncome => _prefs.getDouble('income');

  ThemeMode get themeMode => switch (_prefs.getString('theme')) {
        'light' => ThemeMode.light,
        'dark' => ThemeMode.dark,
        _ => ThemeMode.system,
      };

  Future<void> setThemeMode(ThemeMode mode) async {
    await _prefs.setString('theme', mode.name);
    notifyListeners();
  }

  Future<void> setMonthlyBudget(double? value) => _setNumber('budget', value);
  Future<void> setMonthlyIncome(double? value) => _setNumber('income', value);

  Future<void> _setNumber(String key, double? value) async {
    if (value == null || value <= 0) {
      await _prefs.remove(key);
    } else {
      await _prefs.setDouble(key, value);
    }
    notifyListeners();
  }

  // Goals

  Future<void> addGoal(Goal goal) async {
    _goals = [..._goals, goal];
    await _write('goals', _goals);
  }

  Future<void> addToGoal(String id, double amount) async {
    _goals = [
      for (final g in _goals) g.id == id ? g.copyWith(current: min(g.current + amount, g.target)) : g,
    ];
    await _write('goals', _goals);
  }

  Future<void> removeGoal(String id) async {
    _goals = _goals.where((g) => g.id != id).toList();
    await _write('goals', _goals);
  }

  // Ledger

  Future<void> addContact(LedgerContact contact) async {
    _contacts = [..._contacts, contact];
    await _write('ledger_contacts', _contacts);
  }

  Future<void> addEntry(LedgerEntry entry) async {
    _entries = [entry, ..._entries];
    // Receiving money reduces what the contact owes; paying them increases it.
    _contacts = [
      for (final c in _contacts)
        c.id == entry.contactId ? c.copyWith(balance: c.balance + (entry.received ? -entry.amount : entry.amount)) : c,
    ];
    await _write('ledger_entries', _entries);
    await _write('ledger_contacts', _contacts);
  }

  List<T> _readList<T>(String key, T Function(Map<String, dynamic>) fromJson) {
    final raw = _prefs.getString(key);
    if (raw == null) return [];
    try {
      return (jsonDecode(raw) as List).cast<Map<String, dynamic>>().map(fromJson).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _write(String key, List<dynamic> items) async {
    notifyListeners();
    await _prefs.setString(key, jsonEncode(items.map((i) => i.toJson()).toList()));
  }
}

/// Makes the API client and stores available to every screen.
class AppScope extends InheritedWidget {
  const AppScope({
    super.key,
    required this.api,
    required this.expenses,
    required this.local,
    required super.child,
  });

  final ApiClient api;
  final ExpenseStore expenses;
  final LocalStore local;

  static AppScope of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<AppScope>()!;

  @override
  bool updateShouldNotify(AppScope oldWidget) =>
      api != oldWidget.api || expenses != oldWidget.expenses || local != oldWidget.local;
}
