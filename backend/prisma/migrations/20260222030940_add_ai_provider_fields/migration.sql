-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiProvider" TEXT NOT NULL DEFAULT 'sarvam',
ADD COLUMN     "aiSarvamLang" TEXT NOT NULL DEFAULT 'en-IN',
ADD COLUMN     "aiSarvamSpeaker" TEXT NOT NULL DEFAULT 'meera';
