import express from "express";
import cors from "cors";
import routes from "./routes/index.js";


import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

// Middleware
app.use(morgan("dev"));
app.set("trust proxy", 1);
app.use(cors({
    origin: function (origin, callback) {
        // Allow mobile apps (no origin) 
        if (!origin) return callback(null, true);

        // Fetch allowed origins from environment variable, falling back to local/common ones
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : [
                "http://localhost:3000",
                "http://localhost:3001",
                "https://tasktime.in",
                "https://tasktime-sh1vam-03.vercel.app"
            ];

        // Check if the current origin is in the allowed list, or if it's a Vercel preview deployment
        if (
            allowedOrigins.includes(origin) ||
            origin.includes("vercel.app")
        ) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
// Routes
app.use(routes);

// Error Handler
import errorHandler from "./middlewares/error.middleware.js";
app.use(errorHandler);


export default app;