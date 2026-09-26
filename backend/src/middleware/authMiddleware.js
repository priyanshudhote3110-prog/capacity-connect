/**
 * authMiddleware.js - JWT Authentication & Token Validation Middleware
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES)
 * Bridges to PBAC authGuard for unified session and role authorization.
 */

const jwtService = require("../security/jwtService.js");
const { authGuard, optionalAuthGuard } = require("../authorization/guards/authGuard.js");

function generateToken(payload, expiresInSeconds = 7 * 86400) {
  return jwtService.sign(payload, expiresInSeconds);
}

function verifyToken(token) {
  return jwtService.verify(token);
}

const requireAuth = authGuard;
const optionalAuth = optionalAuthGuard;

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  optionalAuth
};

