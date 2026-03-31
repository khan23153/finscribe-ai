'use client'

import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('finscribe-theme')
    if (saved === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])

  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('finscribe-theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('finscribe-theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-zinc-800 transition-all text-sm text-zinc-400 hover:text-white"
    >
      {isDark ? (
        <><Sun size={16} /><span>Light Mode</span></>
      ) : (
        <><Moon size={16} /><span>Dark Mode</span></>
      )}
    </button>
  )
}
