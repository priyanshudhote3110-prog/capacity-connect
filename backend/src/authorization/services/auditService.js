/**
 * auditService.js - Security Audit Logging Service
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Records all authorization attempts, logins, and administrative actions.
 */

const fs = require("fs");
const path = require("path");

const AUDIT_FILE = path.resolve(__dirname, "../../../../database/audit_logs.json");

class AuditService {
  constructor() {
    this.logs = [];
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(AUDIT_FILE)) {
        const raw = fs.readFileSync(AUDIT_FILE, "utf8");
        this.logs = JSON.parse(raw);
      }
    } catch (err) {
      console.warn("[AuditService] Failed to load audit log file:", err.message);
      this.logs = [];
    }
  }

  persist() {
    try {
      const dir = path.dirname(AUDIT_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(this.logs, null, 2), "utf8");
    } catch (err) {
      console.error("[AuditService] Failed to write audit log:", err.message);
    }
  }

  /**
   * Log an authorization or system event
   */
  log({
    userId = null,
    userEmail = "anonymous",
    userRole = "guest",
    action,
    resourceType = "system",
    resourceId = null,
    details = {},
    ipAddress = "127.0.0.1",
    severity = "info"
  }) {
    const entry = {
      id: "aud_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7),
      userId,
      userEmail,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      severity,
      createdAt: new Date().toISOString()
    };

    this.logs.unshift(entry);
    // Keep max 2000 log entries in file
    if (this.logs.length > 2000) {
      this.logs = this.logs.slice(0, 2000);
    }

    this.persist();

    // Print critical security alerts to console
    if (severity === "critical" || severity === "warning") {
      console.warn(`[SECURITY ${severity.toUpperCase()}] ${action} by ${userEmail} (${userRole}):`, details);
    }

    return entry;
  }

  getLogs({ limit = 50, role, severity, search } = {}) {
    let result = this.logs;
    if (role) {
      result = result.filter(l => l.userRole === role);
    }
    if (severity) {
      result = result.filter(l => l.severity === severity);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.userEmail && l.userEmail.toLowerCase().includes(q)) ||
        (l.resourceType && l.resourceType.toLowerCase().includes(q))
      );
    }
    return result.slice(0, limit);
  }
}

module.exports = new AuditService();
