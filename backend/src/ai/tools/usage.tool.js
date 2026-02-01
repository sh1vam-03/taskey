// Read usage + limits

import * as usageService from "../../services/usage.service.js";

export async function getUsageTool(user) {
    return usageService.getMyUsage(user);
}
