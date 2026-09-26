/**
 * quizController.js - Quiz Exam, Grading, Scorecard & Certificate Issuance Controller
 */

const QuizModel = require("../models/Quiz.js");
const CertificateModel = require("../models/Certificate.js");
const EnrollmentModel = require("../models/Enrollment.js");
const UserModel = require("../models/User.js");

class QuizController {
  async getQuizByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const quiz = QuizModel.getQuizByCourseId(courseId);
      if (!quiz) {
        return res.status(404).json({ success: false, error: "Quiz not found for this course" });
      }

      // Hide correct answers from test taker during the exam
      const sanitizedQuestions = (quiz.questions || []).map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        topic: q.topic
      }));

      return res.status(200).json({
        success: true,
        quiz: {
          ...quiz,
          questions: sanitizedQuestions
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async submitQuiz(req, res) {
    try {
      const { courseId, answers } = req.body;
      const userId = req.user ? req.user.id : req.body.userId || "usr_employee_01";
      const user = UserModel.findById(userId);

      if (!courseId || !answers) {
        return res.status(400).json({ success: false, error: "courseId and answers are required" });
      }

      const scorecard = QuizModel.evaluateSubmission({
        userId,
        courseId,
        answers
      });

      let certificate = null;

      // If learner achieved passing score, issue official certificate & award Knowledge Points
      if (scorecard.isPassed) {
        certificate = CertificateModel.create({
          userId: user ? user.id : userId,
          userName: user ? user.name : "MoES Candidate",
          customRoleId: user ? user.customRoleId : "EMP-001",
          courseId: scorecard.courseId,
          courseTitle: scorecard.courseTitle,
          institute: scorecard.institute,
          score: scorecard.score
        });

        // Update enrollment to completed with certificate
        EnrollmentModel.updateProgress(userId, courseId, {
          progressPercent: 100,
          score: scorecard.score,
          certificateId: certificate.id
        });

        // Award 500 Knowledge Points and bump streak
        if (user) {
          UserModel.update(user.id, {
            knowledgePoints: (user.knowledgePoints || 0) + 500,
            learningStreak: (user.learningStreak || 1) + 1
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: scorecard.isPassed
          ? `Congratulations! You passed with ${scorecard.score}% and earned an Official Certificate.`
          : `Assessment completed. Score: ${scorecard.score}%. Passing score is ${scorecard.passingScore}%.`,
        scorecard,
        certificate
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getSubmission(req, res) {
    try {
      const { id } = req.params;
      const sub = QuizModel.getSubmissionById(id);
      if (!sub) {
        return res.status(404).json({ success: false, error: "Submission not found" });
      }
      return res.status(200).json({ success: true, submission: sub });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new QuizController();
