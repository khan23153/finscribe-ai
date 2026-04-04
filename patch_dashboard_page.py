import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Current try block starts at line 18 "try {"
# We will wrap the prisma queries and replace them safely.

old_try_block = """  try {
    // Fetch the user's main ledger account to calculate balance
    const mainAccount = await prisma.ledgerEntity.findFirst({
      where: {
        user: { clerkId: userId },
        type: "ASSET",
        name: "Main Account"
      }
    });

    if (mainAccount) {
      const credits = await prisma.ledgerTransaction.aggregate({
        where: { creditEntityId: mainAccount.id },
        _sum: { amount: true }
      });

      const debits = await prisma.ledgerTransaction.aggregate({
        where: { debitEntityId: mainAccount.id },
        _sum: { amount: true }
      });

      totalBalance = Number(mainAccount.openingBalance) +
        Number(credits._sum.amount || 0) -
        Number(debits._sum.amount || 0);
    }

    // Fetch true user record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Fetch expenses for current month
    expenses = await prisma.expense.findMany({
      where: {
        userId: user?.id,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      orderBy: { date: 'desc' }
    });

    expenses.forEach(e => {
      totalMonthlySpend += Number(e.amount);
    });
  } catch (error) {
    console.error("Dashboard error:", error);
  }"""

new_try_block = """  try {
    // Fetch the user's main ledger account to calculate balance
    const mainAccount = await prisma.ledgerEntity.findFirst({
      where: {
        user: { clerkId: userId },
        type: "ASSET",
        name: "Main Account"
      }
    });

    if (mainAccount) {
      const credits = await prisma.ledgerTransaction.aggregate({
        where: { creditEntityId: mainAccount.id },
        _sum: { amount: true }
      });

      const debits = await prisma.ledgerTransaction.aggregate({
        where: { debitEntityId: mainAccount.id },
        _sum: { amount: true }
      });

      totalBalance = Number(mainAccount.openingBalance) +
        Number(credits._sum.amount || 0) -
        Number(debits._sum.amount || 0);
    }
  } catch (error) {
    console.error("DB error fetching ledger:", error);
  }

  let user = null;
  try {
    // Fetch true user record
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
  } catch (error) {
    console.error("DB error fetching user:", error);
  }

  try {
    // Fetch expenses for current month
    if (user?.id) {
      expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        orderBy: { date: 'desc' }
      });

      expenses.forEach(e => {
        totalMonthlySpend += Number(e.amount);
      });
    }
  } catch (error) {
    console.error("DB error fetching expenses:", error);
    expenses = [];
  }"""

content = content.replace(old_try_block, new_try_block)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
