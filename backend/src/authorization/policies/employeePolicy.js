/**
 * employeePolicy.js - Policy Rules for Employee / Trainee Role
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { ROLES } = require("../config/roles.js");
const { ACTIONS, RESOURCES } = require("../config/permissions.js");

class EmployeePolicy {
  constructor() {
    this.role = ROLES.EMPLOYEE;
  }

  /**
   * Determine if Employee can perform action on resource
   */
  evaluate(action, resource, context = {}) {
    const { user, targetResource, targetUser } = context;

    // Strict Denials: Admin Panel, Audit Logs, Analytics
    if ([RESOURCES.ADMIN_PANEL, RESOURCES.AUDIT_LOG, RESOURCES.ANALYTICS].includes(resource)) {
      return {
        allowed: false,
        reason: "Access restricted. You do not have clearance for administrative systems."
      };
    }

    // Courses & Live Classes: Read-only access to published content
    if ([RESOURCES.COURSES, RESOURCES.LIVE_CLASSES].includes(resource)) {
      if (action === ACTIONS.READ) {
        if (targetResource && targetResource.status && targetResource.status !== "published") {
          return { allowed: false, reason: "Draft or archived courses can only be viewed by instructors." };
        }
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Employees cannot create or modify courses or live classrooms."
      };
    }

    // Enrollments: Self-service enrollment and progress update
    if (resource === RESOURCES.ENROLLMENTS) {
      if ([ACTIONS.ENROLL, ACTIONS.CREATE].includes(action)) {
        return { allowed: true };
      }
      if ([ACTIONS.READ, ACTIONS.UPDATE].includes(action)) {
        if (!targetResource) return { allowed: true };
        const isSelf = (targetResource.userId === user.id) || (targetResource.user_id === user.id);
        return {
          allowed: isSelf,
          reason: isSelf ? null : "You can only view or update your own enrollment records."
        };
      }
      return { allowed: false, reason: "Unauthorized enrollment action." };
    }

    // Quizzes: Attempt & View questions
    if (resource === RESOURCES.QUIZZES) {
      if ([ACTIONS.READ, ACTIONS.ATTEMPT].includes(action)) {
        return { allowed: true };
      }
      return { allowed: false, reason: "Learners cannot create or edit quiz examination material." };
    }

    // Certificates: View own certificates
    if (resource === RESOURCES.CERTIFICATES) {
      if (action === ACTIONS.READ) {
        if (!targetResource) return { allowed: true };
        const isSelf = (targetResource.userId === user.id) || (targetResource.recipientEmail === user.email);
        return {
          allowed: isSelf,
          reason: isSelf ? null : "You can only access certificates issued in your name."
        };
      }
      return { allowed: false, reason: "Certificates can only be issued by Trainers or Administrators." };
    }

    // Users: View & update self only
    if (resource === RESOURCES.USERS) {
      if (action === ACTIONS.READ || action === ACTIONS.UPDATE) {
        if (!targetUser) return { allowed: true };
        const isSelf = (targetUser.id === user.id) || (targetUser.email === user.email);
        return {
          allowed: isSelf,
          reason: isSelf ? null : "Users cannot inspect other personnel records."
        };
      }
      return { allowed: false, reason: "Employees cannot manage user accounts." };
    }

    return { allowed: false, reason: "Action not permitted for employee clearance level." };
  }
}

module.exports = new EmployeePolicy();
