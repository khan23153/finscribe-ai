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
    let { startingBalance, savingsGoal } = data;
    const { topCategories } = data;

    if (startingBalance === undefined || !topCategories || savingsGoal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    startingBalance = Number(String(startingBalance).replace(/[^0-9.]/g, ''));
    savingsGoal = Number(String(savingsGoal).replace(/[^0-9.]/g, ''));

    if (isNaN(startingBalance) || startingBalance < 0 || isNaN(savingsGoal) || savingsGoal < 0) {
      return NextResponse.json({ error: "Invalid numeric value provided" }, { status: 400 });
    }

    // 1. Update the User record in Prisma
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        onboardingComplete: true,
      },
    });

    // 2. Idempotency Check: Create the LedgerEntity (Main Account) and initial LedgerTransaction
    let mainAccount = await prisma.ledgerEntity.findFirst({
      where: {
        userId: user.id,
        name: 'Main Account',
        type: 'ASSET'
      }
    });

    if (!mainAccount) {
      mainAccount = await prisma.ledgerEntity.create({
        data: {
          userId: user.id,
          name: 'Main Account',
          type: 'ASSET',
          openingBalance: startingBalance,
          description: 'Primary tracking account created during onboarding',
        },
      });

      // If starting balance is > 0, create an initial transaction to reflect the deposit
      if (startingBalance > 0) {
        // Need an EQUITY/INCOME account to balance the double-entry ledger
        let openingEquity = await prisma.ledgerEntity.findFirst({
          where: {
            userId: user.id,
            name: 'Opening Balance Equity',
            type: 'EQUITY'
          }
        });

        if (!openingEquity) {
          openingEquity = await prisma.ledgerEntity.create({
            data: {
              userId: user.id,
              name: 'Opening Balance Equity',
              type: 'EQUITY',
              description: 'System account for initial balance',
            },
          });
        }

        await prisma.ledgerTransaction.create({
          data: {
            userId: user.id,
            debitEntityId: mainAccount.id, // Asset increases with debit
            creditEntityId: openingEquity.id, // Equity increases with credit
            amount: startingBalance,
            description: 'Initial Balance',
            transactionDate: new Date(),
          },
        });
      }
    }

    // 3. Update Clerk user metadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        topCategories,
        savingsGoal,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING_API_ERROR]:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
