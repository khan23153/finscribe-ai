import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      incomeRange,
      savingsPercentage,
      topSpending,
      expenseTracking,
      primaryGoal,
      startingBalance,
      topCategories,
      savingsGoal
    } = data;

    if (
      !incomeRange ||
      !savingsPercentage ||
      !topSpending ||
      !expenseTracking ||
      !primaryGoal ||
      startingBalance === undefined ||
      !topCategories ||
      savingsGoal === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Wrap db calls in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the User record in Prisma
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await tx.user.update({
        where: { clerkId: userId },
        data: {
          onboardingComplete: true,
          incomeRange,
          savingsPercentage,
          topSpending,
          expenseTracking,
          primaryGoal,
          savingsGoal,
        },
      });

      // 2. Create the LedgerEntity (Main Account) and initial LedgerTransaction
      if (startingBalance > 0) {
        const mainAccount = await tx.ledgerEntity.create({
          data: {
            userId: user.id,
            name: 'Main Account',
            type: 'ASSET',
            openingBalance: startingBalance,
            description: 'Primary tracking account created during onboarding',
          },
        });

        const openingEquity = await tx.ledgerEntity.create({
          data: {
            userId: user.id,
            name: 'Opening Balance Equity',
            type: 'EQUITY',
            description: 'System account for initial balance',
          },
        });

        await tx.ledgerTransaction.create({
          data: {
            userId: user.id,
            debitEntityId: mainAccount.id,
            creditEntityId: openingEquity.id,
            amount: startingBalance,
            description: 'Initial Balance',
            transactionDate: new Date(),
          },
        });
      }
    });

    // 3. Update Clerk user metadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Onboarded successfully' });
  } catch (error: any) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
