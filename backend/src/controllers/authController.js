/**
 * authController.js - Central Authentication Controller for API Gateway
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES)
 * Policy-Based Access Control (PBAC) Architecture
 */

const UserModel = require("../models/User.js");
const googleAuthClient = require("../../integrations/google-auth/googleAuthClient.js");
const smsOtpService = require("../../integrations/sms-otp/smsOtpService.js");
const { generateToken } = require("../middleware/authMiddleware.js");
const {
  ROLES,
  isAdminEmail,
  isTrainerEmail,
  resolveRoleFromEmail,
  getPredefinedAccount,
  PREDEFINED_ADMINS,
  PREDEFINED_TRAINERS,
  auditService,
  sessionService
} = require("../authorization/index.js");

class AuthController {
  /**
   * Google OAuth 2.0 Sign In / Register via API Gateway
   * Policy Rule: Role is determined strictly by email whitelist (cannot be forged by client).
   */
  async loginWithGoogle(req, res) {
    try {
      const { credential, institute, designation } = req.body;
      const googleProfile = await googleAuthClient.verifyGoogleToken(credential || req.body);
      const email = (googleProfile.email || "").toLowerCase().trim();

      if (!email) {
        return res.status(400).json({ success: false, error: "Valid Google email profile is required." });
      }

      // Authoritative role assignment — client cannot escalate
      const authoritativeRole = resolveRoleFromEmail(email);
      const predefined = getPredefinedAccount(email);

      let user = UserModel.findByEmail(email);
      if (!user) {
        // Register new user with official role & ID
        user = UserModel.create({
          name: googleProfile.name || predefined?.name || "MoES Official",
          email: email,
          role: authoritativeRole,
          customRoleId: predefined?.customRoleId,
          institute: predefined?.institute || institute || (authoritativeRole === ROLES.ADMIN ? "HQ" : "IMD"),
          designation: predefined?.designation || designation || (authoritativeRole === ROLES.TRAINER ? "Faculty Specialist" : authoritativeRole === ROLES.ADMIN ? "Executive Director" : "Scientific Officer"),
          department: predefined?.department || "Earth Sciences Division",
          avatarUrl: googleProfile.picture || predefined?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleProfile.name || 'MoES')}&background=0A2647&color=fff`
        });
      } else {
        // Enforce role consistency with authoritative whitelist
        if (user.role !== authoritativeRole) {
          user = UserModel.update(user.id, {
            role: authoritativeRole,
            customRoleId: predefined ? predefined.customRoleId : user.customRoleId
          });
        }
      }

      UserModel.updateLastLogin(user.id);

      // Issue signed JWT token
      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customRoleId: user.customRoleId,
        institute: user.institute
      });

      // Track active session & log audit trail
      sessionService.createSession(user, token, {
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });

      auditService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: "auth.google.success",
        resourceType: "user",
        resourceId: user.id,
        details: { method: "Google OAuth 2.0", customRoleId: user.customRoleId },
        severity: "info",
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });

      return res.status(200).json({
        success: true,
        message: `Google authentication successful. Security Clearance: ${user.role.toUpperCase()}`,
        token,
        user: UserModel.sanitize(user)
      });
    } catch (err) {
      auditService.log({
        action: "auth.google.failed",
        resourceType: "auth",
        details: { error: err.message },
        severity: "warning",
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });

      return res.status(400).json({
        success: false,
        error: err.message || "Google authentication failed on API Gateway."
      });
    }
  }

  /**
   * Official Email/Password Sign In via API Gateway
   * Policy Rule: Admin & Trainer accounts require strict password verification.
   */
  async loginWithEmail(req, res) {
    try {
      const { email, password, role: requestedRole } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: "Official email is required." });
      }

      const cleanEmail = email.toLowerCase().trim();
      const authoritativeRole = resolveRoleFromEmail(cleanEmail);

      // Anti-Spoofing: If someone requests 'admin' but their email is NOT an authorized admin email
      if (requestedRole === ROLES.ADMIN && !isAdminEmail(cleanEmail)) {
        auditService.log({
          userEmail: cleanEmail,
          userRole: "unauthorized",
          action: "auth.admin_spoofing_attempt",
          resourceType: "admin_panel",
          severity: "critical",
          details: { attemptedRole: requestedRole, email: cleanEmail },
          ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
        });

        return res.status(403).json({
          success: false,
          code: "UNAUTHORIZED_ADMIN_CLAIM",
          error: "Access Denied: Only designated Executive Administrators from the Ministry may access this portal."
        });
      }

      // Find user
      let user = UserModel.findByEmail(cleanEmail);
      const predefined = getPredefinedAccount(cleanEmail);

      if (!user && predefined) {
        // Pre-seeded account not yet initialized in memory map
        user = UserModel.create(predefined);
      }

      // Password Verification: MANDATORY for Admins & Trainers
      if (authoritativeRole === ROLES.ADMIN || authoritativeRole === ROLES.TRAINER) {
        if (!password) {
          return res.status(400).json({
            success: false,
            code: "PASSWORD_REQUIRED",
            error: `Password is required for ${authoritativeRole.toUpperCase()} clearance accounts.`
          });
        }

        const isPasswordValid = UserModel.verifyPassword(user, password);
        if (!isPasswordValid) {
          auditService.log({
            userId: user?.id,
            userEmail: cleanEmail,
            userRole: authoritativeRole,
            action: "auth.password_failed",
            resourceType: "auth",
            severity: "warning",
            details: { reason: "Invalid password for executive/trainer account" },
            ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
          });

          return res.status(401).json({
            success: false,
            code: "INVALID_CREDENTIALS",
            error: "Authentication failed. Incorrect password for official account."
          });
        }
      } else if (!user) {
        // For general employees, auto-register upon valid email verification
        user = UserModel.create({
          name: cleanEmail.split("@")[0].replace(/[._]/g, " "),
          email: cleanEmail,
          password: password || null,
          role: ROLES.EMPLOYEE,
          institute: "IMD",
          designation: "Scientific Officer",
          department: "Earth Sciences Research"
        });
      }

      UserModel.updateLastLogin(user.id);

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customRoleId: user.customRoleId,
        institute: user.institute
      });

      sessionService.createSession(user, token, {
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });

      auditService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: "auth.login.success",
        resourceType: "auth",
        severity: "info",
        details: { method: "Email/Password", customRoleId: user.customRoleId },
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });

      return res.status(200).json({
        success: true,
        message: `Signed in as ${user.name} (${user.role.toUpperCase()})`,
        token,
        user: UserModel.sanitize(user)
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Send Phone OTP
   */
  async sendPhoneOtp(req, res) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: "Mobile number is required" });
      }
      const result = await smsOtpService.sendOtp(phone);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Verify Phone OTP & Login / Register
   */
  async verifyPhoneOtp(req, res) {
    try {
      const { phone, otp, name, institute, designation } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: "Mobile number and OTP are required" });
      }

      const verification = await smsOtpService.verifyOtp(phone, otp);
      if (!verification.verified) {
        return res.status(400).json({ success: false, error: "OTP verification failed" });
      }

      let user = UserModel.findByPhone(phone);
      if (!user) {
        user = UserModel.create({
          name: name || "MoES Official (" + phone.slice(-4) + ")",
          phone: phone,
          role: ROLES.EMPLOYEE,
          institute: institute || "IMD",
          designation: designation || "Scientific Officer"
        });
      }

      UserModel.updateLastLogin(user.id);

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email || `${phone}@moes.gov.in`,
        role: user.role,
        customRoleId: user.customRoleId,
        institute: user.institute
      });

      sessionService.createSession(user, token, {
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });

      return res.status(200).json({
        success: true,
        message: "Phone OTP authentication successful",
        token,
        user: UserModel.sanitize(user)
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Quick Switch Demo Persona
   */
  async quickDemoLogin(req, res) {
    try {
      const { persona } = req.body; // 'admin' | 'trainer' | 'employee'
      let targetId = "a0000000-0000-0000-0000-000000000002"; // Priyanshu Dhote (Admin)
      if (persona === "trainer") targetId = "b0000000-0000-0000-0000-000000000001"; // Dr. Anita Desai
      if (persona === "employee") targetId = "usr_employee_01";

      let user = UserModel.findById(targetId);
      if (!user && persona === "admin") {
        user = UserModel.findByEmail("priyanshudhote3110@gmail.com") || UserModel.findAdmins()[0];
      }
      if (!user && persona === "trainer") {
        user = UserModel.findByEmail("anita.desai@imd.gov.in") || UserModel.findTrainers()[0];
      }
      if (!user) {
        return res.status(404).json({ success: false, error: `Demo persona '${persona}' not found` });
      }

      UserModel.updateLastLogin(user.id);

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customRoleId: user.customRoleId,
        institute: user.institute
      });

      return res.status(200).json({
        success: true,
        message: `Switched to demo persona: ${user.name} (${user.customRoleId})`,
        token,
        user: UserModel.sanitize(user)
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  async getCurrentUser(req, res) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated. Missing or invalid JWT." });
    }
    return res.status(200).json({
      success: true,
      user: UserModel.sanitize(req.user)
    });
  }

  /**
   * Update Profile
   */
  async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
      }
      const allowedUpdates = ["name", "avatarUrl", "institute", "designation", "department", "bio", "phone"];
      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const updatedUser = UserModel.update(req.user.id, updates);
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: UserModel.sanitize(updatedUser)
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Public Directory: 5 Predefined Ministry Admins
   */
  async getPublicAdmins(req, res) {
    return res.status(200).json({
      success: true,
      count: PREDEFINED_ADMINS.length,
      admins: PREDEFINED_ADMINS
    });
  }

  /**
   * Public Directory: 10 Predefined Specialist Trainers
   */
  async getPublicTrainers(req, res) {
    return res.status(200).json({
      success: true,
      count: PREDEFINED_TRAINERS.length,
      trainers: PREDEFINED_TRAINERS
    });
  }

  /**
   * Admin Audit Trail: Retrieve security audit logs
   */
  async getAuditLogs(req, res) {
    const logs = auditService.getLogs({
      limit: parseInt(req.query?.limit || "50", 10),
      role: req.query?.role,
      severity: req.query?.severity,
      search: req.query?.search
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  }

  /**
   * Sign Out / Revoke Session
   */
  async logout(req, res) {
    if (req.token) {
      sessionService.revokeToken(req.token);
    }
    if (req.user) {
      auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "auth.logout",
        severity: "info",
        ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session successfully terminated and revoked."
    });
  }
}

module.exports = new AuthController();

