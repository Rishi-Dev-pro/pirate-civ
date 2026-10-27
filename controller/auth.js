import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.js";
import Cart from "../models/cart.js";

/* =========================================================
   LOW-LEVEL REUSABLE AUTHENTICATION PRIMITIVES
========================================================= */

/**
 * Normalizes email address to lower-case and trimmed string.
 */
export const normalizeEmail = (email) => {
    return typeof email === "string" ? email.toLowerCase().trim() : "";
};

/**
 * Validates standard email address regex syntax.
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === "string" && emailRegex.test(email.trim());
};

/**
 * Validates safe internal returnTo redirection path.
 * Rejects external URLs, protocol-relative paths, and javascript: exploits.
 */
export const validateReturnTo = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    const trimmed = raw.trim();

    // Must start with single / and not // or contain protocols
    if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://") || trimmed.toLowerCase().startsWith("javascript:")) {
        return null;
    }

    // Ignore authentication loops and bare root
    if (
        trimmed.startsWith("/login") ||
        trimmed.startsWith("/register") ||
        trimmed.startsWith("/logout") ||
        trimmed.startsWith("/buyer/login") ||
        trimmed.startsWith("/buyer/register") ||
        trimmed.startsWith("/seller/login") ||
        trimmed.startsWith("/seller/register") ||
        trimmed === "/"
    ) {
        return null;
    }

    return trimmed;
};

/**
 * Shared primitive to regenerate session, issue signed auth cookie,
 * migrate session cart, and execute safe role-aware redirection.
 *
 * CRITICAL FIX (F-01): Caches returnTo BEFORE session.regenerate() so deep links survive.
 */
export const establishSessionAndCookie = async (req, res, user, options = {}) => {
    // 1. Capture returnTo BEFORE regeneration destroys session
    const savedReturnTo = validateReturnTo(
        options.returnTo || req.session?.returnTo || req.body?.returnTo || req.query?.returnTo
    );

    // 2. Remember Me preference
    const rememberMe =
        req.body?.rememberMe === "on" ||
        req.body?.rememberMe === "true" ||
        req.body?.rememberMe === true ||
        req.body?.remember === "on" ||
        req.body?.remember === "true" ||
        req.body?.remember === true;

    const sessionMaxAge = rememberMe
        ? 1000 * 60 * 60 * 24 * 30  // 30 days
        : 1000 * 60 * 60 * 24;       // 24 hours standard session

    // 3. Issue new cryptographic auth secret
    const authSecret = crypto.randomBytes(32).toString("hex");
    const authSecretHash = crypto.createHash("sha256").update(authSecret).digest("hex");

    user.authSecretHash = authSecretHash;
    await user.save();

    // 4. Capture pre-login session cart for buyers
    const preLoginSessionCart = req.session?.cart;

    // 5. Regenerate session to eliminate session fixation
    req.session.regenerate(async (err) => {
        if (err) {
            console.error("Session Regeneration Error:", err.message);
            const view = options.errorView || (user.role === "seller" ? "seller/login" : "buyer/login");
            return res.status(500).render(view, {
                page_title: user.role === "seller" ? "Merchant Command Deck Login | Pirate-Civ" : "Explorer Sign In | Pirate-Civ",
                error: "Could not establish secure session. Please try again.",
                email: user.email || ""
            });
        }

        // Store identity in new session
        req.session.userId = user._id.toString();
        req.session.authToken = authSecret;
        req.session.cookie.maxAge = sessionMaxAge;

        // Migrate guest session cart to database if buyer
        if (preLoginSessionCart && user.role === "buyer") {
            try {
                await Cart.mergeSessionCart(user._id, preLoginSessionCart);
            } catch (cartErr) {
                console.error("Cart migration error during login:", cartErr.message);
            }
        }

        // Issue signed HMAC HTTP-only cookie
        res.cookie("auth_token", authSecret, {
            httpOnly: true,
            signed: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: sessionMaxAge
        });

        // 6. Safe, role-enforced redirection
        let destination = "/home";
        if (user.role === "seller") {
            destination = "/seller/dashboard";
        } else if (user.role === "admin") {
            destination = "/admin/dashboard";
        }

        if (savedReturnTo) {
            if (user.role === "seller" && savedReturnTo.startsWith("/seller")) {
                destination = savedReturnTo;
            } else if (user.role === "admin" && (savedReturnTo.startsWith("/admin") || savedReturnTo.startsWith("/developer"))) {
                destination = savedReturnTo;
            } else if (user.role === "buyer" && !savedReturnTo.startsWith("/seller") && !savedReturnTo.startsWith("/admin") && !savedReturnTo.startsWith("/developer")) {
                destination = savedReturnTo;
            }
        }

        delete req.session.authIntent;
        delete req.session.returnTo;

        return res.redirect(destination);
    });
};

