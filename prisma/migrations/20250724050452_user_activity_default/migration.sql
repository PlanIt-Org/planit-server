/*
  Warnings:

  - You are about to drop the column `inviteLink` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `activityPreferences` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Trip_inviteLink_key";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "inviteLink";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activityPreferences";

-- AlterTable
ALTER TABLE "UserPreferences" ALTER COLUMN "activityPreferences" SET DEFAULT ARRAY[]::TEXT[];
