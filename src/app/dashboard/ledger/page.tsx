'use client'

import { useState } from 'react'

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
  { id: '1', name: "Rahul Sharma", type: "Customer", phone: "9876543210", balance: 5000 },
  { id: '2', name: "Priya Electronics", type: "Supplier", phone: "9876543211", balance: -12000 },
  { id: '3', name: "Ahmed Khan", type: "Friend", phone: "9876543212", balance: 500 },
]

export default function LedgerPage() {
  const [entities, setEntities] = useState<Entity[]>(initialEntities)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState<'entities' | 'history'>('entities')

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<EntityType>('Customer')
  const [newPhone, setNewPhone] = useState('')

  const [txAmount, setTxAmount] = useState('')
  const [txType, setTxType] = useState<TransactionType>('Received')
  const [txNote, setTxNote] = useState('')
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null)

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    const newEntity: Entity = {
      id: Date.now().toString(),
      name: newName,
      type: newType,
      phone: newPhone,
      balance: 0
    }
    setEntities([...entities, newEntity])
    setNewName('')
    setNewPhone('')
    setNewType('Customer')
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEntityId || !txAmount) return

    const amount = parseFloat(txAmount)
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: txDate,
      entityId: activeEntityId,
      note: txNote,
      amount,
      type: txType
    }

    setTransactions([newTx, ...transactions])

    // Update balance
    setEntities(entities.map(ent => {
      if (ent.id === activeEntityId) {
        // If they pay us (Received), their balance goes down (they owe us less)
        // If we pay them (Paid), their balance goes up (we owe them less / they owe us more)
        const diff = txType === 'Received' ? -amount : amount
        return { ...ent, balance: ent.balance + diff }
      }
      return ent
    }))

    setTxAmount('')
    setTxNote('')
    setActiveEntityId(null)
    setTxDate(new Date().toISOString().split('T')[0])
    setActiveTab('history')
  }

  const getEntityName = (id: string) => entities.find(e => e.id === id)?.name || 'Unknown'

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION A - Add Entity Form */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
        <form onSubmit={handleAddEntity} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="Full Name"
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
                          placeholder="0" min="1" required
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
