import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../data/models.dart';
import '../../data/stores.dart';
import '../widgets.dart';
import 'add_expense.dart' show amountInputFormatters;

class LedgerScreen extends StatefulWidget {
  const LedgerScreen({super.key});

  @override
  State<LedgerScreen> createState() => _LedgerScreenState();
}

class _LedgerScreenState extends State<LedgerScreen> {
  bool _showHistory = false;

  @override
  Widget build(BuildContext context) {
    final local = AppScope.of(context).local;
    return ListenableBuilder(
      listenable: local,
      builder: (context, _) {
        final c = context.colors;
        final contacts = local.contacts;
        final byId = {for (final contact in contacts) contact.id: contact};
        final toReceive = contacts.fold<double>(0, (t, x) => t + (x.balance > 0 ? x.balance : 0));
        final toPay = contacts.fold<double>(0, (t, x) => t + (x.balance < 0 ? -x.balance : 0));

        return Scaffold(
          appBar: AppBar(title: const Text('Ledger')),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => showAppSheet(context, title: 'Add contact', child: const _ContactForm()),
            icon: const Icon(Icons.person_add_alt_outlined),
            label: const Text('Add contact'),
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 96),
            children: [
              StatGrid(children: [
                _Total(icon: Icons.south_west, color: c.positive, label: 'To receive', amount: toReceive),
                _Total(icon: Icons.north_east, color: c.negative, label: 'To pay', amount: toPay),
              ]),
              const SizedBox(height: 16),
              SegmentedButton<bool>(
                segments: [
                  ButtonSegment(value: false, label: Text('Contacts (${contacts.length})')),
                  const ButtonSegment(value: true, label: Text('History')),
                ],
                selected: {_showHistory},
                showSelectedIcon: false,
                onSelectionChanged: (s) => setState(() => _showHistory = s.first),
              ),
              const SizedBox(height: 14),
              if (!_showHistory)
                contacts.isEmpty
                    ? const AppCard(
                        padding: EdgeInsets.zero,
                        child: EmptyState(
                          icon: Icons.contacts_outlined,
                          title: 'No contacts yet',
                          message: 'Add a customer, supplier, or friend to record money in and out.',
                        ),
                      )
                    : DividedCard(children: [for (final contact in contacts) _ContactTile(contact: contact)])
              else
                local.entries.isEmpty
                    ? const AppCard(
                        padding: EdgeInsets.zero,
                        child: EmptyState(
                          icon: Icons.history,
                          title: 'No entries yet',
                          message: 'Payments you record against contacts appear here.',
                        ),
                      )
                    : DividedCard(children: [
                        for (final entry in local.entries) _EntryTile(entry: entry, contact: byId[entry.contactId]),
                      ]),
            ],
          ),
        );
      },
    );
  }
}

class _Total extends StatelessWidget {
  const _Total({required this.icon, required this.color, required this.label, required this.amount});

  final IconData icon;
  final Color color;
  final String label;
  final double amount;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 12.5, color: c.muted)),
        ]),
        const SizedBox(height: 4),
        Text(formatInr(amount),
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: c.foreground, fontFeatures: tabularFigures)),
      ],
    );
  }
}

class _ContactTile extends StatelessWidget {
  const _ContactTile({required this.contact});

  final LedgerContact contact;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final initials = contact.name.trim().split(RegExp(r'\s+')).take(2).map((p) => p[0].toUpperCase()).join();
    final balanceColor = contact.balance > 0 ? c.positive : contact.balance < 0 ? c.negative : c.foreground;

    return InkWell(
      onTap: () => showAppSheet(context, title: 'Record with ${contact.name}', child: _EntryForm(contact: contact)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 19,
              backgroundColor: c.surface2,
              child: Text(initials, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: c.foreground2)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(contact.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w500, color: c.foreground)),
                  const SizedBox(height: 2),
                  Text(
                    [contact.type.label, if (contact.phone.isNotEmpty) contact.phone].join(' · '),
                    style: TextStyle(fontSize: 12.5, color: c.muted),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(formatInrAuto(contact.balance.abs()),
                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: balanceColor, fontFeatures: tabularFigures)),
                Text(
                  contact.balance > 0 ? 'owes you' : contact.balance < 0 ? 'you owe' : 'settled',
                  style: TextStyle(fontSize: 11.5, color: c.muted),
                ),
              ],
            ),
            const SizedBox(width: 4),
            Icon(Icons.chevron_right, color: c.subtle, size: 20),
          ],
        ),
      ),
    );
  }
}

