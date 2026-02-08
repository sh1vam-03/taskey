import express from "express";
import cors from "cors";
import routes from "./routes/index.js";


import cookieParser from "cookie-parser";

const app = express();

// Middleware
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