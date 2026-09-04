export type Expense = {
  id: string
  description: string
  amount: number
  category: string
  date: string
  createdAt?: string
}

export function toLocalDateInputValue(date = new Date()) {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localTime.toISOString().slice(0, 10)
}

export function isInMonth(value: string, month: Date) {
  const date = new Date(value)
  return date.getFullYear() === month.getFullYear()
    && date.getMonth() === month.getMonth()
}

export function startOfPeriod(period: string, now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (period === 'This Week') {
    const day = start.getDay()
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
  } else if (period === 'This Month') {
    start.setDate(1)
  } else if (period === 'Last 3 Months') {
    start.setMonth(start.getMonth() - 2, 1)
  } else if (period === 'This Year') {
    start.setMonth(0, 1)
  }

  return start
}
