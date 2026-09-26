/**
 * policyEngine.js - Central Policy-Based Access Control (PBAC) Engine
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Evaluates contextual authorization policies across roles, resources, and attributes.
 */

const { ROLES, ROLE_HIERARCHY, isAdminEmail, isTrainerEmail } = require("../config/roles.js");
const { ACTIONS, RESOURCES } = require("../config/permissions.js");
const { getPolicyForRole } = require("../policies/index.js");

class PolicyEngine {
  /**
   * Main PBAC Evaluation Function
   * @param {Object} user - The requesting user (id, role, email, institute)
   * @param {string} action - Action to perform (e.g., 'read', 'update', 'delete', 'access')
   * @param {string} resource - Target resource ('courses', 'users', 'admin_panel', etc.)
   * @param {Object} context - Contextual attributes (e.g. targetResource, targetUser, req)
   * @returns {Object} { allowed: boolean, reason: string }
   */
  can(user, action, resource, context = {}) {
    if (!user) {
      return { allowed: false, reason: "Unauthenticated: User context is missing." };
    }

    // Role Escalation & Integrity Check:
    // If user claims to be 'admin', verify their email is strictly in the authorized admin list
    if (user.role === ROLES.ADMIN && !isAdminEmail(user.email)) {
      return {
        allowed: false,
        reason: "Security Alert: Unauthorized admin role escalation detected for email " + user.email
      };
    }

    // If user claims to be 'trainer', verify their email is strictly in the authorized trainer list
    if (user.role === ROLES.TRAINER && !isTrainerEmail(user.email) && !isAdminEmail(user.email)) {
      return {
        allowed: false,
        reason: "Security Alert: Unauthorized trainer role assertion for email " + user.email
      };
    }

    // Evaluate against specific role policy
    const policy = getPolicyForRole(user.role);
    return policy.evaluate(action, resource, { ...context, user });
  }

  /**
   * Checks if user has minimum required role level according to hierarchy
   */
  hasMinimumRole(userRole, requiredRole) {
    const userWeight = ROLE_HIERARCHY[userRole] || 0;
    const requiredWeight = ROLE_HIERARCHY[requiredRole] || 0;
    return userWeight >= requiredWeight;
  }

  /**
   * Evaluates if user can manage a specific target user
   */
  canManageUser(actingUser, targetUser) {
    if (!actingUser) return false;
    if (actingUser.role === ROLES.ADMIN) return true;
    return false;
  }
}

module.exports = new PolicyEngine();
