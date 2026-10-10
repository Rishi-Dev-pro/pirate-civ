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
            return res.redirect("/login");
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

export default requireRole;
