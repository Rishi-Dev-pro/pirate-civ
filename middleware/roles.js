/**
 * Role-Based Authorization Middleware
 *
 * Enforces role restrictions on authenticated routes based on req.user.role.
 * Relies on authMiddleware to establish req.user.
 *
 * @param {...string} allowedRoles - One or more permitted roles ('buyer', 'seller', 'admin')
 * @returns {Function} Express middleware (req, res, next)
 */
export const requireRole = (...allowedRoles) => {
    const roles = allowedRoles.flat();

    return (req, res, next) => {
        // Defensive check: if unauthenticated, redirect to appropriate login
        if (!req.user) {
            if (roles.includes("seller")) {
                return res.redirect("/seller/login");
            }
            if (roles.includes("admin")) {
                return res.redirect("/admin/login");
            }
            return res.redirect("/buyer/login");
        }

        // Verify role authorization
        if (!req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        // Seller approval check: if accessing seller-protected routes, verify seller charter status
        if (req.user.role === "seller" && roles.includes("seller")) {
            if (req.user.sellerStatus === "pending") {
                const message = "Your Merchant Charter is awaiting approval from the Admiralty.";
                if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                    return res.status(403).json({ success: false, error: message });
                }
                return res.status(403).send(message);
            }

            if (req.user.sellerStatus === "rejected") {
                const reason = req.user.rejectionReason ? ` Reason: ${req.user.rejectionReason}` : "";
                const message = `Your Merchant Charter application was rejected.${reason}`;
                if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                    return res.status(403).json({ success: false, error: message, reason: req.user.rejectionReason || null });
                }
                return res.status(403).send(message);
            }
        }

        next();
    };
};

export const requireSeller = requireRole("seller");
export const requireBuyer = requireRole("buyer");
export const requireAdmin = requireRole("admin");

export const forbidSeller = (req, res, next) => {
    if (req.user && req.user.role === "seller") {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            return res.status(403).json({ success: false, error: "Access denied: merchants cannot maintain a buyer cargo hold." });
        }
        return res.status(403).send("Access denied: merchants cannot maintain a buyer cargo hold.");
    }
    next();
};

export default requireRole;