class _EntryTile extends StatelessWidget {
  const _EntryTile({required this.entry, required this.contact});

  final LedgerEntry entry;
  final LedgerContact? contact;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: entry.received ? c.accentSoft : c.negativeSoft,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(entry.received ? Icons.south_west : Icons.north_east,
                size: 17, color: entry.received ? c.positive : c.negative),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${entry.received ? 'From' : 'To'} ${contact?.name ?? 'Removed contact'}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w500, color: c.foreground)),
                const SizedBox(height: 2),
                Text(
                  [formatLongDate(entry.date), if (entry.note.isNotEmpty) entry.note].join(' · '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 12.5, color: c.muted),
                ),
              ],
            ),
          ),
          Text(
            '${entry.received ? '+' : '−'}${formatInrAuto(entry.amount)}',
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w500,
              color: entry.received ? c.positive : c.foreground,
              fontFeatures: tabularFigures,
            ),
          ),
        ],
      ),
    );
  }
}

class _ContactForm extends StatefulWidget {
  const _ContactForm();

  @override
  State<_ContactForm> createState() => _ContactFormState();
}

class _ContactFormState extends State<_ContactForm> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  ContactType _type = ContactType.customer;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _name,
            autofocus: true,
            maxLength: 80,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(labelText: 'Name', counterText: ''),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter a name' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phone,
            maxLength: 30,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Phone (optional)', counterText: ''),
          ),
          const SizedBox(height: 16),
          SegmentedButton<ContactType>(
            segments: [for (final t in ContactType.values) ButtonSegment(value: t, label: Text(t.label))],
            selected: {_type},
            showSelectedIcon: false,
            onSelectionChanged: (s) => setState(() => _type = s.first),
          ),
          const SizedBox(height: 22),
          FilledButton(
            onPressed: () {
              if (!_formKey.currentState!.validate()) return;
              AppScope.of(context).local.addContact(LedgerContact(
                    id: newId(),
                    name: _name.text.trim(),
                    type: _type,
                    phone: _phone.text.trim(),
                    balance: 0,
                  ));
              Navigator.pop(context);
            },
            child: const Text('Add contact'),
          ),
        ],
      ),
    );
  }
}

class _EntryForm extends StatefulWidget {
  const _EntryForm({required this.contact});

  final LedgerContact contact;

  @override
  State<_EntryForm> createState() => _EntryFormState();
}

class _EntryFormState extends State<_EntryForm> {
  final _formKey = GlobalKey<FormState>();
  final _amount = TextEditingController();
  final _note = TextEditingController();
  bool _received = true;
  DateTime _date = dateOnly(DateTime.now());

  @override
  void dispose() {
    _amount.dispose();
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SegmentedButton<bool>(
            segments: const [
              ButtonSegment(value: true, label: Text('I received')),
              ButtonSegment(value: false, label: Text('I paid')),
            ],
            selected: {_received},
            showSelectedIcon: false,
            onSelectionChanged: (s) => setState(() => _received = s.first),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _amount,
            autofocus: true,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: amountInputFormatters,
            decoration: const InputDecoration(labelText: 'Amount', prefixText: '₹ '),
            validator: (v) => (double.tryParse(v ?? '') ?? 0) <= 0 ? 'Enter an amount above zero' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _note,
            maxLength: 160,
            decoration: const InputDecoration(labelText: 'Note (optional)', counterText: ''),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _date,
                firstDate: DateTime(2000),
                lastDate: DateTime.now(),
              );
              if (picked != null) setState(() => _date = picked);
            },
            icon: const Icon(Icons.calendar_today_outlined, size: 17),
            label: Text(formatLongDate(_date)),
            style: OutlinedButton.styleFrom(alignment: Alignment.centerLeft),
          ),
          const SizedBox(height: 22),
          FilledButton(
            onPressed: () {
              if (!_formKey.currentState!.validate()) return;
              AppScope.of(context).local.addEntry(LedgerEntry(
                    id: newId(),
                    contactId: widget.contact.id,
                    amount: double.parse(_amount.text),
                    received: _received,
                    note: _note.text.trim(),
                    date: _date,
                  ));
              Navigator.pop(context);
            },
            child: const Text('Save entry'),
          ),
        ],
      ),
    );
  }
}
