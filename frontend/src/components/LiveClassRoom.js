/**
 * LiveClassRoom.js - Interactive Virtual Classroom & Broadcaster Deck (समर्थ-कक्षा)
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Features: WebRTC Camera/Screen Share, Real-time Chat, Moderated Q&A, Hand-Raise Queue, Live Polls, and Scheduling
 */

class LiveClassRoomComponent {
  constructor(appState) {
    this.appState = appState;
    this.activeSessionId = "live_imd_01";
    this.activeTab = "chat"; // "chat" | "qa" | "roster"
    this.hasRaisedHand = false;
    this.isBroadcasting = false;
    this.localMediaStream = null;
    this.isMicMuted = false;
    this.isCameraOff = false;
    this.isScreenSharing = false;
    this.screenStream = null;
    this.isScheduleModalOpen = false;
    this.isPollModalOpen = false;
    this.hasVotedCurrentPoll = false;
    this.selectedPollOption = null;
    this.handRaisedTimestamp = null;
    this._lastContainer = null;

    // 30s Interactive Poll Engine
    this.pollRemainingSeconds = 30;
    this.pollTimerInterval = null;
    this.isPollDismissed = false;
    this.dismissedPollId = null;
    this.currentPollId = null;

    // Real-Time Broadcaster Stream Engine
    this.activeFeedMode = "radar"; // "webcam" | "radar"
    this.simulatedStream = null;
    this.radarCanvas = null;
    this.radarAnimationId = null;
    this.broadcastStartTime = null;
    this.broadcastTimerInterval = null;
    this.broadcastElapsedSeconds = 0;
  }

  getRadarStream() {
    if (this.simulatedStream && this.simulatedStream.active) {
      return this.simulatedStream;
    }

    let canvas = document.getElementById("moes-radar-canvas-generator");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "moes-radar-canvas-generator";
      canvas.width = 1280;
      canvas.height = 720;
      canvas.style.display = "none";
      document.body.appendChild(canvas);
    }
    this.radarCanvas = canvas;

    const ctx = canvas.getContext("2d");
    let angle = 0;

    // Polarimetric Doppler radar hydrometeor classification moments
    const stormCells = [
      { r: 160, theta: 0.9, size: 48, maxDbz: 62, label: "Hail Core (ZDR: 0.2dB | 62 dBZ)" },
      { r: 270, theta: 2.1, size: 75, maxDbz: 48, label: "Heavy Convective Line (KDP: 3.4°/km)" },
      { r: 210, theta: 4.2, size: 55, maxDbz: 52, label: "Squall Front (RhoHV: 0.97)" },
      { r: 320, theta: 5.4, size: 60, maxDbz: 38, label: "Stratiform Rain Band" }
    ];

    if (this.radarAnimationId) {
      cancelAnimationFrame(this.radarAnimationId);
    }

