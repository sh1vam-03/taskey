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
    origin: true, // Allow all origins during development to bypass CORS hurdles
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