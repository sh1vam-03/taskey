import express from "express";
import cors from "cors";
import routes from "./routes/index.js";


import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://blacktime.app",
        "https://blacktime.onrender.com"
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use(routes);


export default app;