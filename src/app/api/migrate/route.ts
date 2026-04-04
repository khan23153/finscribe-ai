import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const results: string[] = []
  const errors: string[] = []

  const migrations = [
    `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'Other'`,
    `ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    `UPDATE "Expense" SET "description" = '' WHERE "description" IS NULL`,
    `UPDATE "Expense" SET "category" = 'Other' WHERE "category" IS NULL`,
    `ALTER TABLE "LedgerEntity" ADD COLUMN IF NOT EXISTS "description" TEXT`,
    `ALTER TABLE "LedgerEntity" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
    `ALTER TABLE "LedgerEntity" ADD COLUMN IF NOT EXISTS "balance" DOUBLE PRECISION NOT NULL DEFAULT 0`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyIncome" DOUBLE PRECISION`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyBudget" DOUBLE PRECISION`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "savingsGoal" DOUBLE PRECISION`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingComplete" BOOLEAN NOT NULL DEFAULT false`,
  ]

  for (const sql of migrations) {
    try {
      await prisma.$executeRawUnsafe(sql)
      results.push(`OK: ${sql.substring(0, 50)}`)
    } catch (e) {
      errors.push(`ERR: ${sql.substring(0, 50)} — ${e}`)
    }
  }

  return NextResponse.json({
    success: true,
    results,
    errors
  })
}
