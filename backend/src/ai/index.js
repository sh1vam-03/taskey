// AI module entry point

import aiRoutes from "./routes/ai.routes.js";
import voiceRoutes from "./voice/voice.routes.js";

/**
 * AI Module Entry Point
 * This keeps AI isolated from the main backend
 */
export const registerAiRoutes = (app) => {
    app.use("/text", aiRoutes);
    app.use("/voice", voiceRoutes);
};
