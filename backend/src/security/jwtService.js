/**
 * jwtService.js - Cryptographic JWT Token Service
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Provides secure JWT issuance, verification, and claims decoding without external dependencies.
 */

const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "moes_capacity_connect_enterprise_jwt_secret_2026";
const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

class JwtService {
  /**
   * Generate signed JWT token with payload claims
   */
  sign(payload, expiresIn = DEFAULT_EXPIRY_SECONDS) {
    const header = { alg: "HS256", typ: "JWT" };
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const body = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedBody = base64UrlEncode(JSON.stringify(body));

    const signature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedBody}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  /**
   * Verify and return decoded token payload or null if invalid/expired
   */
  verify(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedBody, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedBody}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSig) return null;

    try {
      const payload = JSON.parse(base64UrlDecode(encodedBody));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token Expired
      }
      return payload;
    } catch (err) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header string
   */
  extractBearerToken(authHeader = "") {
    if (!authHeader) return null;
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }
    return authHeader.trim();
  }
}

module.exports = new JwtService();
