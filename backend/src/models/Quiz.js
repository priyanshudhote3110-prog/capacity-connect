/**
 * Quiz.js - Quiz & Assessment Model
 */

const CourseModel = require("./Course.js");

class QuizModel {
  constructor() {
    this.submissions = new Map(); // submissionId -> submissionData
  }

  getQuizByCourseId(courseId) {
    const course = CourseModel.findById(courseId);
    if (!course || !course.quiz) return null;
    return {
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      institute: course.institute,
      ...course.quiz
    };
  }

  evaluateSubmission(submissionData) {
    const { userId, courseId, answers } = submissionData;
    const course = CourseModel.findById(courseId);
    if (!course || !course.quiz) {
      throw new Error("Course or Quiz not found");
    }

    const quiz = course.quiz;
    const questions = quiz.questions || [];
    let correctCount = 0;
    const topicBreakdown = {};
    const itemReview = [];

    questions.forEach((q, idx) => {
      const selectedIndex = answers[q.id] !== undefined ? answers[q.id] : -1;
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;

      const topic = q.topic || "General";
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { total: 0, correct: 0 };
      }
      topicBreakdown[topic].total++;
      if (isCorrect) topicBreakdown[topic].correct++;

      itemReview.push({
        id: q.id,
        question: q.question,
        selectedOption: selectedIndex >= 0 && q.options ? q.options[selectedIndex] : "Not Answered",
        correctOption: q.options ? q.options[q.correctIndex] : "",
        isCorrect,
        topic,
        explanation: q.explanation || ""
      });
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100 * 10) / 10 : 0;
    const passingScore = quiz.passingScore || 70;
    const isPassed = percentage >= passingScore;

    const submissionId = "sub_" + Date.now().toString(36);
    const result = {
      id: submissionId,
      userId,
      courseId,
      courseTitle: course.title,
      institute: course.institute,
      quizTitle: quiz.title,
      score: percentage,
      correctCount,
      totalQuestions,
      passingScore,
      isPassed,
      topicBreakdown,
      itemReview,
      submittedAt: new Date().toISOString()
    };

    this.submissions.set(submissionId, result);
    return result;
  }

  getSubmissionById(submissionId) {
    return this.submissions.get(submissionId) || null;
  }

  getSubmissionsByUserId(userId) {
    return Array.from(this.submissions.values()).filter(s => s.userId === userId);
  }
}

module.exports = new QuizModel();
