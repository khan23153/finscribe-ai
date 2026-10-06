import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/request-user'

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
] as const

const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  })

const createExpenseSchema = z.object({
  amount: z.coerce.number().finite().positive().max(100_000_000),
  description: z.string().trim().min(1).max(160),
  category: z.enum(categories),
  date: dateSchema.optional(),
}).strict()

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(
      { expenses },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('GET expenses failed', error)
    return NextResponse.json(
      { error: 'Unable to load expenses.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
    }
    const parsed = createExpenseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Enter a valid description, positive amount, category, and date.' },
        { status: 400 },
      )
    }

    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: parsed.data.amount,
        description: parsed.data.description,
        category: parsed.data.category,
        date: parsed.data.date
          ? new Date(`${parsed.data.date}T00:00:00.000Z`)
          : new Date(),
      },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error('POST expense failed', error)
    return NextResponse.json(
      { error: 'Unable to save the expense.' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = new URL(request.url).searchParams.get('id')
    if (!id || id.length > 64) {
      return NextResponse.json({ error: 'Expense ID is required.' }, { status: 400 })
    }

    const result = await prisma.expense.deleteMany({
      where: { id, userId: user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Expense not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE expense failed', error)
    return NextResponse.json(
      { error: 'Unable to delete the expense.' },
      { status: 500 },
    )
  }
}
