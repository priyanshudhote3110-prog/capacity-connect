/**
 * resourceGuard.js - Dynamic PBAC Resource & Attribute Guard
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const policyEngine = require("../services/policyEngine.js");
const auditService = require("../services/auditService.js");

/**
 * Middleware factory for resource-level authorization
 * @param {string} action - 'read', 'update', 'delete', 'create', 'enroll', etc.
 * @param {string} resource - 'courses', 'live_classes', 'users', 'certificates', etc.
 * @param {Function} [resolveContext] - Optional function to extract target resource from req
 */
function resourceGuard(action, resource, resolveContext = null) {
  return async function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required to access this resource."
      });
    }

    let context = {};
    if (typeof resolveContext === "function") {
      try {
        context = await resolveContext(req);
      } catch (err) {
        console.warn("[ResourceGuard] Context resolution error:", err.message);
      }
    }

    const decision = policyEngine.can(req.user, action, resource, context);

    if (!decision.allowed) {
      auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: `denied.${resource}.${action}`,
        resourceType: resource,
        resourceId: req.params?.id || null,
        details: { reason: decision.reason, path: req.url },
        severity: "warning",
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });

      return res.status(403).json({
        success: false,
        code: "PBAC_POLICY_DENIED",
        error: decision.reason || `You do not have permission to ${action} this ${resource}.`
      });
    }

    if (next) next();
  };
}

module.exports = {
  resourceGuard
};
