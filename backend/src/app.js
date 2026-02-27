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
    origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://tasktime.in",
        "https://tasktime-sh1vam-03.vercel.app"
    ],
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