/* =========================================================
   BUYER AUTHENTICATION CONTROLLERS
========================================================= */

/**
 * GET /buyer/login
 */
export const renderBuyerLogin = (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const returnTo = validateReturnTo(req.query.returnTo || req.session?.returnTo);

    return res.render("buyer/login", {
        page_title: "Explorer Sign In | Pirate-Civ",
        error: req.query.error || null,
        registered: req.query.registered === "1",
        email: "",
        returnTo: returnTo || ""
    });
};

/**
 * GET /buyer/register
 */
export const renderBuyerRegister = (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    return res.render("buyer/register", {
        page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
        error: req.query.error || null,
        name: "",
        email: "",
        homeIsland: "Astrolabe"
    });
};

/**
 * POST /buyer/login
 * Strictly authenticates buyers only.
 */
export const loginBuyer = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password || typeof password !== "string") {
            return res.status(400).render("buyer/login", {
                page_title: "Explorer Sign In | Pirate-Civ",
                error: "Email and secret cipher are required.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || ""
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).render("buyer/login", {
                page_title: "Explorer Sign In | Pirate-Civ",
                error: "Invalid email or secret cipher.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || ""
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password || "");
        if (!passwordMatch) {
            return res.status(401).render("buyer/login", {
                page_title: "Explorer Sign In | Pirate-Civ",
                error: "Invalid email or secret cipher.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || ""
            });
        }

        // STRICT ROLE ENFORCEMENT: Buyer portal accepts BUYERS only
        if (user.role !== "buyer") {
            if (user.role === "seller") {
                return res.status(403).render("buyer/login", {
                    page_title: "Explorer Sign In | Pirate-Civ",
                    error: "These credentials belong to a merchant account. Use Merchant Login.",
                    email: normalizedEmail,
                    roleMismatch: "seller",
                    returnTo: ""
                });
            }
            return res.status(403).render("buyer/login", {
                page_title: "Explorer Sign In | Pirate-Civ",
                error: "Access denied: Account role is not permitted in the Explorer portal.",
                email: normalizedEmail,
                returnTo: ""
            });
        }

        // Success: Establish session and redirect
        return await establishSessionAndCookie(req, res, user, {
            returnTo: req.body?.returnTo || req.query?.returnTo,
            errorView: "buyer/login"
        });

    } catch (error) {
        console.error("Buyer Login Error:", error);
        return res.status(500).render("buyer/login", {
            page_title: "Explorer Sign In | Pirate-Civ",
            error: "An unexpected squall occurred during sign-in. Please try again.",
            email: normalizeEmail(req.body?.email)
        });
    }
};

/**
 * POST /buyer/register
 * Server strictly forces role = "buyer". Ignores any client role input.
 */
export const registerBuyer = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, homeIsland } = req.body || {};
        const normalizedEmail = normalizeEmail(email);

        if (
            typeof name !== "string" || !name.trim() ||
            !normalizedEmail ||
            typeof password !== "string" || !password ||
            typeof confirmPassword !== "string" || !confirmPassword
        ) {
            return res.status(400).render("buyer/register", {
                page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
                error: "All fields are required.",
                name: typeof name === "string" ? name : "",
                email: normalizedEmail,
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        if (!validateEmail(normalizedEmail)) {
            return res.status(400).render("buyer/register", {
                page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
                error: "Please enter a valid email address.",
                name: name.trim(),
                email: normalizedEmail,
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        if (password.length < 6) {
            return res.status(400).render("buyer/register", {
                page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
                error: "Password must be at least 6 characters long.",
                name: name.trim(),
                email: normalizedEmail,
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render("buyer/register", {
                page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
                error: "Passwords do not match.",
                name: name.trim(),
                email: normalizedEmail,
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).render("buyer/register", {
                page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
                error: "An account with this email already exists.",
                name: name.trim(),
                email: normalizedEmail,
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const authSecret = crypto.randomBytes(32).toString("hex");
        const authSecretHash = crypto.createHash("sha256").update(authSecret).digest("hex");

        const allowedIslands = ["Cutlass Cove", "Booty Cay", "Velvet Isle", "Kraken Vault", "Chronos", "Astrolabe"];
        const selectedIsland = allowedIslands.includes(homeIsland) ? homeIsland : "Astrolabe";

        // FORCED ROLE: ALWAYS 'buyer'
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            authSecretHash: authSecretHash,
            role: "buyer",
            homeIsland: selectedIsland
        });

        await user.save();
        return res.redirect("/buyer/login?registered=1");

    } catch (error) {
        console.error("Buyer Registration Error:", error);
        if (error.code === 11000) {
            return res.status(409).render("buyer/register", {
                page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
                error: "An account with this email already exists.",
                name: req.body?.name || "",
                email: normalizeEmail(req.body?.email)
            });
        }
        return res.status(500).render("buyer/register", {
            page_title: "Join the Crew | Explorer Registration | Pirate-Civ",
            error: "Something went wrong during registration. Please try again.",
            name: req.body?.name || "",
            email: normalizeEmail(req.body?.email)
        });
    }
};

/* =========================================================
   SELLER AUTHENTICATION CONTROLLERS
========================================================= */

/**
 * GET /seller/login
 */
export const renderSellerLogin = (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const returnTo = validateReturnTo(req.query.returnTo || req.session?.returnTo);

    return res.render("seller/login", {
        page_title: "Merchant Command Deck Login | Pirate-Civ",
        error: req.query.error || null,
        registered: req.query.registered === "1",
        email: "",
        returnTo: returnTo || ""
    });
};

/**
 * GET /seller/register
 */
export const renderSellerRegister = (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    return res.render("seller/register", {
        page_title: "Charter Merchant Account | Pirate-Civ",
        error: req.query.error || null,
        name: "",
        email: "",
        storeName: "",
        homeIsland: "Astrolabe"
    });
};

/**
 * POST /seller/login
 * Strictly authenticates sellers only.
 */
export const loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password || typeof password !== "string") {
            return res.status(400).render("seller/login", {
                page_title: "Merchant Command Deck Login | Pirate-Civ",
                error: "Email and command cipher are required.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || ""
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).render("seller/login", {
                page_title: "Merchant Command Deck Login | Pirate-Civ",
                error: "Invalid email or command cipher.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || ""
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password || "");
        if (!passwordMatch) {
            return res.status(401).render("seller/login", {
                page_title: "Merchant Command Deck Login | Pirate-Civ",
                error: "Invalid email or command cipher.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || ""
            });
        }

        // STRICT ROLE ENFORCEMENT: Seller portal accepts SELLERS only
        if (user.role !== "seller") {
            if (user.role === "buyer") {
                return res.status(403).render("seller/login", {
                    page_title: "Merchant Command Deck Login | Pirate-Civ",
                    error: "These credentials belong to an explorer account. Use Buyer Login.",
                    email: normalizedEmail,
                    roleMismatch: "buyer",
                    returnTo: ""
                });
            }
            return res.status(403).render("seller/login", {
                page_title: "Merchant Command Deck Login | Pirate-Civ",
                error: "Access denied: Account role is not permitted on the Armator Deck.",
                email: normalizedEmail,
                returnTo: ""
            });
        }

        // Success: Establish session and redirect to seller dashboard
        return await establishSessionAndCookie(req, res, user, {
            returnTo: req.body?.returnTo || req.query?.returnTo,
            errorView: "seller/login"
        });

    } catch (error) {
        console.error("Seller Login Error:", error);
        return res.status(500).render("seller/login", {
            page_title: "Merchant Command Deck Login | Pirate-Civ",
            error: "An unexpected squall occurred during sign-in. Please try again.",
            email: normalizeEmail(req.body?.email)
        });
    }
};

/**
 * POST /seller/register
 * Server strictly forces role = "seller" and mandates storeName.
 */
export const registerSeller = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, storeName, homeIsland } = req.body || {};
        const normalizedEmail = normalizeEmail(email);

        if (
            typeof name !== "string" || !name.trim() ||
            !normalizedEmail ||
            typeof password !== "string" || !password ||
            typeof confirmPassword !== "string" || !confirmPassword
        ) {
            return res.status(400).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "All fields are required.",
                name: typeof name === "string" ? name : "",
                email: normalizedEmail,
                storeName: typeof storeName === "string" ? storeName : "",
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        // Mandatory storeName for Armators
        if (!storeName || typeof storeName !== "string" || !storeName.trim()) {
            return res.status(400).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "Store / Fleet name is required for Armators.",
                name: name.trim(),
                email: normalizedEmail,
                storeName: "",
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        if (!validateEmail(normalizedEmail)) {
            return res.status(400).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "Please enter a valid email address.",
                name: name.trim(),
                email: normalizedEmail,
                storeName: storeName.trim(),
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        if (password.length < 6) {
            return res.status(400).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "Password must be at least 6 characters long.",
                name: name.trim(),
                email: normalizedEmail,
                storeName: storeName.trim(),
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "Passwords do not match.",
                name: name.trim(),
                email: normalizedEmail,
                storeName: storeName.trim(),
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "An account with this email already exists.",
                name: name.trim(),
                email: normalizedEmail,
                storeName: storeName.trim(),
                homeIsland: homeIsland || "Astrolabe"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const authSecret = crypto.randomBytes(32).toString("hex");
        const authSecretHash = crypto.createHash("sha256").update(authSecret).digest("hex");

        const allowedIslands = ["Cutlass Cove", "Booty Cay", "Velvet Isle", "Kraken Vault", "Chronos", "Astrolabe"];
        const selectedIsland = allowedIslands.includes(homeIsland) ? homeIsland : "Astrolabe";

        // FORCED ROLE: ALWAYS 'seller', INITIAL STATUS: 'pending'
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            authSecretHash: authSecretHash,
            role: "seller",
            sellerStatus: "pending",
            storeName: storeName.trim(),
            homeIsland: selectedIsland
        });

        await user.save();
        return res.redirect("/seller/login?registered=1");

    } catch (error) {
        console.error("Seller Registration Error:", error);
        if (error.code === 11000) {
            return res.status(409).render("seller/register", {
                page_title: "Charter Merchant Account | Pirate-Civ",
                error: "An account with this email already exists.",
                name: req.body?.name || "",
                email: normalizeEmail(req.body?.email),
                storeName: req.body?.storeName || ""
            });
        }
        return res.status(500).render("seller/register", {
            page_title: "Charter Merchant Account | Pirate-Civ",
            error: "Something went wrong during registration. Please try again.",
            name: req.body?.name || "",
            email: normalizeEmail(req.body?.email),
            storeName: req.body?.storeName || ""
        });
    }
};

/* =========================================================
   LOGOUT CONTROLLER
========================================================= */

/**
 * GET /logout
 */
export const logoutUser = async (req, res) => {
    let isDeveloper = (req.user && req.user.role === "admin") || 
                      req.query.from === "developer" || 
                      req.query.returnTo === "/" ||
                      (req.headers.referer && (req.headers.referer.includes("/developer") || req.headers.referer.includes("/admin")));

    if (!isDeveloper && req.session?.userId) {
        try {
            const u = await User.findById(req.session.userId).select("role");
            if (u && u.role === "admin") {
                isDeveloper = true;
            }
        } catch (_) {}
    }

    req.session.destroy((error) => {
        if (error) {
            console.error("Logout Error:", error.message);
            return res.status(500).send("Could not logout");
        }

        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.clearCookie("connect.sid");

        // Developer/Admin disconnects directly back to the Gateway character selection
        if (isDeveloper) {
            return res.redirect("/");
        }

        return res.redirect("/buyer/login");
    });
};

/**
 * GET /developer/logout (and /admin/logout)
 * Dedicated developer disconnect handler that destroys session and returns to Gateway (/)
 */
export const logoutDeveloper = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Developer Logout Error:", error.message);
            return res.status(500).send("Could not disconnect from Developer Realm");
        }

        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.clearCookie("connect.sid");

        return res.redirect("/");
    });
};

/* =========================================================
   BACKWARD COMPATIBILITY CONTROLLERS (MIGRATION SAFETY)
========================================================= */

/**
 * Legacy POST /login handler for older forms / tests
 */
export const loginUser = async (req, res) => {
    const rawIntent = (req.body?.intent || req.query?.intent || "").toLowerCase().trim();
    if (rawIntent === "seller" || rawIntent === "merchant") {
        return loginSeller(req, res);
    }
    if (rawIntent === "buyer") {
        return loginBuyer(req, res);
    }

    // Backward compatibility for legacy tests/clients that post to /login without intent
    const email = normalizeEmail(req.body?.email);
    if (email) {
        try {
            const user = await User.findOne({ email });
            if (user && user.role === "seller") {
                return loginSeller(req, res);
            }
        } catch (_) {}
    }

    return loginBuyer(req, res);
};

/**
 * Legacy POST /register handler for older forms / tests
 */
export const registerUser = async (req, res) => {
    const rawIntent = (req.body?.intent || req.body?.role || req.query?.intent || "").toLowerCase().trim();
    if (rawIntent === "seller" || rawIntent === "merchant") {
        return registerSeller(req, res);
    }
    return registerBuyer(req, res);
};

/* =========================================================
   DEVELOPER / ADMIN AUTHENTICATION CONTROLLERS
========================================================= */

/**
 * GET /admin/login (also /developer/login)
 */
export const renderDeveloperLogin = (req, res) => {
    if (req.user) {
        if (req.user.role === "admin") return res.redirect("/admin/dashboard");
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const returnTo = validateReturnTo(req.query.returnTo || req.session?.returnTo);

    return res.render("developer/login", {
        page_title: "PIRATE-CIV // DEVELOPER GATE",
        error: req.query.error || null,
        email: "",
        returnTo: returnTo || "/admin/dashboard"
    });
};

/**
 * POST /admin/login (also /developer/login)
 * Authenticates developers/admins only.
 */
export const loginDeveloper = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password || typeof password !== "string") {
            return res.status(400).render("developer/login", {
                page_title: "PIRATE-CIV // DEVELOPER GATE",
                error: "Developer email and sovereign cipher are required.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || "/admin/dashboard"
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).render("developer/login", {
                page_title: "PIRATE-CIV // DEVELOPER GATE",
                error: "Invalid developer credentials.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || "/admin/dashboard"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password || "");
        if (!passwordMatch) {
            return res.status(401).render("developer/login", {
                page_title: "PIRATE-CIV // DEVELOPER GATE",
                error: "Invalid developer credentials.",
                email: normalizedEmail,
                returnTo: validateReturnTo(req.body?.returnTo || req.query?.returnTo) || "/admin/dashboard"
            });
        }

        // STRICT ROLE ENFORCEMENT: Developer portal requires admin role
        if (user.role !== "admin") {
            return res.status(403).render("developer/login", {
                page_title: "PIRATE-CIV // DEVELOPER GATE",
                error: "Access denied: Insufficient privileges for Developer Realm.",
                email: normalizedEmail,
                returnTo: ""
            });
        }

        // Success: Establish session and redirect
        return await establishSessionAndCookie(req, res, user, {
            returnTo: req.body?.returnTo || req.query?.returnTo || "/admin/dashboard",
            errorView: "developer/login"
        });

    } catch (error) {
        console.error("Developer Login Error:", error);
        return res.status(500).render("developer/login", {
            page_title: "PIRATE-CIV // DEVELOPER GATE",
            error: "An unexpected error occurred in the Developer Gate. Please try again.",
            email: normalizeEmail(req.body?.email)
        });
    }
};

export default {
    normalizeEmail,
    validateEmail,
    validateReturnTo,
    establishSessionAndCookie,
    renderBuyerLogin,
    renderBuyerRegister,
    loginBuyer,
    registerBuyer,
    renderSellerLogin,
    renderSellerRegister,
    loginSeller,
    registerSeller,
    renderDeveloperLogin,
    loginDeveloper,
    logoutUser,
    loginUser,
    registerUser
};