import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ expenses: [] })

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    if (!user) return NextResponse.json({ expenses: [] })

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('GET expenses error:', error)
    return NextResponse.json({ expenses: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, { status: 404 }
      )
    }

    const body = await req.json()
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        title: body.description || body.desc || 'Expense',
        amount: parseFloat(body.amount),
        category: body.category || 'Other',
        description: body.description || body.desc || '',
        date: body.date ? new Date(body.date) : new Date(),
      }
    })
    return NextResponse.json({ expense })
  } catch (error) {
    console.error('POST expense error:', error)
    return NextResponse.json(
      { error: 'Failed to save expense' }, { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'ID required' }, { status: 400 }
      )
    }

    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE expense error:', error)
    return NextResponse.json(
      { error: 'Failed to delete' }, { status: 500 }
    )
  }
}
