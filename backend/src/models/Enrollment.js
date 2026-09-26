/**
 * Enrollment.js - Course Enrollment & Progress Tracking Model
 */

class EnrollmentModel {
  constructor() {
    this.enrollments = new Map(); // id -> enrollment
    // Seed sample enrollments for mock learners
    const seed = [
      {
        id: "enr_01",
        userId: "usr_employee_01",
        courseId: "crs_dwr_401",
        status: "completed",
        progressPercent: 100,
        completedLessons: ["dwr_m1_l1", "dwr_m1_l2", "dwr_m2_l1"],
        currentModuleId: "dwr_m2",
        currentLessonId: "dwr_m2_l1",
        score: 90.0,
        certificateId: "cert_001",
        enrolledAt: "2026-08-15T10:00:00Z",
        completedAt: "2026-09-08T14:35:00Z",
        notes: [
          { timestamp: "05:22", text: "Dual-pol radar differential reflectivity (ZDR) helps separate hail from rain." }
        ]
      },
      {
        id: "enr_02",
        userId: "usr_employee_01",
        courseId: "crs_hpc_501",
        status: "in_progress",
        progressPercent: 65,
        completedLessons: ["hpc_m1_l1", "hpc_m1_l2"],
        currentModuleId: "hpc_m2",
        currentLessonId: "hpc_m2_l1",
        score: null,
        certificateId: null,
        enrolledAt: "2026-09-10T09:30:00Z",
        completedAt: null,
        notes: [
          { timestamp: "12:40", text: "Remember to set #SBATCH --qos=priority for urgent cyclone forecast runs." }
        ]
      }
    ];
    seed.forEach(e => this.enrollments.set(e.id, e));
  }

  findByUserAndCourse(userId, courseId) {
    for (const enr of this.enrollments.values()) {
      if (enr.userId === userId && enr.courseId === courseId) {
        return enr;
      }
    }
    return null;
  }

  findByUserId(userId) {
    return Array.from(this.enrollments.values()).filter(e => e.userId === userId);
  }

  findByCourseId(courseId) {
    return Array.from(this.enrollments.values()).filter(e => e.courseId === courseId);
  }

  enroll(userId, courseId) {
    let existing = this.findByUserAndCourse(userId, courseId);
    if (existing) return existing;

    const id = "enr_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1000);
    const newEnr = {
      id,
      userId,
      courseId,
      status: "in_progress",
      progressPercent: 0,
      completedLessons: [],
      currentModuleId: null,
      currentLessonId: null,
      score: null,
      certificateId: null,
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      notes: []
    };
    this.enrollments.set(id, newEnr);
    return newEnr;
  }

  updateProgress(userId, courseId, progressData) {
    let enr = this.findByUserAndCourse(userId, courseId);
    if (!enr) {
      enr = this.enroll(userId, courseId);
    }

    if (progressData.progressPercent !== undefined) {
      enr.progressPercent = Math.min(100, Math.max(0, progressData.progressPercent));
    }
    if (progressData.completedLessonId && !enr.completedLessons.includes(progressData.completedLessonId)) {
      enr.completedLessons.push(progressData.completedLessonId);
    }
    if (progressData.currentModuleId) enr.currentModuleId = progressData.currentModuleId;
    if (progressData.currentLessonId) enr.currentLessonId = progressData.currentLessonId;
    if (progressData.score !== undefined) enr.score = progressData.score;
    if (progressData.certificateId) enr.certificateId = progressData.certificateId;

    if (enr.progressPercent >= 100 && enr.status !== "completed") {
      enr.status = "completed";
      enr.completedAt = new Date().toISOString();
    }

    this.enrollments.set(enr.id, enr);
    return enr;
  }

  addNote(userId, courseId, note) {
    let enr = this.findByUserAndCourse(userId, courseId);
    if (!enr) enr = this.enroll(userId, courseId);
    enr.notes = enr.notes || [];
    enr.notes.push({
      id: "note_" + Date.now().toString(36),
      timestamp: note.timestamp || "00:00",
      text: note.text,
      createdAt: new Date().toISOString()
    });
    this.enrollments.set(enr.id, enr);
    return enr.notes;
  }
}

module.exports = new EnrollmentModel();
