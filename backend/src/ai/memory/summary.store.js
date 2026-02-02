import prisma from "../../config/db.js";

/**
 * Summary Store (Retriever)
 * Fetches the most recent summary for a conversation.
 * Since we save summaries as SYSTEM messages with specific metadata, we query for that.
 */
export const getLastSummary = async (conversationId) => {
    if (!conversationId) return null;

    try {
        const summaryMsg = await prisma.aiMessage.findFirst({
            where: {
                conversationId,
                role: "SYSTEM",
                // Depending on Prisma JSON filter capabilities, we might need raw query or just checking content prefix.
                // For safety and DB compatibility, checking the content prefix is robust for V1.
                content: {
                    startsWith: "SUMMARY_MARKER:"
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (summaryMsg) {
            // strip the marker
            return summaryMsg.content.replace("SUMMARY_MARKER: ", "").trim();
        }

        return null;
    } catch (error) {
        console.error("Error fetching summary:", error);
        return null;
    }
};
