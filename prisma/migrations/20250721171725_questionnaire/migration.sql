/*
  Warnings:

  - You are about to drop the column `budgetRange` on the `UserPreferences` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "budgetRange",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lifestyleChoices" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "planningRole" TEXT,
ADD COLUMN     "typicalAudience" TEXT[],
ADD COLUMN     "typicalTripLength" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
