/**
 * courseController.js - Course Management, Playlists & Enrollment Controller
 */

const CourseModel = require("../models/Course.js");
const EnrollmentModel = require("../models/Enrollment.js");

class CourseController {
  async getAllCourses(req, res) {
    try {
      const { institute, category, search } = req.query;
      const courses = CourseModel.findAll({ institute, category, search });

      // If user is authenticated, attach enrollment status & progress
      const userId = req.user ? req.user.id : null;
      const enriched = courses.map(c => {
        const enr = userId ? EnrollmentModel.findByUserAndCourse(userId, c.id) : null;
        return {
          ...c,
          isEnrolled: !!enr,
          progressPercent: enr ? enr.progressPercent : 0,
          enrollmentStatus: enr ? enr.status : "not_enrolled"
        };
      });

      return res.status(200).json({
        success: true,
        count: enriched.length,
        courses: enriched
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const course = CourseModel.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }

      const userId = req.user ? req.user.id : null;
      const enrollment = userId ? EnrollmentModel.findByUserAndCourse(userId, id) : null;

      return res.status(200).json({
        success: true,
        course,
        enrollment
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async createCourse(req, res) {
    try {
      const courseData = req.body;
      if (!courseData.title || !courseData.description) {
        return res.status(400).json({ success: false, error: "Title and description are required" });
      }

      if (req.user) {
        courseData.trainerId = req.user.id;
        courseData.trainerName = req.user.name;
        courseData.institute = courseData.institute || req.user.institute;
      }

      const newCourse = CourseModel.create(courseData);
      return res.status(201).json({
        success: true,
        message: "Course published successfully",
        course: newCourse
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async enrollCourse(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : req.body.userId || "usr_employee_01";

      const course = CourseModel.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }

      const enrollment = EnrollmentModel.enroll(userId, id);
      return res.status(200).json({
        success: true,
        message: `Successfully enrolled in ${course.title}`,
        enrollment
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : req.body.userId || "usr_employee_01";
      const progressData = req.body;

      const updated = EnrollmentModel.updateProgress(userId, id, progressData);
      return res.status(200).json({
        success: true,
        enrollment: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async addNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : req.body.userId || "usr_employee_01";
      const { timestamp, text } = req.body;

      if (!text) {
        return res.status(400).json({ success: false, error: "Note text cannot be empty" });
      }

      const notes = EnrollmentModel.addNote(userId, id, { timestamp, text });
      return res.status(200).json({
        success: true,
        notes
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async addLesson(req, res) {
    try {
      const { id } = req.params;
      const lessonData = req.body;
      if (!lessonData.title) {
        return res.status(400).json({ success: false, error: "Lesson title is required" });
      }

      const lesson = CourseModel.addLesson(id, lessonData);
      if (!lesson) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }

      return res.status(201).json({
        success: true,
        message: "Lesson video uploaded successfully",
        lesson
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async addQuestion(req, res) {
    try {
      const { id } = req.params;
      const questionData = req.body;
      if (!questionData.question) {
        return res.status(400).json({ success: false, error: "Question prompt is required" });
      }

      const question = CourseModel.addQuestion(id, questionData);
      if (!question) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }

      return res.status(201).json({
        success: true,
        message: "Assessment question added successfully",
        question
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const course = CourseModel.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }

      // Security check: Only course instructor or Admin can update
      if (req.user && req.user.role !== "admin" && course.trainerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Forbidden. Only the course creator or Executive Directorate (Admin) can modify this course."
        });
      }

      const updated = CourseModel.update(id, req.body);
      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      
      // Security check: Only Admin can delete courses
      if (req.user && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden. Only Executive Directorate (Admin) has permission to delete courses."
        });
      }

      const removed = CourseModel.delete(id);
      if (!removed) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }

      return res.status(200).json({
        success: true,
        message: `Course '${removed.title}' has been successfully deleted`,
        deletedId: id
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new CourseController();
