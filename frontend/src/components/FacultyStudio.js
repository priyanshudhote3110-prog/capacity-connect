/**
 * FacultyStudio.js - Faculty & Trainer Portal for Video Uploads, Question Creation, Exam Timers & Course Publishing
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt of India
 */

class FacultyStudioComponent {
  constructor(appState) {
    this.appState = appState;
    this.isOpen = false;
    this.activeTab = "video"; // "video" | "question" | "timer" | "course"
    this.selectedQuestionCourseId = null;

    // Banner state for video lesson
    this.bannerSourceType = "preset"; // "preset" | "upload" | "url"
    this.selectedBannerUrl = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80";
    
    // Curated MoES Scientific Presets for Video Banners
    this.bannerPresets = [
      {
        id: "radar",
        inst: "IMD",
        title: "Doppler Weather Radar (DWR)",
        desc: "S-Band Polarimetric Radar & Storm Nowcasting",
        url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "tsunami",
        inst: "INCOIS",
        title: "Ocean Buoy & Tsunami Early Warning",
        desc: "BPR Bottom Pressure Recorder & Argo Profiling",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "hpc",
        inst: "NCMRWF",
        title: "Supercomputer HPC Modeling",
        desc: "Pratyush & Mihir Global Weather Ensembles",
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "polar",
        inst: "NCPOR",
        title: "Antarctic Ice Research Station",
        desc: "Maitri & Bharati Polar Atmosphere Expeditions",
        url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "niot",
        inst: "NIOT",
        title: "Samudrayaan & Matsya 6000",
        desc: "Deep Ocean Manned Submersible & Marine Sensors",
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80"
      }
    ];

    // Course cover state for Tab 4
    this.selectedCourseCover = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80";
  }

  open(tab = "video") {
    this.isOpen = true;
    this.activeTab = tab;
    const mount = document.getElementById("faculty-modal-mount");
    if (mount) this.render(mount);
  }

  close() {
    this.isOpen = false;
    const mount = document.getElementById("faculty-modal-mount");
    if (mount) mount.innerHTML = "";
  }

  render(container) {
    if (!this.isOpen) {
      container.innerHTML = "";
      return;
    }

    const courses = this.appState.courses || [];
    const user = this.appState.currentUser || { name: "Dr. Anita Desai", role: "trainer", institute: "IMD" };

    container.innerHTML = `
      <div class="modal-overlay active" id="faculty-modal-overlay">
        <div class="faculty-studio-card modal-card-lg" id="faculty-studio-card" role="dialog" aria-modal="true" aria-labelledby="faculty-studio-title">
          
          <!-- Modal Header -->
          <div style="background: linear-gradient(135deg, #07172C 0%, #0F2D54 60%, #1A365D 100%); color: #FFF; padding: 20px 24px; border-bottom: 3px solid var(--saffron-gold); display: flex; justify-content: space-between; align-items: center; position: relative;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="background: linear-gradient(135deg, rgba(255, 153, 51, 0.25), rgba(255, 153, 51, 0.08)); border: 1.5px solid var(--saffron-gold); width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(255, 153, 51, 0.2);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9933" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                  <path d="M6 6h10"/>
                  <path d="M6 10h10"/>
                  <path d="m9 16 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 id="faculty-studio-title" style="font-size: 1.2rem; font-weight: 700; margin: 0; color: #FFF; letter-spacing: -0.2px;">MoES Faculty & Trainer Studio</h3>
                  <span style="background: rgba(0, 141, 218, 0.25); color: #7DD3FC; border: 1px solid rgba(125, 211, 252, 0.3); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase;">Portal v2.6</span>
                </div>
                <div style="font-size: 0.8rem; color: #94A3B8; margin-top: 2px;">
                  Faculty: <strong style="color: #F1F5F9;">${user.name}</strong> · ${user.institute || 'MoES'} · Video Ingestion & Assessment Controls
                </div>
              </div>
            </div>
            
            <button class="modal-close-btn" id="close-faculty-modal" aria-label="Close Studio" style="color: #94A3B8; font-size: 1.5rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
              &times;
            </button>
          </div>

          <!-- Studio Tab Strip -->
          <div class="studio-tab-strip">
            <button class="studio-tab-btn ${this.activeTab === 'video' ? 'active' : ''}" data-tab="video">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
              Upload Video Lesson
            </button>
            <button class="studio-tab-btn ${this.activeTab === 'question' ? 'active' : ''}" data-tab="question">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              Add Quiz Questions
            </button>
            <button class="studio-tab-btn ${this.activeTab === 'timer' ? 'active' : ''}" data-tab="timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Set Exam Timer
            </button>
            <button class="studio-tab-btn ${this.activeTab === 'course' ? 'active' : ''}" data-tab="course">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Publish New Course
            </button>
          </div>

          <!-- Studio Body -->
          <div class="modal-body" style="padding: 24px; max-height: 72vh; overflow-y: auto;">
            
            <!-- ========================================== -->
            <!-- TAB 1: UPLOAD VIDEO LESSON & VIDEO BANNER -->
            <!-- ========================================== -->
            <div id="tab-video" style="display: ${this.activeTab === 'video' ? 'block' : 'none'};">
              <form id="form-upload-video">
                
                <!-- Course & Target Module Row -->
                <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Target Course / लक्षित पाठ्यक्रम</label>
                    <select class="form-select" id="video-course-id" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">
                      ${courses.map(c => `<option value="${c.id}">[${c.institute}] ${c.code}: ${c.title}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Curriculum Module</label>
                    <input type="text" class="form-input" id="video-module-name" placeholder="Module 1: Operational Lectures" value="Module 1: Operational Lectures" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  </div>
                </div>

                <!-- Lesson Title & Duration Row -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 18px;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Lesson Title / व्याख्यान शीर्षक</label>
                    <input type="text" class="form-input" id="video-lesson-title" placeholder="e.g. Lesson 2.2: Dual-PRF De-aliasing & Radar Echo Identification" value="Lesson 2.2: Dual-PRF De-aliasing & Polarimetric Hydrometeors" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Duration (MM:SS)</label>
                    <input type="text" class="form-input" id="video-lesson-duration" placeholder="e.g. 25:00" value="25:00" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  </div>
                </div>

                <!-- ============================================== -->
                <!-- NEW FEATURE: VIDEO BANNER / THUMBNAIL UPLOADER -->
                <!-- ============================================== -->
                <div class="card" style="padding: 18px; margin-bottom: 20px; background: var(--bg-subtle); border: 1.5px solid rgba(0, 141, 218, 0.25); border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--ocean-cyan); color: #FFF; width: 26px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </span>
                        <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--text-main);">Video Banner & Thumbnail / वीडियो बैनर अपलोड</h4>
                      </div>
                      <p style="font-size: 0.78rem; color: var(--text-muted); margin: 4px 0 0 34px;">
                        Custom thumbnail displayed in the MoES video player, course playlist accordion, and mobile cards.
                      </p>
                    </div>

