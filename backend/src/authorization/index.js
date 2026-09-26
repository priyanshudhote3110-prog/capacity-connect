/**
 * authorization/index.js - Unified PBAC Module Hub
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const {
  ROLES,
  ROLE_HIERARCHY,
  PREDEFINED_ADMINS,
  PREDEFINED_TRAINERS,
  ADMIN_EMAIL_SET,
  TRAINER_EMAIL_SET,
  isAdminEmail,
  isTrainerEmail,
  resolveRoleFromEmail,
  getPredefinedAccount
} = require("./config/roles.js");

const { ACTIONS, RESOURCES, DEFAULT_PERMISSIONS } = require("./config/permissions.js");

const policyEngine = require("./services/policyEngine.js");
const auditService = require("./services/auditService.js");
const sessionService = require("./services/sessionService.js");

const {
  authGuard,
  optionalAuthGuard,
  roleGuard,
  requireAdmin,
  requireTrainerOrAdmin,
  requireAnyRole,
  resourceGuard
} = require("./guards/index.js");

const { SEED_ADMINS } = require("./seeds/seedAdmins.js");
const { SEED_TRAINERS } = require("./seeds/seedTrainers.js");
const { runSeeds } = require("./seeds/runSeeds.js");

module.exports = {
  // Config & Constants
  ROLES,
  ROLE_HIERARCHY,
  PREDEFINED_ADMINS,
  PREDEFINED_TRAINERS,
  ADMIN_EMAIL_SET,
  TRAINER_EMAIL_SET,
  ACTIONS,
  RESOURCES,
  DEFAULT_PERMISSIONS,

  // Role validation helpers
  isAdminEmail,
  isTrainerEmail,
  resolveRoleFromEmail,
  getPredefinedAccount,

  // Services
  policyEngine,
  auditService,
  sessionService,

  // Guards
  authGuard,
  optionalAuthGuard,
  roleGuard,
  requireAdmin,
  requireTrainerOrAdmin,
  requireAnyRole,
  resourceGuard,

  // Seeds
  SEED_ADMINS,
  SEED_TRAINERS,
  runSeeds
};
