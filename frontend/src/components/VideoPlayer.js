/**
 * VideoPlayer.js - YouTube-Style Video Player, Playlist Sidebar & Timestamped Notes
 * Capacity Connect LMS — MoES Govt of India
 */

class VideoPlayerComponent {
  constructor(appState) {
    this.appState = appState;
    this.currentCourseId = "crs_dwr_401";
    this.currentLessonIndex = 0;
  }

  render(container) {
    const courses = this.appState.courses || [];
    const course = courses.find(c => c.id === this.currentCourseId) || courses[0];

    if (!course) {
      container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;">No course selected.</div>`;
      return;
    }

    const modules = course.modules || [];
    // Collect all lessons flat
    const allLessons = [];
    modules.forEach(m => {
      (m.lessons || []).forEach(l => {
        allLessons.push({ ...l, moduleTitle: m.title });
      });
    });

    const activeLesson = allLessons[this.currentLessonIndex] || allLessons[0] || {
      title: course.title,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "18:45"
    };

    const notes = (course.notes || []);

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 40px;">
        <!-- Breadcrumb & Header -->
        <div style="margin-bottom: 20px;">
          <a style="cursor: pointer; font-size: 0.85rem; color: var(--ocean-cyan);" id="back-to-catalog">← Back to All Courses</a>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="role-tag ${course.institute.toLowerCase()}">${course.institute}</span>
              <h2 style="margin-top: 4px;">${course.title}</h2>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Instructor: ${course.trainerName} · Level: ${course.level}</p>
            </div>
            <div>
              <button class="btn btn-saffron" id="btn-jump-quiz">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Take Certification Exam
              </button>
            </div>
          </div>
        </div>

        <!-- Video Player Grid: Main Player (70%) & Playlist Accordion (30%) -->
        <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px;" class="video-layout-grid">
          
          <!-- Left Column: Video + Controls + Notes -->
          <div>
            <!-- Video Container -->
            <div style="position: relative; background: #000; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 16/9; box-shadow: var(--shadow-lg);">
              <video 
                id="main-video-player"
                src="${activeLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}" 
                poster="${activeLesson.thumbnailUrl || activeLesson.bannerUrl || course.thumbnail || ''}"
                controls 
                style="width: 100%; height: 100%; object-fit: cover;"
              ></video>
            </div>

            <!-- Video Info & Speed Selector Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; background: var(--bg-surface); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div>
                <h3 style="font-size: 1.1rem; margin-bottom: 4px;">${activeLesson.title}</h3>
                <span style="font-size: 0.8125rem; color: var(--text-muted);">Duration: ${activeLesson.duration || '15:00'} · Lesson ${this.currentLessonIndex + 1} of ${allLessons.length || 1}</span>
                ${activeLesson.summary ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">${activeLesson.summary}</p>` : ''}
              </div>

              <!-- Speed Switcher -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted);">Speed:</span>
                <select id="playback-speed-select" class="form-control" style="width: auto; padding: 4px 10px; font-size: 0.8125rem;">
                  <option value="0.75">0.75x</option>
                  <option value="1.0" selected>1.0x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>
            </div>

            <!-- Timestamped Personal Notes Taking Section -->
            <div class="card" style="margin-top: 20px;">
              <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Timestamped Study Notes
              </h4>
              <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                <input type="text" class="form-control" id="note-input" placeholder="Type a key observation or operational formula..." />
                <button class="btn btn-primary btn-sm" id="btn-add-note" style="white-space: nowrap;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="12" y1="17" x2="12" y2="3"/><line x1="5" y1="10" x2="12" y2="3"/><line x1="19" y1="10" x2="12" y2="3"/><line x1="5" y1="21" x2="19" y2="21"/></svg> Add Note at Timestamp
                </button>
              </div>

              <div id="notes-list" style="display: flex; flex-direction: column; gap: 8px;">
                ${notes.length === 0 ? `
                  <div style="font-size: 0.8125rem; color: var(--text-muted); font-style: italic;">No personal notes yet. Add one while watching!</div>
                ` : notes.map(n => `
                  <div style="display: flex; align-items: center; gap: 12px; background: var(--bg-subtle); padding: 8px 14px; border-radius: var(--radius-sm); font-size: 0.85rem;">
                    <span style="background: var(--primary-navy); color: #FFF; font-family: monospace; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" class="seek-timestamp" data-time="${n.timestamp}">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${n.timestamp}
                    </span>
                    <span>${n.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: Course Playlist Accordion -->
          <div class="card" style="padding: 16px; max-height: 720px; overflow-y: auto;">
            <div style="font-weight: 700; font-size: 1rem; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
              <span>Course Playlist</span>
              <span style="font-size: 0.75rem; color: var(--ocean-cyan); font-weight: 600;">${allLessons.length} Lessons</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${allLessons.map((l, idx) => `
                <div 
                  class="playlist-item ${idx === this.currentLessonIndex ? 'active' : ''}" 
                  data-index="${idx}"
                  style="padding: 8px 10px; border-radius: var(--radius-md); background: ${idx === this.currentLessonIndex ? 'rgba(0, 141, 218, 0.1)' : 'var(--bg-subtle)'}; border: 1px solid ${idx === this.currentLessonIndex ? 'var(--ocean-cyan)' : 'transparent'}; cursor: pointer; transition: var(--transition);"
                >
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="width: 60px; height: 38px; border-radius: 6px; overflow: hidden; background: #0B192C; flex-shrink: 0; position: relative; border: 1px solid rgba(0,0,0,0.1);">
                      <img src="${l.thumbnailUrl || l.bannerUrl || course.thumbnail || 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=200'}" alt="" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=200'" />
                      <span style="position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.6rem; padding: 1px 4px; border-radius: 2px; font-family: monospace;">${l.duration || '12:00'}</span>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 0.825rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${idx === this.currentLessonIndex ? 'var(--ocean-cyan)' : 'var(--primary-navy)'};">
                        ${idx + 1}. ${l.title}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${l.moduleTitle || 'Module'}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Quiz CTA in Playlist -->
            <div style="margin-top: 24px; padding: 16px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-md); text-align: center;">
              <div style="font-weight: 700; color: #92400E; font-size: 0.9rem; margin-bottom: 4px;">Final Competency Test</div>
              <p style="font-size: 0.75rem; color: #B45309; margin-bottom: 12px;">Complete all modules to unlock the official Ministry qualification certificate.</p>
              <button class="btn btn-saffron btn-sm" id="btn-playlist-quiz" style="width: 100%;">
                Start Exam Now
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, course, allLessons);
  }

  bindEvents(container, course, allLessons) {
    const video = container.querySelector("#main-video-player");

    // Speed Selector
    const speedSelect = container.querySelector("#playback-speed-select");
    if (speedSelect && video) {
      speedSelect.addEventListener("change", (e) => {
        video.playbackRate = parseFloat(e.target.value);
      });
    }

    // Playlist Item clicks
    container.querySelectorAll(".playlist-item").forEach(item => {
      item.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
        this.currentLessonIndex = idx;
        this.render(container);
      });
    });

    // Add Note
    const addNoteBtn = container.querySelector("#btn-add-note");
    const noteInput = container.querySelector("#note-input");
    if (addNoteBtn && noteInput) {
      addNoteBtn.addEventListener("click", async () => {
        const text = noteInput.value.trim();
        if (!text) return;

        let curTime = "00:00";
        if (video && video.currentTime) {
          const mins = Math.floor(video.currentTime / 60);
          const secs = Math.floor(video.currentTime % 60);
          curTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        course.notes = course.notes || [];
        course.notes.push({ timestamp: curTime, text });
        noteInput.value = "";
        this.render(container);
      });
    }

    // Back to catalog
    const backBtn = container.querySelector("#back-to-catalog");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.appState.navigate("courses"));
    }

    // Jump to Quiz
    const quizBtn1 = container.querySelector("#btn-jump-quiz");
    const quizBtn2 = container.querySelector("#btn-playlist-quiz");
    const triggerQuiz = () => {
      this.appState.activeCourseForQuiz = course;
      this.appState.navigate("exam");
    };
    if (quizBtn1) quizBtn1.addEventListener("click", triggerQuiz);
    if (quizBtn2) quizBtn2.addEventListener("click", triggerQuiz);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = VideoPlayerComponent;
}
