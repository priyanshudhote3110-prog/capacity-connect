/**
 * AuthModal.js - Modern 2-Column Sign-In Modal with Interactive DotMap Canvas
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Live Firebase Authentication (Google OAuth 2.0 & Email/Password) + Role-Based Access
 */

class AuthModalComponent {
  constructor(appState) {
    this.appState = appState;
    this.selectedRole = "employee";
    this.isLoading = false;
    this.isPasswordVisible = false;
    this.isGooglePickerOpen = false;
    this.showCustomGoogleInput = false;
    this.otpSent = false;
    this.currentPhone = "";
    this.debugOtp = "";
    this.activeMode = "credentials"; // "credentials" or "otp"
    this.dotMapAnimationId = null;
  }

  open() {
    this.appState.isAuthModalOpen = true;
    this.isLoading = false;
    this.appState.render();
    setTimeout(() => this.setupDotMap(), 50);
  }

  close() {
    if (this.dotMapAnimationId) {
      cancelAnimationFrame(this.dotMapAnimationId);
      this.dotMapAnimationId = null;
    }
    this.appState.isAuthModalOpen = false;
    this.isLoading = false;
    this.isGooglePickerOpen = false;
    this.showCustomGoogleInput = false;
    this.appState.render();
  }

  setupDotMap() {
    const canvas = document.getElementById("auth-dot-map-canvas");
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth || 420;
    const height = parent.clientHeight || 640;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate grid dots for the map
    const dots = [];
    const gap = 14;
    const dotRadius = 1.1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // India & subcontinent focal silhouette
        const nx = x / width;
        const ny = y / height;
        const isIndiaFocal = (nx > 0.25 && nx < 0.75 && ny > 0.20 && ny < 0.85);
        const isOceanLink = (ny > 0.65 && Math.random() > 0.4);

        if (isIndiaFocal || isOceanLink || Math.random() > 0.55) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: isIndiaFocal ? (Math.random() * 0.45 + 0.25) : (Math.random() * 0.2 + 0.08)
          });
        }
      }
    }

    // Ministry Institute Coordinates on Canvas (normalized relative to canvas)
    const instituteNodes = [
      { name: "IMD (Delhi)", x: width * 0.48, y: height * 0.32, color: "#38BDF8" },
      { name: "NCMRWF (Noida)", x: width * 0.52, y: height * 0.34, color: "#38BDF8" },
      { name: "IITM (Pune)", x: width * 0.42, y: height * 0.54, color: "#818CF8" },
      { name: "INCOIS (Hyderabad)", x: width * 0.52, y: height * 0.58, color: "#34D399" },
      { name: "NIOT (Chennai)", x: width * 0.56, y: height * 0.68, color: "#F59E0B" },
      { name: "NCPOR (Goa)", x: width * 0.38, y: height * 0.64, color: "#A78BFA" }
    ];

    // Animated telemetry routes between institutes
    const routes = [
      { start: instituteNodes[0], end: instituteNodes[2], delay: 0, color: "#38BDF8" },
      { start: instituteNodes[2], end: instituteNodes[3], delay: 1.5, color: "#34D399" },
      { start: instituteNodes[3], end: instituteNodes[4], delay: 3.0, color: "#F59E0B" },
      { start: instituteNodes[4], end: instituteNodes[5], delay: 2.2, color: "#A78BFA" },
      { start: instituteNodes[0], end: instituteNodes[1], delay: 0.8, color: "#38BDF8" },
      { start: instituteNodes[5], end: instituteNodes[0], delay: 4.0, color: "#38BDF8" }
    ];

    let startTime = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Dot Grid
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${dot.opacity})`;
        ctx.fill();
      });

      const currentTime = (Date.now() - startTime) / 1000;

      // 2. Draw Routes & Moving Packets
      routes.forEach(route => {
        const elapsed = (currentTime - route.delay) % 7;
        if (elapsed < 0) return;

        const duration = 2.8;
        const progress = Math.min(Math.max(elapsed / duration, 0), 1);

        const currentX = route.start.x + (route.end.x - route.start.x) * progress;
        const currentY = route.start.y + (route.end.y - route.start.y) * progress;

        // Base route line
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(route.end.x, route.end.y);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Active highlighted beam
        if (progress > 0 && progress < 1) {
          ctx.beginPath();
          ctx.moveTo(route.start.x, route.start.y);
          ctx.lineTo(currentX, currentY);
          ctx.strokeStyle = route.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Moving telemetry packet
          ctx.beginPath();
          ctx.arc(currentX, currentY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#FFF";
          ctx.fill();

          // Packet glow
          ctx.beginPath();
          ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
          ctx.fill();
        }
      });

      // 3. Draw Institute Beacon Nodes
      instituteNodes.forEach((node, i) => {
        const pulse = (Math.sin(currentTime * 2 + i) + 1) / 2;

        // Outer pulse circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 7 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${0.25 - pulse * 0.15})`;
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      this.dotMapAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  renderGoogleAccountPicker(t) {
    return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #FFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style="width: 20px; height: 20px;" />
          </div>
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">Sign in with Google</h2>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">
          Choose an official Google account to sign in to Capacity Connect (समर्थ-पृथ्वी)
        </p>
      </div>

      <!-- Operational Role Indicator for Google Session -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-subtle); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-light); margin-bottom: 14px;">
        <span style="font-size: 0.74rem; font-weight: 600; color: var(--text-muted);">
          Selected Role / भूमिका:
        </span>
        <span class="role-tag ${this.selectedRole}" style="font-size: 0.65rem;">
          ${this.selectedRole === 'admin' ? 'Executive Directorate' : this.selectedRole === 'trainer' ? 'Faculty Clearance' : 'Learner Officer'}
        </span>
      </div>

      <!-- Account Selection List -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
        <!-- Account 1: Capacity Connect Official MoES Admin -->
        <div class="google-acc-card" id="google-acc-priyanshu" style="display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--border-medium); background: var(--bg-surface); cursor: pointer; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #0A2647 0%, #008DDA 100%); color: #FFF; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 141, 218, 0.3);">
              CC
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Capacity Connect Admin</div>
              <div style="font-size: 0.77rem; color: var(--text-muted);">capacityconnectmofec@gmail.com</div>
            </div>
          </div>
          <span class="role-tag admin" style="font-size: 0.65rem;">ADM-001</span>
        </div>

        <!-- Account 2: Dr. Rajesh Sharma -->
        <div class="google-acc-card" id="google-acc-rajesh" style="display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--border-medium); background: var(--bg-surface); cursor: pointer; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Dr. Rajesh" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-medium);" />
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Dr. Rajesh Sharma</div>
              <div style="font-size: 0.77rem; color: var(--text-muted);">rajesh.sharma@imd.gov.in</div>
            </div>
          </div>
          <span class="role-tag employee" style="font-size: 0.65rem;">EMP-001</span>
        </div>

        <!-- Account 3: Dr. Anita Desai -->
        <div class="google-acc-card" id="google-acc-anita" style="display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--border-medium); background: var(--bg-surface); cursor: pointer; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" alt="Dr. Anita" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-medium);" />
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Dr. Anita Desai</div>
              <div style="font-size: 0.77rem; color: var(--text-muted);">anita.desai@imd.gov.in</div>
            </div>
          </div>
          <span class="role-tag trainer" style="font-size: 0.65rem;">TRN-001</span>
        </div>

        <!-- Option 4: Use Another Account Toggle -->
        <div class="google-acc-card" id="google-acc-custom-toggle" style="display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; border: 1.5px dashed var(--border-medium); background: var(--bg-subtle); cursor: pointer; transition: all 0.2s;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(66, 133, 244, 0.1); color: #4285F4; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">Use another Google account</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Sign in with custom Gmail / MoES Workspace ID</div>
          </div>
        </div>
      </div>

      <!-- Expandable Custom Google Account Input -->
      ${this.showCustomGoogleInput ? `
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 12px; border: 1px solid var(--border-medium); margin-bottom: 14px; animation: fadeIn 0.2s ease;">
          <label class="form-label" style="font-size: 0.78rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
            Enter Google Email / Gmail Address:
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <input type="email" id="custom-google-email" class="form-control" placeholder="yourname@gmail.com" value="" style="height: 40px; font-size: 0.86rem;" />
            <input type="text" id="custom-google-name" class="form-control" placeholder="Full Name (e.g. Priyanshu Dhote)" value="" style="height: 40px; font-size: 0.86rem;" />
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
              <label style="font-size: 0.74rem; font-weight: 600; color: var(--text-muted);">Role Permission:</label>
              <select id="custom-google-role" class="form-control" style="width: auto; height: 32px; padding: 2px 8px; font-size: 0.78rem;">
                <option value="admin" ${this.selectedRole === 'admin' ? 'selected' : ''}>Admin (HQ Lead)</option>
                <option value="trainer" ${this.selectedRole === 'trainer' ? 'selected' : ''}>Trainer / Faculty</option>
                <option value="employee" ${this.selectedRole === 'employee' ? 'selected' : ''}>Learner Officer</option>
              </select>
            </div>

            <button type="button" class="btn btn-primary" id="btn-submit-custom-google" style="height: 40px; justify-content: center; font-weight: 700; background: #4285F4; border-color: #4285F4; margin-top: 4px;">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 16px; height: 16px; margin-right: 6px;" />
              Continue with Google Account
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Back to Password Form -->
      <button type="button" class="btn btn-outline" id="btn-back-to-credentials" style="width: 100%; height: 42px; font-size: 0.86rem; justify-content: center; gap: 8px; border-radius: 10px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Standard Password Login
      </button>
    `;
  }

  render(container) {
    const t = (k, def) => (window.i18n ? window.i18n.t(k, def) : def);
    const isOpen = Boolean(this.appState.isAuthModalOpen);

    container.innerHTML = `
      <div class="modal-overlay ${isOpen ? 'active' : ''}" id="auth-modal-overlay">
        <div class="modal-card-split" id="auth-modal-split-card">
          
          <!-- LEFT COLUMN: Animated Geolocation DotMap & Ministry Branding -->
          <div class="modal-left-map">
            <canvas id="auth-dot-map-canvas" class="dot-map-canvas"></canvas>
            
            <div class="dot-map-overlay">
              <div>
                <div class="dot-map-header">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style="height: 48px; filter: brightness(0) invert(1);" />
                  <div>
                    <span class="dot-map-badge">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #38BDF8; display: inline-block;"></span>
                      MoES Cloud Network
                    </span>
                    <h2 style="font-size: 1.35rem; font-weight: 800; color: #FFF; margin: 4px 0 0; letter-spacing: -0.01em;">
                      Capacity Connect
                    </h2>
                    <div style="font-size: 0.82rem; color: #94A3B8; font-family: var(--font-hindi);">समर्थ-पृथ्वी राष्ट्रीय ज्ञान पोर्टल</div>
                  </div>
                </div>

                <p style="margin-top: 20px; font-size: 0.82rem; color: #CBD5E1; line-height: 1.6; max-width: 320px;">
                  Unified Geoscience Capacity Building, Atmospheric Nowcasting & Oceanographic Telemetry Academy.
                </p>
              </div>

              <!-- Real-time Connected Nodes Ticker -->
              <div class="dot-map-nodes">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #38BDF8; letter-spacing: 0.05em;">
                    Connected Autonomous Institutes
                  </span>
                  <span style="font-size: 0.68rem; color: #34D399; font-weight: 700;">LIVE RTQC</span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.72rem; color: #E2E8F0;">
                  <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px;">IMD (Delhi)</span>
                  <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px;">INCOIS (Hyd)</span>
                  <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px;">IITM (Pune)</span>
                  <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px;">NCMRWF</span>
                  <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px;">NIOT</span>
                  <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px;">NCPOR</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Official Secure Sign In Form / Google Account Chooser -->
          <div class="modal-right-form">
            <button class="modal-close" id="auth-modal-close" style="position: absolute; top: 20px; right: 20px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-medium); background: var(--bg-subtle); color: var(--text-muted); cursor: pointer; transition: all 0.2s;">&times;</button>
            
            ${this.isGooglePickerOpen ? this.renderGoogleAccountPicker(t) : `
              <div style="margin-bottom: 20px;">
                <h1 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin: 0 0 4px 0;">
                  ${t('auth.modalTitle', 'Welcome back')}
                </h1>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">
                  Sign in to your official Ministry of Earth Sciences workspace
                </p>
              </div>

              <!-- Operational Role Radio Selection Pills -->
              <div class="form-group" style="margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <label class="form-label" style="margin: 0; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">
                    ${t('auth.selectRole', 'Select Target Role')} / ${t('auth.selectRoleHi', 'भूमिका चुनें')}:
                  </label>
                  <span class="role-tag ${this.selectedRole}" style="font-size: 0.65rem;">
                    ${this.selectedRole === 'admin' ? 'Executive Directorate' : this.selectedRole === 'trainer' ? 'Faculty Clearance' : 'Learner Officer'}
                  </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                  <button type="button" class="btn btn-outline btn-sm ${this.selectedRole === 'employee' ? 'btn-primary' : ''}" id="role-btn-employee" style="flex-direction: column; gap: 4px; padding: 9px 4px; border-radius: 10px; font-size: 0.75rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Learner</span>
                  </button>

                  <button type="button" class="btn btn-outline btn-sm ${this.selectedRole === 'trainer' ? 'btn-primary' : ''}" id="role-btn-trainer" style="flex-direction: column; gap: 4px; padding: 9px 4px; border-radius: 10px; font-size: 0.75rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Trainer</span>
                  </button>

                  <button type="button" class="btn btn-outline btn-sm ${this.selectedRole === 'admin' ? 'btn-primary' : ''}" id="role-btn-admin" style="flex-direction: column; gap: 4px; padding: 9px 4px; border-radius: 10px; font-size: 0.75rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <!-- Primary Action 1: Google OAuth 2.0 Sign In Button -->
              <button class="btn-google" id="btn-google-signin" ${this.isLoading ? 'disabled' : ''} style="box-shadow: 0 4px 12px rgba(0,0,0,0.06); height: 46px; margin-bottom: 6px;">
                ${this.isLoading ? `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <span>Authenticating with Google...</span>
                ` : `
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
                  <span style="font-weight: 600; font-size: 0.92rem;">${t('auth.googleSignIn', 'Login with Google')}</span>
                `}
              </button>

              <!-- Divider -->
              <div class="divider-text" style="margin: 16px 0;">or sign in with credentials</div>

              <!-- Primary Action 2: Email & Password Form -->
              <form id="auth-email-form" style="display: flex; flex-direction: column; gap: 12px;" onsubmit="return false;">
                <div>
                  <label class="form-label" style="font-size: 0.78rem; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
                    Official Email <span style="color: var(--ocean-cyan);">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="auth-input-email" 
                    class="form-control" 
                    placeholder="officer@moes.gov.in" 
                    value="${this.selectedRole === 'admin' ? 'secretary@moes.gov.in' : this.selectedRole === 'trainer' ? 'anita.desai@imd.gov.in' : 'rajesh.sharma@imd.gov.in'}" 
                    required 
                    style="font-size: 0.88rem; height: 42px;"
                  />
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label class="form-label" style="font-size: 0.78rem; font-weight: 600; color: var(--text-main); margin: 0;">
                      Password <span style="color: var(--ocean-cyan);">*</span>
                    </label>
                    <a href="javascript:void(0)" id="auth-forgot-pwd" style="font-size: 0.72rem; color: var(--ocean-cyan); text-decoration: none;">Forgot password?</a>
                  </div>
                  
                  <div style="position: relative;">
                    <input 
                      type="${this.isPasswordVisible ? 'text' : 'password'}" 
                      id="auth-input-password" 
                      class="form-control" 
                      placeholder="••••••••••••" 
                      value="moesSecure@2026" 
                      required 
                      style="font-size: 0.88rem; height: 42px; padding-right: 40px;"
                    />
                    <button 
                      type="button" 
                      id="auth-toggle-pwd" 
                      style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;"
                      title="${this.isPasswordVisible ? 'Hide Password' : 'Show Password'}"
                    >
                      ${this.isPasswordVisible ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      ` : `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      `}
                    </button>
                  </div>
                </div>

                <!-- Shimmer Gradient Sign In Button -->
                <div class="btn-shimmer-wrap" style="margin-top: 4px;">
                  <button type="submit" class="btn btn-primary" id="btn-submit-credentials" style="width: 100%; height: 44px; font-weight: 700; font-size: 0.92rem; justify-content: center; gap: 8px; background: linear-gradient(135deg, #008DDA 0%, #0A2647 100%);">
                    <span>Sign In</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </form>

              <!-- Quick Demo Personas (Zero Setup Instant 1-Click Access for Evaluation) -->
              <div style="margin-top: 18px; padding-top: 12px; border-top: 1px dashed var(--border-medium);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Instant Evaluation Personas:
                  </span>
                  <span style="font-size: 0.65rem; color: var(--forest-green); font-weight: 700;">1-Click</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                  <button class="btn btn-outline btn-sm" id="quick-demo-emp" style="padding: 6px 4px; font-size: 0.72rem; flex-direction: column; gap: 2px;">
                    <span class="role-tag employee" style="font-size: 0.62rem;">EMP-001</span>
                    <span style="font-weight: 600; color: var(--text-main);">Dr. Rajesh</span>
                  </button>
                  <button class="btn btn-outline btn-sm" id="quick-demo-trn" style="padding: 6px 4px; font-size: 0.72rem; flex-direction: column; gap: 2px;">
                    <span class="role-tag trainer" style="font-size: 0.62rem;">TRN-001</span>
                    <span style="font-weight: 600; color: var(--text-main);">Dr. Anita</span>
                  </button>
                  <button class="btn btn-outline btn-sm" id="quick-demo-adm" style="padding: 6px 4px; font-size: 0.72rem; flex-direction: column; gap: 2px;">
                    <span class="role-tag admin" style="font-size: 0.62rem;">ADM-001</span>
                    <span style="font-weight: 600; color: var(--text-main);">Dr. Ravichandran</span>
                  </button>
                </div>
              </div>
            `}

          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const overlay = container.querySelector("#auth-modal-overlay");
    const closeBtn = container.querySelector("#auth-modal-close");

    if (closeBtn) closeBtn.addEventListener("click", () => this.close());
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Handlers for Google Account Chooser View
    if (this.isGooglePickerOpen) {
      const backBtn = container.querySelector("#btn-back-to-credentials");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          this.isGooglePickerOpen = false;
          this.showCustomGoogleInput = false;
          this.render(container);
          setTimeout(() => this.setupDotMap(), 50);
        });
      }

      // Quick Account 1: Priyanshu Dhote
      const accPriyanshu = container.querySelector("#google-acc-priyanshu");
      if (accPriyanshu) {
        accPriyanshu.addEventListener("click", async () => {
          accPriyanshu.style.opacity = "0.7";
          accPriyanshu.innerHTML = `<span style="font-size: 0.85rem; color: #4285F4; font-weight: 700;">Verifying Official Admin with Google...</span>`;
          await this.appState.loginWithGoogle("admin", {
            email: "capacityconnectmofec@gmail.com",
            name: "Dr. Priyanshu Dhote (Admin)",
            picture: "https://ui-avatars.com/api/?name=Capacity+Connect&background=0A2647&color=fff"
          });
          this.isGooglePickerOpen = false;
        });
      }

      // Quick Account 2: Dr. Rajesh Sharma
      const accRajesh = container.querySelector("#google-acc-rajesh");
      if (accRajesh) {
        accRajesh.addEventListener("click", async () => {
          accRajesh.style.opacity = "0.7";
          accRajesh.innerHTML = `<span style="font-size: 0.85rem; color: #4285F4; font-weight: 700;">Verifying Dr. Rajesh with Google...</span>`;
          await this.appState.loginWithGoogle("employee", {
            email: "rajesh.sharma@imd.gov.in",
            name: "Dr. Rajesh Sharma"
          });
          this.isGooglePickerOpen = false;
        });
      }

      // Quick Account 3: Dr. Anita Desai
      const accAnita = container.querySelector("#google-acc-anita");
      if (accAnita) {
        accAnita.addEventListener("click", async () => {
          accAnita.style.opacity = "0.7";
          accAnita.innerHTML = `<span style="font-size: 0.85rem; color: #4285F4; font-weight: 700;">Verifying Dr. Anita with Google...</span>`;
          await this.appState.loginWithGoogle("trainer", {
            email: "anita.desai@imd.gov.in",
            name: "Dr. Anita Desai"
          });
          this.isGooglePickerOpen = false;
        });
      }

      // Custom Google Account Toggle
      const customToggle = container.querySelector("#google-acc-custom-toggle");
      if (customToggle) {
        customToggle.addEventListener("click", () => {
          this.showCustomGoogleInput = !this.showCustomGoogleInput;
          this.render(container);
          setTimeout(() => this.setupDotMap(), 50);
        });
      }

      // Submit Custom Google Account
      const submitCustomBtn = container.querySelector("#btn-submit-custom-google");
      if (submitCustomBtn) {
        submitCustomBtn.addEventListener("click", async () => {
          const email = container.querySelector("#custom-google-email")?.value?.trim();
          const name = container.querySelector("#custom-google-name")?.value?.trim();
          const role = container.querySelector("#custom-google-role")?.value || this.selectedRole;

          if (!email || !email.includes("@")) {
            this.appState.showToast("Please enter a valid Google email address", "warning");
            return;
          }

          submitCustomBtn.disabled = true;
          submitCustomBtn.innerHTML = `<span>Verifying with Google...</span>`;

          await this.appState.loginWithGoogle(role, {
            email: email,
            name: name || email.split("@")[0]
          });
          this.isGooglePickerOpen = false;
        });
      }

      return;
    }

    // Role selection pills
    ["employee", "trainer", "admin"].forEach(role => {
      const btn = container.querySelector(`#role-btn-${role}`);
      if (btn) {
        btn.addEventListener("click", () => {
          this.selectedRole = role;
          this.render(container);
          setTimeout(() => this.setupDotMap(), 50);
        });
      }
    });

    // Toggle password visibility
    const togglePwdBtn = container.querySelector("#auth-toggle-pwd");
    if (togglePwdBtn) {
      togglePwdBtn.addEventListener("click", () => {
        this.isPasswordVisible = !this.isPasswordVisible;
        const pwdInput = container.querySelector("#auth-input-password");
        if (pwdInput) {
          pwdInput.type = this.isPasswordVisible ? "text" : "password";
        }
        togglePwdBtn.innerHTML = this.isPasswordVisible ? `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
        ` : `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        `;
      });
    }

    // Google Sign-In button opens Google Account Selector
    const googleBtn = container.querySelector("#btn-google-signin");
    if (googleBtn) {
      googleBtn.addEventListener("click", () => {
        this.isGooglePickerOpen = true;
        this.render(container);
        setTimeout(() => this.setupDotMap(), 50);
      });
    }

    // Email/Password Submit Form
    const emailForm = container.querySelector("#auth-email-form");
    if (emailForm) {
      emailForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = container.querySelector("#auth-input-email");
        const passwordInput = container.querySelector("#auth-input-password");
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!email || !password) {
          this.appState.showToast("Please enter your official email and password", "warning");
          return;
        }

        const submitBtn = container.querySelector("#btn-submit-credentials");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span>Verifying Credentials...</span>
          `;
        }

        try {
          if (this.appState.loginWithEmail) {
            await this.appState.loginWithEmail(email, password, this.selectedRole);
          } else {
            this.appState.switchPersona(this.selectedRole);
            this.close();
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Forgot password trigger
    const forgotPwdLink = container.querySelector("#auth-forgot-pwd");
    if (forgotPwdLink) {
      forgotPwdLink.addEventListener("click", () => {
        const emailInput = container.querySelector("#auth-input-email");
        const email = emailInput ? emailInput.value.trim() : "";
        if (window.firebaseAuth && email) {
          window.firebaseAuth.sendPasswordResetEmail(email)
            .then(() => this.appState.showToast(`Password reset link sent to ${email}`))
            .catch(e => this.appState.showToast(`Password reset: ${e.message}`, "warning"));
        } else {
          this.appState.showToast("Enter your email address and click again to receive a password reset link.", "info");
        }
      });
    }

    // Quick demo personas
    const demoEmp = container.querySelector("#quick-demo-emp");
    const demoTrn = container.querySelector("#quick-demo-trn");
    const demoAdm = container.querySelector("#quick-demo-adm");

    if (demoEmp) {
      demoEmp.addEventListener("click", () => {
        this.close();
        this.appState.switchPersona("employee");
      });
    }
    if (demoTrn) {
      demoTrn.addEventListener("click", () => {
        this.close();
        this.appState.switchPersona("trainer");
      });
    }
    if (demoAdm) {
      demoAdm.addEventListener("click", () => {
        this.close();
        this.appState.switchPersona("admin");
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthModalComponent;
}
