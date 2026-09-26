/**
 * roleCheckMiddleware.js - Role-Based Access Control (RBAC) Middleware Bridge
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * 
 * NOTE: Legacy bridge. Routes are now guarded using PBAC roleGuard.
 */

const {
  roleGuard,
  requireAdmin,
  requireTrainerOrAdmin
} = require("../authorization/guards/roleGuard.js");

module.exports = {
  requireRole: roleGuard,
  requireAdmin,
  requireTrainerOrAdmin
};
