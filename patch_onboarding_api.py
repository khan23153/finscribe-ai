import re

with open('src/app/api/onboarding/route.ts', 'r') as f:
    content = f.read()

old_block = """    // 2. Create the LedgerEntity (Main Account) and initial LedgerTransaction
    const mainAccount = await prisma.ledgerEntity.create({
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
      const openingEquity = await prisma.ledgerEntity.create({
        data: {
          userId: user.id,
          name: 'Opening Balance Equity',
          type: 'EQUITY',
          description: 'System account for initial balance',
        },
      });

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
    }"""

new_block = """    // 2. Idempotency Check: Create the LedgerEntity (Main Account) and initial LedgerTransaction
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
    }"""

content = content.replace(old_block, new_block)

with open('src/app/api/onboarding/route.ts', 'w') as f:
    f.write(content)
