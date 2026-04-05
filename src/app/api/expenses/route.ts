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

    const body = await req.json()

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId }
      })
    }

    // Create expense with only safe fields
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: Number(body.amount) || 0,
        description: body.description
          ? String(body.description) : '',
        category: body.category
          ? String(body.category) : 'Other',
        date: body.date
          ? new Date(body.date) : new Date(),
      }
    })

    return NextResponse.json({ expense })
  } catch (error) {
    // Log full error
    console.error(
      'POST expense FULL ERROR:',
      JSON.stringify(error, null, 2),
      error instanceof Error ? error.stack : ''
    )
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message : 'Unknown error'
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
