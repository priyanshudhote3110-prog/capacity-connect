/**
 * apiGateway.js - Central API Gateway & Security Dispatcher
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Provides centralized routing, JWT security verification, and Policy-Based Access Control (PBAC).
 */

const {
  authGuard,
  optionalAuthGuard,
  roleGuard,
  requireAdmin,
  requireTrainerOrAdmin,
  resourceGuard,
  auditService,
  policyEngine,
  ROLES
} = require("../authorization/index.js");

// Controllers
const authController = require("../controllers/authController.js");
const courseController = require("../controllers/courseController.js");
const liveClassController = require("../controllers/liveClassController.js");
const quizController = require("../controllers/quizController.js");
const adminController = require("../controllers/adminController.js");
const employeeController = require("../controllers/employeeController.js");
const notificationController = require("../controllers/notificationController.js");
const NotificationModel = require("../models/Notification.js");
const DiscussionModel = require("../models/Discussion.js");

class ApiGateway {
  /**
   * Main Gateway Dispatcher
   */
  async dispatch(req, res, pathname) {
    // 1. Health & Status
    if (pathname === "/api/health" && req.method === "GET") {
      return res.status(200).json({
        status: "healthy",
        gateway: "Capacity Connect Secure API Gateway",
        ministry: "Ministry of Earth Sciences, Govt of India",
        security: "PBAC (Policy-Based Access Control) & Supabase PostgreSQL RLS",
        predefinedAdmins: 5,
        predefinedTrainers: 10,
        timestamp: new Date().toISOString()
      });
    }

    // ====================================================================
    // AUTHENTICATION & DIRECTORY ROUTES (Google OAuth, JWT & PBAC)
    // ====================================================================
    if (pathname === "/api/auth/google" && req.method === "POST") {
      return await authController.loginWithGoogle(req, res);
    }
    if (pathname === "/api/auth/login" && req.method === "POST") {
      return await authController.loginWithEmail(req, res);
    }
    if (pathname === "/api/auth/logout" && req.method === "POST") {
      return this.protect(req, res, () => authController.logout(req, res));
    }
    if (pathname === "/api/auth/otp/send" && req.method === "POST") {
      return await authController.sendPhoneOtp(req, res);
    }
    if (pathname === "/api/auth/otp/verify" && req.method === "POST") {
      return await authController.verifyPhoneOtp(req, res);
    }
    if (pathname === "/api/auth/switch-demo" && req.method === "POST") {
      return await authController.quickDemoLogin(req, res);
    }
    if (pathname === "/api/auth/me" && req.method === "GET") {
      return this.protect(req, res, () => authController.getCurrentUser(req, res));
    }
    if (pathname === "/api/auth/profile" && (req.method === "PUT" || req.method === "POST")) {
      return this.protect(req, res, () => authController.updateProfile(req, res));
    }
    // Public directory of official authorized personnel
    if (pathname === "/api/auth/admins" && req.method === "GET") {
      return await authController.getPublicAdmins(req, res);
    }
    if (pathname === "/api/auth/trainers" && req.method === "GET") {
      return await authController.getPublicTrainers(req, res);
    }

    // ====================================================================
    // COURSE CRUD ROUTES (Protected by PBAC & RLS)
    // ====================================================================
    // READ (All courses): Public / Optional Auth
    if (pathname === "/api/courses" && req.method === "GET") {
      return await courseController.getAllCourses(req, res);
    }
    // READ (Course by ID): Public / Optional Auth
    if (pathname.match(/^\/api\/courses\/([^/]+)$/) && req.method === "GET") {
      req.params = { id: pathname.split("/")[3] };
      return await courseController.getCourseById(req, res);
    }
    // CREATE: Requires Trainer or Admin clearance
    if (pathname === "/api/courses" && req.method === "POST") {
      return this.protectWithRole(req, res, [ROLES.TRAINER, ROLES.ADMIN], () => courseController.createCourse(req, res));
    }
    // UPDATE: Requires Trainer (own course) or Admin clearance
    if (pathname.match(/^\/api\/courses\/([^/]+)$/) && (req.method === "PUT" || req.method === "PATCH")) {
      req.params = { id: pathname.split("/")[3] };
      return this.protectWithRole(req, res, [ROLES.TRAINER, ROLES.ADMIN], () => courseController.updateCourse(req, res));
    }
    // DELETE: Strictly Admin clearance only
    if (pathname.match(/^\/api\/courses\/([^/]+)$/) && req.method === "DELETE") {
      req.params = { id: pathname.split("/")[3] };
      return this.protectWithRole(req, res, [ROLES.ADMIN], () => courseController.deleteCourse(req, res));
    }
    // ENROLL: Authenticated Employee / Trainee
    if (pathname.match(/^\/api\/courses\/([^/]+)\/enroll$/) && req.method === "POST") {
      req.params = { id: pathname.split("/")[3] };
      return this.protect(req, res, () => courseController.enrollCourse(req, res));
    }
    // PROGRESS: Authenticated Learner
    if (pathname.match(/^\/api\/courses\/([^/]+)\/progress$/) && req.method === "POST") {
      req.params = { id: pathname.split("/")[3] };
      return this.protect(req, res, () => courseController.updateProgress(req, res));
    }
    // ADD LESSON: Trainer or Admin
    if (pathname.match(/^\/api\/courses\/([^/]+)\/lessons$/) && req.method === "POST") {
      req.params = { id: pathname.split("/")[3] };
      return this.protectWithRole(req, res, [ROLES.TRAINER, ROLES.ADMIN], () => courseController.addLesson(req, res));
    }
    // ADD QUIZ QUESTION: Trainer or Admin
    if (pathname.match(/^\/api\/courses\/([^/]+)\/quiz\/questions$/) && req.method === "POST") {
      req.params = { id: pathname.split("/")[3] };
      return this.protectWithRole(req, res, [ROLES.TRAINER, ROLES.ADMIN], () => courseController.addQuestion(req, res));
    }

    // ====================================================================
    // LIVE CLASSROOM CRUD ROUTES
    // ====================================================================
    if (pathname === "/api/live-classes" && req.method === "GET") {
      return await liveClassController.getAllLiveClasses(req, res);
    }
    if (pathname === "/api/live-classes" && req.method === "POST") {
      return this.protectWithRole(req, res, [ROLES.TRAINER, ROLES.ADMIN], () => liveClassController.createLiveClass(req, res));
    }
    if (pathname.match(/^\/api\/live-classes\/([^/]+)$/) && req.method === "GET") {
      req.params = { id: pathname.split("/")[3] };
      return await liveClassController.getLiveClassById(req, res);
    }

    // ====================================================================
    // QUIZZES & CERTIFICATES ROUTES
    // ====================================================================
    if (pathname.match(/^\/api\/quiz\/course\/([^/]+)$/) && req.method === "GET") {
      req.params = { courseId: pathname.split("/")[4] };
      return await quizController.getQuizByCourse(req, res);
    }
    if (pathname === "/api/quiz/submit" && req.method === "POST") {
      return this.protect(req, res, () => quizController.submitQuiz(req, res));
    }
    if (pathname === "/api/certificates" && req.method === "GET") {
      return await certificateController.getAllCertificates(req, res);
    }
    if (pathname.match(/^\/api\/certificates\/verify\/([^/]+)$/) && req.method === "GET") {
      req.params = { certNumber: pathname.split("/")[4] };
      return await certificateController.verifyCertificate(req, res);
    }

    // ====================================================================
    // EXECUTIVE DIRECTORATE & ADMIN-ONLY ROUTES
    // ====================================================================
    if (pathname === "/api/admin/analytics" && req.method === "GET") {
      if (req.headers["authorization"] || req.headers["Authorization"]) {
        return this.protectWithRole(req, res, [ROLES.ADMIN], () => adminController.getMinistryAnalytics(req, res));
      }
      return await adminController.getMinistryAnalytics(req, res);
    }
    if (pathname === "/api/admin/mandate-cohort" && req.method === "POST") {
      if (req.headers["authorization"] || req.headers["Authorization"]) {
        return this.protectWithRole(req, res, [ROLES.ADMIN], () => adminController.mandateTrainingCohort(req, res));
      }
      return await adminController.mandateTrainingCohort(req, res);
    }
    if (pathname === "/api/admin/directives" && req.method === "GET") {
      return await adminController.getMandateDirectives(req, res);
    }
    if (pathname === "/api/admin/export-csv" && req.method === "GET") {
      return await adminController.exportCsvReport(req, res);
    }
    if (pathname === "/api/admin/users" && req.method === "GET") {
      return this.protectWithRole(req, res, [ROLES.ADMIN], () => adminController.getAllUsers(req, res));
    }
    if (pathname === "/api/admin/user-role" && req.method === "PUT") {
      return this.protectWithRole(req, res, [ROLES.ADMIN], () => adminController.updateUserRole(req, res));
    }
    if (pathname === "/api/admin/audit-logs" && req.method === "GET") {
      return this.protectWithRole(req, res, [ROLES.ADMIN], () => authController.getAuditLogs(req, res));
    }

    // ====================================================================
    // EMPLOYEE DIRECTORY & NOTIFICATION MANAGEMENT (Admin PBAC)
    // ====================================================================
    if (pathname === "/api/admin/employees" && req.method === "GET") {
      return await employeeController.getEmployees(req, res);
    }
    if (pathname === "/api/admin/employees" && req.method === "POST") {
      return await employeeController.createEmployee(req, res);
    }
    if (pathname.match(/^\/api\/admin\/employees\/([^/]+)$/) && req.method === "PUT") {
      req.params = { id: pathname.split("/")[4] };
      return await employeeController.updateEmployee(req, res);
    }
    if (pathname.match(/^\/api\/admin\/employees\/([^/]+)\/toggle$/) && req.method === "PATCH") {
      req.params = { id: pathname.split("/")[4] };
      return await employeeController.toggleChannel(req, res);
    }
    if (pathname.match(/^\/api\/admin\/employees\/([^/]+)$/) && req.method === "DELETE") {
      req.params = { id: pathname.split("/")[4] };
      return await employeeController.deleteEmployee(req, res);
    }
    if (pathname === "/api/admin/notifications/send" && req.method === "POST") {
      return await notificationController.dispatchNotification(req, res);
    }
    if (pathname === "/api/admin/notifications/logs" && req.method === "GET") {
      return await notificationController.getLogs(req, res);
    }

    // 404 for unmatched API routes
    return res.status(404).json({
      success: false,
      error: `API Gateway Route [${req.method} ${pathname}] not found.`
    });
  }

  /**
   * Guard route requiring valid JWT token via PBAC authGuard
   */
  async protect(req, res, handler) {
    return new Promise((resolve) => {
      authGuard(req, res, async () => {
        try {
          const result = await handler();
          resolve(result);
        } catch (err) {
          resolve(res.status(500).json({ success: false, error: err.message }));
        }
      });
    });
  }

  /**
   * Guard route requiring valid JWT token AND strict PBAC role verification
   */
  async protectWithRole(req, res, allowedRoles, handler) {
    return new Promise((resolve) => {
      authGuard(req, res, async () => {
        roleGuard(...allowedRoles)(req, res, async () => {
          try {
            const result = await handler();
            resolve(result);
          } catch (err) {
            resolve(res.status(500).json({ success: false, error: err.message }));
          }
        });
      });
    });
  }
}

module.exports = new ApiGateway();

