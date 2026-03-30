'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION 1 - Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100 flex items-center space-x-6">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 flex-shrink-0">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500">
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
              Free Tier
            </span>
            <span className="px-2.5 py-1 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700 uppercase tracking-wider">
              ID: {user?.id.slice(0, 8) || 'unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2 - Preferences */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h3 className="text-lg font-bold mb-6 border-b border-zinc-800 pb-4">Notification Preferences</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Email notifications</p>
              <p className="text-sm text-zinc-500 mt-1">Receive updates about your account activity.</p>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${emailNotifs ? 'bg-green-500' : 'bg-zinc-700'}`}
              aria-label="Toggle Email notifications"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${emailNotifs ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Weekly spending report</p>
              <p className="text-sm text-zinc-500 mt-1">Get a summary of your weekly expenses every Monday.</p>
            </div>
            <button
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${weeklyReport ? 'bg-green-500' : 'bg-zinc-700'}`}
              aria-label="Toggle Weekly spending report"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${weeklyReport ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-200">Budget alerts</p>
              <p className="text-sm text-zinc-500 mt-1">Get notified when you approach 80% of your category budgets.</p>
            </div>
            <button
              onClick={() => setBudgetAlerts(!budgetAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${budgetAlerts ? 'bg-green-500' : 'bg-zinc-700'}`}
              aria-label="Toggle Budget alerts"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transform transition-transform ${budgetAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3 - Danger Zone */}
      <div className="bg-zinc-900 border border-red-900/30 p-6 rounded-xl text-zinc-100">
        <h3 className="text-lg font-bold text-red-400 mb-6 border-b border-red-900/30 pb-4">Danger Zone</h3>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-200">Sign out of FinScribe</p>
              <p className="text-sm text-zinc-500 mt-1">You will be securely logged out of this device.</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              Sign Out
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-800">
            <div>
              <p className="font-medium text-zinc-200">Delete Account</p>
              <p className="text-sm text-zinc-500 mt-1">Permanently remove all your financial data and settings.</p>
            </div>
            <button
              disabled
              className="px-6 py-2 border border-red-900/50 text-red-500/50 bg-transparent rounded-lg font-medium w-full sm:w-auto cursor-not-allowed opacity-75"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
