/**
 * rbacPolicy.js - Role-Based Access Control (RBAC) Security Policy Matrix
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * 
 * NOTE: Legacy bridge. All authorization logic is now centrally enforced
 * by the PBAC engine in /backend/src/authorization/.
 */

const {
  ROLES,
  isAdminEmail,
  isTrainerEmail,
  resolveRoleFromEmail,
  PREDEFINED_ADMINS,
  PREDEFINED_TRAINERS
} = require("../authorization/config/roles.js");
const policyEngine = require("../authorization/services/policyEngine.js");

const KNOWN_ADMIN_EMAILS = PREDEFINED_ADMINS.map(a => a.email);
const KNOWN_TRAINER_EMAILS = PREDEFINED_TRAINERS.map(t => t.email);

const PERMISSIONS = {
  COURSE_CREATE: [ROLES.ADMIN, ROLES.TRAINER],
  COURSE_READ: [ROLES.ADMIN, ROLES.TRAINER, ROLES.EMPLOYEE],
  COURSE_UPDATE: [ROLES.ADMIN, ROLES.TRAINER],
  COURSE_DELETE: [ROLES.ADMIN],
  LIVE_CLASS_CREATE: [ROLES.ADMIN, ROLES.TRAINER],
  LIVE_CLASS_READ: [ROLES.ADMIN, ROLES.TRAINER, ROLES.EMPLOYEE],
  LIVE_CLASS_UPDATE: [ROLES.ADMIN, ROLES.TRAINER],
  LIVE_CLASS_DELETE: [ROLES.ADMIN],
  USER_VIEW_ALL: [ROLES.ADMIN],
  USER_ROLE_UPDATE: [ROLES.ADMIN],
  USER_DELETE: [ROLES.ADMIN],
  ANALYTICS_VIEW: [ROLES.ADMIN],
  MANDATE_COHORT: [ROLES.ADMIN]
};

function hasPermission(role, permission) {
  const map = {
    COURSE_CREATE: ["create", "courses"],
    COURSE_READ: ["read", "courses"],
    COURSE_UPDATE: ["update", "courses"],
    COURSE_DELETE: ["delete", "courses"],
    LIVE_CLASS_CREATE: ["create", "live_classes"],
    LIVE_CLASS_READ: ["read", "live_classes"],
    LIVE_CLASS_UPDATE: ["update", "live_classes"],
    LIVE_CLASS_DELETE: ["delete", "live_classes"],
    USER_VIEW_ALL: ["read", "users"],
    USER_ROLE_UPDATE: ["update", "users"],
    USER_DELETE: ["delete", "users"],
    ANALYTICS_VIEW: ["read", "analytics"],
    MANDATE_COHORT: ["manage", "courses"]
  };

  const entry = map[permission];
  if (!entry) return false;
  const [action, resource] = entry;
  const decision = policyEngine.can({ role, email: "" }, action, resource);
  return decision.allowed;
}

function resolveUserRole(email = "", requestedIntent = "employee") {
  return resolveRoleFromEmail(email);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  KNOWN_ADMIN_EMAILS,
  KNOWN_TRAINER_EMAILS,
  hasPermission,
  resolveUserRole
};
