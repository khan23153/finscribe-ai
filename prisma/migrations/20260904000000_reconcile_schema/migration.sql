-- Reconcile databases created by the legacy patch migrations with the current
-- Prisma schema. Legacy columns are removed only after their replacements are
-- present and nullable data has been normalized.

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
UPDATE "User"
SET "clerkId" = 'legacy-' || "id"
WHERE "clerkId" IS NULL OR "clerkId" = '';
ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "clerkId" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" DROP DEFAULT;
ALTER TABLE "User" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "monthlyIncome";
ALTER TABLE "User" DROP COLUMN IF EXISTS "monthlyBudget";
ALTER TABLE "User" DROP COLUMN IF EXISTS "savingsGoal";
ALTER TABLE "User" DROP COLUMN IF EXISTS "onboardingComplete";
DROP INDEX IF EXISTS "User_email_key";
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");

-- Expense
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3);
UPDATE "Expense" SET "description" = '' WHERE "description" IS NULL;
UPDATE "Expense" SET "category" = 'Other' WHERE "category" IS NULL;
UPDATE "Expense" SET "date" = CURRENT_TIMESTAMP WHERE "date" IS NULL;
ALTER TABLE "Expense" ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION;
ALTER TABLE "Expense" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "description" SET DEFAULT '';
ALTER TABLE "Expense" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "category" SET DEFAULT 'Other';
ALTER TABLE "Expense" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "title";
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "note";
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "currency";
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "receiptUrl";
DROP INDEX IF EXISTS "Expense_userId_idx";
DROP INDEX IF EXISTS "Expense_date_idx";
CREATE INDEX IF NOT EXISTS "Expense_userId_date_idx" ON "Expense"("userId", "date");

-- LedgerEntity
ALTER TABLE "LedgerEntity" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "LedgerEntity" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "LedgerEntity" ADD COLUMN IF NOT EXISTS "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "LedgerEntity"
  ALTER COLUMN "openingBalance" TYPE DOUBLE PRECISION USING "openingBalance"::DOUBLE PRECISION;
ALTER TABLE "LedgerEntity" ALTER COLUMN "openingBalance" SET DEFAULT 0;
ALTER TABLE "LedgerEntity" ALTER COLUMN "currency" SET DEFAULT 'INR';
CREATE INDEX IF NOT EXISTS "LedgerEntity_userId_idx" ON "LedgerEntity"("userId");

-- LedgerTransaction
ALTER TABLE "LedgerTransaction"
  ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION;
ALTER TABLE "LedgerTransaction" ALTER COLUMN "currency" SET DEFAULT 'INR';
CREATE INDEX IF NOT EXISTS "LedgerTransaction_userId_idx" ON "LedgerTransaction"("userId");
CREATE INDEX IF NOT EXISTS "LedgerTransaction_transactionDate_idx" ON "LedgerTransaction"("transactionDate");
CREATE INDEX IF NOT EXISTS "LedgerTransaction_debitEntityId_idx" ON "LedgerTransaction"("debitEntityId");
CREATE INDEX IF NOT EXISTS "LedgerTransaction_creditEntityId_idx" ON "LedgerTransaction"("creditEntityId");

-- Foreign keys are recreated with the actions declared in schema.prisma.
ALTER TABLE "Expense" DROP CONSTRAINT IF EXISTS "Expense_userId_fkey";
ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LedgerEntity" DROP CONSTRAINT IF EXISTS "LedgerEntity_userId_fkey";
ALTER TABLE "LedgerEntity"
  ADD CONSTRAINT "LedgerEntity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LedgerTransaction" DROP CONSTRAINT IF EXISTS "LedgerTransaction_userId_fkey";
ALTER TABLE "LedgerTransaction"
  ADD CONSTRAINT "LedgerTransaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LedgerTransaction" DROP CONSTRAINT IF EXISTS "LedgerTransaction_debitEntityId_fkey";
ALTER TABLE "LedgerTransaction"
  ADD CONSTRAINT "LedgerTransaction_debitEntityId_fkey"
  FOREIGN KEY ("debitEntityId") REFERENCES "LedgerEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LedgerTransaction" DROP CONSTRAINT IF EXISTS "LedgerTransaction_creditEntityId_fkey";
ALTER TABLE "LedgerTransaction"
  ADD CONSTRAINT "LedgerTransaction_creditEntityId_fkey"
  FOREIGN KEY ("creditEntityId") REFERENCES "LedgerEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
