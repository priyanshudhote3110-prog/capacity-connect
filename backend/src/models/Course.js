/**
 * Course.js - Course Model connected to persistent Database Engine
 */

const db = require("../database.js");

class CourseModel {
  findAll(filters = {}) {
    return db.getCourses(filters);
  }

  findById(id) {
    return db.getCourseById(id);
  }

  create(courseData) {
    const id = courseData.id || "crs_" + Date.now().toString(36);
    const newCourse = {
      id,
      code: courseData.code || "MOES-" + (courseData.institute || "IMD") + "-" + Math.floor(100 + Math.random() * 900),
      title: courseData.title,
      description: courseData.description,
      category: courseData.category || "Earth Sciences",
      institute: courseData.institute || "IMD",
      trainerId: courseData.trainerId || "usr_trainer_01",
      trainerName: courseData.trainerName || "Dr. Anita Desai",
      level: courseData.level || "Intermediate",
      durationMinutes: Number(courseData.durationMinutes || 120),
      thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80",
      isMandatory: !!courseData.isMandatory,
      deadline: courseData.deadline || null,
      status: "published",
      tags: courseData.tags || [courseData.institute || "MoES"],
      modules: courseData.modules || [
        {
          id: "mod_01",
          title: "Module 1: General Video Lectures",
          lessons: []
        }
      ],
      quiz: courseData.quiz || {
        id: "qnz_" + Date.now().toString(36),
        title: `${courseData.title} Examination`,
        passingScore: 75,
        timeLimitMinutes: 15,
        questions: []
      }
    };

    return db.addCourse(newCourse);
  }

  update(id, updates) {
    return db.updateCourse(id, updates);
  }

  delete(id) {
    return db.deleteCourse(id);
  }

  addLesson(courseId, lesson) {
    return db.addLessonToCourse(courseId, lesson);
  }

  addQuestion(courseId, questionData) {
    return db.addQuestionToQuiz(courseId, questionData);
  }

  updateQuizSettings(courseId, settings) {
    return db.updateQuizSettings(courseId, settings);
  }
}

module.exports = new CourseModel();