    const drawRadar = () => {
      ctx.fillStyle = "#020817";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = 320;

      // Circular Range Rings (50km, 100km, 150km, 200km, 250km)
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 168, 232, 0.22)";
      for (let r = 64; r <= maxR; r += 64) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 212, 255, 0.6)";
        ctx.font = "11px monospace";
        ctx.fillText(`${(r / 64) * 50} km`, cx + 6, cy - r + 14);
      }

      // Compass Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Cardinal Directions & Azimuthal ticks
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + (maxR - 8) * Math.cos(rad);
        const y1 = cy + (maxR - 8) * Math.sin(rad);
        const x2 = cx + maxR * Math.cos(rad);
        const y2 = cy + maxR * Math.sin(rad);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (deg % 90 === 0) {
          const tx = cx + (maxR + 24) * Math.cos(rad);
          const ty = cy + (maxR + 24) * Math.sin(rad);
          ctx.fillStyle = "#38BDF8";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const dirs = { 0: "090° E", 90: "180° S", 180: "270° W", 270: "000° N" };
          ctx.fillText(dirs[deg] || `${deg}°`, tx, ty);
        }
      }

      // Storm Reflectivity Echoes
      stormCells.forEach(cell => {
        const cellX = cx + cell.r * Math.cos(cell.theta);
        const cellY = cy + cell.r * Math.sin(cell.theta);
        const grad = ctx.createRadialGradient(cellX, cellY, 4, cellX, cellY, cell.size);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.88)");    // Hail core (Red)
        grad.addColorStop(0.35, "rgba(245, 158, 11, 0.78)"); // Heavy rain (Amber)
        grad.addColorStop(0.65, "rgba(34, 197, 94, 0.58)"); // Moderate (Green)
        grad.addColorStop(1, "rgba(14, 165, 233, 0)");      // Boundary

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cellX, cellY, cell.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#F8FAFC";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(cell.label, cellX, cellY + cell.size + 14);
      });

      // Rotating Radar Beam with Phosphor sweep trail
      const sweepAngle = angle;
      const trailAngle = 0.58;
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      sweepGrad.addColorStop(0, "rgba(0, 255, 170, 0.45)");
      sweepGrad.addColorStop(1, "rgba(0, 255, 170, 0.04)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - trailAngle, sweepAngle, false);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sharp beam line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(sweepAngle), cy + maxR * Math.sin(sweepAngle));
      ctx.strokeStyle = "#00FFAA";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#00FFAA";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // Telemetry Data Box
      ctx.fillStyle = "rgba(10, 25, 47, 0.90)";
      ctx.fillRect(20, 20, 395, 165);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, 395, 165);

      ctx.fillStyle = "#FF9933"; // Saffron
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("IMD S-BAND POLARIMETRIC RADAR NOWCAST", 35, 45);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "11px monospace";
      const now = new Date();
      const timeStr = now.toISOString().replace("T", " ").substring(0, 19) + " UTC";
      ctx.fillText(`TIMESTAMP : ${timeStr}`, 35, 70);
      ctx.fillText(`STATION   : CHENNAI S-BAND (13.08°N, 80.27°E)`, 35, 90);
      ctx.fillText(`OPERATING : 2.85 GHz | PRF: 600 Hz | RPM: 3.0`, 35, 110);
      ctx.fillText(`MOMENTS   : ZDR: 0.8dB | KDP: 2.8°/km | RhoHV: 0.98`, 35, 130);
      ctx.fillText(`HAIL CORE : 62.4 dBZ (ALT: 4.8 km CONVECTIVE)`, 35, 150);

      // Top Right Broadcast Badge
      ctx.fillStyle = "rgba(220, 38, 38, 0.92)";
      ctx.fillRect(canvas.width - 270, 20, 250, 38);
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("● LIVE FACULTY BROADCAST", canvas.width - 250, 44);

      // Bottom Right Reflectivity Scale
      ctx.fillStyle = "rgba(10, 25, 47, 0.90)";
      ctx.fillRect(canvas.width - 250, canvas.height - 105, 230, 85);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
      ctx.strokeRect(canvas.width - 250, canvas.height - 105, 230, 85);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "10px sans-serif";
      ctx.fillText("REFLECTIVITY SCALE (dBZ):", canvas.width - 235, canvas.height - 86);

      const dbzBars = [
        { label: "15", col: "#0EA5E9" },
        { label: "30", col: "#22C55E" },
        { label: "45", col: "#F59E0B" },
        { label: "60+", col: "#EF4444" }
      ];
      dbzBars.forEach((b, i) => {
        ctx.fillStyle = b.col;
        ctx.fillRect(canvas.width - 235 + i * 52, canvas.height - 76, 44, 10);
        ctx.fillStyle = "#FFF";
        ctx.font = "9px monospace";
        ctx.fillText(b.label, canvas.width - 235 + i * 52 + 14, canvas.height - 54);
      });

      // Advance beam angle
      angle += 0.035;
      if (angle > Math.PI * 2) angle = 0;

      this.radarAnimationId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    if (canvas.captureStream) {
      this.simulatedStream = canvas.captureStream(30);
    }

    return this.simulatedStream;
  }

  startBroadcastTimer() {
    this.stopBroadcastTimer();
    this.broadcastStartTime = Date.now();
    this.broadcastTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.broadcastStartTime) / 1000);
      this.broadcastElapsedSeconds = elapsed;
      const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const secs = String(elapsed % 60).padStart(2, "0");
      const timerEl = document.getElementById("broadcast-timer-display");
      if (timerEl) {
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  stopBroadcastTimer() {
    if (this.broadcastTimerInterval) {
      clearInterval(this.broadcastTimerInterval);
      this.broadcastTimerInterval = null;
    }
  }

  getFormattedBroadcastTime() {
    const elapsed = this.broadcastElapsedSeconds || 0;
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }

  startPollCountdown(container, currentSession) {
    this.stopPollCountdown();
    this.pollTimerInterval = setInterval(() => {
      this.pollRemainingSeconds -= 1;

      const secEl = container.querySelector("#poll-timer-seconds");
      const barEl = container.querySelector("#poll-time-progress-fill");
      const badgeEl = container.querySelector("#poll-timer-badge");

      if (secEl) secEl.textContent = Math.max(0, this.pollRemainingSeconds);
      if (barEl) barEl.style.width = Math.max(0, (this.pollRemainingSeconds / 30) * 100) + "%";

      if (this.pollRemainingSeconds <= 7 && badgeEl) {
        badgeEl.classList.add("urgent");
      }

      if (this.pollRemainingSeconds <= 0) {
        this.stopPollCountdown();
        this.autoDismissPoll(container, currentSession);
      }
    }, 1000);
  }

  stopPollCountdown() {
    if (this.pollTimerInterval) {
      clearInterval(this.pollTimerInterval);
      this.pollTimerInterval = null;
    }
  }

  dismissPoll(container, currentSession, userTriggered = true) {
    this.stopPollCountdown();
    this.isPollDismissed = true;
    if (currentSession && currentSession.activePoll) {
      this.dismissedPollId = currentSession.activePoll.id;
    }

    const pollCard = container.querySelector("#in-stream-live-poll");
    if (pollCard) {
      pollCard.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
      pollCard.style.opacity = "0";
      pollCard.style.transform = "translateY(20px)";
      setTimeout(() => {
        if (pollCard && pollCard.parentNode) pollCard.remove();
      }, 350);
    }

    if (userTriggered) {
      this.appState.showToast("In-class poll closed.");
    }
  }

  autoDismissPoll(container, currentSession) {
    this.stopPollCountdown();
    const statusMsg = container.querySelector("#poll-status-message");
    const timerBadge = container.querySelector("#poll-timer-badge");
    if (timerBadge) timerBadge.innerHTML = "⏱️ Concluded";
    if (statusMsg) statusMsg.innerHTML = "<strong style='color:var(--saffron-gold)'>Time Expired (30s complete)</strong>";

    setTimeout(() => {
      this.dismissPoll(container, currentSession, false);
      this.appState.showToast("In-class 30s poll concluded.");
      if (currentSession && currentSession.activePoll) {
        currentSession.activePoll.isActive = false;
      }
    }, 1200);
  }

  openScheduleModal() {
    this.isScheduleModalOpen = true;
    if (this._lastContainer) {
      this.render(this._lastContainer);
    }
  }

  closeScheduleModal() {
    this.isScheduleModalOpen = false;
    if (this._lastContainer) {
      this.render(this._lastContainer);
    }
  }

  openPollModal() {
    this.isPollModalOpen = true;
    if (this._lastContainer) {
      this.render(this._lastContainer);
    }
  }

  closePollModal() {
    this.isPollModalOpen = false;
    if (this._lastContainer) {
      this.render(this._lastContainer);
    }
  }

  render(container) {
    this._lastContainer = container;
    let liveClasses = this.appState.liveClasses || [];

    // Fallback: If empty, restore official MoES cohort sessions immediately
    if (liveClasses.length === 0 && this.appState.loadFallbackSeedData) {
      this.appState.loadFallbackSeedData();
      this.appState.saveLocalDb();
      liveClasses = this.appState.liveClasses || [];
    }

    let currentSession = liveClasses.find(l => l.id === this.activeSessionId) || liveClasses[0];

    if (!currentSession) {
      container.innerHTML = `
        <div class="app-container" style="padding: 60px 20px; text-align: center;">
          <div class="card" style="padding: 40px; max-width: 500px; margin: 0 auto; box-shadow: var(--shadow-md);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-cyan)" stroke-width="1.5" style="margin-bottom: 16px;"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            <h3 style="margin-bottom: 8px;">No Live Session Active</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px; line-height: 1.5;">There are no active ministerial broadcasts scheduled at this exact moment.</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" id="btn-create-first-session">Schedule First Session</button>
              <button class="btn btn-outline btn-sm" id="btn-restore-default-sessions">Restore MoES Cohorts</button>
            </div>
          </div>
        </div>
        ${this.isScheduleModalOpen ? this.renderScheduleModalHtml() : ''}
      `;
      const btn = container.querySelector("#btn-create-first-session");
      if (btn) {
        btn.addEventListener("click", () => {
          this.isScheduleModalOpen = true;
          this.render(container);
        });
      }
      const restoreBtn = container.querySelector("#btn-restore-default-sessions");
      if (restoreBtn) {
        restoreBtn.addEventListener("click", () => {
          if (this.appState.loadFallbackSeedData) {
            this.appState.loadFallbackSeedData();
            this.appState.saveLocalDb();
            this.render(container);
          }
        });
      }
      this.bindScheduleModalEvents(container);
      return;
    }

    const user = this.appState.currentUser;
    const isTrainerOrAdmin = user && (user.role === "trainer" || user.role === "admin");
    const isTrainer = user && user.role === "trainer";
    const isAdmin = user && user.role === "admin";
    const t = (k, def) => (window.i18n ? window.i18n.t(k, def) : def);

    const chatCount = (currentSession.chatMessages || []).length;
    const qaList = currentSession.qaQuestions || [];
    const activePoll = currentSession.activePoll;
    const isPollActive = activePoll && activePoll.isActive && (!this.isPollDismissed || this.dismissedPollId !== activePoll.id);
    if (isPollActive && this.currentPollId !== activePoll.id) {
      this.currentPollId = activePoll.id;
      this.pollRemainingSeconds = 30;
      this.isPollDismissed = false;
      this.hasVotedCurrentPoll = false;
      this.selectedPollOption = null;
    }

    // Online Mock Officers Roster
    const officersRoster = [
      { name: "Dr. Anita Desai", institute: "IMD", role: "trainer", isInstructor: true, status: "Presenting" },
      { name: "Dr. Rajesh Sharma", institute: "IMD", role: "employee", handRaised: this.hasRaisedHand, status: "Active" },
      { name: "Er. Vivek Nair", institute: "NCMRWF", role: "employee", status: "Active" },
      { name: "Dr. P. Balakrishnan", institute: "INCOIS", role: "trainer", status: "Active" },
      { name: "Dr. Sunita Rao", institute: "IITM", role: "employee", status: "Active" },
      { name: "Er. A. K. Verma", institute: "NIOT", role: "employee", status: "Active" },
      { name: "Dr. Thamban Meloth", institute: "NCPOR", role: "trainer", status: "Active" }
    ];

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 50px;">
        
        <!-- 1. Header & Live Session Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="live-badge" style="background: var(--emergency-red); color: #FFF; border: none; font-size: 0.72rem; padding: 3px 10px;">
                <span class="pulse-dot" style="background: #FFF;"></span>
                ${currentSession.status === 'live' ? 'LIVE BROADCAST' : 'SCHEDULED COHORT'}
              </span>
              <span class="role-tag ${currentSession.institute.toLowerCase()}">${currentSession.institute}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
                NIC National Telemetry CDN
              </span>
            </div>
            
            <h1 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin: 0 0 4px 0;">
              ${currentSession.title}
            </h1>
            
            <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; display: flex; align-items: center; gap: 6px;">
              <span>Faculty: <strong>${currentSession.trainerName}</strong></span>
              <span>·</span>
              <span>${currentSession.courseTitle || 'National Geoscience Special'}</span>
            </p>
          </div>

          <!-- Top Action Bar (Role-Based Controls) -->
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            ${isTrainerOrAdmin ? `
              <button class="btn btn-outline btn-sm ${this.isBroadcasting ? 'btn-danger' : 'btn-primary'}" id="btn-toggle-broadcast">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                ${this.isBroadcasting ? 'End Broadcast' : 'Go Live (Webcam)'}
              </button>

              <button class="btn btn-outline btn-sm" id="btn-trigger-poll-modal">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Launch Poll
              </button>

              <button class="btn btn-saffron btn-sm" id="btn-schedule-session-modal">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Schedule Class
              </button>
            ` : `
              <!-- Learner Hand-Raise Toggle -->
              <button class="btn ${this.hasRaisedHand ? 'btn-saffron' : 'btn-outline'} btn-sm" id="btn-raise-hand">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                </svg>
                ${this.hasRaisedHand ? 'Hand Raised (Queue #1)' : 'Raise Hand'}
              </button>

              <!-- Picture-in-Picture Toggle -->
              <button class="btn btn-outline btn-sm" id="btn-toggle-pip" title="Picture in Picture">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <rect width="18" height="12" x="3" y="3" rx="2"/><rect width="8" height="5" x="11" y="9" rx="1"/>
                </svg>
                PiP Mode
              </button>
            `}
          </div>
        </div>

        <!-- 2. Main Interactive Classroom Grid -->
        <div class="live-classroom-grid">
          
          <!-- LEFT COLUMN: Video Stream & Media Broadcaster -->
          <div>
            <div class="live-media-wrapper">
              <video 
                id="live-stream-video" 
                class="live-video-element"
                ${this.isBroadcasting ? '' : `src="${currentSession.streamUrl || ''}" controls`}
                autoplay 
                playsinline 
                muted
              ></video>

              <!-- Faculty Camera Paused Overlay -->
              ${this.isBroadcasting && this.isCameraOff ? `
                <div class="camera-paused-overlay">
                  <div class="faculty-avatar-circle">
                    ${(currentSession.trainerName || 'Dr. Anita Desai').split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div style="font-weight: 700; font-size: 1rem; margin-top: 12px; color: #FFF;">
                    ${currentSession.trainerName || 'Dr. Anita Desai'}
                  </div>
                  <div style="font-size: 0.78rem; color: #94A3B8; margin-top: 4px;">
                    Faculty Camera Paused · Live Audio Transmission Active
                  </div>
                  <div class="audio-wave-pulse">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>
              ` : ''}

              <!-- Stream Information Overlay -->
              <div style="position: absolute; top: 16px; left: 16px; display: flex; gap: 8px; z-index: 10; align-items: center; flex-wrap: wrap;">
                <span class="live-badge" style="background: rgba(220, 38, 38, 0.92); color: #FFF; border: none; font-size: 0.72rem; padding: 4px 10px;">
                  <span class="pulse-dot" style="background: #FFF;"></span>
                  ${this.isBroadcasting ? 'FACULTY BROADCAST' : 'INTERACTIVE STREAM'}
                </span>

                ${this.isBroadcasting ? `
                  <span style="background: rgba(0, 0, 0, 0.75); color: #FFF; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; font-family: monospace; font-weight: 700; border: 1px solid rgba(255,255,255,0.2);">
                    LIVE <span id="broadcast-timer-display">${this.getFormattedBroadcastTime()}</span>
                  </span>
                  <span style="background: rgba(14, 165, 233, 0.85); color: #FFF; padding: 4px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 700;">
                    ${this.isScreenSharing ? '🖥️ Screen Share' : this.activeFeedMode === 'webcam' ? '📷 Webcam Live' : '🛰️ S-Band Radar Telemetry'}
                  </span>
                ` : ''}
                
                <span style="background: rgba(10, 38, 71, 0.85); backdrop-filter: blur(8px); color: #FFF; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 600; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.15);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  ${currentSession.attendeesCount || 54} Officers Online
                </span>
              </div>

              <!-- Faculty Alert: Raised Hand Banner (Visible when learner raises hand) -->
              ${this.hasRaisedHand ? `
                <div class="hand-raise-alert-banner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--saffron-gold)" stroke-width="2.5"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                  <div>
                    <div style="font-weight: 700; font-size: 0.85rem;">Dr. Rajesh Sharma (IMD) raised hand</div>
                    <div style="font-size: 0.72rem; color: #CBD5E1;">Awaiting faculty interaction · Queue #1</div>
                  </div>
                  ${isTrainerOrAdmin ? `
                    <button class="btn btn-outline btn-sm" id="btn-ack-hand" style="color: var(--saffron-gold); border-color: var(--saffron-gold); padding: 4px 10px; font-size: 0.72rem;">
                      Grant Mic
                    </button>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Floating In-Stream Live Poll Card (If active) -->
              ${isPollActive ? `
                <div class="in-stream-poll-card" id="in-stream-live-poll">
                  <!-- Time Progress Bar -->
                  <div class="poll-time-progress-bar">
                    <div class="poll-time-progress-fill" id="poll-time-progress-fill" style="width: ${(this.pollRemainingSeconds / 30) * 100}%;"></div>
                  </div>

                  <!-- Header with Title, Countdown & Cut/Close Button -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 0.7rem; font-weight: 800; color: var(--saffron-gold); letter-spacing: 0.05em; text-transform: uppercase;">
                        Live In-Class Poll
                      </span>
                      <span id="poll-timer-badge" class="poll-countdown-badge ${this.pollRemainingSeconds <= 7 ? 'urgent' : ''}">
                        ⏱️ <span id="poll-timer-seconds">${this.pollRemainingSeconds}</span>s
                      </span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 0.72rem; color: #CBD5E1;" id="poll-vote-count">${activePoll.totalVotes || 0} Votes</span>
                      <button class="poll-close-btn" id="btn-close-in-stream-poll" title="Cut / Close Poll (कट करें)" aria-label="Dismiss Poll">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 12px; line-height: 1.35;">
                    ${activePoll.question}
                  </div>

                  <div class="poll-options-container" id="poll-options-container">
                    ${activePoll.options.map((opt, idx) => {
                      const total = activePoll.totalVotes || 1;
                      const pct = Math.round((opt.votes / total) * 100);
                      const isVoted = this.selectedPollOption === idx;
                      return `
                        <div class="poll-option-row ${isVoted ? 'voted' : ''}" data-idx="${idx}">
                          <div class="poll-bar-fill" style="width: ${this.hasVotedCurrentPoll ? pct : 0}%;"></div>
                          <div class="poll-option-text">
                            <span>${opt.label}</span>
                            ${this.hasVotedCurrentPoll ? `<span style="font-weight: 800; color: #38BDF8;">${pct}%</span>` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 0.7rem; color: #94A3B8;">
                    <span id="poll-status-message">${this.hasVotedCurrentPoll ? '✓ Response logged in telemetry' : 'Click any option above to cast your instant response'}</span>
                    <button type="button" id="btn-text-dismiss-poll" style="background: none; border: none; color: #94A3B8; cursor: pointer; text-decoration: underline; font-size: 0.68rem; padding: 0;">
                      Close Poll (हटाएं)
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Broadcaster Deck Control Bar (For Faculty & Presentation) -->
            <div class="broadcaster-deck">
              <div class="broadcaster-btn-group">
                ${isTrainerOrAdmin ? `
                  <button class="deck-control-btn ${this.isMicMuted ? 'active' : ''}" id="deck-toggle-mic" title="Mute/Unmute Mic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                    <span>${this.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                  </button>

                  <button class="deck-control-btn ${this.isCameraOff ? 'active' : ''}" id="deck-toggle-camera" title="Toggle Camera">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
                    </svg>
                    <span>${this.isCameraOff ? 'Start Camera' : 'Stop Camera'}</span>
                  </button>

                  <button class="deck-control-btn ${this.isScreenSharing ? 'active' : ''}" id="deck-toggle-screen" title="Share Screen">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
                    </svg>
                    <span>${this.isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
                  </button>

                  ${this.isBroadcasting ? `
                    <button class="deck-control-btn ${this.activeFeedMode === 'radar' ? 'active' : ''}" id="deck-toggle-feed-mode" title="Switch between Webcam and Doppler Radar Telemetry">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                      </svg>
                      <span>${this.activeFeedMode === 'radar' ? 'Switch to Webcam' : 'Switch to Radar'}</span>
                    </button>
                  ` : ''}
                ` : `
                  <span style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--forest-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Connected to National WebRTC Hub
                  </span>
                `}
              </div>

              <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--forest-green); display: inline-block;"></span>
                  1080p · 60fps
                </span>
                <span>·</span>
                <span>Latency: 28ms</span>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Tabbed Engagement Hub (Chat, Q&A, Roster) -->
          <div class="classroom-sidebar">
            
            <!-- Tab Navigation Bar -->
            <div class="classroom-tab-nav">
              <button class="classroom-tab-btn ${this.activeTab === 'chat' ? 'active' : ''}" data-tab="chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat (${chatCount})
              </button>

              <button class="classroom-tab-btn ${this.activeTab === 'qa' ? 'active' : ''}" data-tab="qa">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Q&A (${qaList.length})
              </button>

              <button class="classroom-tab-btn ${this.activeTab === 'roster' ? 'active' : ''}" data-tab="roster">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Roster (${officersRoster.length})
              </button>
            </div>

            <!-- Tab Content 1: Live Chat -->
            ${this.activeTab === 'chat' ? `
              <div class="classroom-tab-content" id="live-chat-scroll-area">
                ${(currentSession.chatMessages || []).map(msg => `
                  <div style="background: var(--bg-subtle); padding: 10px 12px; border-radius: 8px; border-left: 3px solid ${msg.role === 'trainer' ? 'var(--ocean-cyan)' : msg.role === 'admin' ? 'var(--saffron-gold)' : 'var(--border-medium)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-weight: 700; font-size: 0.8rem; color: var(--text-main);">${msg.senderName}</span>
                        ${msg.role === 'trainer' ? '<span class="role-tag trainer" style="font-size: 0.6rem;">FACULTY</span>' : ''}
                        ${msg.role === 'admin' ? '<span class="role-tag admin" style="font-size: 0.6rem;">DIRECTOR</span>' : ''}
                      </div>
                      <span style="font-size: 0.68rem; color: var(--text-muted);">${msg.timestamp || 'Now'}</span>
                    </div>
                    <div style="font-size: 0.8125rem; color: var(--text-main); line-height: 1.4;">
                      ${msg.message}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Chat Input Bar -->
              <div style="padding: 12px; border-top: 1px solid var(--border-light); background: var(--bg-surface);">
                <form id="classroom-chat-form" style="display: flex; gap: 8px;">
                  <input 
                    type="text" 
                    class="form-control" 
                    id="classroom-chat-input" 
                    placeholder="Ask or comment in live cohort..." 
                    style="padding: 8px 12px; font-size: 0.82rem; height: 38px;" 
                    required 
                  />
                  <button type="submit" class="btn btn-primary btn-sm" style="padding: 0 14px; height: 38px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </form>
              </div>
            ` : ''}

            <!-- Tab Content 2: Moderated Q&A Doubts -->
            ${this.activeTab === 'qa' ? `
              <div class="classroom-tab-content" id="live-qa-scroll-area">
                <div style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-subtle); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-light); display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Vote on important questions to highlight them to the faculty.
                </div>

                ${qaList.map(item => `
                  <div class="qa-item-card ${item.isAnswered ? 'answered' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                      <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main); margin-bottom: 4px;">
                          ${item.question}
                        </div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center;">
                          <span>${item.senderName}</span>
                          <span>·</span>
                          <span>${item.timestamp}</span>
                        </div>
                      </div>

                      <button class="qa-upvote-btn" data-qid="${item.id}" title="Upvote this question">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                        <span>${item.upvotes || 0}</span>
                      </button>
                    </div>

                    ${item.isAnswered ? `
                      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-light); font-size: 0.78rem; color: var(--forest-green); display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Answered Live by Faculty</span>
                      </div>
                    ` : isTrainerOrAdmin ? `
                      <button class="btn btn-outline btn-sm btn-mark-answered" data-qid="${item.id}" style="margin-top: 8px; padding: 3px 8px; font-size: 0.7rem; width: 100%;">
                        Mark Answered Live
                      </button>
                    ` : ''}
                  </div>
                `).join('')}
              </div>

              <!-- Ask Q&A Form -->
              <div style="padding: 12px; border-top: 1px solid var(--border-light); background: var(--bg-surface);">
                <form id="classroom-qa-form" style="display: flex; gap: 8px;">
                  <input 
                    type="text" 
                    class="form-control" 
                    id="classroom-qa-input" 
                    placeholder="Ask formal doubt for faculty queue..." 
                    style="padding: 8px 12px; font-size: 0.82rem; height: 38px;" 
                    required 
                  />
                  <button type="submit" class="btn btn-outline btn-sm" style="padding: 0 14px; height: 38px; font-weight: 700;">
                    Post
                  </button>
                </form>
              </div>
            ` : ''}

            <!-- Tab Content 3: Officers Roster -->
            ${this.activeTab === 'roster' ? `
              <div class="classroom-tab-content">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
                  Active Online Participants across Ministry Institutes:
                </div>

                ${officersRoster.map(officer => `
                  <div class="participant-list-item">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary-navy); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700;">
                        ${officer.name.split(' ')[1] ? officer.name.split(' ')[1][0] : officer.name[0]}
                      </div>
                      <div>
                        <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-main);">
                          ${officer.name}
                        </div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">
                          ${officer.institute} · ${officer.role}
                        </div>
                      </div>
                    </div>

                    <div>
                      ${officer.handRaised ? `
                        <span style="background: rgba(245, 158, 11, 0.15); color: #D97706; padding: 2px 6px; border-radius: 4px; font-size: 0.68rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                          Hand Raised
                        </span>
                      ` : officer.isInstructor ? `
                        <span class="role-tag trainer" style="font-size: 0.65rem;">HOST</span>
                      ` : `
                        <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--forest-green); display: inline-block;"></span>
                      `}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

          </div>
        </div>

        <!-- 3. Multi-Institute Cohort Sessions Grid -->
        <div style="margin-top: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; color: var(--text-main);">
                National MoES Training Cohorts
              </h3>
              <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">
                Autonomous geoscience institutes live broadcast and scheduled training rooms
              </p>
            </div>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--ocean-cyan);">
              ${liveClasses.length} Programs Registered
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            ${liveClasses.map(cls => {
              const isCurrent = cls.id === currentSession.id;
              return `
                <div class="card" style="padding: 18px; border-radius: 12px; border-left: 4px solid ${cls.status === 'live' ? 'var(--emergency-red)' : 'var(--ocean-cyan)'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="role-tag ${cls.institute.toLowerCase()}">${cls.institute}</span>
                    ${cls.status === 'live' ? `
                      <span class="live-badge" style="font-size: 0.65rem; padding: 2px 6px;">
                        <span class="pulse-dot"></span>LIVE
                      </span>
                    ` : `
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">UPCOMING</span>
                    `}
                  </div>

                  <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0 0 6px 0; color: var(--text-main); line-height: 1.35;">
                    ${cls.title}
                  </h4>

                  <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0 0 14px 0;">
                    Instructor: <strong>${cls.trainerName}</strong>
                  </p>

                  <button class="btn ${isCurrent ? 'btn-primary' : 'btn-outline'} btn-sm switch-session-btn" data-id="${cls.id}" style="width: 100%; justify-content: center; font-size: 0.78rem;">
                    ${isCurrent ? 'Viewing Active Stream' : 'Switch to this Classroom'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Schedule Modal Dialog (Rendered when isScheduleModalOpen is true) -->
      ${this.isScheduleModalOpen ? this.renderScheduleModalHtml() : ''}

      <!-- Poll Launcher Modal (For Faculty) -->
      ${this.isPollModalOpen ? this.renderPollModalHtml() : ''}
    `;

    this.bindEvents(container, currentSession);
  }

  renderScheduleModalHtml() {
    return `
      <div class="modal-overlay active" id="schedule-modal-overlay">
        <div class="modal-card modal-schedule-dialog" style="max-width: 540px;">
          <div class="modal-header" style="background: linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-light) 100%);">
            <div>
              <h3 style="font-size: 1.1rem; color: #FFF; margin: 0;">Schedule New MoES Live Session</h3>
              <p style="font-size: 0.75rem; color: #94A3B8; margin: 2px 0 0;">Ministry of Earth Sciences Live Capacity Building Engine</p>
            </div>
            <button class="modal-close" id="schedule-modal-close" style="color:#FFF;">&times;</button>
          </div>

          <div class="modal-body" style="padding: 24px;">
            <form id="new-live-session-form" style="display: flex; flex-direction: column; gap: 14px;">
              <div>
                <label class="form-label" style="font-size: 0.8rem; font-weight: 700;">Session Topic / Title <span style="color:var(--ocean-cyan)">*</span></label>
                <input type="text" class="form-control" id="sched-title" placeholder="e.g. S-Band Radar Calibration Protocols" required style="font-size: 0.88rem;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="form-label" style="font-size: 0.8rem; font-weight: 700;">Host Institute</label>
                  <select class="form-control" id="sched-inst" style="font-size: 0.85rem;">
                    <option value="IMD">IMD (Delhi)</option>
                    <option value="INCOIS">INCOIS (Hyderabad)</option>
                    <option value="IITM">IITM (Pune)</option>
                    <option value="NCMRWF">NCMRWF (Noida)</option>
                    <option value="NIOT">NIOT (Chennai)</option>
                    <option value="NCPOR">NCPOR (Goa)</option>
                  </select>
                </div>

                <div>
                  <label class="form-label" style="font-size: 0.8rem; font-weight: 700;">Instructor / Specialist</label>
                  <input type="text" class="form-control" id="sched-trainer" value="Dr. Anita Desai" required style="font-size: 0.85rem;" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="form-label" style="font-size: 0.8rem; font-weight: 700;">Status</label>
                  <select class="form-control" id="sched-status" style="font-size: 0.85rem;">
                    <option value="live">Go Live Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>

                <div>
                  <label class="form-label" style="font-size: 0.8rem; font-weight: 700;">Estimated Duration</label>
                  <select class="form-control" id="sched-duration" style="font-size: 0.85rem;">
                    <option value="45">45 Minutes</option>
                    <option value="60" selected>60 Minutes</option>
                    <option value="90">90 Minutes</option>
                    <option value="120">120 Minutes</option>
                  </select>
                </div>
              </div>

              <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button type="button" class="btn btn-outline" id="btn-cancel-schedule" style="flex: 1;">Cancel</button>
                <button type="submit" class="btn btn-primary" style="flex: 2; font-weight: 700;">Create & Launch</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  renderPollModalHtml() {
    return `
      <div class="modal-overlay active" id="poll-modal-overlay">
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header" style="background: var(--primary-navy);">
            <div>
              <h3 style="font-size: 1.1rem; color: #FFF; margin: 0;">Launch In-Class Interactive Poll</h3>
              <p style="font-size: 0.75rem; color: #94A3B8; margin: 2px 0 0;">Interactive Comprehension Telemetry</p>
            </div>
            <button class="modal-close" id="poll-modal-close" style="color:#FFF;">&times;</button>
          </div>

          <div class="modal-body" style="padding: 24px;">
            <form id="poll-creator-form" style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label class="form-label" style="font-size: 0.8rem; font-weight: 700;">Poll Question <span style="color:var(--ocean-cyan)">*</span></label>
                <input type="text" class="form-control" id="poll-input-q" placeholder="e.g. Which polarimetric moment identifies hail?" value="Which polarimetric moment is most reliable for discriminating hail?" required style="font-size: 0.85rem;" />
              </div>

              <div>
                <label class="form-label" style="font-size: 0.78rem; font-weight: 700;">Option A</label>
                <input type="text" class="form-control" id="poll-opt-1" value="Differential Reflectivity (ZDR)" required style="font-size: 0.82rem;" />
              </div>

              <div>
                <label class="form-label" style="font-size: 0.78rem; font-weight: 700;">Option B</label>
                <input type="text" class="form-control" id="poll-opt-2" value="Specific Differential Phase (KDP)" required style="font-size: 0.82rem;" />
              </div>

              <div>
                <label class="form-label" style="font-size: 0.78rem; font-weight: 700;">Option C</label>
                <input type="text" class="form-control" id="poll-opt-3" value="Correlation Coefficient (RhoHV)" required style="font-size: 0.82rem;" />
              </div>

              <div>
                <label class="form-label" style="font-size: 0.78rem; font-weight: 700;">Option D</label>
                <input type="text" class="form-control" id="poll-opt-4" value="Total Power Reflectivity (dBZ)" required style="font-size: 0.82rem;" />
              </div>

              <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button type="button" class="btn btn-outline" id="btn-cancel-poll" style="flex: 1;">Cancel</button>
                <button type="submit" class="btn btn-primary" style="flex: 2; font-weight: 700;">Launch Poll Now</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(container, currentSession) {
    const videoEl = container.querySelector("#live-stream-video");

    // 0. Connect and sustain active stream (Webcam, Screen Share, or Live Doppler Radar Feed)
    if (videoEl) {
      if (this.isBroadcasting) {
        if (this.isScreenSharing && this.screenStream) {
          videoEl.srcObject = this.screenStream;
        } else if (this.activeFeedMode === "webcam" && this.localMediaStream) {
          videoEl.srcObject = this.localMediaStream;
        } else {
          const radarStream = this.getRadarStream();
          if (radarStream) videoEl.srcObject = radarStream;
        }
        videoEl.play().catch(e => console.log("[Live Broadcast] stream notice:", e));
      } else {
        // Viewer mode: Fallback to animated telemetry radar if stream fails
        videoEl.onerror = () => {
          console.warn("[Interactive Stream] Fallback to live radar stream");
          const radarStream = this.getRadarStream();
          if (radarStream) {
            videoEl.srcObject = radarStream;
            videoEl.play().catch(e => console.log(e));
          }
        };
        videoEl.play().catch(() => {
          videoEl.muted = true;
          videoEl.play().catch(e => console.log(e));
        });
      }
    }

    // Start/manage 30-second poll countdown timer
    const activePoll = currentSession.activePoll;
    const isPollActive = activePoll && activePoll.isActive && (!this.isPollDismissed || this.dismissedPollId !== activePoll.id);
    if (isPollActive) {
      this.startPollCountdown(container, currentSession);
    } else {
      this.stopPollCountdown();
    }

    // Cut / Close poll buttons (हटाएं)
    const pollCloseBtn = container.querySelector("#btn-close-in-stream-poll");
    if (pollCloseBtn) {
      pollCloseBtn.addEventListener("click", () => {
        this.dismissPoll(container, currentSession, true);
      });
    }
    const pollTextCloseBtn = container.querySelector("#btn-text-dismiss-poll");
    if (pollTextCloseBtn) {
      pollTextCloseBtn.addEventListener("click", () => {
        this.dismissPoll(container, currentSession, true);
      });
    }

    // 1. Tab Navigation (Chat / Q&A / Roster)
    container.querySelectorAll(".classroom-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-tab");
        if (tab) {
          this.activeTab = tab;
          this.render(container);
        }
      });
    });

    // 2. Chat message form submit
    const chatForm = container.querySelector("#classroom-chat-form");
    if (chatForm) {
      chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = container.querySelector("#classroom-chat-input");
        const msg = input ? input.value.trim() : "";
        if (!msg) return;

        await this.appState.postLiveChatMessage(currentSession.id, msg);
        if (input) input.value = "";
        this.render(container);

        // Auto-scroll chat area to bottom
        const scrollArea = container.querySelector("#live-chat-scroll-area");
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      });
    }

    // 3. Q&A Question submit
    const qaForm = container.querySelector("#classroom-qa-form");
    if (qaForm) {
      qaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = container.querySelector("#classroom-qa-input");
        const q = input ? input.value.trim() : "";
        if (!q) return;

        await this.appState.submitQAQuestion(currentSession.id, q);
        if (input) input.value = "";
        this.render(container);
      });
    }

    // 4. Q&A Upvote buttons
    container.querySelectorAll(".qa-upvote-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const qid = e.currentTarget.getAttribute("data-qid");
        if (qid) {
          this.appState.upvoteQAQuestion(currentSession.id, qid);
          this.render(container);
        }
      });
    });

    // 5. Faculty Mark Question Answered
    container.querySelectorAll(".btn-mark-answered").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const qid = e.currentTarget.getAttribute("data-qid");
        if (qid) {
          this.appState.answerQAQuestion(currentSession.id, qid);
          this.render(container);
        }
      });
    });

    // 6. Learner Raise Hand Toggle
    const handBtn = container.querySelector("#btn-raise-hand");
    if (handBtn) {
      handBtn.addEventListener("click", () => {
        this.hasRaisedHand = !this.hasRaisedHand;
        if (this.hasRaisedHand) {
          this.handRaisedTimestamp = Date.now();
          this.appState.showToast("Your hand is raised! The faculty has been notified.");
        } else {
          this.handRaisedTimestamp = null;
          this.appState.showToast("Hand lowered.");
        }
        this.render(container);
      });
    }

    // Faculty Acknowledge Hand
    const ackHandBtn = container.querySelector("#btn-ack-hand");
    if (ackHandBtn) {
      ackHandBtn.addEventListener("click", () => {
        this.hasRaisedHand = false;
        this.appState.showToast("Acknowledged Dr. Rajesh Sharma. Microphone privileges granted.");
        this.render(container);
      });
    }

    // 7. Interactive Poll Voting (Smooth in-place DOM update)
    container.querySelectorAll(".poll-option-row").forEach(row => {
      row.addEventListener("click", (e) => {
        if (this.hasVotedCurrentPoll) return;
        const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
        if (!isNaN(idx) && currentSession.activePoll) {
          this.selectedPollOption = idx;
          this.hasVotedCurrentPoll = true;
          this.appState.castPollVote(currentSession.id, currentSession.activePoll.id, idx);

          // Update poll in place without resetting video stream
          const poll = currentSession.activePoll;
          const total = poll.totalVotes || 1;
          const rows = container.querySelectorAll(".poll-option-row");
          rows.forEach((r, rIdx) => {
            const opt = poll.options[rIdx];
            if (opt) {
              const pct = Math.round((opt.votes / total) * 100);
              const bar = r.querySelector(".poll-bar-fill");
              if (bar) bar.style.width = pct + "%";
              const textDiv = r.querySelector(".poll-option-text");
              if (textDiv) {
                textDiv.innerHTML = `<span>${opt.label}</span><span style="font-weight: 800; color: #38BDF8;">${pct}%</span>`;
              }
            }
            if (rIdx === idx) r.classList.add("voted");
          });

          const voteCountEl = container.querySelector("#poll-vote-count");
          if (voteCountEl) voteCountEl.textContent = `${poll.totalVotes} Votes`;

          const statusMsgEl = container.querySelector("#poll-status-message");
          if (statusMsgEl) statusMsgEl.textContent = "✓ Response recorded in live telemetry";
        }
      });
    });

    // 8. Picture in Picture (PiP)
    const pipBtn = container.querySelector("#btn-toggle-pip");
    if (pipBtn && videoEl) {
      pipBtn.addEventListener("click", async () => {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (videoEl.requestPictureInPicture) {
            await videoEl.requestPictureInPicture();
          }
        } catch (err) {
          this.appState.showToast("Picture-in-Picture not supported in this view.", "warning");
        }
      });
    }

    // 9. Faculty WebRTC Go Live Broadcast (Webcam / Mic / Radar)
    const broadcastBtn = container.querySelector("#btn-toggle-broadcast");
    if (broadcastBtn) {
      broadcastBtn.addEventListener("click", async () => {
        if (!this.isBroadcasting) {
          this.isBroadcasting = true;
          this.startBroadcastTimer();

          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              this.localMediaStream = stream;
              this.activeFeedMode = "webcam";
              this.appState.showToast("Live webcam broadcast started! Streaming to MoES cohort.");
              this.render(container);
            } else {
              throw new Error("getUserMedia unavailable");
            }
          } catch (err) {
            console.warn("[WebRTC] Fallback to simulated Doppler Radar stream:", err.message);
            this.activeFeedMode = "radar";
            this.appState.showToast("Webcam unavailable. Live IMD Doppler Radar broadcast stream active!");
            this.render(container);
          }
        } else {
          // Stop broadcast
          if (this.localMediaStream) {
            this.localMediaStream.getTracks().forEach(track => track.stop());
            this.localMediaStream = null;
          }
          if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
          }
          this.isBroadcasting = false;
          this.isScreenSharing = false;
          this.isCameraOff = false;
          this.isMicMuted = false;
          this.stopBroadcastTimer();
          if (videoEl) videoEl.srcObject = null;
          this.appState.showToast("Live broadcast ended.");
          this.render(container);
        }
      });
    }

    // Broadcaster Feed Mode Toggle (Webcam / Radar)
    const feedToggleBtn = container.querySelector("#deck-toggle-feed-mode");
    if (feedToggleBtn) {
      feedToggleBtn.addEventListener("click", async () => {
        if (this.activeFeedMode === "radar") {
          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              this.localMediaStream = stream;
              this.activeFeedMode = "webcam";
              this.appState.showToast("Switched to live webcam feed.");
              this.render(container);
            } else {
              throw new Error("getUserMedia unavailable");
            }
          } catch (err) {
            this.appState.showToast("Camera access unavailable. Continuing Doppler Radar feed.", "warning");
          }
        } else {
          this.activeFeedMode = "radar";
          this.appState.showToast("Switched to Live Doppler Weather Radar Telemetry.");
          this.render(container);
        }
      });
    }

    // 10. Screen Share Toggle
    const screenBtn = container.querySelector("#deck-toggle-screen");
    if (screenBtn) {
      screenBtn.addEventListener("click", async () => {
        if (!this.isScreenSharing) {
          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
              const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
              this.screenStream = screenStream;
              this.isScreenSharing = true;
              screenStream.getVideoTracks()[0].onended = () => {
                this.isScreenSharing = false;
                this.screenStream = null;
                this.render(container);
              };
              this.appState.showToast("Screen sharing active (Radar / Presentation view).");
              this.render(container);
            }
          } catch (err) {
            console.warn("[ScreenShare Error]", err);
          }
        } else {
          if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
          }
          this.isScreenSharing = false;
          this.appState.showToast("Returned to broadcast camera/telemetry view.");
          this.render(container);
        }
      });
    }

    // 11. Mute Mic Toggle
    const micBtn = container.querySelector("#deck-toggle-mic");
    if (micBtn) {
      micBtn.addEventListener("click", () => {
        this.isMicMuted = !this.isMicMuted;
        if (this.localMediaStream) {
          this.localMediaStream.getAudioTracks().forEach(track => {
            track.enabled = !this.isMicMuted;
          });
        }
        this.appState.showToast(this.isMicMuted ? "Microphone muted" : "Microphone active");
        this.render(container);
      });
    }

    // 12. Toggle Camera Video Track
    const camBtn = container.querySelector("#deck-toggle-camera");
    if (camBtn) {
      camBtn.addEventListener("click", () => {
        this.isCameraOff = !this.isCameraOff;
        if (this.localMediaStream) {
          this.localMediaStream.getVideoTracks().forEach(track => {
            track.enabled = !this.isCameraOff;
          });
        }
        this.appState.showToast(this.isCameraOff ? "Camera feed paused" : "Camera feed resumed");
        this.render(container);
      });
    }

    // 13. Session Switcher Buttons
    container.querySelectorAll(".switch-session-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (id) {
          this.activeSessionId = id;
          this.hasVotedCurrentPoll = false;
          this.selectedPollOption = null;
          this.pollRemainingSeconds = 30;
          this.isPollDismissed = false;
          this.dismissedPollId = null;
          this.render(container);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });

    // 14. Schedule Session Modal Trigger & Form Handling
    const schedBtn = container.querySelector("#btn-schedule-session-modal");
    if (schedBtn) {
      schedBtn.addEventListener("click", () => {
        this.isScheduleModalOpen = true;
        this.render(container);
      });
    }
    this.bindScheduleModalEvents(container);

    // 15. Poll Launcher Modal Trigger & Form Handling
    const pollBtn = container.querySelector("#btn-trigger-poll-modal");
    if (pollBtn) {
      pollBtn.addEventListener("click", () => {
        this.isPollModalOpen = true;
        this.render(container);
      });
    }

    const pollClose = container.querySelector("#poll-modal-close");
    const pollCancel = container.querySelector("#btn-cancel-poll");
    if (pollClose) pollClose.addEventListener("click", () => { this.isPollModalOpen = false; this.render(container); });
    if (pollCancel) pollCancel.addEventListener("click", () => { this.isPollModalOpen = false; this.render(container); });

    const pollForm = container.querySelector("#poll-creator-form");
    if (pollForm) {
      pollForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = container.querySelector("#poll-input-q").value.trim();
        const o1 = container.querySelector("#poll-opt-1").value.trim();
        const o2 = container.querySelector("#poll-opt-2").value.trim();
        const o3 = container.querySelector("#poll-opt-3").value.trim();
        const o4 = container.querySelector("#poll-opt-4").value.trim();

        if (q && o1 && o2) {
          this.appState.launchLivePoll(currentSession.id, {
            question: q,
            options: [o1, o2, o3, o4].filter(Boolean)
          });
          this.isPollModalOpen = false;
          this.hasVotedCurrentPoll = false;
          this.selectedPollOption = null;
          this.pollRemainingSeconds = 30;
          this.isPollDismissed = false;
          this.dismissedPollId = null;
          this.render(container);
        }
      });
    }
  }

  bindScheduleModalEvents(container) {
    const schedClose = container.querySelector("#schedule-modal-close");
    const schedCancel = container.querySelector("#btn-cancel-schedule");
    if (schedClose) schedClose.addEventListener("click", () => { this.isScheduleModalOpen = false; this.render(container); });
    if (schedCancel) schedCancel.addEventListener("click", () => { this.isScheduleModalOpen = false; this.render(container); });

    const schedForm = container.querySelector("#new-live-session-form");
    if (schedForm) {
      schedForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const titleEl = container.querySelector("#sched-title");
        const instEl = container.querySelector("#sched-inst");
        const trainerEl = container.querySelector("#sched-trainer");
        const statusEl = container.querySelector("#sched-status");
        const durationEl = container.querySelector("#sched-duration");

        const title = titleEl ? titleEl.value.trim() : "";
        const institute = instEl ? instEl.value : "IMD";
        const trainerName = trainerEl ? trainerEl.value.trim() : "Faculty Specialist";
        const status = statusEl ? statusEl.value : "live";
        const durationMinutes = durationEl ? parseInt(durationEl.value) : 60;

        if (title) {
          const newSession = await this.appState.createLiveClass({
            title,
            institute,
            trainerName,
            status,
            durationMinutes
          });
          this.isScheduleModalOpen = false;
          if (newSession && newSession.id) {
            this.activeSessionId = newSession.id;
          }
          this.render(container);
        }
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LiveClassRoomComponent;
}
