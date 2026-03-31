'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import ThemeToggle from '../../../components/ThemeToggle'

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(false)

  const [income, setIncome] = useState('')
  const [budget, setBudget] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    const savedIncome = localStorage.getItem('finscribe-income')
    const savedBudget = localStorage.getItem('finscribe-budget')
    if (savedIncome) setIncome(savedIncome)
    if (savedBudget) setBudget(savedBudget)
  }, [])

  const savePreferences = () => {
    localStorage.setItem('finscribe-income', income)
    localStorage.setItem('finscribe-budget', budget)
    setSavedMessage('Saved! ✓')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION 1 - Profile Card */}
      <div className="bg-surface border border-zinc-800 p-6 rounded-xl text-zinc-100 flex items-center space-x-6">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700 bg-accent text-black flex items-center justify-center flex-shrink-0">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-zinc-100 truncate">
            {user?.fullName || 'Anonymous User'}
          </h2>
          <p className="text-zinc-400 text-sm truncate mt-1">
            {user?.primaryEmailAddress?.emailAddress || 'No email attached'}
          </p>
          <div className="mt-3 flex gap-2">
            <span className="px-2.5 py-1 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700 uppercase tracking-wider">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2 - Appearance */}
      <div className="bg-surface border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h3 className="text-lg font-bold mb-6 border-b border-zinc-800 pb-4">Appearance</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Theme</p>
              <p className="text-sm text-zinc-500 mt-1">Select your preferred viewing mode.</p>
            </div>
            <div className="w-48">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Currency</p>
              <p className="text-sm text-zinc-500 mt-1">Your primary currency for displaying amounts.</p>
            </div>
            <div className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm border border-zinc-700">
              ₹ INR
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 - Preferences */}
      <div className="bg-surface border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h3 className="text-lg font-bold mb-6 border-b border-zinc-800 pb-4">Notification Preferences</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Weekly spending report</p>
              <p className="text-sm text-zinc-500 mt-1">Get a summary of your weekly expenses every Monday.</p>
            </div>
            <button
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${weeklyReport ? 'bg-accent' : 'bg-zinc-700'}`}
              aria-label="Toggle Weekly spending report"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${weeklyReport ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Budget alerts</p>
              <p className="text-sm text-zinc-500 mt-1">Get notified when you approach 80% of your category budgets.</p>
            </div>
            <button
              onClick={() => setBudgetAlerts(!budgetAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${budgetAlerts ? 'bg-accent' : 'bg-zinc-700'}`}
              aria-label="Toggle Budget alerts"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${budgetAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Monthly summary report</p>
              <p className="text-sm text-zinc-500 mt-1">Receive a detailed monthly financial breakdown.</p>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${emailNotifs ? 'bg-accent' : 'bg-zinc-700'}`}
              aria-label="Toggle Monthly notifications"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4 - Financial Preferences */}
      <div className="bg-surface border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h3 className="text-lg font-bold mb-6 border-b border-zinc-800 pb-4">Financial Preferences</h3>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-200">Monthly Income (₹)</p>
              <p className="text-sm text-zinc-500 mt-1">Set your base monthly income.</p>
            </div>
            <input
              type="number"
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-accent"
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-200">Monthly Budget Limit (₹)</p>
              <p className="text-sm text-zinc-500 mt-1">Set your overall monthly spending limit.</p>
            </div>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-accent"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={savePreferences}
              className="px-6 py-2 bg-accent hover:bg-accent-dark text-black font-medium rounded-lg transition-colors"
            >
              Save Preferences
            </button>
            {savedMessage && <span className="text-accent text-sm font-medium">{savedMessage}</span>}
          </div>
        </div>
      </div>

      {/* SECTION 5 - Danger Zone */}
      <div className="bg-surface border border-red-900/30 p-6 rounded-xl text-zinc-100">
        <h3 className="text-lg font-bold text-red-400 mb-6 border-b border-red-900/30 pb-4">Danger Zone</h3>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-200">Sign out of FinScribe</p>
              <p className="text-sm text-zinc-500 mt-1">You will be securely logged out of this device.</p>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors w-full sm:w-auto hover:bg-red-500/20"
            >
              Sign Out
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-800">
            <div>
              <p className="font-medium text-zinc-200 flex items-center gap-2">
                Delete Account
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase tracking-wider">Coming soon</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">Permanently remove all your financial data and settings.</p>
            </div>
            <button
              disabled
              className="px-6 py-2 border border-zinc-800 text-zinc-500 bg-transparent rounded-lg font-medium w-full sm:w-auto cursor-not-allowed"
              title="Coming soon"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
