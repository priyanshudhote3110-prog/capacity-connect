/**
 * authGuard.js - Authentication Guard Middleware
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Verifies Bearer JWT tokens, handles session revocation, and populates req.user.
 */

const jwtService = require("../../security/jwtService.js");
const UserModel = require("../../models/User.js");
const sessionService = require("../services/sessionService.js");
const auditService = require("../services/auditService.js");

/**
 * Strict Guard: Blocks request if JWT token is missing, expired, or revoked.
 */
function authGuard(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = jwtService.extractBearerToken(authHeader) || (req.query && req.query.token);

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "AUTH_REQUIRED",
      error: "Authentication required. Missing Bearer JWT in Authorization header."
    });
  }

  // Check revocation
  if (sessionService.isTokenRevoked(token)) {
    return res.status(401).json({
      success: false,
      code: "TOKEN_REVOKED",
      error: "Your session has been revoked. Please sign in again."
    });
  }

  // Decode & verify
  const decoded = jwtService.verify(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      code: "TOKEN_INVALID",
      error: "Invalid or expired session token. Please re-authenticate."
    });
  }

  // Look up authoritative user profile from database model
  const user = UserModel.findById(decoded.id) || UserModel.findByEmail(decoded.email);
  if (user) {
    req.user = user;
  } else {
    // If user authenticated via Supabase JWT with app_metadata
    const appMetaRole = decoded.app_metadata && decoded.app_metadata.role;
    req.user = {
      id: decoded.id || decoded.sub,
      name: decoded.name || decoded.user_metadata?.full_name || "MoES Official",
      email: decoded.email,
      role: appMetaRole || decoded.role || "employee",
      customRoleId: decoded.customRoleId || "EMP-001",
      institute: decoded.institute || "IMD"
    };
  }

  req.token = token;
  if (next) next();
}

/**
 * Optional Guard: Extracts user if token is valid, but does not block if unauthenticated.
 */
function optionalAuthGuard(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = jwtService.extractBearerToken(authHeader) || (req.query && req.query.token);

  if (token && !sessionService.isTokenRevoked(token)) {
    const decoded = jwtService.verify(token);
    if (decoded) {
      const user = UserModel.findById(decoded.id) || UserModel.findByEmail(decoded.email);
      req.user = user || {
        id: decoded.id || decoded.sub,
        name: decoded.name || "MoES Official",
        email: decoded.email,
        role: decoded.app_metadata?.role || decoded.role || "employee",
        customRoleId: decoded.customRoleId || "EMP-001",
        institute: decoded.institute || "IMD"
      };
      req.token = token;
    }
  }

  if (next) next();
}

module.exports = {
  authGuard,
  optionalAuthGuard
};
