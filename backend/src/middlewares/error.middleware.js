import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    console.error("🔥 ERROR MIDDLEWARE CAUGHT:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

    let { statusCode, message } = err;

    if (!(err instanceof ApiError)) {
        // Handle OpenAI/LangChain specific errors
        if (err.status === 429 || err.code === 'insufficient_quota' || err.message?.includes('exceeded your current quota')) {
            statusCode = 429;
            message = "AI Service temporarily unavailable due to quota limits. Please try again later or contact support.";
        } else {
            statusCode = err.statusCode || 500;
            message = err.message || "Internal Server Error";
        }
    }

    const response = {
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    };

    res.status(statusCode).json(response);
};

export default errorHandler;
