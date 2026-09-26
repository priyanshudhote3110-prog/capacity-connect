/**
 * permissions.js - Comprehensive Resource and Action Matrix for PBAC
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { ROLES } = require("./roles.js");

const ACTIONS = Object.freeze({
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  ENROLL: "enroll",
  ATTEMPT: "attempt",
  ISSUE: "issue",
  ACCESS: "access"
});

const RESOURCES = Object.freeze({
  USERS: "users",
  COURSES: "courses",
  LIVE_CLASSES: "live_classes",
  ENROLLMENTS: "enrollments",
  QUIZZES: "quizzes",
  CERTIFICATES: "certificates",
  ANALYTICS: "analytics",
  AUDIT_LOG: "audit_log",
  ADMIN_PANEL: "admin_panel"
});

/**
 * Default Policy Matrix
 */
const DEFAULT_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: [
    { resource: RESOURCES.USERS, action: ACTIONS.MANAGE, isAllowed: true },
    { resource: RESOURCES.USERS, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.USERS, action: ACTIONS.CREATE, isAllowed: true },
    { resource: RESOURCES.USERS, action: ACTIONS.UPDATE, isAllowed: true },
    { resource: RESOURCES.USERS, action: ACTIONS.DELETE, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.MANAGE, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.CREATE, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.UPDATE, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.DELETE, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.MANAGE, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.CREATE, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.UPDATE, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.DELETE, isAllowed: true },
    { resource: RESOURCES.ENROLLMENTS, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.ENROLLMENTS, action: ACTIONS.MANAGE, isAllowed: true },
    { resource: RESOURCES.QUIZZES, action: ACTIONS.MANAGE, isAllowed: true },
    { resource: RESOURCES.CERTIFICATES, action: ACTIONS.ISSUE, isAllowed: true },
    { resource: RESOURCES.CERTIFICATES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.AUDIT_LOG, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.ADMIN_PANEL, action: ACTIONS.ACCESS, isAllowed: true }
  ],
  [ROLES.TRAINER]: [
    { resource: RESOURCES.USERS, action: ACTIONS.READ, isAllowed: true, conditions: { scope: "institute_employees" } },
    { resource: RESOURCES.COURSES, action: ACTIONS.CREATE, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.COURSES, action: ACTIONS.UPDATE, isAllowed: true, conditions: { scope: "own" } },
    { resource: RESOURCES.COURSES, action: ACTIONS.DELETE, isAllowed: false },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.CREATE, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.UPDATE, isAllowed: true, conditions: { scope: "own" } },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.DELETE, isAllowed: false },
    { resource: RESOURCES.ENROLLMENTS, action: ACTIONS.READ, isAllowed: true, conditions: { scope: "institute" } },
    { resource: RESOURCES.QUIZZES, action: ACTIONS.CREATE, isAllowed: true },
    { resource: RESOURCES.QUIZZES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.QUIZZES, action: ACTIONS.UPDATE, isAllowed: true, conditions: { scope: "own" } },
    { resource: RESOURCES.CERTIFICATES, action: ACTIONS.ISSUE, isAllowed: true },
    { resource: RESOURCES.CERTIFICATES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ, isAllowed: false },
    { resource: RESOURCES.AUDIT_LOG, action: ACTIONS.READ, isAllowed: false },
    { resource: RESOURCES.ADMIN_PANEL, action: ACTIONS.ACCESS, isAllowed: false }
  ],
  [ROLES.EMPLOYEE]: [
    { resource: RESOURCES.USERS, action: ACTIONS.READ, isAllowed: true, conditions: { scope: "self" } },
    { resource: RESOURCES.USERS, action: ACTIONS.UPDATE, isAllowed: true, conditions: { scope: "self" } },
    { resource: RESOURCES.COURSES, action: ACTIONS.READ, isAllowed: true, conditions: { filter: "published" } },
    { resource: RESOURCES.COURSES, action: ACTIONS.CREATE, isAllowed: false },
    { resource: RESOURCES.COURSES, action: ACTIONS.UPDATE, isAllowed: false },
    { resource: RESOURCES.COURSES, action: ACTIONS.DELETE, isAllowed: false },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.LIVE_CLASSES, action: ACTIONS.CREATE, isAllowed: false },
    { resource: RESOURCES.ENROLLMENTS, action: ACTIONS.ENROLL, isAllowed: true, conditions: { scope: "self" } },
    { resource: RESOURCES.ENROLLMENTS, action: ACTIONS.READ, isAllowed: true, conditions: { scope: "self" } },
    { resource: RESOURCES.ENROLLMENTS, action: ACTIONS.UPDATE, isAllowed: true, conditions: { scope: "self" } },
    { resource: RESOURCES.QUIZZES, action: ACTIONS.ATTEMPT, isAllowed: true },
    { resource: RESOURCES.QUIZZES, action: ACTIONS.READ, isAllowed: true },
    { resource: RESOURCES.CERTIFICATES, action: ACTIONS.READ, isAllowed: true, conditions: { scope: "self" } },
    { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ, isAllowed: false },
    { resource: RESOURCES.AUDIT_LOG, action: ACTIONS.READ, isAllowed: false },
    { resource: RESOURCES.ADMIN_PANEL, action: ACTIONS.ACCESS, isAllowed: false }
  ]
});

module.exports = {
  ACTIONS,
  RESOURCES,
  DEFAULT_PERMISSIONS
};
