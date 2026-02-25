import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.user.updateMany({
        where: { aiChatModel: 'gemini-2.0-flash' },
        data: { aiChatModel: 'gemini-1.5-flash' }
    });
    await prisma.user.updateMany({
        where: { aiVoiceModel: 'gemini-2.0-flash' },
        data: { aiVoiceModel: 'gemini-1.5-flash' }
    });
    console.log("Database models migrated successfully.");
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
