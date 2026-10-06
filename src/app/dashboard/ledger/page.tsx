'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'
import { ArrowDownLeft, ArrowUpRight, BookUser, History, Plus } from 'lucide-react'
import Sheet from '@/components/Sheet'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Segmented,
  Select,
  cx,
} from '@/components/ui'
import { toLocalDateInputValue } from '@/lib/expenses'
import { formatINR, formatLongDate } from '@/lib/format'
import { useLocalStorageJson } from '@/lib/use-local-storage'

type EntityType = 'Customer' | 'Supplier' | 'Friend'
type TransactionType = 'Received' | 'Paid'

const entitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  type: z.enum(['Customer', 'Supplier', 'Friend']),
  phone: z.string().max(30),
  balance: z.number().finite(),
}).strict()

const transactionSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entityId: z.string().min(1),
  note: z.string().max(160),
  amount: z.number().finite().positive(),
  type: z.enum(['Received', 'Paid']),
}).strict()

type Entity = z.infer<typeof entitySchema>
type Transaction = z.infer<typeof transactionSchema>

const entityListSchema = z.array(entitySchema).max(500)
const transactionListSchema = z.array(transactionSchema).max(5_000)
const initialEntities: Entity[] = []
const initialTransactions: Transaction[] = []

function parseEntities(value: unknown) {
  const result = entityListSchema.safeParse(value)
  return result.success ? result.data : undefined
}

function parseTransactions(value: unknown) {
  const result = transactionListSchema.safeParse(value)
  return result.success ? result.data : undefined
}

