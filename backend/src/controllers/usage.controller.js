import asyncHandler from "../utils/asyncHandler.js";
import * as usageService from "../services/usage.service.js";

export const getMyUsage = asyncHandler(async (req, res) => {
    const user = req.user; // { id, role, plan }

    const data = await usageService.getMyUsage(user);

    res.status(200).json({
        success: true,
        data,
    });
});
