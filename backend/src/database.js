/**
 * database.js - Persistent JSON Database Engine for Capacity Connect LMS
 * Provides atomic read/write operations on database/db.json
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../../database/db.json");

class DatabaseEngine {
  constructor() {
    this.data = {
      users: [],
      courses: [],
      liveClasses: [],
      discussions: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf8");
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error("[Database] Error loading db.json:", err.message);
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      console.error("[Database] Error saving db.json:", err.message);
    }
  }

  // Course Queries
  getCourses(filters = {}) {
    let list = this.data.courses || [];
    if (filters.institute && filters.institute !== "ALL") {
      list = list.filter(c => c.institute === filters.institute);
    }
    if (filters.category && filters.category !== "ALL") {
      list = list.filter(c => (c.category || "").toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.code || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (c.institute || "").toLowerCase().includes(q)
      );
    }
    return list;
  }

  getCourseById(id) {
    return (this.data.courses || []).find(c => c.id === id) || null;
  }

  addCourse(course) {
    if (!this.data.courses) this.data.courses = [];
    this.data.courses.unshift(course);
    this.save();
    return course;
  }

  updateCourse(id, updates) {
    const idx = (this.data.courses || []).findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
      this.save();
      return this.data.courses[idx];
    }
    return null;
  }

  deleteCourse(id) {
    const idx = (this.data.courses || []).findIndex(c => c.id === id);
    if (idx !== -1) {
      const removed = this.data.courses.splice(idx, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  addLessonToCourse(courseId, lesson) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    if (!course.modules || course.modules.length === 0) {
      course.modules = [{
        id: "mod_" + Date.now().toString(36),
        title: "Module 1: General Video Lectures",
        lessons: []
      }];
    }

    const targetModule = course.modules[0];
    if (!targetModule.lessons) targetModule.lessons = [];

    const newLesson = {
      id: "les_" + Date.now().toString(36),
      title: lesson.title || "New Video Lecture",
      duration: lesson.duration || "15:00",
      durationMinutes: lesson.durationMinutes || 15,
      videoUrl: lesson.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      summary: lesson.summary || "Faculty uploaded instructional lecture"
    };

    targetModule.lessons.push(newLesson);
    this.save();
    return newLesson;
  }

  addQuestionToQuiz(courseId, questionData) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    if (!course.quiz) {
      course.quiz = {
        id: "qnz_" + Date.now().toString(36),
        title: `${course.title} Examination`,
        passingScore: 70,
        timeLimitMinutes: 15,
        questions: []
      };
    }

    if (!course.quiz.questions) course.quiz.questions = [];

    const newQ = {
      id: "q_" + Date.now().toString(36),
      question: questionData.question,
      options: questionData.options || ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: Number(questionData.correctIndex || 0),
      topic: questionData.topic || "Core Domain Competency",
      explanation: questionData.explanation || "Official MoES standard procedure."
    };

    course.quiz.questions.push(newQ);
    this.save();
    return newQ;
  }

  updateQuizSettings(courseId, settings) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    if (!course.quiz) {
      course.quiz = {
        id: "qnz_" + Date.now().toString(36),
        title: `${course.title} Examination`,
        passingScore: 70,
        timeLimitMinutes: 15,
        questions: []
      };
    }

    if (settings.timeLimitMinutes !== undefined) {
      course.quiz.timeLimitMinutes = Number(settings.timeLimitMinutes);
    }
    if (settings.passingScore !== undefined) {
      course.quiz.passingScore = Number(settings.passingScore);
    }
    if (settings.title) {
      course.quiz.title = settings.title;
    }

    this.save();
    return course.quiz;
  }

  // Users & Analytics
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return (this.data.users || []).find(u => u.id === id) || null;
  }

  getLiveClasses() {
    return this.data.liveClasses || [];
  }

  getDiscussions() {
    return this.data.discussions || [];
  }
}

const dbInstance = new DatabaseEngine();
module.exports = dbInstance;
