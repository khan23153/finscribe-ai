with open('src/app/api/expenses/route.ts', 'r') as f:
    content = f.read()

new_content = """import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ expenses: [] })

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    })

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
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

    // Get Clerk user details
    const clerkUser = await currentUser()

    // Upsert user — create if not exists
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]
          ?.emailAddress ?? null,
      },
    })

    const body = await req.json()
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: Number(body.amount) || 0,
        description: String(body.description || ''),
        category: String(body.category || 'Other'),
        date: body.date
          ? new Date(body.date) : new Date(),
      }
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('POST expense error:',
      error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error
          ? error.message : 'Failed' },
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
"""

with open('src/app/api/expenses/route.ts', 'w') as f:
    f.write(new_content)
