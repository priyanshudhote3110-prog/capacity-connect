/**
 * adminPolicy.js - Policy Rules for Admin Role
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { ROLES } = require("../config/roles.js");
const { ACTIONS, RESOURCES } = require("../config/permissions.js");

class AdminPolicy {
  constructor() {
    this.role = ROLES.ADMIN;
  }

  /**
   * Determine if Admin can perform action on resource
   * Admin has unrestricted access across all resources.
   */
  evaluate(action, resource, context = {}) {
    // Admin has full clearance across all systems
    return {
      allowed: true,
      reason: "Admin has highest clearance in the Ministry of Earth Sciences hierarchy."
    };
  }

  /**
   * Check if user can access the Admin Directorate Panel
   */
  canAccessAdminPanel(user) {
    return user && user.role === ROLES.ADMIN;
  }

  /**
   * Check if admin can manage role assignments
   */
  canChangeUserRole(user, targetUser, targetRole) {
    if (!user || user.role !== ROLES.ADMIN) return false;
    // Admins cannot demote themselves to prevent accidental lockout
    if (user.id === targetUser.id && targetRole !== ROLES.ADMIN) {
      return false;
    }
    return true;
  }
}

module.exports = new AdminPolicy();
