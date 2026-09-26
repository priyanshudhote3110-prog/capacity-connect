/**
 * guards/index.js - Unified Guards Export
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { authGuard, optionalAuthGuard } = require("./authGuard.js");
const { roleGuard, requireAdmin, requireTrainerOrAdmin, requireAnyRole } = require("./roleGuard.js");
const { resourceGuard } = require("./resourceGuard.js");

module.exports = {
  authGuard,
  optionalAuthGuard,
  roleGuard,
  requireAdmin,
  requireTrainerOrAdmin,
  requireAnyRole,
  resourceGuard
};
