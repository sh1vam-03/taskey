import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "../../config/db.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const updateProfileTool = () => {
    return new DynamicStructuredTool({
        name: "update_profile",
        description: "Update user profile settings (name, timezone).",
        schema: z.object({
            name: z.string().optional(),
            timezone: z.string().optional(),
        }),
        func: async (args, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                const user = await prisma.user.update({
                    where: { id: userId },
                    data: args
                });
                return success({ name: user.name, timezone: user.timezone });
            } catch (e) {
                return error(`Error updating profile: ${e.message}`);
            }
        }
    });
};
