import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import Cart from "../models/cart.js";

/**
 * Controller action: Initiate Google OAuth 2.0 Authorization Code Flow
 * Route: GET /auth/google
 */
export const initiateGoogleAuth = async (req, res) => {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        const rawIntent = (req.query.intent || req.body?.intent || req.session?.authIntent || "buyer").toLowerCase().trim();
        const roleIntent = (rawIntent === "seller" || rawIntent === "merchant") ? "seller" : "buyer";

        // If credentials are not configured, honestly display the configuration requirements view
        if (!clientId || !clientSecret || clientId === "YOUR_GOOGLE_CLIENT_ID" || clientSecret === "YOUR_GOOGLE_CLIENT_SECRET") {
            return res.render("google-config-required", {
                page_title: "Google Fleet Authentication Configuration | Pirate-Civ",
                intent: roleIntent,
                user: req.user || null
            });
        }

        const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/auth/google/callback`;
        const stateToken = crypto.randomBytes(32).toString("hex");

        req.session.googleAuth = {
            state: stateToken,
            intent: roleIntent,
            createdAt: Date.now()
        };

        const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        googleAuthUrl.searchParams.set("client_id", clientId);
        googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
        googleAuthUrl.searchParams.set("response_type", "code");
        googleAuthUrl.searchParams.set("scope", "openid email profile");
        googleAuthUrl.searchParams.set("state", stateToken);
        googleAuthUrl.searchParams.set("prompt", "select_account");

        return res.redirect(googleAuthUrl.toString());

    } catch (error) {
        console.error("Error initiating Google Auth:", error);
        return res.redirect("/login?error=Google authentication could not be initiated.");
    }
};

/**
 * Controller action: Handle Google OAuth 2.0 Authorization Callback
 * Route: GET /auth/google/callback
 */
export const handleGoogleCallback = async (req, res) => {
    try {
        const { code, state, error: oauthError } = req.query;

        if (oauthError) {
            console.warn("Google OAuth callback returned error:", oauthError);
            return res.redirect(`/login?error=${encodeURIComponent("Google authentication was canceled.")}`);
        }

        const savedSession = req.session.googleAuth;
        if (!savedSession || !savedSession.state || savedSession.state !== state) {
            return res.redirect(`/login?error=${encodeURIComponent("Invalid or expired authentication state. Please try again.")}`);
        }

        const roleIntent = savedSession.intent === "seller" ? "seller" : "buyer";
        delete req.session.googleAuth;

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/auth/google/callback`;

        // 1. Exchange authorization code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackUrl,
                grant_type: "authorization_code"
            })
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error("Token exchange failed:", errText);
            return res.redirect(`/login?error=${encodeURIComponent("Could not complete token exchange with Google.")}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Query userinfo endpoint with bearer token
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!userInfoResponse.ok) {
            console.error("UserInfo fetch failed");
            return res.redirect(`/login?error=${encodeURIComponent("Could not retrieve Google profile details.")}`);
        }

        const profile = await userInfoResponse.json();
        const googleId = profile.sub;
        const email = profile.email ? profile.email.toLowerCase().trim() : null;
        const name = profile.name || profile.given_name || "Seafarer";
        const avatar = profile.picture || "/images/avatars/default-pirate.png";

        if (!email) {
            return res.redirect(`/login?error=${encodeURIComponent("Google account did not provide an email address.")}`);
        }

        // 3. Find or create user
        let user = await User.findOne({
            $or: [
                { googleId: googleId },
                { email: email }
            ]
        });

        const authSecret = crypto.randomBytes(32).toString("hex");
        const authSecretHash = crypto.createHash("sha256").update(authSecret).digest("hex");

        if (user) {
            // Existing user: Link googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
            }
            user.authSecretHash = authSecretHash;
            await user.save();
        } else {
            // New user: assign role based on role intent preserved in session
            const randomPassword = crypto.randomBytes(24).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                googleId: googleId,
                role: roleIntent,
                storeName: roleIntent === "seller" ? `${name}'s Port` : null,
                homeIsland: "astrolabe",
                avatar: avatar,
                authSecretHash: authSecretHash
            });

            await user.save();
        }

        // 4. Capture session cart and establish session
        const preLoginSessionCart = req.session.cart;

        req.session.regenerate(async (err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res.redirect("/login?error=Could not create secure session.");
            }

            req.session.userId = user._id.toString();
            req.session.authToken = authSecret;
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

            if (preLoginSessionCart && user.role === "buyer") {
                try {
                    await Cart.mergeSessionCart(user._id, preLoginSessionCart);
                } catch (cErr) {
                    console.error("Cart migration error:", cErr);
                }
            }

            res.cookie("auth_token", authSecret, {
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7
            });

            if (user.role === "seller") {
                return res.redirect("/seller/dashboard");
            }
            return res.redirect("/home");
        });

    } catch (error) {
        console.error("Error in handleGoogleCallback:", error);
        return res.redirect("/login?error=An unexpected error occurred during Google authentication.");
    }
};

export default {
    initiateGoogleAuth,
    handleGoogleCallback
};
