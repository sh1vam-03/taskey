import asyncHandler from "../utils/asyncHandler.js";

/**
 * @route GET /api/health
 * @desc Health check
 * @access Public
 */

const healthCheck = asyncHandler(async (req, res) => {
    res.json({ message: "Api is working..." });
});

export default healthCheck;