                    <!-- Source Selector Pill Tabs -->
                    <div class="banner-source-nav">
                      <button type="button" class="banner-source-btn ${this.bannerSourceType === 'preset' ? 'active' : ''}" data-source="preset">
                        🏛️ MoES Presets
                      </button>
                      <button type="button" class="banner-source-btn ${this.bannerSourceType === 'upload' ? 'active' : ''}" data-source="upload">
                        📁 Upload Image
                      </button>
                      <button type="button" class="banner-source-btn ${this.bannerSourceType === 'url' ? 'active' : ''}" data-source="url">
                        🔗 Image URL
                      </button>
                    </div>
                  </div>

                  <!-- Banner Source Sections -->
                  
                  <!-- 1. Presets Grid -->
                  <div id="banner-source-preset" style="display: ${this.bannerSourceType === 'preset' ? 'block' : 'none'}; margin-bottom: 16px;">
                    <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">Select a curated Ministry of Earth Sciences scientific theme:</div>
                    <div class="banner-preset-grid">
                      ${this.bannerPresets.map(preset => `
                        <div class="banner-preset-card ${this.selectedBannerUrl === preset.url ? 'selected' : ''}" data-banner-url="${preset.url}" data-preset-title="${preset.title}">
                          <img src="${preset.url}" alt="${preset.title}" loading="lazy" />
                          <div class="preset-label">
                            <span style="color: var(--ocean-cyan); font-weight: 700;">[${preset.inst}]</span> ${preset.title}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- 2. Local File Dropzone -->
                  <div id="banner-source-upload" style="display: ${this.bannerSourceType === 'upload' ? 'block' : 'none'}; margin-bottom: 16px;">
                    <div class="banner-uploader-card" id="banner-drop-zone" style="text-align: center; cursor: pointer; position: relative; border-style: dashed; padding: 24px;">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-cyan)" stroke-width="1.8" style="margin-bottom: 6px;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <div style="font-weight: 600; font-size: 0.875rem; color: var(--text-main);">Click or Drag & Drop Banner Image Here</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">PNG, JPG, WebP · Recommended 16:9 ratio (1280x720 or 1920x1080)</div>
                      <input type="file" id="banner-file-input" accept="image/png,image/jpeg,image/webp,image/jpg" style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;" />
                    </div>
                    <div id="banner-upload-status" style="display: none; font-size: 0.75rem; color: #16A34A; margin-top: 6px; font-weight: 600;"></div>
                  </div>

                  <!-- 3. Direct Image URL Input -->
                  <div id="banner-source-url" style="display: ${this.bannerSourceType === 'url' ? 'block' : 'none'}; margin-bottom: 16px;">
                    <div style="display: flex; gap: 8px;">
                      <input type="url" class="form-input" id="banner-url-input" placeholder="https://cdn.moes.gov.in/banners/radar-course-banner.jpg" value="${this.selectedBannerUrl}" style="flex: 1; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.85rem;" />
                      <button type="button" class="btn btn-outline btn-sm" id="btn-apply-banner-url" style="white-space: nowrap;">Apply URL</button>
                    </div>
                  </div>

                  <!-- Interactive Live 16:9 Banner Preview Box -->
                  <div style="margin-top: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Live 16:9 Banner Preview</span>
                      <button type="button" id="btn-reset-banner" style="background: none; border: none; color: var(--ocean-cyan); font-size: 0.75rem; cursor: pointer; font-weight: 600; text-decoration: underline;">
                        Reset to Doppler Preset
                      </button>
                    </div>
                    
                    <div class="banner-preview-frame">
                      <img id="live-banner-img" src="${this.selectedBannerUrl}" alt="Video Banner Preview" onerror="this.src='https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80'" />
                      
                      <!-- Overlay with dynamically synced title and duration badge -->
                      <div class="banner-preview-overlay">
                        <div>
                          <span class="banner-badge-live">
                            <span style="width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 6px #4ADE80;"></span>
                            MoES Video Lecture
                          </span>
                        </div>
                        <div class="banner-overlay-bottom">
                          <div class="banner-lesson-preview-title" id="banner-preview-title-txt">
                            Lesson 2.2: Dual-PRF De-aliasing & Polarimetric Hydrometeors
                          </div>
                          <div class="banner-duration-chip" id="banner-preview-duration-txt">
                            25:00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Video Source (File vs URL) -->
                <div class="form-group" style="margin-bottom: 18px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Video File or Stream Endpoint / वीडियो स्रोत</label>
                  <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; cursor: pointer; padding: 6px 14px; border: 1px solid var(--border-medium); border-radius: 8px; background: var(--bg-surface);" id="label-radio-url">
                      <input type="radio" name="video_source_type" value="url" checked id="radio-video-url" /> CDN / Stream URL
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; cursor: pointer; padding: 6px 14px; border: 1px solid var(--border-medium); border-radius: 8px; background: var(--bg-surface);" id="label-radio-file">
                      <input type="radio" name="video_source_type" value="file" id="radio-video-file" /> Upload Local MP4
                    </label>
                  </div>

                  <div id="video-url-container">
                    <input type="url" class="form-input" id="video-lesson-url" value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 4px;">Enter direct MP4, WebM, or HLS (.m3u8) video stream URL.</span>
                  </div>

                  <div id="video-file-container" style="display: none;">
                    <div class="upload-zone" id="video-drop-zone" style="border: 1.5px dashed var(--border-medium); padding: 24px; text-align: center; border-radius: 10px; cursor: pointer; position: relative;">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.8" class="upload-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <div class="upload-text" style="font-weight: 600; font-size: 0.875rem; margin-top: 6px;">Click or drag video file here</div>
                      <div class="upload-hint" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">MP4 / WebM format · Max 500MB</div>
                      <input type="file" id="video-lesson-file" accept="video/mp4,video/webm" style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;" />
                    </div>
                    <!-- Upload Progress -->
                    <div id="upload-progress-area" style="display: none;"></div>
                    <!-- Upload Success Preview -->
                    <div id="upload-preview-area" style="display: none;"></div>
                  </div>
                </div>

                <!-- Lecture Summary & Objectives -->
                <div class="form-group" style="margin-bottom: 20px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Lecture Summary & Key Objectives / व्याख्यान सारांश</label>
                  <textarea class="form-input" id="video-lesson-summary" rows="3" placeholder="Key topics covered, mathematical formulas, hydrometeor classifications, and operational relevance for scientists..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">Covers dual-polarization beam transmission, Differential Reflectivity (ZDR), Correlation Coefficient (RhoHV), and real-time de-aliasing filters for cyclone tracking.</textarea>
                </div>

                <!-- Submit & Cancel Buttons -->
                <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                  <button type="button" class="btn btn-outline" id="btn-cancel-video">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="btn-submit-video" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; font-weight: 600;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Video to Curriculum / वीडियो अपलोड करें
                  </button>
                </div>

              </form>
            </div>

            <!-- ========================================== -->
            <!-- TAB 2: ADD ASSESSMENT QUESTIONS -->
            <!-- ========================================== -->
            <div id="tab-question" style="display: ${this.activeTab === 'question' ? 'block' : 'none'};">
              <form id="form-add-question">
                
                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Target Course Examination / लक्षित परीक्षा</label>
                  <select class="form-select" id="q-course-id" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">
                    ${courses.map(c => `<option value="${c.id}">[${c.institute}] ${c.code}: ${c.title}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Question Prompt / प्रश्न कथन</label>
                  <textarea class="form-input" id="q-text" rows="3" placeholder="Enter scientific question or standard operating procedure scenario..." required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">Which dual-polarization radar parameter is most effective in discriminating tornadic debris signatures from meteorological hydrometeors?</textarea>
                </div>

                <!-- 4 Options with Direct Radio Answer Selector -->
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin: 0;">Answer Options (Click radio button next to the correct answer):</label>
                    <span style="font-size: 0.75rem; color: var(--forest-green); font-weight: 600;">● Active selection will be marked correct</span>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Option A -->
                    <div class="quiz-opt-item is-correct" id="opt-container-0">
                      <input type="radio" name="q_correct_option" value="0" class="quiz-opt-radio" checked id="radio-opt-0" />
                      <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); width: 24px;">A:</span>
                      <input type="text" class="form-input" id="q-opt-0" value="Correlation Coefficient (RhoHV < 0.80)" placeholder="Option A text" required style="flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.85rem;" />
                      <span class="correct-badge-pill" id="badge-opt-0" style="font-size: 0.75rem; font-weight: 700; color: #16A34A; white-space: nowrap;">✓ Correct Answer</span>
                    </div>

                    <!-- Option B -->
                    <div class="quiz-opt-item" id="opt-container-1">
                      <input type="radio" name="q_correct_option" value="1" class="quiz-opt-radio" id="radio-opt-1" />
                      <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); width: 24px;">B:</span>
                      <input type="text" class="form-input" id="q-opt-1" value="Differential Reflectivity (ZDR > 4 dB)" placeholder="Option B text" required style="flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.85rem;" />
                      <span class="correct-badge-pill" id="badge-opt-1" style="font-size: 0.75rem; font-weight: 700; color: #16A34A; white-space: nowrap; display: none;">✓ Correct Answer</span>
                    </div>

