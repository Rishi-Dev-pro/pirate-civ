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
        // Defensive check: if unauthenticated, redirect to login
        if (!req.user) {
            const isSellerTarget = roles.includes("seller");
            return res.redirect(isSellerTarget ? "/seller/login" : "/buyer/login");
        }

        // Verify role authorization
        if (!req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).send("Access denied: insufficient permissions.");
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

