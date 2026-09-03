import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.js";


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
           Check Password
        ========================== */

        if (password !== confirmPassword) {

            return res.send("Passwords do not match");

        }


        /* ==========================
           Check Existing User
        ========================== */

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });


        if (existingUser) {

            return res.send("User already exists");

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

            name: name,

            email: email.toLowerCase(),

            password: hashedPassword,

            authSecretHash: authSecretHash

        });


        await user.save();


        /* ==========================
           Regenerate Session
        ========================== */

        req.session.regenerate((error) => {

            if (error) {

                console.log("Session Error:");
                console.log(error.message);

                return res.status(500).send(
                    "Could not create session"
                );

            }


            /* ==========================
               Store User Information
            ========================== */

            req.session.userId =
                user._id.toString();

            req.session.authToken =
                authSecret;


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
                        1000 * 60 * 60 * 24 * 7
                }
            );


            console.log(
                "User registered successfully"
            );


            /* ==========================
               Redirect Home
            ========================== */

            res.redirect("/");

        });


    } catch (error) {

        console.log("Registration Error:");
        console.log(error.message);

        res.status(500).send(
            "Something went wrong during registration"
        );

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
           Find User
        ========================== */

        const user = await User.findOne({

            email: email.toLowerCase()

        });


        if (!user) {

            return res.send(
                "Invalid email or password"
            );

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

            return res.send(
                "Invalid email or password"
            );

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
           Regenerate Session
        ========================== */

        req.session.regenerate((error) => {

            if (error) {

                console.log("Session Error:");
                console.log(error.message);

                return res.status(500).send(
                    "Could not create session"
                );

            }


            /* ==========================
               Store User Information
            ========================== */

            req.session.userId =
                user._id.toString();

            req.session.authToken =
                authSecret;


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
                        1000 * 60 * 60 * 24 * 7
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

        console.log("Login Error:");
        console.log(error.message);

        res.status(500).send(
            "Something went wrong during login"
        );

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