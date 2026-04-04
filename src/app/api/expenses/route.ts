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
      where: { clerkId: userId },
      select: { id: true }
    })

    if (!user) {
      // Auto-create user if not exists
      const newUser = await prisma.user.create({
        data: { clerkId: userId }
      })

      const body = await req.json()
      const expense = await prisma.expense.create({
        data: {
          userId: newUser.id,
          amount: parseFloat(String(body.amount)) || 0,
          description: String(body.description || ''),
          category: String(body.category || 'Other'),
          date: body.date ? new Date(body.date) : new Date(),
        }
      })
      return NextResponse.json({ expense })
    }

    const body = await req.json()
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: parseFloat(String(body.amount)) || 0,
        description: String(body.description || ''),
        category: String(body.category || 'Other'),
        date: body.date ? new Date(body.date) : new Date(),
      }
    })
    return NextResponse.json({ expense })

  } catch (error) {
    console.error('POST expense error DETAILS:',
      error instanceof Error ? error.message : error
    )
    return NextResponse.json(
      { error: 'Failed to save expense',
        details: error instanceof Error ? error.message : 'Unknown'
      },
      { status: 500 }
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
