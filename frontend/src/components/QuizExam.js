/**
 * QuizExam.js - Timed Exam Portal, Question Palette Grid & Diagnostic Scorecard
 * Capacity Connect LMS — MoES Govt of India
 * Dynamic Exam Timers & Professional Vector Iconography
 */

class QuizExamComponent {
  constructor(appState) {
    this.appState = appState;
    this.currentQuestionIndex = 0;
    this.userAnswers = {}; // questionId -> optionIndex
    this.markedForReview = new Set();
    this.timeRemainingSeconds = null;
    this.timerInterval = null;
    this.isSubmitted = false;
    this.scorecard = null;
    this.earnedCertificate = null;
    this.activeCourseId = null;
  }

  startTimer(container) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timeRemainingSeconds > 0 && !this.isSubmitted) {
        this.timeRemainingSeconds--;
        const timerEl = container.querySelector("#exam-timer-display");
        if (timerEl) {
          const mins = Math.floor(this.timeRemainingSeconds / 60);
          const secs = this.timeRemainingSeconds % 60;
          timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          
          // Visual urgency when under 2 minutes
          if (this.timeRemainingSeconds <= 120) {
            timerEl.parentElement.style.color = "var(--emergency-red)";
            timerEl.parentElement.style.fontWeight = "800";
          }
        }
      } else if (this.timeRemainingSeconds <= 0 && !this.isSubmitted) {
        clearInterval(this.timerInterval);
        alert("Time limit expired! Automatically submitting examination.");
        this.submitExam(container);
      }
    }, 1000);
  }

  render(container) {
    const course = this.appState.activeCourseForQuiz || (this.appState.courses && this.appState.courses[0]);
    if (!course || !course.quiz) {
      container.innerHTML = `
        <div class="app-container" style="padding-top: 40px; text-align: center;">
          <div class="card" style="padding: 40px; max-width: 600px; margin: 0 auto;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--saffron-gold)" stroke-width="2" style="margin-bottom: 16px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h3>No Assessment Assigned Yet</h3>
            <p style="color: var(--text-muted); margin: 12px 0 20px;">Faculty specialists are preparing the question bank for this course.</p>
            <button class="btn btn-primary" onclick="window.app.navigate('courses')">Back to Courses</button>
          </div>
        </div>
      `;
      return;
    }

    const quiz = course.quiz;
    const questions = quiz.questions || [];

    // Initialize timer based on course settings
    if (this.activeCourseId !== course.id || this.timeRemainingSeconds === null) {
      this.activeCourseId = course.id;
      const limitMinutes = Number(quiz.timeLimitMinutes || 15);
      this.timeRemainingSeconds = limitMinutes * 60;
      this.isSubmitted = false;
      this.scorecard = null;
      this.userAnswers = {};
      this.markedForReview.clear();
      this.currentQuestionIndex = 0;
    }

    // If already submitted, render Diagnostic Scorecard
    if (this.isSubmitted && this.scorecard) {
      this.renderScorecard(container, course);
      return;
    }

    const currentQ = questions[this.currentQuestionIndex] || questions[0];
    const mins = Math.floor(this.timeRemainingSeconds / 60);
    const secs = this.timeRemainingSeconds % 60;
    const isTrainerOrAdmin = this.appState.currentUser && (this.appState.currentUser.role === "trainer" || this.appState.currentUser.role === "admin");

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 40px;">
        
        <!-- Top Banner with Exam Title & Countdown Clock -->
        <div class="exam-topbar">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">MoES Official National Accreditation</span>
              <span class="role-tag ${course.institute.toLowerCase()}">${course.institute}</span>
            </div>
            <h3 style="color: #FFF; margin-top: 4px; font-size: 1.25rem;">${quiz.title}</h3>
            <span style="font-size: 0.8125rem; color: #CBD5E1;">Course: ${course.title} (${course.code}) · Benchmark: ${quiz.passingScore || 75}% to qualify</span>
          </div>

          <div style="display: flex; align-items: center; gap: 16px;">
            ${isTrainerOrAdmin ? `
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-outline btn-sm" id="btn-edit-exam-settings" style="border-color: rgba(255,255,255,0.3); color: #FFF; font-size: 0.75rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Edit Timer / Add Questions
                </button>
                <button class="btn btn-outline btn-sm" id="btn-delete-active-exam" style="border-color: rgba(239, 68, 68, 0.5); color: #FCA5A5; font-size: 0.75rem; background: rgba(239, 68, 68, 0.15);">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  Delete Exam / परीक्षा हटाएं
                </button>
              </div>
            ` : ''}

            <div style="text-align: right; background: rgba(0,0,0,0.25); padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="font-size: 0.7rem; color: #94A3B8; display: block; font-weight: 700;">COUNTDOWN TIMER</span>
              <div class="exam-timer" style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 1.15rem; color: #FFF;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--saffron-gold)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span id="exam-timer-display">${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Exam Layout: Question Area (70%) & Question Palette (30%) -->
        <div class="card exam-layout-grid" style="border-top-left-radius: 0; border-top-right-radius: 0; display: grid; grid-template-columns: 2.5fr 1fr; gap: 30px; padding: 30px;">
          
          <!-- Question Container -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-light);">
              <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary-navy);">
                Question ${this.currentQuestionIndex + 1} of ${questions.length}
              </span>
              <span class="role-tag" style="background: var(--bg-subtle); color: var(--primary-navy); border: 1px solid var(--border-medium);">
                Topic: ${currentQ ? (currentQ.topic || 'General Science') : 'General'}
              </span>
            </div>

            ${currentQ ? `
              <p style="font-size: 1.05rem; font-weight: 600; line-height: 1.6; margin-bottom: 24px; color: var(--text-main);">
                ${currentQ.question}
              </p>

              <!-- Options Radio List -->
              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
                ${(currentQ.options || []).map((opt, idx) => {
                  const isSelected = this.userAnswers[currentQ.id] === idx;
                  return `
                    <label class="exam-option-card ${isSelected ? 'selected' : ''}" data-idx="${idx}" style="display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: 1px solid ${isSelected ? 'var(--ocean-cyan)' : 'var(--border-medium)'}; background: ${isSelected ? 'rgba(0, 141, 218, 0.05)' : 'var(--bg-surface)'}; border-radius: 8px; cursor: pointer; transition: all 0.15s ease;">
                      <input type="radio" name="exam_q_${currentQ.id}" value="${idx}" ${isSelected ? 'checked' : ''} style="display: none;" />
                      <div class="option-indicator" style="width: 26px; height: 26px; border-radius: 50%; border: 2px solid ${isSelected ? 'var(--ocean-cyan)' : 'var(--border-medium)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: ${isSelected ? '#FFF' : 'var(--text-muted)'}; background: ${isSelected ? 'var(--ocean-cyan)' : 'transparent'}; flex-shrink: 0;">
                        ${String.fromCharCode(65 + idx)}
                      </div>
                      <span style="font-size: 0.95rem; color: var(--text-main); font-weight: ${isSelected ? '600' : '400'};">${opt}</span>
                    </label>
                  `;
                }).join('')}
              </div>

              <!-- Navigation & Review Action Buttons -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-light);">
                <div style="display: flex; gap: 10px;">
                  <button class="btn btn-outline btn-sm" id="btn-mark-review" style="border-color: #A855F7; color: #9333EA;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    ${this.markedForReview.has(currentQ.id) ? 'Unmark Review' : 'Mark for Review'}
                  </button>
                  <button class="btn btn-outline btn-sm" id="btn-clear-response">
                    Clear Answer
                  </button>
                </div>

                <div style="display: flex; gap: 10px;">
                  <button class="btn btn-outline" id="btn-prev-q" ${this.currentQuestionIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    ← Previous
                  </button>
                  <button class="btn btn-primary" id="btn-next-q">
                    ${this.currentQuestionIndex === questions.length - 1 ? 'Save & Finish' : 'Next Question →'}
                  </button>
                </div>
              </div>
            ` : `
              <p>No questions found in this assessment.</p>
            `}
          </div>

          <!-- Question Palette Sidebar -->
          <div style="border-left: 1px solid var(--border-light); padding-left: 24px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: var(--primary-navy); display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Question Palette
            </h4>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px;">
              ${questions.map((q, idx) => {
                const isAnswered = this.userAnswers[q.id] !== undefined;
                const isReview = this.markedForReview.has(q.id);
                const isCurrent = this.currentQuestionIndex === idx;

                let stateClass = "unanswered";
                if (isReview) stateClass = "review";
                else if (isAnswered) stateClass = "answered";

                return `
                  <button class="palette-node ${stateClass} ${isCurrent ? 'active' : ''}" data-idx="${idx}" style="height: 38px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; border: ${isCurrent ? '2px solid var(--primary-navy)' : '1px solid var(--border-medium)'}; cursor: pointer; transition: transform 0.1s;">
                    ${idx + 1}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Legend -->
            <div style="font-size: 0.75rem; display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; padding: 14px; background: var(--bg-subtle); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background: var(--forest-green); display: inline-block;"></span>
                <span>Answered</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background: #9333EA; display: inline-block;"></span>
                <span>Marked for Review</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background: #E2E8F0; border: 1px solid #CBD5E1; display: inline-block;"></span>
                <span>Unanswered</span>
              </div>
            </div>

            <!-- Submit Examination Button -->
            <button class="btn btn-saffron" id="btn-submit-exam" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; font-size: 0.95rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"/></svg>
              Final Submit Assessment
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, course, questions);
    this.startTimer(container);
  }

  bindEvents(container, course, questions) {
    const currentQ = questions[this.currentQuestionIndex];

    // Option selection
    container.querySelectorAll(".exam-option-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.getAttribute("data-idx"));
        if (currentQ) {
          this.userAnswers[currentQ.id] = idx;
          this.render(container);
        }
      });
    });

    // Mark for review
    const reviewBtn = container.querySelector("#btn-mark-review");
    if (reviewBtn && currentQ) {
      reviewBtn.addEventListener("click", () => {
        if (this.markedForReview.has(currentQ.id)) {
          this.markedForReview.delete(currentQ.id);
        } else {
          this.markedForReview.add(currentQ.id);
        }
        this.render(container);
      });
    }

    // Clear response
    const clearBtn = container.querySelector("#btn-clear-response");
    if (clearBtn && currentQ) {
      clearBtn.addEventListener("click", () => {
        delete this.userAnswers[currentQ.id];
        this.render(container);
      });
    }

    // Prev / Next
    const prevBtn = container.querySelector("#btn-prev-q");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentQuestionIndex > 0) {
          this.currentQuestionIndex--;
          this.render(container);
        }
      });
    }

    const nextBtn = container.querySelector("#btn-next-q");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentQuestionIndex < questions.length - 1) {
          this.currentQuestionIndex++;
          this.render(container);
        } else {
          // If on last question, prompt submit
          if (confirm("You are at the last question. Would you like to submit your examination now?")) {
            this.submitExam(container);
          }
        }
      });
    }

    // Palette direct jump
    container.querySelectorAll(".palette-node").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.getAttribute("data-idx"));
        this.currentQuestionIndex = idx;
        this.render(container);
      });
    });

    // Faculty shortcut
    const facultyBtn = container.querySelector("#btn-edit-exam-settings");
    if (facultyBtn && this.appState.facultyStudio) {
      facultyBtn.addEventListener("click", () => {
        this.appState.facultyStudio.open("timer");
      });
    }

    // Delete active exam
    const deleteExamBtn = container.querySelector("#btn-delete-active-exam");
    if (deleteExamBtn) {
      deleteExamBtn.addEventListener("click", async () => {
        const confirmed = confirm(`Are you sure you want to permanently delete the examination for:\n\n"${course.title}"?\n\nThis will remove all questions, timer benchmarks, and certification access for this course.`);
        if (confirmed) {
          if (this.timerInterval) clearInterval(this.timerInterval);
          await this.appState.deleteQuiz(course.id);
          this.appState.navigate("courses");
        }
      });
    }

    // Final submit
    const submitBtn = container.querySelector("#btn-submit-exam");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const answeredCount = Object.keys(this.userAnswers).length;
        const total = questions.length;
        if (confirm(`Submit examination now?\n\nAnswered: ${answeredCount} / ${total}\nUnanswered: ${total - answeredCount}`)) {
          this.submitExam(container);
        }
      });
    }
  }

  submitExam(container) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const course = this.appState.activeCourseForQuiz || (this.appState.courses && this.appState.courses[0]);
    const quiz = course.quiz;
    const questions = quiz.questions || [];

    let scorePoints = 0;
    const topicBreakdown = {};

    questions.forEach(q => {
      const topic = q.topic || "Core Scientific Principles";
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { total: 0, correct: 0 };
      }
      topicBreakdown[topic].total++;

      const userSelected = this.userAnswers[q.id];
      if (userSelected !== undefined && userSelected === q.correctIndex) {
        scorePoints++;
        topicBreakdown[topic].correct++;
      }
    });

    const totalQuestions = questions.length || 1;
    const scorePct = Math.round((scorePoints / totalQuestions) * 100);
    const passThreshold = Number(quiz.passingScore || 70);
    const isPassed = scorePct >= passThreshold;

    this.scorecard = {
      scorePct,
      correctCount: scorePoints,
      totalQuestions,
      isPassed,
      passThreshold,
      topicBreakdown
    };

    if (isPassed) {
      const user = this.appState.currentUser || { name: "Dr. Rajesh Sharma", customRoleId: "EMP-001" };
      this.earnedCertificate = {
        certificateNumber: `MOES-CC-${new Date().getFullYear()}-${course.institute}-${Math.floor(10000 + Math.random() * 90000)}`,
        userName: user.name,
        customRoleId: user.customRoleId || "EMP-001",
        courseTitle: course.title,
        institute: course.institute,
        score: scorePct,
        issuedDate: new Date().toISOString(),
        digitalSignatureHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      };

      if (!this.appState.certificates) this.appState.certificates = [];
      this.appState.certificates.unshift(this.earnedCertificate);
      this.appState.activeCertificate = this.earnedCertificate;
      if (this.appState.saveLocalDb) this.appState.saveLocalDb();
    }

    this.isSubmitted = true;
    this.renderScorecard(container, course);
  }

  renderScorecard(container, course) {
    const sc = this.scorecard;
    const cert = this.earnedCertificate;

    container.innerHTML = `
      <div class="app-container" style="padding-top: 30px; padding-bottom: 60px;">
        <div class="card" style="max-width: 820px; margin: 0 auto; padding: 40px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: ${sc.isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border: 2px solid ${sc.isPassed ? 'var(--forest-green)' : 'var(--emergency-red)'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              ${sc.isPassed ? `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--forest-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ` : `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--emergency-red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              `}
            </div>

            <span class="role-tag ${course.institute.toLowerCase()}">${course.institute}</span>
            <h2 style="font-size: 1.6rem; color: var(--primary-navy); margin-top: 8px;">
              ${sc.isPassed ? 'Assessment Cleared Successfully!' : 'Benchmark Not Met'}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 6px;">
              ${course.title} (${course.code})
            </p>
          </div>

          <!-- Score Metrics Row -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px;">
            <div style="background: var(--bg-subtle); padding: 18px; border-radius: 10px; text-align: center; border: 1px solid var(--border-light);">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Final Score</span>
              <div style="font-size: 1.8rem; font-weight: 800; color: ${sc.isPassed ? 'var(--forest-green)' : 'var(--emergency-red)'}; margin-top: 4px;">
                ${sc.scorePct}%
              </div>
            </div>

            <div style="background: var(--bg-subtle); padding: 18px; border-radius: 10px; text-align: center; border: 1px solid var(--border-light);">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Correct Responses</span>
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary-navy); margin-top: 4px;">
                ${sc.correctCount} / ${sc.totalQuestions}
              </div>
            </div>

            <div style="background: var(--bg-subtle); padding: 18px; border-radius: 10px; text-align: center; border: 1px solid var(--border-light);">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Passing Threshold</span>
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">
                ${sc.passThreshold}%
              </div>
            </div>
          </div>

          <!-- Certificate Action Prompt -->
          ${sc.isPassed && cert ? `
            <div style="background: linear-gradient(135deg, #07172C 0%, #13335D 100%); color: #FFF; padding: 24px; border-radius: var(--radius-lg); margin-bottom: 36px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-left: 4px solid var(--saffron-gold);">
              <div>
                <h3 style="color: #FF9933; margin-bottom: 6px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                  Official Digital Certificate Issued!
                </h3>
                <p style="font-size: 0.85rem; color: #CBD5E1; margin: 0;">
                  Certificate ID: <code style="color: #38BDF8; font-weight: 600;">${cert.certificateNumber}</code>. Verifiable on national repository.
                </p>
              </div>
              <button class="btn btn-saffron" id="btn-view-earned-cert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                View & Download Certificate
              </button>
            </div>
          ` : ''}

          <!-- Diagnostic Topic Breakdown -->
          <h4 style="margin-bottom: 16px; font-size: 1rem; color: var(--primary-navy);">Diagnostic Topic-Wise Performance Breakdown</h4>
          <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px;">
            ${Object.entries(sc.topicBreakdown || {}).map(([topic, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
                    <span>${topic}</span>
                    <span>${data.correct}/${data.total} (${pct}%)</span>
                  </div>
                  <div style="height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${pct >= sc.passThreshold ? 'var(--forest-green)' : 'var(--saffron-gold)'};"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            <button class="btn btn-outline" id="btn-retake-exam">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              Retake Assessment
            </button>
            <button class="btn btn-primary" id="btn-back-courses">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
              Browse Other MoES Courses
            </button>
          </div>

        </div>
      </div>
    `;

    const certBtn = container.querySelector("#btn-view-earned-cert");
    if (certBtn) {
      certBtn.addEventListener("click", () => {
        this.appState.activeCertificate = cert;
        this.appState.navigate("certificates");
      });
    }

    const retakeBtn = container.querySelector("#btn-retake-exam");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        this.isSubmitted = false;
        this.scorecard = null;
        this.userAnswers = {};
        this.markedForReview.clear();
        this.timeRemainingSeconds = null;
        this.render(container);
      });
    }

    const backCoursesBtn = container.querySelector("#btn-back-courses");
    if (backCoursesBtn) {
      backCoursesBtn.addEventListener("click", () => this.appState.navigate("courses"));
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = QuizExamComponent;
}
