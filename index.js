import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import session from "express-session";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";


/* ==========================================
   Load Environment Variables
========================================== */

dotenv.config();


/* ==========================================
   Connect MongoDB
========================================== */

connectDB();


/* ==========================================
   Server Configuration
========================================== */

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


const server = express();


/* ==========================================
   Body Parser
========================================== */

server.use(
    express.urlencoded({
        extended: true
    })
);

server.use(
    express.json()
);


/* ==========================================
   Cookie Parser
========================================== */

server.use(
    cookieParser(
        process.env.COOKIE_SECRET
    )
);


/* ==========================================
   Session
========================================== */

server.use(
    session({

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {

            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite: "lax",

            maxAge:
                1000 *
                60 *
                60 *
                24 *
                7

        }

    })
);


/* ==========================================
   EJS Configuration
========================================== */

server.set(
    "view engine",
    "ejs"
);

server.set(
    "views",
    path.join(__dirname, "views")
);


/* ==========================================
   Static Files
========================================== */

server.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* ==========================================
   Routes
========================================== */

import webRoutes from "./routes/web.js";

server.use(
    "/",
    webRoutes
);


/* ==========================================
   404 Catch-All Handler
========================================== */

server.use((req, res) => {
    res.status(404).render("home", {
        page_title: "404 - Terra Incognita",
        user: req.user || null
    });
});


/* ==========================================
   Global Centralized Error Handler
========================================== */

server.use((err, req, res, next) => {
    console.error("Centralized Server Error Handler:", err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;

    res.status(statusCode).render("home", {
        page_title: "Archipelago Tempest | Error",
        user: req.user || null
    });
});


/* ==========================================
   Server Start
========================================== */

server.listen(PORT, () => {

    console.log(
        `Server is running on port ${PORT}`
    );

});

export default server;