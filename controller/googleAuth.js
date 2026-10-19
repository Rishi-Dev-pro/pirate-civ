import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import Cart from "../models/cart.js";

/**
 * Helper to validate safe internal returnTo redirection path.
 */
function validateReturnTo(raw) {
    if (!raw || typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://") || trimmed.toLowerCase().startsWith("javascript:")) {
        return null;
    }
    if (trimmed.startsWith("/login") || trimmed.startsWith("/register") || trimmed.startsWith("/logout") ||
        trimmed.startsWith("/buyer/") || trimmed.startsWith("/seller/login") || trimmed.startsWith("/seller/register") ||
        trimmed === "/") {
        return null;
    }
    return trimmed;
}

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

        // If credentials are not configured, display the configuration requirements view
        if (!clientId || !clientSecret || clientId === "YOUR_GOOGLE_CLIENT_ID" || clientSecret === "YOUR_GOOGLE_CLIENT_SECRET") {
            return res.render("google-config-required", {
                page_title: "Google Fleet Authentication Configuration | Pirate-Civ",
                intent: roleIntent,
                user: req.user || null
            });
        }

        const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/auth/google/callback`;

        // Cryptographically sign state containing random bytes and role intent
        // Fixes OAuth intent drift across parallel tabs
        const randomToken = crypto.randomBytes(24).toString("hex");
        const hmacSecret = process.env.SESSION_SECRET || "fallback_secret";
        const signature = crypto.createHmac("sha256", hmacSecret).update(`${randomToken}:${roleIntent}`).digest("hex");
        const stateToken = `${randomToken}.${roleIntent}.${signature}`;

        // Also store in session map for double defense
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
        return res.redirect("/buyer/login?error=" + encodeURIComponent("Google authentication could not be initiated."));
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
            return res.redirect(`/buyer/login?error=${encodeURIComponent("Google authentication was canceled.")}`);
        }

        // Validate cryptographically signed state token
        let verifiedRoleIntent = null;
        if (state && typeof state === "string") {
            const parts = state.split(".");
            if (parts.length === 3) {
                const [rand, intent, sig] = parts;
                const hmacSecret = process.env.SESSION_SECRET || "fallback_secret";
                const expectedSig = crypto.createHmac("sha256", hmacSecret).update(`${rand}:${intent}`).digest("hex");
                if (sig === expectedSig && (intent === "seller" || intent === "buyer")) {
                    verifiedRoleIntent = intent;
                }
            }
        }

        // Fallback to session check if signature split format differs
        if (!verifiedRoleIntent && req.session?.googleAuth?.state === state) {
            verifiedRoleIntent = req.session.googleAuth.intent === "seller" ? "seller" : "buyer";
        }

        if (!verifiedRoleIntent) {
            return res.redirect(`/buyer/login?error=${encodeURIComponent("Invalid or expired authentication state. Please try again.")}`);
        }

        const fallbackLoginUrl = verifiedRoleIntent === "seller" ? "/seller/login" : "/buyer/login";
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
            return res.redirect(`${fallbackLoginUrl}?error=${encodeURIComponent("Could not complete token exchange with Google.")}`);
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
            return res.redirect(`${fallbackLoginUrl}?error=${encodeURIComponent("Could not retrieve Google profile details.")}`);
        }

        const profile = await userInfoResponse.json();
        const googleId = profile.sub;
        const email = profile.email ? profile.email.toLowerCase().trim() : null;
        const name = profile.name || profile.given_name || "Seafarer";
        const avatar = profile.picture || "/images/avatars/default-pirate.png";

        if (!email) {
            return res.redirect(`${fallbackLoginUrl}?error=${encodeURIComponent("Google account did not provide an email address.")}`);
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
            // Existing user: Link googleId if missing. CRITICAL: user.role is NEVER modified!
            if (!user.googleId) {
                user.googleId = googleId;
            }
            user.authSecretHash = authSecretHash;
            await user.save();
        } else {
            // New user: assign role based on cryptographically verified role intent
            const randomPassword = crypto.randomBytes(24).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                googleId: googleId,
                role: verifiedRoleIntent,
                storeName: verifiedRoleIntent === "seller" ? `${name}'s Fleet` : null,
                homeIsland: "Astrolabe",
                avatar: avatar,
                authSecretHash: authSecretHash
            });

            await user.save();
        }

        // 4. Capture session cart and returnTo BEFORE session regeneration
        const preLoginSessionCart = req.session?.cart;
        const savedReturnTo = validateReturnTo(req.session?.returnTo);

        req.session.regenerate(async (err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res.redirect(`${fallbackLoginUrl}?error=${encodeURIComponent("Could not create secure session.")}`);
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

            // 5. Enforce safe role destination
            let destination = user.role === "seller" ? "/seller/dashboard" : "/home";
            if (savedReturnTo) {
                if (user.role === "seller" && savedReturnTo.startsWith("/seller")) {
                    destination = savedReturnTo;
                } else if (user.role === "buyer" && !savedReturnTo.startsWith("/seller")) {
                    destination = savedReturnTo;
                }
            }

            delete req.session.authIntent;
            delete req.session.returnTo;

            return res.redirect(destination);
        });

    } catch (error) {
        console.error("Error in handleGoogleCallback:", error);
        return res.redirect("/buyer/login?error=" + encodeURIComponent("An unexpected error occurred during Google authentication."));
    }
};

export default {
    initiateGoogleAuth,
    handleGoogleCallback
};
