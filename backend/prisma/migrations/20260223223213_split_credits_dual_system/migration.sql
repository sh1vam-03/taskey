/*
  Warnings:

  - You are about to drop the column `aiCreditBalance` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "aiCreditBalance",
ADD COLUMN     "subscriptionCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionCreditsExpiresAt" TIMESTAMP(3),
ADD COLUMN     "topupCredits" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "aiChatModel" SET DEFAULT 'gemini-2.0-flash',
ALTER COLUMN "aiVoiceModel" SET DEFAULT 'gemini-2.0-flash';
