/**
 * AI Module Entry Point
 *
 * Exports controllers, graph runners, and routers for use by the main app.
 *
 * ✅ FIX: Routes use "export default router" — export* does NOT re-export default exports.
 *   Previously: export * from "./routes/ai.routes.js"  ← silently exports nothing from routes
 *   Fixed with explicit named re-exports below.
 */

// Controller exports (named exports — export* works fine here)
export * from "./controllers/ai.controller.js";

// Graph runner exports (named exports)
export * from "./graph/main.graph.js";

// Route exports — must be explicit because routes use "export default"
export { default as aiRouter } from "./routes/ai.routes.js";
export { default as voiceRouter } from "./routes/voice.routes.js";
