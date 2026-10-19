import crypto from "crypto";
import User from "../models/user.js";

const redirectToLogin = (req, res) => {
    const isSeller = (req.originalUrl && req.originalUrl.startsWith("/seller")) ||
                     (req.path && req.path.startsWith("/seller"));
    const intent = isSeller ? "seller" : "buyer";
    if (req.session) {
        req.session.authIntent = intent;
        req.session.returnTo = req.originalUrl || req.path;
    }
    return res.redirect(isSeller ? "/seller/login" : "/buyer/login");
};


const authMiddleware = async (req, res, next) => {

    try {

        /* ==========================
           Check Session
        ========================== */

        if (!req.session || !req.session.userId) {

            return redirectToLogin(req, res);

        }


        /* ==========================
           Check Session Token
        ========================== */

        if (!req.session.authToken) {

            return redirectToLogin(req, res);

        }


        /* ==========================
           Check Cookie
        ========================== */

        const cookieToken =
            req.signedCookies ? req.signedCookies.auth_token : null;


        if (!cookieToken) {

            return redirectToLogin(req, res);

        }


        /* ==========================
           Compare Session + Cookie
        ========================== */

        if (
            req.session.authToken !== cookieToken
        ) {

            req.session.destroy(() => {});

            res.clearCookie("auth_token");

            return redirectToLogin(req, res);

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

            return redirectToLogin(req, res);

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

            return redirectToLogin(req, res);

        }


        /* ==========================
           Authentication Successful
        ========================== */

        req.user = user;


        next();


    } catch (error) {

        console.log("Authentication Error:");

        console.log(error.message);

        return redirectToLogin(req, res);

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