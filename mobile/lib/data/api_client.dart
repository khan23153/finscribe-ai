import 'dart:convert';
import 'dart:math';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import '../core/config.dart';
import 'models.dart';

class ApiException implements Exception {
  const ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

/// Talks to the FinScribe Next.js API.
///
/// Instead of a login, each install generates a random device key on first
/// launch and keeps it in secure storage. The server uses it to keep this
/// device's records separate. Losing the key (e.g. uninstalling) means losing
/// access to those records.
class ApiClient {
  ApiClient({http.Client? client, FlutterSecureStorage? storage})
      : _client = client ?? http.Client(),
        _storage = storage ?? const FlutterSecureStorage();

  static const _deviceKeyName = 'finscribe_device_key';
  static const _timeout = Duration(seconds: 45);

  final http.Client _client;
  final FlutterSecureStorage _storage;
  String? _deviceKey;

  Future<String> _getDeviceKey() async {
    final cached = _deviceKey;
    if (cached != null) return cached;

    var key = await _storage.read(key: _deviceKeyName);
    if (key == null) {
      final random = Random.secure();
      final bytes = List<int>.generate(32, (_) => random.nextInt(256));
      key = base64Url.encode(bytes).replaceAll('=', '');
      await _storage.write(key: _deviceKeyName, value: key);
    }
    return _deviceKey = key;
  }

  Future<Map<String, String>> _headers() async => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-finscribe-device-key': await _getDeviceKey(),
      };

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('${AppConfig.apiBaseUrl}$path').replace(queryParameters: query);

  Future<Map<String, dynamic>> _send(Future<http.Response> Function(Map<String, String> headers) request) async {
    final http.Response response;
    try {
      response = await request(await _headers()).timeout(_timeout);
    } on Exception {
      throw const ApiException('Could not reach FinScribe. Check your connection and try again.');
    }

    Map<String, dynamic> body = const {};
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) body = decoded;
    } on FormatException {
      // Fall through to the status-based message below.
    }

    if (response.statusCode >= 400) {
      final error = body['error'];
      throw ApiException(error is String && error.isNotEmpty ? error : 'Something went wrong (${response.statusCode}).');
    }
    return body;
  }

  Future<List<Expense>> fetchExpenses() async {
    final body = await _send((h) => _client.get(_uri('/api/expenses'), headers: h));
    final list = body['expenses'];
    if (list is! List) return [];
    return list.whereType<Map<String, dynamic>>().map(Expense.fromJson).toList();
  }

  Future<Expense> createExpense({
    required String description,
    required double amount,
    required String category,
    required String date,
  }) async {
    final body = await _send((h) => _client.post(
          _uri('/api/expenses'),
          headers: h,
          body: jsonEncode({'description': description, 'amount': amount, 'category': category, 'date': date}),
        ));
    final expense = body['expense'];
    if (expense is! Map<String, dynamic>) throw const ApiException('The server returned an invalid expense.');
    return Expense.fromJson(expense);
  }

  Future<void> deleteExpense(String id) async {
    await _send((h) => _client.delete(_uri('/api/expenses', {'id': id}), headers: h));
  }

  /// [mode] is one of `assistant`, `emi`, `stocks`, `news`, `report`.
  Future<AiReply> askAi(String mode, List<ChatMessage> messages) async {
    final body = await _send((h) => _client.post(
          _uri('/api/ai'),
          headers: h,
          body: jsonEncode({'mode': mode, 'messages': messages.map((m) => m.toJson()).toList()}),
        ));
    final reply = body['reply'];
    if (reply is! String || reply.isEmpty) throw const ApiException('The assistant returned an empty response.');

    final sources = <Source>[];
    final rawSources = body['sources'];
    if (rawSources is List) {
      for (final item in rawSources) {
        if (item is Map && item['url'] is String) {
          sources.add(Source((item['title'] as String?) ?? item['url'] as String, item['url'] as String));
        }
      }
    }
    return AiReply(reply, sources);
  }
}
