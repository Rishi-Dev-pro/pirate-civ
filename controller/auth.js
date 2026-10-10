import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.js";
import Cart from "../models/cart.js";


/* ==========================================
   REGISTER USER
========================================== */

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body;


        /* ==========================
           Validate Required Fields
        ========================== */

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).render("register", {
                page_title: "Register",
                error: "All fields are required.",
                name: typeof name === "string" ? name : "",
                email: typeof email === "string" ? email : ""
            });

        }


        /* ==========================
           Validate Email Format
        ========================== */

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {

            return res.status(400).render("register", {
                page_title: "Register",
                error: "Please enter a valid email address.",
                name: name || "",
                email: email || ""
            });

        }


        /* ==========================
           Validate Password Length
        ========================== */

        if (password.length < 6) {

            return res.status(400).render("register", {
                page_title: "Register",
                error: "Password must be at least 6 characters long.",
                name: name || "",
                email: email || ""
            });

        }


        /* ==========================
           Check Password Match
        ========================== */

        if (password !== confirmPassword) {

            return res.status(400).render("register", {
                page_title: "Register",
                error: "Passwords do not match.",
                name: name || "",
                email: email || ""
            });

        }


        /* ==========================
           Check Existing User
        ========================== */

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });


        if (existingUser) {

            return res.status(409).render("register", {
                page_title: "Register",
                error: "An account with this email already exists.",
                name: name || "",
                email: email || ""
            });

        }


        /* ==========================
           Hash Password
        ========================== */

        const hashedPassword =
            await bcrypt.hash(password, 12);


        /* ==========================
           Generate User Secret
        ========================== */

        const authSecret =
            crypto.randomBytes(32).toString("hex");


        /* ==========================
           Hash User Secret
        ========================== */

        const authSecretHash =
            crypto
                .createHash("sha256")
                .update(authSecret)
                .digest("hex");


        /* ==========================
           Create User
        ========================== */

        const user = new User({

            name: name.trim(),

            email: email.toLowerCase().trim(),

            password: hashedPassword,

            authSecretHash: authSecretHash

        });


        await user.save();

        console.log(
            "User registered successfully"
        );


        /* ==========================
           Redirect to Login
        ========================== */

        return res.redirect("/login");


    } catch (error) {

        console.error("Registration Error:");
        console.error(error.message);

        if (error.code === 11000) {

            return res.status(409).render("register", {
                page_title: "Register",
                error: "An account with this email already exists.",
                name: req.body?.name || "",
                email: req.body?.email || ""
            });

        }

        return res.status(500).render("register", {
            page_title: "Register",
            error: "Something went wrong during registration. Please try again.",
            name: req.body?.name || "",
            email: req.body?.email || ""
        });

    }

};


/* ==========================================
   LOGIN USER
========================================== */

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* ==========================
           Validate Credentials Input
        ========================== */

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {

            return res.status(400).render("login", {
                page_title: "Login",
                error: "Invalid email or password.",
                email: typeof email === "string" ? email : ""
            });

        }


        /* ==========================
           Find User
        ========================== */

        const user = await User.findOne({

            email: email.toLowerCase().trim()

        });


        if (!user) {

            return res.status(401).render("login", {
                page_title: "Login",
                error: "Invalid email or password.",
                email: email || ""
            });

        }


        /* ==========================
           Compare Password
        ========================== */

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).render("login", {
                page_title: "Login",
                error: "Invalid email or password.",
                email: email || ""
            });

        }


        /* ==========================
           Generate New Auth Secret
        ========================== */

        const authSecret =
            crypto.randomBytes(32).toString("hex");


        /* ==========================
           Hash Auth Secret
        ========================== */

        const authSecretHash =
            crypto
                .createHash("sha256")
                .update(authSecret)
                .digest("hex");


        /* ==========================
           Update User Secret
        ========================== */

        user.authSecretHash =
            authSecretHash;


        await user.save();


        /* ==========================
           Remember Me Preference
        ========================== */

        const rememberMe =
            req.body.rememberMe === "on" ||
            req.body.rememberMe === "true" ||
            req.body.rememberMe === true ||
            req.body.remember === "on" ||
            req.body.remember === "true" ||
            req.body.remember === true;

        const sessionMaxAge = rememberMe
            ? 1000 * 60 * 60 * 24 * 30  // 30 days
            : 1000 * 60 * 60 * 24;       // 24 hours standard session

        /* ==========================
           Capture Pre-Login Session Cart
        ========================== */

        const preLoginSessionCart = req.session.cart;


        /* ==========================
           Regenerate Session
        ========================== */

        req.session.regenerate(async (error) => {

            if (error) {

                console.error("Session Error:");
                console.error(error.message);

                return res.status(500).render("login", {
                    page_title: "Login",
                    error: "Could not create session. Please try again.",
                    email: email || ""
                });

            }


            /* ==========================
               Store User Information
            ========================== */

            req.session.userId =
                user._id.toString();

            req.session.authToken =
                authSecret;

            req.session.cookie.maxAge =
                sessionMaxAge;


            /* ==========================
               Migrate Session Cart to DB
            ========================== */

            if (preLoginSessionCart) {
                try {
                    await Cart.mergeSessionCart(user._id, preLoginSessionCart);
                } catch (cartErr) {
                    console.error("Cart migration error during login:", cartErr.message);
                }
            }


            /* ==========================
               Create Signed Cookie
            ========================== */

            res.cookie(
                "auth_token",
                authSecret,
                {
                    httpOnly: true,

                    signed: true,

                    secure:
                        process.env.NODE_ENV === "production",

                    sameSite: "lax",

                    maxAge:
                        sessionMaxAge
                }
            );


            console.log(
                "User logged in successfully"
            );


            /* ==========================
               Redirect Home
            ========================== */

            res.redirect("/");

        });


    } catch (error) {

        console.error("Login Error:");
        console.error(error.message);

        return res.status(500).render("login", {
            page_title: "Login",
            error: "Something went wrong during login. Please try again.",
            email: req.body?.email || ""
        });

    }

};


/* ==========================================
   LOGOUT USER
========================================== */

const logoutUser = (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.log("Logout Error:");
            console.log(error.message);

            return res.status(500).send(
                "Could not logout"
            );

        }


        /* ==========================
           Clear Authentication Cookie
        ========================== */

        res.clearCookie(
            "auth_token",
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV === "production",

                sameSite: "lax"
            }
        );


        console.log(
            "User logged out successfully"
        );


        /* ==========================
           Redirect Login
        ========================== */

        res.redirect("/login");

    });

};


/* ==========================================
   EXPORT CONTROLLERS
========================================== */

export {
    registerUser,
    loginUser,
    logoutUser
};