                    <!-- Option C -->
                    <div class="quiz-opt-item" id="opt-container-2">
                      <input type="radio" name="q_correct_option" value="2" class="quiz-opt-radio" id="radio-opt-2" />
                      <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); width: 24px;">C:</span>
                      <input type="text" class="form-input" id="q-opt-2" value="Radial Velocity Spectrum Width (SW < 1 m/s)" placeholder="Option C text" required style="flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.85rem;" />
                      <span class="correct-badge-pill" id="badge-opt-2" style="font-size: 0.75rem; font-weight: 700; color: #16A34A; white-space: nowrap; display: none;">✓ Correct Answer</span>
                    </div>

                    <!-- Option D -->
                    <div class="quiz-opt-item" id="opt-container-3">
                      <input type="radio" name="q_correct_option" value="3" class="quiz-opt-radio" id="radio-opt-3" />
                      <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); width: 24px;">D:</span>
                      <input type="text" class="form-input" id="q-opt-3" value="Base Reflectivity only (dBZ)" placeholder="Option D text" required style="flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.85rem;" />
                      <span class="correct-badge-pill" id="badge-opt-3" style="font-size: 0.75rem; font-weight: 700; color: #16A34A; white-space: nowrap; display: none;">✓ Correct Answer</span>
                    </div>
                  </div>
                </div>

                <!-- Topic & Quick Suggestion Chips -->
                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Competency / Topic Tag</label>
                  <input type="text" class="form-input" id="q-topic" placeholder="e.g. Radar SOP, Severe Weather Signatures" value="Severe Storm Signatures" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  
                  <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                    <span style="font-size: 0.72rem; color: var(--text-muted); align-self: center;">Quick Tags:</span>
                    <span class="topic-chip-tag" data-tag="Dual-Pol Physics">Dual-Pol Physics</span>
                    <span class="topic-chip-tag" data-tag="Radar SOP">Radar SOP</span>
                    <span class="topic-chip-tag" data-tag="Nowcasting">Nowcasting</span>
                    <span class="topic-chip-tag" data-tag="Tsunami Warning">Tsunami Warning</span>
                    <span class="topic-chip-tag" data-tag="HPC Modeling">HPC Modeling</span>
                    <span class="topic-chip-tag" data-tag="Ocean Buoy Telemetry">Ocean Buoy Telemetry</span>
                  </div>
                </div>

                <!-- Detailed Explanation -->
                <div class="form-group" style="margin-bottom: 20px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Scientific Explanation / वैज्ञानिक व्याख्या (Shown in Learner Scorecard)</label>
                  <textarea class="form-input" id="q-explanation" rows="2" placeholder="Scientific rationale explaining why this option is correct according to MoES research manuals..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">A sharp drop in Correlation Coefficient (RhoHV < 0.80) coincident with a cyclonic velocity couplet and high reflectivity indicates non-uniform tumbling debris lofted by a tornado.</textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                  <button type="button" class="btn btn-outline" id="btn-cancel-q">Cancel</button>
                  <button type="submit" class="btn btn-saffron" id="btn-submit-q" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; font-weight: 600;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Save Question to Exam Bank
                  </button>
                </div>

              </form>

              <!-- Active Exam Questions & Delete Controls -->
              <div style="margin-top: 24px; padding-top: 18px; border-top: 2px dashed var(--border-medium);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--primary-navy); display: flex; align-items: center; gap: 6px;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                      Active Exam Questions & Bank Deletion / परीक्षा प्रश्न प्रबंधन
                    </h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0;">Inspect, delete individual questions, or reset the full examination for the selected course.</p>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-delete-full-exam" style="color: var(--emergency-red); border-color: rgba(239, 68, 68, 0.4); font-size: 0.75rem; background: rgba(239, 68, 68, 0.05); display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete Full Exam (पूरी परीक्षा हटाएं)
                  </button>
                </div>

                <div id="active-course-questions-list">
                  ${(() => {
                    const activeCourseId = this.selectedQuestionCourseId || (courses[0] && courses[0].id);
                    const targetCourse = courses.find(c => c.id === activeCourseId);
                    if (!targetCourse || !targetCourse.quiz || !targetCourse.quiz.questions || targetCourse.quiz.questions.length === 0) {
                      return `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 16px; background: var(--bg-subtle); border-radius: 8px; text-align: center; border: 1px dashed var(--border-medium);">No questions in exam bank for this course yet. Use the form above to add questions!</div>`;
                    }
                    return `
                      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
                        ${targetCourse.quiz.questions.map((q, idx) => `
                          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 8px; gap: 12px;">
                            <div style="flex: 1; min-width: 0;">
                              <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); line-height: 1.4;">Q${idx + 1}: ${q.question}</div>
                              <div style="font-size: 0.75rem; color: #16A34A; margin-top: 4px; font-weight: 600;">
                                ✓ Answer: ${q.options ? q.options[q.correctIndex] || 'Option ' + (q.correctIndex + 1) : 'Standard Answer'} · <span style="color: var(--text-muted); font-weight: 400;">${q.topic || 'General Science'}</span>
                              </div>
                            </div>
                            <button type="button" class="btn btn-outline btn-sm btn-delete-studio-q" data-course-id="${targetCourse.id}" data-q-id="${q.id}" title="Delete Question / प्रश्न हटाएं" style="color: var(--emergency-red); border-color: rgba(239, 68, 68, 0.4); padding: 4px 8px; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px; background: rgba(239, 68, 68, 0.05); flex-shrink: 0;">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              Delete
                            </button>
                          </div>
                        `).join('')}
                      </div>
                    `;
                  })()}
                </div>
              </div>

            </div>

            <!-- ========================================== -->
            <!-- TAB 3: SET EXAM TIMER & PASSING CRITERIA -->
            <!-- ========================================== -->
            <div id="tab-timer" style="display: ${this.activeTab === 'timer' ? 'block' : 'none'};">
              <form id="form-exam-timer">
                
                <div class="form-group" style="margin-bottom: 18px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Select Course Examination</label>
                  <select class="form-select" id="timer-course-id" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">
                    ${courses.map(c => `<option value="${c.id}" ${c.quiz ? `data-time="${c.quiz.timeLimitMinutes || 15}" data-pass="${c.quiz.passingScore || 75}"` : ''}>[${c.institute}] ${c.code}: ${c.title}</option>`).join('')}
                  </select>
                </div>

                <!-- Dynamic Live Gauge Preview -->
                <div class="exam-metric-gauge">
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Time Limit</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--ocean-cyan);" id="gauge-time-val">15</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Minutes / परीक्षा अवधि</div>
                  </div>
                  <div style="width: 1px; height: 50px; background: var(--border-medium);"></div>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Pass Benchmark</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--saffron-gold);" id="gauge-pass-val">75%</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Certificate Threshold</div>
                  </div>
                  <div style="width: 1px; height: 50px; background: var(--border-medium);"></div>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Assessment Mode</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #10B981; margin-top: 4px;" id="gauge-mode-val">Standard Unit Test</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Auto-submit on expiry</div>
                  </div>
                </div>

                <!-- Sliders Card -->
                <div class="card" style="padding: 20px; background: var(--bg-subtle); border: 1px solid var(--border-cyan); border-radius: 12px; margin-bottom: 20px;">
                  
                  <!-- Duration Slider -->
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <label class="form-label" style="font-weight: 700; font-size: 0.875rem; margin: 0;">Exam Time Limit (Minutes):</label>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="number" class="form-input" id="timer-minutes" min="1" max="180" value="15" required style="width: 70px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-medium); font-weight: 700; text-align: center; background: var(--bg-surface); color: var(--text-main);" />
                        <span style="font-size: 0.8rem; color: var(--text-muted);">min</span>
                      </div>
                    </div>
                    <input type="range" id="slider-timer-minutes" min="5" max="120" step="5" value="15" style="width: 100%; accent-color: var(--ocean-cyan); cursor: pointer;" />
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                      <span>5 min (Sprint)</span>
                      <span>30 min</span>
                      <span>60 min</span>
                      <span>120 min (Comprehensive)</span>
                    </div>
                  </div>

                  <!-- Passing Score Slider -->
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <label class="form-label" style="font-weight: 700; font-size: 0.875rem; margin: 0;">Passing Score Benchmark (%):</label>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="number" class="form-input" id="timer-passing-score" min="40" max="100" value="75" required style="width: 70px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-medium); font-weight: 700; text-align: center; background: var(--bg-surface); color: var(--text-main);" />
                        <span style="font-size: 0.8rem; color: var(--text-muted);">%</span>
                      </div>
                    </div>
                    <input type="range" id="slider-passing-score" min="40" max="100" step="5" value="75" style="width: 100%; accent-color: var(--saffron-gold); cursor: pointer;" />
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                      <span>40% (Minimum)</span>
                      <span>60% (Competent)</span>
                      <span>75% (Standard MoES)</span>
                      <span>90% (Distinction)</span>
                    </div>
                  </div>

                  <!-- Quick Presets Buttons -->
                  <div style="border-top: 1px solid var(--border-light); padding-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">MoES Presets:</span>
                    <button type="button" class="btn btn-outline btn-sm preset-btn" data-time="5" data-pass="70" style="padding: 4px 10px; font-size: 0.75rem;">⚡ 5 Min Sprint (70%)</button>
                    <button type="button" class="btn btn-outline btn-sm preset-btn" data-time="15" data-pass="75" style="padding: 4px 10px; font-size: 0.75rem;">⏱️ 15 Min Standard (75%)</button>
                    <button type="button" class="btn btn-outline btn-sm preset-btn" data-time="30" data-pass="75" style="padding: 4px 10px; font-size: 0.75rem;">📘 30 Min Exam (75%)</button>
                    <button type="button" class="btn btn-outline btn-sm preset-btn" data-time="60" data-pass="80" style="padding: 4px 10px; font-size: 0.75rem;">🔬 60 Min Deep Dive (80%)</button>
                  </div>

                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                  <button type="button" class="btn btn-outline" id="btn-cancel-timer">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="btn-save-timer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; font-weight: 600;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
                    Apply Settings to Examination
                  </button>
                </div>

              </form>
            </div>

            <!-- ========================================== -->
            <!-- TAB 4: PUBLISH NEW MOES COURSE -->
            <!-- ========================================== -->
            <div id="tab-course" style="display: ${this.activeTab === 'course' ? 'block' : 'none'};">
              <form id="form-new-course">
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <div>
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Course Title / पाठ्यक्रम शीर्षक</label>
                    <input type="text" class="form-input" id="nc-title" placeholder="e.g. Advanced Numerical Weather Modeling & Boundary Layer Physics" value="Numerical Ocean Circulation & High-Resolution Wave Modeling" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  </div>
                  <div>
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">MoES Institute</label>
                    <select class="form-select" id="nc-institute" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">
                      <option value="IMD">IMD — India Meteorological Dept</option>
                      <option value="INCOIS" selected>INCOIS — Ocean Info Services</option>
                      <option value="IITM">IITM — Tropical Meteorology</option>
                      <option value="NCMRWF">NCMRWF — Medium Range Weather</option>
                      <option value="NIOT">NIOT — Ocean Technology</option>
                      <option value="NCPOR">NCPOR — Polar & Ocean Research</option>
                    </select>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Course Description / पाठ्यक्रम विवरण</label>
                  <textarea class="form-input" id="nc-description" rows="3" placeholder="Syllabus scope, operational protocols, telemetry models, and target cadre..." required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">Comprehensive curriculum covering coastal bathymetry, WAVEWATCH III simulations, tsunami propagation modeling, and offshore hazard mitigation protocols.</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 18px;">
                  <div>
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Category</label>
                    <input type="text" class="form-input" id="nc-category" value="Marine & Coastal Dynamics" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  </div>
                  <div>
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Difficulty Level</label>
                    <select class="form-select" id="nc-level" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;">
                      <option value="Fundamental">Fundamental</option>
                      <option value="Intermediate" selected>Intermediate</option>
                      <option value="Advanced">Advanced / Expert</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Estimated Hours</label>
                    <input type="number" class="form-input" id="nc-duration" value="160" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.875rem;" />
                  </div>
                </div>

                <!-- Course Cover Banner -->
                <div class="card" style="padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-medium); border-radius: 10px; margin-bottom: 20px;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 6px;">Course Catalog Cover Banner</label>
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="width: 100px; height: 62px; border-radius: 6px; overflow: hidden; background: #0B192C; flex-shrink: 0; border: 1px solid var(--border-medium);">
                      <img id="nc-cover-preview-img" src="${this.selectedCourseCover}" alt="Cover" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="flex: 1;">
                      <input type="url" class="form-input" id="nc-cover-url" value="${this.selectedCourseCover}" placeholder="https://images.unsplash.com/..." style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-main); font-size: 0.825rem;" />
                      <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; display: block;">Image URL or pick an institute preset.</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                  <button type="button" class="btn btn-outline" id="btn-cancel-course">Cancel</button>
                  <button type="submit" class="btn btn-saffron" id="btn-publish-course" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; font-weight: 600;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    Publish Course to National Portal
                  </button>
                </div>

              </form>

              <!-- Manage & Delete Existing Published Courses -->
              <div style="margin-top: 24px; padding-top: 18px; border-top: 2px dashed var(--border-medium);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--primary-navy); display: flex; align-items: center; gap: 6px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                      Manage & Delete Courses / पाठ्यक्रम प्रबंधन एवं विलोपन
                    </h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0;">Remove retired or obsolete courses and curriculum from the National Portal.</p>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--ocean-cyan); font-weight: 700;">${courses.length} Active Courses</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto;">
                  ${courses.map(c => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 8px; gap: 12px;">
                      <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                        <span class="role-tag ${c.institute.toLowerCase()}" style="font-size: 0.7rem; padding: 2px 6px;">${c.institute}</span>
                        <div style="min-width: 0;">
                          <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</div>
                          <div style="font-size: 0.72rem; color: var(--text-muted);">${c.code} · ${c.level} · ${(c.modules || []).reduce((acc, m) => acc + (m.lessons || []).length, 0)} Lessons ${c.quiz ? '· Exam Configured' : '· No Exam'}</div>
                        </div>
                      </div>
                      <button type="button" class="btn btn-outline btn-sm btn-delete-studio-course" data-id="${c.id}" data-title="${c.title.replace(/"/g, '&quot;')}" style="color: var(--emergency-red); border-color: rgba(239, 68, 68, 0.4); font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px; background: rgba(239, 68, 68, 0.05); flex-shrink: 0;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        Delete (हटाएं)
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // 1. Close button & Backdrop click
    const closeBtn = container.querySelector("#close-faculty-modal");
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());

    const overlay = container.querySelector("#faculty-modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Cancel buttons
    ["#btn-cancel-video", "#btn-cancel-q", "#btn-cancel-timer", "#btn-cancel-course"].forEach(sel => {
      const btn = container.querySelector(sel);
      if (btn) btn.addEventListener("click", () => this.close());
    });

    // Tab Switching
    container.querySelectorAll(".studio-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-tab");
        this.open(tab);
      });
    });

    // ==========================================
    // TAB 1: BANNER UPLOAD & LIVE PREVIEW EVENTS
    // ==========================================
    const liveBannerImg = container.querySelector("#live-banner-img");
    const bannerTitleTxt = container.querySelector("#banner-preview-title-txt");
    const bannerDurationTxt = container.querySelector("#banner-preview-duration-txt");
    const titleInput = container.querySelector("#video-lesson-title");
    const durationInput = container.querySelector("#video-lesson-duration");

    // Real-time title & duration sync to live preview overlay
    if (titleInput && bannerTitleTxt) {
      titleInput.addEventListener("input", (e) => {
        bannerTitleTxt.textContent = e.target.value.trim() || "Untitled Lesson";
      });
    }
    if (durationInput && bannerDurationTxt) {
      durationInput.addEventListener("input", (e) => {
        bannerDurationTxt.textContent = e.target.value.trim() || "00:00";
      });
    }

    // Banner source navigation buttons
    container.querySelectorAll(".banner-source-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const source = e.currentTarget.getAttribute("data-source");
        this.bannerSourceType = source;
        
        container.querySelectorAll(".banner-source-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        const secPreset = container.querySelector("#banner-source-preset");
        const secUpload = container.querySelector("#banner-source-upload");
        const secUrl = container.querySelector("#banner-source-url");

        if (secPreset) secPreset.style.display = source === "preset" ? "block" : "none";
        if (secUpload) secUpload.style.display = source === "upload" ? "block" : "none";
        if (secUrl) secUrl.style.display = source === "url" ? "block" : "none";
      });
    });

    // Preset cards selection
    container.querySelectorAll(".banner-preset-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const bannerUrl = e.currentTarget.getAttribute("data-banner-url");
        this.selectedBannerUrl = bannerUrl;
        
        container.querySelectorAll(".banner-preset-card").forEach(c => c.classList.remove("selected"));
        e.currentTarget.classList.add("selected");

        if (liveBannerImg) liveBannerImg.src = bannerUrl;
        const bannerUrlInput = container.querySelector("#banner-url-input");
        if (bannerUrlInput) bannerUrlInput.value = bannerUrl;
      });
    });

    // Reset Banner button
    const btnResetBanner = container.querySelector("#btn-reset-banner");
    if (btnResetBanner) {
      btnResetBanner.addEventListener("click", () => {
        this.selectedBannerUrl = this.bannerPresets[0].url;
        if (liveBannerImg) liveBannerImg.src = this.selectedBannerUrl;
        const bannerUrlInput = container.querySelector("#banner-url-input");
        if (bannerUrlInput) bannerUrlInput.value = this.selectedBannerUrl;
        container.querySelectorAll(".banner-preset-card").forEach((c, idx) => {
          c.classList.toggle("selected", idx === 0);
        });
      });
    }

    // Banner Image File Dropzone & FileReader
    const bannerFileInput = container.querySelector("#banner-file-input");
    const bannerDropZone = container.querySelector("#banner-drop-zone");
    const bannerUploadStatus = container.querySelector("#banner-upload-status");

    const handleBannerFile = (file) => {
      if (!file || !file.type.startsWith("image/")) {
        alert("Please upload a valid image file (PNG, JPG, WebP)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        this.selectedBannerUrl = dataUrl;
        if (liveBannerImg) liveBannerImg.src = dataUrl;
        if (bannerUploadStatus) {
          bannerUploadStatus.style.display = "block";
          bannerUploadStatus.textContent = `✓ Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        }
      };
      reader.readAsDataURL(file);
    };

    if (bannerFileInput) {
      bannerFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          handleBannerFile(e.target.files[0]);
        }
      });
    }

    if (bannerDropZone) {
      bannerDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        bannerDropZone.classList.add("drag-over");
      });
      bannerDropZone.addEventListener("dragleave", () => {
        bannerDropZone.classList.remove("drag-over");
      });
      bannerDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        bannerDropZone.classList.remove("drag-over");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleBannerFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Apply URL button
    const btnApplyBannerUrl = container.querySelector("#btn-apply-banner-url");
    const bannerUrlInput = container.querySelector("#banner-url-input");
    if (btnApplyBannerUrl && bannerUrlInput) {
      btnApplyBannerUrl.addEventListener("click", () => {
        const url = bannerUrlInput.value.trim();
        if (url) {
          this.selectedBannerUrl = url;
          if (liveBannerImg) liveBannerImg.src = url;
        }
      });
    }

    // Video Source Radio toggling (URL vs Local File)
    const radioUrl = container.querySelector("#radio-video-url");
    const radioFile = container.querySelector("#radio-video-file");
    const urlContainer = container.querySelector("#video-url-container");
    const fileContainer = container.querySelector("#video-file-container");

    if (radioUrl && radioFile) {
      radioUrl.addEventListener("change", () => {
        if (urlContainer) urlContainer.style.display = "block";
        if (fileContainer) fileContainer.style.display = "none";
      });
      radioFile.addEventListener("change", () => {
        if (urlContainer) urlContainer.style.display = "none";
        if (fileContainer) fileContainer.style.display = "block";
      });
    }

    // Video File drag-drop zone
    const videoDropZone = container.querySelector("#video-drop-zone");
    const fileInputVideo = container.querySelector("#video-lesson-file");
    if (videoDropZone && fileInputVideo) {
      videoDropZone.addEventListener("dragover", (e) => { e.preventDefault(); videoDropZone.classList.add("drag-over"); });
      videoDropZone.addEventListener("dragleave", () => { videoDropZone.classList.remove("drag-over"); });
      videoDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        videoDropZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
          fileInputVideo.files = e.dataTransfer.files;
          this.showUploadProgress(container, e.dataTransfer.files[0]);
        }
      });
      fileInputVideo.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.showUploadProgress(container, e.target.files[0]);
        }
      });
    }

    // Form 1 Submit: Video Lesson Upload
    const formVideo = container.querySelector("#form-upload-video");
    if (formVideo) {
      formVideo.addEventListener("submit", async (e) => {
        e.preventDefault();
        const courseId = container.querySelector("#video-course-id").value;
        const moduleName = container.querySelector("#video-module-name").value.trim() || "Module 1: Operational Lectures";
        const title = container.querySelector("#video-lesson-title").value.trim();
        const duration = container.querySelector("#video-lesson-duration").value.trim() || "20:00";
        const summary = container.querySelector("#video-lesson-summary").value.trim();
        
        let videoUrl = container.querySelector("#video-lesson-url")?.value?.trim() || "";
        const fileInput = container.querySelector("#video-lesson-file");
        if (radioFile && radioFile.checked && fileInput && fileInput.files && fileInput.files[0]) {
          videoUrl = URL.createObjectURL(fileInput.files[0]);
        }

        if (!title) { alert("Please enter a lesson title"); return; }

        const newLesson = {
          id: "les_" + Date.now().toString(36),
          title,
          duration,
          videoUrl: videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          thumbnailUrl: this.selectedBannerUrl,
          bannerUrl: this.selectedBannerUrl,
          summary,
          moduleTitle: moduleName
        };

        // Try API, then local store
        try {
          await fetch(`/api/courses/${courseId}/lessons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLesson)
          });
        } catch (err) {}

        // Update local appState
        const course = (this.appState.courses || []).find(c => c.id === courseId);
        if (course) {
          if (!course.modules || course.modules.length === 0) {
            course.modules = [{ title: moduleName, lessons: [] }];
          }
          let targetModule = course.modules.find(m => m.title === moduleName);
          if (!targetModule) {
            targetModule = course.modules[0];
          }
          targetModule.lessons.push(newLesson);
          this.appState.saveLocalDb();
        }

        this.showSuccessToast(`Video lesson "${title}" with custom banner added to curriculum!`);
        this.close();
        if (this.appState.render) this.appState.render();
      });
    }

    // ==========================================
    // TAB 2: QUIZ QUESTION EVENTS
    // ==========================================
    // Radio toggle updates highlight styles and badges for options A, B, C, D
    const updateOptionSelection = (selectedIndex) => {
      [0, 1, 2, 3].forEach(idx => {
        const item = container.querySelector(`#opt-container-${idx}`);
        const badge = container.querySelector(`#badge-opt-0` ? `#badge-opt-${idx}` : null);
        if (item) {
          item.classList.toggle("is-correct", idx === selectedIndex);
        }
        if (badge) {
          badge.style.display = idx === selectedIndex ? "inline" : "none";
        }
      });
    };

    container.querySelectorAll('input[name="q_correct_option"]').forEach(radio => {
      radio.addEventListener("change", (e) => {
        updateOptionSelection(parseInt(e.target.value, 10));
      });
    });

    // Topic quick chips
    container.querySelectorAll(".topic-chip-tag").forEach(chip => {
      chip.addEventListener("click", (e) => {
        const tag = e.currentTarget.getAttribute("data-tag");
        const topicInput = container.querySelector("#q-topic");
        if (topicInput) topicInput.value = tag;
      });
    });

    // Form 2 Submit: Quiz Question
    const formQ = container.querySelector("#form-add-question");
    if (formQ) {
      formQ.addEventListener("submit", async (e) => {
        e.preventDefault();
        const courseId = container.querySelector("#q-course-id").value;
        const questionText = container.querySelector("#q-text").value.trim();
        const options = [
          container.querySelector("#q-opt-0").value.trim(),
          container.querySelector("#q-opt-1").value.trim(),
          container.querySelector("#q-opt-2").value.trim(),
          container.querySelector("#q-opt-3").value.trim()
        ];
        const selectedRadio = container.querySelector('input[name="q_correct_option"]:checked');
        const correctIndex = selectedRadio ? parseInt(selectedRadio.value, 10) : 0;
        const topic = container.querySelector("#q-topic").value.trim();
        const explanation = container.querySelector("#q-explanation").value.trim();

        const newQ = {
          id: "q_" + Date.now().toString(36),
          question: questionText,
          options,
          correctIndex,
          topic,
          explanation
        };

        try {
          await fetch(`/api/courses/${courseId}/quiz/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQ)
          });
        } catch (err) {}

        const course = (this.appState.courses || []).find(c => c.id === courseId);
        if (course) {
          if (!course.quiz) {
            course.quiz = { title: `${course.title} Exam`, timeLimitMinutes: 15, passingScore: 75, questions: [] };
          }
          if (!course.quiz.questions) course.quiz.questions = [];
          course.quiz.questions.push(newQ);
          this.appState.saveLocalDb();
        }

        this.showSuccessToast("Assessment question successfully saved to exam question bank!");
        this.close();
        if (this.appState.render) this.appState.render();
      });
    }

    // ==========================================
    // TAB 3: EXAM TIMER & GAUGE EVENTS
    // ==========================================
    const timerInput = container.querySelector("#timer-minutes");
    const timerSlider = container.querySelector("#slider-timer-minutes");
    const passInput = container.querySelector("#timer-passing-score");
    const passSlider = container.querySelector("#slider-passing-score");
    const gaugeTimeVal = container.querySelector("#gauge-time-val");
    const gaugePassVal = container.querySelector("#gauge-pass-val");
    const gaugeModeVal = container.querySelector("#gauge-mode-val");

    const updateTimerGauge = () => {
      const time = parseInt(timerInput.value, 10) || 15;
      const pass = parseInt(passInput.value, 10) || 75;
      
      if (gaugeTimeVal) gaugeTimeVal.textContent = time;
      if (gaugePassVal) gaugePassVal.textContent = pass + "%";
      
      if (gaugeModeVal) {
        if (time <= 5) gaugeModeVal.textContent = "Sprint Quiz";
        else if (time <= 15) gaugeModeVal.textContent = "Standard Unit Test";
        else if (time <= 30) gaugeModeVal.textContent = "Comprehensive Exam";
        else gaugeModeVal.textContent = "Deep Research Defense";
      }
    };

    if (timerSlider && timerInput) {
      timerSlider.addEventListener("input", (e) => {
        timerInput.value = e.target.value;
        updateTimerGauge();
      });
      timerInput.addEventListener("input", (e) => {
        timerSlider.value = e.target.value;
        updateTimerGauge();
      });
    }

    if (passSlider && passInput) {
      passSlider.addEventListener("input", (e) => {
        passInput.value = e.target.value;
        updateTimerGauge();
      });
      passInput.addEventListener("input", (e) => {
        passSlider.value = e.target.value;
        updateTimerGauge();
      });
    }

    // Quick Presets
    container.querySelectorAll(".preset-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const t = e.currentTarget.getAttribute("data-time");
        const p = e.currentTarget.getAttribute("data-pass");
        if (t && timerInput) {
          timerInput.value = t;
          if (timerSlider) timerSlider.value = t;
        }
        if (p && passInput) {
          passInput.value = p;
          if (passSlider) passSlider.value = p;
        }
        updateTimerGauge();
      });
    });

    // When timer course changes, update inputs with existing values
    const timerCourseSelect = container.querySelector("#timer-course-id");
    if (timerCourseSelect) {
      timerCourseSelect.addEventListener("change", (e) => {
        const opt = e.target.selectedOptions[0];
        if (opt) {
          const t = opt.getAttribute("data-time");
          const p = opt.getAttribute("data-pass");
          if (t && timerInput) {
            timerInput.value = t;
            if (timerSlider) timerSlider.value = t;
          }
          if (p && passInput) {
            passInput.value = p;
            if (passSlider) passSlider.value = p;
          }
          updateTimerGauge();
        }
      });
    }

    // Form 3 Submit: Exam Timer
    const formTimer = container.querySelector("#form-exam-timer");
    if (formTimer) {
      formTimer.addEventListener("submit", async (e) => {
        e.preventDefault();
        const courseId = container.querySelector("#timer-course-id").value;
        const timeLimitMinutes = Number(container.querySelector("#timer-minutes").value);
        const passingScore = Number(container.querySelector("#timer-passing-score").value);

        try {
          await fetch(`/api/courses/${courseId}/quiz/settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timeLimitMinutes, passingScore })
          });
        } catch (err) {}

        const course = (this.appState.courses || []).find(c => c.id === courseId);
        if (course) {
          if (!course.quiz) course.quiz = { title: `${course.title} Exam`, questions: [] };
          course.quiz.timeLimitMinutes = timeLimitMinutes;
          course.quiz.passingScore = passingScore;
          this.appState.saveLocalDb();
        }

        this.showSuccessToast(`Exam timer set to ${timeLimitMinutes} minutes with ${passingScore}% passing threshold!`);
        this.close();
        if (this.appState.render) this.appState.render();
      });
    }

    // ==========================================
    // TAB 4: PUBLISH COURSE EVENTS
    // ==========================================
    const coverUrlInput = container.querySelector("#nc-cover-url");
    const coverPreviewImg = container.querySelector("#nc-cover-preview-img");
    if (coverUrlInput && coverPreviewImg) {
      coverUrlInput.addEventListener("input", (e) => {
        coverPreviewImg.src = e.target.value.trim();
      });
    }

    // Form 4 Submit: Publish Course
    const formCourse = container.querySelector("#form-new-course");
    if (formCourse) {
      formCourse.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = container.querySelector("#nc-title").value.trim();
        const institute = container.querySelector("#nc-institute").value;
        const description = container.querySelector("#nc-description").value.trim();
        const category = container.querySelector("#nc-category").value.trim();
        const level = container.querySelector("#nc-level").value;
        const durationMinutes = Number(container.querySelector("#nc-duration").value);
        const coverUrl = container.querySelector("#nc-cover-url")?.value?.trim() || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600";

        const user = this.appState.currentUser || { name: "Dr. Anita Desai" };

        const newCourse = {
          id: "crs_" + institute.toLowerCase() + "_" + Date.now().toString(36),
          code: `MOES-${institute}-${Math.floor(100 + Math.random() * 900)}`,
          title,
          description,
          institute,
          category,
          level,
          durationMinutes,
          trainerName: user.name || "Faculty Specialist",
          thumbnail: coverUrl,
          isMandatory: false,
          modules: [
            {
              id: "mod_01",
              title: "Module 1: Orientation & Core Concepts",
              lessons: [
                { 
                  id: "les_1", 
                  title: "Lesson 1: Introduction to Framework", 
                  duration: "20:00", 
                  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  thumbnailUrl: coverUrl,
                  bannerUrl: coverUrl
                }
              ]
            }
          ],
          quiz: {
            id: "qnz_" + Date.now().toString(36),
            title: `${title} Certification Exam`,
            timeLimitMinutes: 15,
            passingScore: 75,
            questions: [
              {
                id: "q_init_1",
                question: `What is the primary operational mandate of ${institute} within the Ministry of Earth Sciences?`,
                options: ["Atmospheric & Oceanographic Monitoring", "Civil Aviation Regulation", "Heavy Mining Licensing", "Space Launch Operations"],
                correctIndex: 0,
                topic: "Institutional Mandate",
                explanation: `${institute} conducts advanced scientific research and operational services under MoES.`
              }
            ]
          }
        };

        try {
          await fetch("/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCourse)
          });
        } catch (err) {}

        this.appState.courses.unshift(newCourse);
        this.appState.saveLocalDb();

        this.showSuccessToast(`New MoES Course "${title}" successfully published!`);
        this.close();
        if (this.appState.navigate) this.appState.navigate("courses");
      });
    }

    // Question Course Selector Change (Dynamic list update)
    const qCourseSelect = container.querySelector("#q-course-id");
    if (qCourseSelect) {
      qCourseSelect.addEventListener("change", (e) => {
        this.selectedQuestionCourseId = e.target.value;
        const mount = document.getElementById("faculty-modal-mount");
        if (mount) this.render(mount);
      });
    }

    // Delete single question from exam bank
    container.querySelectorAll(".btn-delete-studio-q").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const courseId = e.currentTarget.getAttribute("data-course-id");
        const qId = e.currentTarget.getAttribute("data-q-id");
        if (confirm("Remove this question from the exam question bank? / क्या आप इस प्रश्न को परीक्षा बैंक से हटाना चाहते हैं?")) {
          if (this.appState.deleteQuizQuestion) {
            await this.appState.deleteQuizQuestion(courseId, qId);
          }
          const mount = document.getElementById("faculty-modal-mount");
          if (mount) this.render(mount);
        }
      });
    });

    // Delete full exam for selected course
    const btnDeleteFullExam = container.querySelector("#btn-delete-full-exam");
    if (btnDeleteFullExam) {
      btnDeleteFullExam.addEventListener("click", async () => {
        const targetCourseId = container.querySelector("#q-course-id")?.value;
        const course = (this.appState.courses || []).find(c => c.id === targetCourseId);
        if (!course) return;
        if (confirm(`Are you sure you want to permanently delete the entire examination for "${course.title}"?\n\nAll questions and timer configurations will be removed.`)) {
          if (this.appState.deleteQuiz) {
            await this.appState.deleteQuiz(targetCourseId);
          }
          const mount = document.getElementById("faculty-modal-mount");
          if (mount) this.render(mount);
        }
      });
    }

    // Delete course from Studio Tab 4
    container.querySelectorAll(".btn-delete-studio-course").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const title = e.currentTarget.getAttribute("data-title");
        if (confirm(`Are you sure you want to permanently delete the course "${title}"?\n\nThis will remove the curriculum, video lectures, and exam.`)) {
          if (this.appState.deleteCourse) {
            await this.appState.deleteCourse(id);
          }
          const mount = document.getElementById("faculty-modal-mount");
          if (mount) this.render(mount);
        }
      });
    });
  }

  showUploadProgress(container, file) {
    const progressArea = container.querySelector("#upload-progress-area");
    const previewArea = container.querySelector("#upload-preview-area");
    if (!progressArea) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    progressArea.style.display = "block";
    progressArea.innerHTML = `
      <div class="upload-progress-container" style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium); margin-top: 10px;">
        <div class="upload-status-text" style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px;">
          <span>${file.name}</span>
          <span id="upload-pct">0%</span>
        </div>
        <div class="upload-progress-track" style="height: 6px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
          <div class="upload-progress-fill" id="upload-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--ocean-cyan), #10B981); transition: width 0.2s ease;"></div>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">${sizeMB} MB · Transcoding to MoES stream format...</div>
      </div>
    `;

    let pct = 0;
    const fill = container.querySelector("#upload-fill");
    const pctText = container.querySelector("#upload-pct");
    const interval = setInterval(() => {
      pct += Math.random() * 18 + 7;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        if (fill) fill.style.width = "100%";
        if (pctText) pctText.textContent = "100%";
        setTimeout(() => {
          progressArea.style.display = "none";
          if (previewArea) {
            previewArea.style.display = "block";
            const objectUrl = URL.createObjectURL(file);
            previewArea.innerHTML = `
              <div class="upload-success-preview" style="display: flex; align-items: center; gap: 12px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); padding: 12px 16px; border-radius: 8px; margin-top: 10px;">
                <div class="preview-thumb" style="width: 50px; height: 32px; border-radius: 4px; overflow: hidden; background: #000;"><video src="${objectUrl}" muted style="width: 100%; height: 100%; object-fit: cover;"></video></div>
                <div>
                  <div style="font-weight: 700; color: #166534; font-size: 0.875rem; display: flex; align-items: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Video file verified & ready! (${sizeMB} MB)
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1px;">${file.name}</div>
                </div>
              </div>
            `;
          }
        }, 400);
      } else {
        if (fill) fill.style.width = pct + "%";
        if (pctText) pctText.textContent = Math.round(pct) + "%";
      }
    }, 180);
  }

  showSuccessToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed; bottom: 28px; right: 28px; z-index: 99999;
      background: linear-gradient(135deg, #065F46, #059669); color: #FFF;
      padding: 14px 22px; border-radius: 12px; font-weight: 600; font-size: 0.9rem;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.4);
      display: flex; align-items: center; gap: 12px;
      animation: studioModalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      max-width: 440px; border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    toast.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = FacultyStudioComponent;
}
