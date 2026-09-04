'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toLocalDateInputValue } from '@/lib/expenses'
import { useLocalStorageJson } from '@/lib/use-local-storage'

type EntityType = 'Customer' | 'Supplier' | 'Friend'

type Entity = {
  id: string
  name: string
  type: EntityType
  phone: string
  balance: number
}

type TransactionType = 'Received' | 'Paid'

type Transaction = {
  id: string
  date: string
  entityId: string
  note: string
  amount: number
  type: TransactionType
}

const initialEntities: Entity[] = [
]

const initialTransactions: Transaction[] = []
const entityListSchema = z.array(z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  type: z.enum(['Customer', 'Supplier', 'Friend']),
  phone: z.string().max(30),
  balance: z.number().finite(),
}).strict()).max(500)
const transactionListSchema = z.array(z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entityId: z.string().min(1),
  note: z.string().max(160),
  amount: z.number().finite().positive(),
  type: z.enum(['Received', 'Paid']),
}).strict()).max(5_000)

function parseEntities(value: unknown) {
  const result = entityListSchema.safeParse(value)
  return result.success ? result.data : undefined
}

function parseTransactions(value: unknown) {
  const result = transactionListSchema.safeParse(value)
  return result.success ? result.data : undefined
}

export default function LedgerPage() {
  const [entities, setEntities] = useLocalStorageJson(
    'finscribe-ledger-entities',
    initialEntities,
    parseEntities,
  )
  const [transactions, setTransactions] = useLocalStorageJson(
    'finscribe-ledger-transactions',
    initialTransactions,
    parseTransactions,
  )
  const [activeTab, setActiveTab] = useState<'entities' | 'history'>('entities')

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<EntityType>('Customer')
  const [newPhone, setNewPhone] = useState('')

  const [txAmount, setTxAmount] = useState('')
  const [txType, setTxType] = useState<TransactionType>('Received')
  const [txNote, setTxNote] = useState('')
  const [txDate, setTxDate] = useState(toLocalDateInputValue)
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || newPhone.trim().length > 30) {
      setError('Enter a contact name and a valid optional phone number.')
      return
    }

    const newEntity: Entity = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      type: newType,
      phone: newPhone.trim(),
      balance: 0
    }
    setEntities((previous) => [...previous, newEntity])
    setNewName('')
    setNewPhone('')
    setNewType('Customer')
    setError(null)
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(txAmount)
    if (
      !activeEntityId
      || !entities.some((entity) => entity.id === activeEntityId)
      || !Number.isFinite(amount)
      || amount <= 0
      || amount > 100_000_000
      || !/^\d{4}-\d{2}-\d{2}$/.test(txDate)
    ) {
      setError('Choose a contact and enter a valid date and positive amount.')
      return
    }

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      date: txDate,
      entityId: activeEntityId,
      note: txNote.trim().slice(0, 160),
      amount,
      type: txType
    }

    setTransactions((previous) => [newTx, ...previous])

    setEntities((previous) => previous.map(ent => {
      if (ent.id === activeEntityId) {
        // A positive balance means the contact owes the user. Receiving money
        // reduces it; paying the contact increases it.
        const diff = txType === 'Received' ? -amount : amount
        return { ...ent, balance: ent.balance + diff }
      }
      return ent
    }))

    setTxAmount('')
    setTxNote('')
    setActiveEntityId(null)
    setTxDate(toLocalDateInputValue())
    setActiveTab('history')
    setError(null)
  }

  const getEntityName = (id: string) => entities.find(e => e.id === id)?.name || 'Unknown'

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION A - Add Entity Form */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Add New Contact</h1>
          <p className="text-xs text-zinc-500 mt-1">Contacts and ledger entries are saved in this browser.</p>
        </div>
        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <form onSubmit={handleAddEntity} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="Full Name"
              maxLength={80}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as EntityType)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Friend">Friend</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="10-digit number"
              maxLength={30}
            />
          </div>
          <button
            type="submit"
            className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Add Contact
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('entities')}
          className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'entities' ? 'border-green-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Contacts
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'history' ? 'border-green-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          History
        </button>
      </div>

      {/* SECTION B & C - Entity Cards & Inline Tx */}
      {activeTab === 'entities' && (
        entities.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
            <p>No contacts yet. Add someone above.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map(entity => (
            <div key={entity.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-5 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg text-zinc-100">{entity.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {entity.type}
                    </span>
                  </div>
                  {entity.phone && <p className="text-sm text-zinc-500 mt-1">{entity.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 mb-1">Balance</p>
                  <p className={`font-mono font-bold text-lg ${entity.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {entity.balance >= 0 ? '+' : '-'}₹{Math.abs(entity.balance).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {entity.balance > 0 ? 'They owe you' : entity.balance < 0 ? 'You owe them' : 'Settled'}
                  </p>
                </div>
              </div>

              {activeEntityId === entity.id ? (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                  <form onSubmit={handleAddTransaction} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500 mb-1">Type</label>
                        <select
                          value={txType}
                          onChange={e => setTxType(e.target.value as TransactionType)}
                          className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                        >
                          <option value="Received">Received (Got ₹)</option>
                          <option value="Paid">Paid (Gave ₹)</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500 mb-1">Amount</label>
                        <input
                          type="number"
                          value={txAmount}
                          onChange={e => setTxAmount(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                          placeholder="0" min="0.01" max="100000000" step="0.01" required
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={txNote}
                        onChange={e => setTxNote(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                        placeholder="Note / Reason"
                        maxLength={160}
                      />
                      <input
                        type="date"
                        value={txDate}
                        onChange={e => setTxDate(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 rounded-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveEntityId(null)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-1.5 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="px-5 pb-5 pt-2">
                  <button
                    onClick={() => setActiveEntityId(entity.id)}
                    className="w-full text-center py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg text-sm transition-colors"
                  >
                    + Add Transaction
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        )
      )}

      {/* SECTION D - Transaction History */}
      {activeTab === 'history' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p>No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Note</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                      <td className="px-6 py-4 font-medium text-zinc-100">{getEntityName(tx.entityId)}</td>
                      <td className="px-6 py-4">{tx.note || '-'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-mono font-bold ${
                        tx.type === 'Received' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tx.type === 'Received' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
