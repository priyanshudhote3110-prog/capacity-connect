/**
 * trainerPolicy.js - Policy Rules for Trainer Role
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { ROLES } = require("../config/roles.js");
const { ACTIONS, RESOURCES } = require("../config/permissions.js");

class TrainerPolicy {
  constructor() {
    this.role = ROLES.TRAINER;
  }

  /**
   * Determine if Trainer can perform action on resource
   */
  evaluate(action, resource, context = {}) {
    const { user, targetResource } = context;

    // Strict Denial: Admin Panel, Audit Logs, Analytics
    if ([RESOURCES.ADMIN_PANEL, RESOURCES.AUDIT_LOG, RESOURCES.ANALYTICS].includes(resource)) {
      return {
        allowed: false,
        reason: "Access denied. Only Executive Directorate Administrators may access this area."
      };
    }

    // Strict Denial: Deleting Courses / Live Classes
    if ([RESOURCES.COURSES, RESOURCES.LIVE_CLASSES].includes(resource) && action === ACTIONS.DELETE) {
      return {
        allowed: false,
        reason: "Trainers cannot delete published courses or live classes. Request removal via Admin."
      };
    }

    // Course Creation & Reading
    if (resource === RESOURCES.COURSES) {
      if (action === ACTIONS.CREATE || action === ACTIONS.READ) {
        return { allowed: true };
      }
      if (action === ACTIONS.UPDATE) {
        // Must own the course or be assigned trainer
        if (!targetResource) return { allowed: true }; // Route guard check
        const isOwner = (targetResource.trainerId === user.id) ||
                        (targetResource.trainer_id === user.id) ||
                        (targetResource.instructorEmail === user.email);
        return {
          allowed: isOwner,
          reason: isOwner ? null : "You can only edit courses where you are assigned as the instructor."
        };
      }
    }

    // Live Classes
    if (resource === RESOURCES.LIVE_CLASSES) {
      if (action === ACTIONS.CREATE || action === ACTIONS.READ) {
        return { allowed: true };
      }
      if (action === ACTIONS.UPDATE) {
        if (!targetResource) return { allowed: true };
        const isOwner = (targetResource.trainerId === user.id) ||
                        (targetResource.trainer_id === user.id) ||
                        (targetResource.trainerEmail === user.email);
        return {
          allowed: isOwner,
          reason: isOwner ? null : "You can only modify your own live classroom sessions."
        };
      }
    }

    // Quizzes & Certificates
    if ([RESOURCES.QUIZZES, RESOURCES.CERTIFICATES].includes(resource)) {
      if ([ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.ISSUE].includes(action)) {
        return { allowed: true };
      }
    }

    // Users (Institute Scope)
    if (resource === RESOURCES.USERS) {
      if (action === ACTIONS.READ) {
        // Can read trainees/employees in the same institute
        if (context.targetUser) {
          const sameInst = (context.targetUser.institute === user.institute);
          return {
            allowed: sameInst,
            reason: sameInst ? null : "Trainers can only view trainees within their parent institute."
          };
        }
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Trainers cannot modify user profiles or permissions."
      };
    }

    // Enrollments
    if (resource === RESOURCES.ENROLLMENTS) {
      return { allowed: true };
    }

    return { allowed: false, reason: "Unauthorized operation for Trainer role." };
  }
}

module.exports = new TrainerPolicy();
