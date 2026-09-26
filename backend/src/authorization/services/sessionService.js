/**
 * sessionService.js - User Session & Revocation Management
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

class SessionService {
  constructor() {
    this.activeSessions = new Map(); // userId -> [{ sessionId, token, expiresAt, ip, userAgent }]
    this.revokedTokens = new Set();
  }

  createSession(user, token, meta = {}) {
    const sessionId = "ses_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const session = {
      sessionId,
      userId: user.id,
      email: user.email,
      role: user.role,
      token,
      ip: meta.ip || "127.0.0.1",
      userAgent: meta.userAgent || "Unknown",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString()
    };

    if (!this.activeSessions.has(user.id)) {
      this.activeSessions.set(user.id, []);
    }
    this.activeSessions.get(user.id).push(session);
    return session;
  }

  isTokenRevoked(token) {
    if (!token) return true;
    return this.revokedTokens.has(token);
  }

  revokeToken(token) {
    if (token) {
      this.revokedTokens.add(token);
    }
  }

  revokeAllSessionsForUser(userId) {
    const sessions = this.activeSessions.get(userId) || [];
    sessions.forEach(s => {
      this.revokedTokens.add(s.token);
    });
    this.activeSessions.delete(userId);
  }

  getActiveSessionsCount() {
    let total = 0;
    for (const list of this.activeSessions.values()) {
      total += list.length;
    }
    return total;
  }
}

module.exports = new SessionService();
