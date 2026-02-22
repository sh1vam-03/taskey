/*
  Warnings:

  - You are about to drop the column `aiProvider` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "aiProvider",
ADD COLUMN     "aiChatModel" TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
ADD COLUMN     "aiSttModel" TEXT NOT NULL DEFAULT 'saaras:v3',
ADD COLUMN     "aiTtsModel" TEXT NOT NULL DEFAULT 'bulbul:v3',
ADD COLUMN     "aiVoiceModel" TEXT NOT NULL DEFAULT 'gemini-1.5-flash';