export default function LedgerPage() {
  const [entities, setEntities] = useLocalStorageJson('finscribe-ledger-entities', initialEntities, parseEntities)
  const [transactions, setTransactions] = useLocalStorageJson('finscribe-ledger-transactions', initialTransactions, parseTransactions)
  const [view, setView] = useState<'contacts' | 'history'>('contacts')

  const [contactSheetOpen, setContactSheetOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<EntityType>('Customer')
  const [newPhone, setNewPhone] = useState('')

  const [txEntityId, setTxEntityId] = useState<string | null>(null)
  const [txAmount, setTxAmount] = useState('')
  const [txType, setTxType] = useState<TransactionType>('Received')
  const [txNote, setTxNote] = useState('')
  const [txDate, setTxDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const entityById = useMemo(() => new Map(entities.map((entity) => [entity.id, entity])), [entities])
  const txEntity = txEntityId ? entityById.get(txEntityId) : undefined
  const toReceive = entities.reduce((total, entity) => total + Math.max(entity.balance, 0), 0)
  const toPay = entities.reduce((total, entity) => total + Math.max(-entity.balance, 0), 0)

  const openContactSheet = () => {
    setNewName('')
    setNewPhone('')
    setNewType('Customer')
    setError(null)
    setContactSheetOpen(true)
  }

  const openTransactionSheet = (entityId: string) => {
    setTxEntityId(entityId)
    setTxAmount('')
    setTxNote('')
    setTxType('Received')
    setTxDate(toLocalDateInputValue())
    setError(null)
  }

  const handleAddEntity = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newName.trim() || newPhone.trim().length > 30) {
      setError('Enter a name and, optionally, a phone number.')
      return
    }

    setEntities((previous) => [...previous, {
      id: crypto.randomUUID(),
      name: newName.trim(),
      type: newType,
      phone: newPhone.trim(),
      balance: 0,
    }])
    setContactSheetOpen(false)
  }

  const handleAddTransaction = (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(txAmount)
    if (
      !txEntityId
      || !entityById.has(txEntityId)
      || !Number.isFinite(amount) || amount <= 0 || amount > 100_000_000
      || !/^\d{4}-\d{2}-\d{2}$/.test(txDate)
    ) {
      setError('Enter an amount above zero and a valid date.')
      return
    }

    setTransactions((previous) => [{
      id: crypto.randomUUID(),
      date: txDate,
      entityId: txEntityId,
      note: txNote.trim().slice(0, 160),
      amount,
      type: txType,
    }, ...previous])

    // A positive balance means the contact owes the user. Receiving money
    // reduces it; paying the contact increases it.
    setEntities((previous) => previous.map((entity) => (
      entity.id === txEntityId
        ? { ...entity, balance: entity.balance + (txType === 'Received' ? -amount : amount) }
        : entity
    )))
    setTxEntityId(null)
  }

  return (
    <div>
      <PageHeader
        title="Ledger"
        description="Track money between you and the people you deal with. Stored on this device."
        actions={<Button onClick={openContactSheet}><Plus size={16} /> Add contact</Button>}
      />

      <Card className="overflow-hidden grid grid-cols-2 gap-px bg-border [&>*]:bg-surface [&>*]:p-5 mb-5">
        <div>
          <p className="text-[13px] text-muted flex items-center gap-1.5"><ArrowDownLeft size={14} className="text-positive" /> To receive</p>
          <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight tabular">{formatINR(toReceive)}</p>
        </div>
        <div>
          <p className="text-[13px] text-muted flex items-center gap-1.5"><ArrowUpRight size={14} className="text-negative" /> To pay</p>
          <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight tabular">{formatINR(toPay)}</p>
        </div>
      </Card>

      <Segmented
        label="Ledger view"
        value={view}
        onChange={setView}
        options={[
          { value: 'contacts', label: `Contacts${entities.length ? ` (${entities.length})` : ''}` },
          { value: 'history', label: 'History' },
        ]}
        className="mb-4"
      />

      {view === 'contacts' && (
        <Card className="overflow-hidden">
          {entities.length === 0 ? (
            <EmptyState
              icon={BookUser}
              title="No contacts yet"
              description="Add a customer, supplier, or friend to start recording money in and out."
              action={<Button size="sm" onClick={openContactSheet}><Plus size={14} /> Add contact</Button>}
            />
          ) : (
            <ul className="divide-y divide-border">
              {entities.map((entity) => (
                <li key={entity.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="h-9 w-9 shrink-0 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[13px] font-semibold text-foreground-2">
                    {initials(entity.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{entity.name}</p>
                      <Badge className="max-sm:hidden">{entity.type}</Badge>
                    </div>
                    <p className="text-xs text-muted mt-0.5 truncate tabular">
                      <span className="sm:hidden">{entity.type}{entity.phone && ' · '}</span>
                      {entity.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cx(
                      'text-sm font-semibold tabular',
                      entity.balance > 0 && 'text-positive',
                      entity.balance < 0 && 'text-negative',
                    )}>
                      {formatINR(Math.abs(entity.balance), { precise: !Number.isInteger(entity.balance) })}
                    </p>
                    <p className="text-[11px] text-muted">
                      {entity.balance > 0 ? 'owes you' : entity.balance < 0 ? 'you owe' : 'settled'}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openTransactionSheet(entity.id)}>
                    Record
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {view === 'history' && (
        <Card className="overflow-hidden">
          {transactions.length === 0 ? (
            <EmptyState icon={History} title="No entries yet" description="Payments you record against contacts appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cx(
                    'h-9 w-9 shrink-0 rounded-lg flex items-center justify-center',
                    transaction.type === 'Received' ? 'bg-accent-soft text-positive' : 'bg-negative-soft text-negative',
                  )}>
                    {transaction.type === 'Received' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {transaction.type === 'Received' ? 'From ' : 'To '}
                      {entityById.get(transaction.entityId)?.name ?? 'Removed contact'}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {formatLongDate(transaction.date)}{transaction.note && ` · ${transaction.note}`}
                    </p>
                  </div>
                  <p className={cx('text-sm font-medium tabular', transaction.type === 'Received' ? 'text-positive' : 'text-foreground')}>
                    {transaction.type === 'Received' ? '+' : '−'}
                    {formatINR(transaction.amount, { precise: !Number.isInteger(transaction.amount) })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Sheet
        open={contactSheetOpen}
        onClose={() => setContactSheetOpen(false)}
        title="Add contact"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setContactSheetOpen(false)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" form="contact-form" className="flex-1 sm:flex-none">Add contact</Button>
          </div>
        }
      >
        <form id="contact-form" onSubmit={handleAddEntity} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Name" htmlFor="contact-name">
            <Input id="contact-name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Full name" maxLength={80} required autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="contact-type">
              <Select id="contact-type" value={newType} onChange={(event) => setNewType(event.target.value as EntityType)}>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="Friend">Friend</option>
              </Select>
            </Field>
            <Field label="Phone (optional)" htmlFor="contact-phone">
              <Input id="contact-phone" type="tel" inputMode="tel" value={newPhone} onChange={(event) => setNewPhone(event.target.value)} placeholder="98765 43210" maxLength={30} />
            </Field>
          </div>
        </form>
      </Sheet>

      <Sheet
        open={txEntityId !== null}
        onClose={() => setTxEntityId(null)}
        title={txEntity ? `Record with ${txEntity.name}` : 'Record entry'}
        footer={
          <div className="flex gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setTxEntityId(null)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" form="ledger-tx-form" className="flex-1 sm:flex-none">Save entry</Button>
          </div>
        }
      >
        <form id="ledger-tx-form" onSubmit={handleAddTransaction} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Segmented
            label="Direction"
            value={txType}
            onChange={setTxType}
            options={[
              { value: 'Received', label: 'I received money' },
              { value: 'Paid', label: 'I paid / gave money' },
            ]}
            className="w-full [&>button]:flex-1"
          />
          <Field label="Amount (₹)" htmlFor="ledger-amount">
            <Input id="ledger-amount" type="number" inputMode="decimal" value={txAmount} onChange={(event) => setTxAmount(event.target.value)} placeholder="0" min="0.01" max="100000000" step="0.01" required autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Note (optional)" htmlFor="ledger-note">
              <Input id="ledger-note" value={txNote} onChange={(event) => setTxNote(event.target.value)} placeholder="Reason" maxLength={160} />
            </Field>
            <Field label="Date" htmlFor="ledger-date">
              <Input id="ledger-date" type="date" value={txDate} onChange={(event) => setTxDate(event.target.value)} required />
            </Field>
          </div>
        </form>
      </Sheet>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
