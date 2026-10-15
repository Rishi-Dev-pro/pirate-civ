import crypto from "crypto";

import User from "../models/user.js";


const authMiddleware = async (req, res, next) => {

    try {

        /* ==========================
           Check Session
        ========================== */

        if (!req.session.userId) {

            return res.redirect("/login");

        }


        /* ==========================
           Check Session Token
        ========================== */

        if (!req.session.authToken) {

            return res.redirect("/login");

        }


        /* ==========================
           Check Cookie
        ========================== */

        const cookieToken =
            req.signedCookies.auth_token;


        if (!cookieToken) {

            return res.redirect("/login");

        }


        /* ==========================
           Compare Session + Cookie
        ========================== */

        if (
            req.session.authToken !== cookieToken
        ) {

            req.session.destroy(() => {});

            res.clearCookie("auth_token");

            return res.redirect("/login");

        }


        /* ==========================
           Find User
        ========================== */

        const user = await User.findById(
            req.session.userId
        );


        if (!user) {

            req.session.destroy(() => {});

            res.clearCookie("auth_token");

            return res.redirect("/login");

        }


        /* ==========================
           Hash Cookie Token
        ========================== */

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(cookieToken)
                .digest("hex");


        /* ==========================
           Compare With Database
        ========================== */

        if (
            tokenHash !== user.authSecretHash
        ) {

            req.session.destroy(() => {});

            res.clearCookie("auth_token");

            return res.redirect("/login");

        }


        /* ==========================
           Authentication Successful
        ========================== */

        req.user = user;


        next();


    } catch (error) {

        console.log("Authentication Error:");

        console.log(error.message);

        res.redirect("/login");

    }

};


export const optionalAuth = async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId || !req.session.authToken) {
            req.user = null;
            return next();
        }

        const cookieToken = req.signedCookies ? req.signedCookies.auth_token : null;
        if (!cookieToken || req.session.authToken !== cookieToken) {
            req.user = null;
            return next();
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            req.user = null;
            return next();
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(cookieToken)
            .digest("hex");

        if (tokenHash !== user.authSecretHash) {
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};


export default authMiddleware;