import 'package:flutter/material.dart';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

const categoryIcons = <String, IconData>{
  'Food': Icons.restaurant_outlined,
  'Transport': Icons.directions_car_outlined,
  'Shopping': Icons.shopping_bag_outlined,
  'Bills': Icons.bolt_outlined,
  'Entertainment': Icons.movie_outlined,
  'Health': Icons.favorite_outline,
  'Other': Icons.more_horiz,
};

IconData iconForCategory(String category) => categoryIcons[category] ?? Icons.more_horiz;

class Expense {
  const Expense({
    required this.id,
    required this.description,
    required this.amount,
    required this.category,
    required this.date,
  });

  final String id;
  final String description;
  final double amount;
  final String category;

  /// Calendar date of the expense (no time component).
  final DateTime date;

  factory Expense.fromJson(Map<String, dynamic> json) {
    // The server stores dates as UTC midnight; read the calendar day in UTC so
    // it doesn't shift by the device's timezone.
    final parsed = DateTime.parse(json['date'] as String).toUtc();
    return Expense(
      id: json['id'] as String,
      description: (json['description'] as String?) ?? '',
      amount: (json['amount'] as num).toDouble(),
      category: (json['category'] as String?) ?? 'Other',
      date: DateTime(parsed.year, parsed.month, parsed.day),
    );
  }
}

class Goal {
  const Goal({
    required this.id,
    required this.name,
    required this.target,
    required this.current,
    required this.deadline,
    required this.icon,
    required this.createdAt,
  });

  final String id;
  final String name;
  final double target;
  final double current;
  final DateTime deadline;
  final String icon;
  final DateTime createdAt;

  Goal copyWith({double? current}) => Goal(
        id: id,
        name: name,
        target: target,
        current: current ?? this.current,
        deadline: deadline,
        icon: icon,
        createdAt: createdAt,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'target': target,
        'current': current,
        'deadline': deadline.toIso8601String(),
        'icon': icon,
        'createdAt': createdAt.toIso8601String(),
      };

  factory Goal.fromJson(Map<String, dynamic> json) => Goal(
        id: json['id'] as String,
        name: json['name'] as String,
        target: (json['target'] as num).toDouble(),
        current: (json['current'] as num).toDouble(),
        deadline: DateTime.parse(json['deadline'] as String),
        icon: json['icon'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

const goalIcons = <String, IconData>{
  'home': Icons.home_outlined,
  'car': Icons.directions_car_outlined,
  'plane': Icons.flight_outlined,
  'phone': Icons.smartphone_outlined,
  'laptop': Icons.laptop_outlined,
  'school': Icons.school_outlined,
  'ring': Icons.diamond_outlined,
  'bank': Icons.account_balance_outlined,
};

enum ContactType { customer, supplier, friend }

extension ContactTypeLabel on ContactType {
  String get label => switch (this) {
        ContactType.customer => 'Customer',
        ContactType.supplier => 'Supplier',
        ContactType.friend => 'Friend',
      };
}

class LedgerContact {
  const LedgerContact({
    required this.id,
    required this.name,
    required this.type,
    required this.phone,
    required this.balance,
  });

  final String id;
  final String name;
  final ContactType type;
  final String phone;

  /// Positive: the contact owes the user. Negative: the user owes the contact.
  final double balance;

  LedgerContact copyWith({double? balance}) =>
      LedgerContact(id: id, name: name, type: type, phone: phone, balance: balance ?? this.balance);

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'type': type.name, 'phone': phone, 'balance': balance};

  factory LedgerContact.fromJson(Map<String, dynamic> json) => LedgerContact(
        id: json['id'] as String,
        name: json['name'] as String,
        type: ContactType.values.byName(json['type'] as String),
        phone: (json['phone'] as String?) ?? '',
        balance: (json['balance'] as num).toDouble(),
      );
}

class LedgerEntry {
  const LedgerEntry({
    required this.id,
    required this.contactId,
    required this.amount,
    required this.received,
    required this.note,
    required this.date,
  });

  final String id;
  final String contactId;
  final double amount;

  /// True when the user received money; false when they paid.
  final bool received;
  final String note;
  final DateTime date;

  Map<String, dynamic> toJson() => {
        'id': id,
        'contactId': contactId,
        'amount': amount,
        'received': received,
        'note': note,
        'date': date.toIso8601String(),
      };

  factory LedgerEntry.fromJson(Map<String, dynamic> json) => LedgerEntry(
        id: json['id'] as String,
        contactId: json['contactId'] as String,
        amount: (json['amount'] as num).toDouble(),
        received: json['received'] as bool,
        note: (json['note'] as String?) ?? '',
        date: DateTime.parse(json['date'] as String),
      );
}

class Source {
  const Source(this.title, this.url);
  final String title;
  final String url;
}

class AiReply {
  const AiReply(this.text, this.sources);
  final String text;
  final List<Source> sources;
}

class ChatMessage {
  const ChatMessage({required this.fromUser, required this.text});
  final bool fromUser;
  final String text;

  Map<String, String> toJson() => {'role': fromUser ? 'user' : 'assistant', 'content': text};
}

class NewsItem {
  const NewsItem({
    required this.title,
    required this.summary,
    required this.category,
    required this.sentiment,
    required this.publishedAt,
  });

  final String title;
  final String summary;
  final String category;
  final String sentiment;
  final DateTime? publishedAt;

  static NewsItem? tryParse(Object? value) {
    if (value is! Map) return null;
    final title = value['title'], summary = value['summary'];
    if (title is! String || summary is! String || title.isEmpty) return null;
    return NewsItem(
      title: title,
      summary: summary,
      category: value['category'] is String ? value['category'] as String : 'Markets',
      sentiment: value['sentiment'] is String ? value['sentiment'] as String : 'neutral',
      publishedAt: value['publishedAt'] is String ? DateTime.tryParse(value['publishedAt'] as String) : null,
    );
  }
}
