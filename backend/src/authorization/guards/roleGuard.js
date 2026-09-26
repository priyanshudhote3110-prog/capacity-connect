/**
 * roleGuard.js - PBAC Role Enforcement Guard
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Strictly restricts routes to authorized roles with anti-spoofing whitelist verification.
 */

const { ROLES, isAdminEmail, isTrainerEmail } = require("../config/roles.js");
const auditService = require("../services/auditService.js");

/**
 * Returns a middleware guard that allows only the specified roles
 * @param  {...string} allowedRoles - 'admin', 'trainer', 'employee'
 */
function roleGuard(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Access denied. Authentication required before role verification."
      });
    }

    const { role, email, name, id } = req.user;

    // Anti-Spoofing & Privilege Escalation Check:
    // 1. If route requires 'admin' or user claims 'admin', email MUST be in the 5 predefined admins
    if (role === ROLES.ADMIN && !isAdminEmail(email)) {
      auditService.log({
        userId: id,
        userEmail: email,
        userRole: role,
        action: "security.escalation_prevented",
        resourceType: "admin_route",
        severity: "critical",
        details: { requestedPath: req.url, reason: "Non-whitelisted user attempted admin action" },
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });

      return res.status(403).json({
        success: false,
        code: "UNAUTHORIZED_ADMIN_CLAIM",
        error: "Security Alert: Your email is not registered in the Ministry's Executive Admin Directorate."
      });
    }

    // 2. If route requires 'trainer', user MUST be trainer or admin
    if (allowedRoles.includes(ROLES.TRAINER) && !allowedRoles.includes(ROLES.EMPLOYEE)) {
      if (role === ROLES.TRAINER && !isTrainerEmail(email) && !isAdminEmail(email)) {
        auditService.log({
          userId: id,
          userEmail: email,
          userRole: role,
          action: "security.unauthorized_trainer_attempt",
          resourceType: "trainer_route",
          severity: "warning",
          details: { requestedPath: req.url },
          ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
        });

        return res.status(403).json({
          success: false,
          code: "UNAUTHORIZED_TRAINER_CLAIM",
          error: "Access restricted: Only verified MoES faculty trainers can perform this action."
        });
      }
    }

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(role)) {
      auditService.log({
        userId: id,
        userEmail: email,
        userRole: role,
        action: "access.denied.role_mismatch",
        resourceType: "endpoint",
        severity: "warning",
        details: { allowedRoles, userRole: role, path: req.url },
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });

      return res.status(403).json({
        success: false,
        code: "FORBIDDEN_ROLE",
        error: `Access Denied: Requires one of [${allowedRoles.join(", ").toUpperCase()}]. Your clearance is [${role.toUpperCase()}].`
      });
    }

    if (next) next();
  };
}

/**
 * Convenience Guards
 */
const requireAdmin = roleGuard(ROLES.ADMIN);
const requireTrainerOrAdmin = roleGuard(ROLES.TRAINER, ROLES.ADMIN);
const requireAnyRole = roleGuard(ROLES.ADMIN, ROLES.TRAINER, ROLES.EMPLOYEE);

module.exports = {
  roleGuard,
  requireAdmin,
  requireTrainerOrAdmin,
  requireAnyRole
};
