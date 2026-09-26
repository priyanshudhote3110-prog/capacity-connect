/**
 * SettingsModal.js - Comprehensive Settings & Control Center Modal
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Unified management for: Persona/Role Switching, Faculty Studio, Officer Profile & Preferences
 */

class SettingsModalComponent {
  constructor(appState) {
    this.appState = appState;
  }

  open() {
    this.appState.isSettingsModalOpen = true;
    this.appState.render();
  }

  close() {
    this.appState.isSettingsModalOpen = false;
    this.appState.render();
  }

  render(container) {
    const user = this.appState.currentUser;
    const isOpen = Boolean(this.appState.isSettingsModalOpen);
    const lang = window.i18n ? window.i18n.currentLang : "en";
    const t = (k, def) => (window.i18n ? window.i18n.t(k, def) : def);
    const isDark = document.body.classList.contains("dark-mode");

    const isTrainerOrAdmin = user && (user.role === "trainer" || user.role === "admin");
    const isAdmin = user && user.role === "admin";
    const isEmployee = user && user.role === "employee";

    container.innerHTML = `
      <div class="modal-overlay ${isOpen ? 'active' : ''}" id="settings-modal-overlay">
        <div class="modal-card settings-modal-card" style="max-width: 640px; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 60px -15px rgba(0, 20, 50, 0.4);">
          
          <!-- Header with Tricolor Accent -->
          <div class="modal-header" style="background: linear-gradient(135deg, #022B59 0%, #004080 100%); color: #FFF; padding: 18px 24px; position: relative; border-bottom: 3px solid #FF9933;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255, 153, 51, 0.2); border: 1px solid rgba(255, 153, 51, 0.4); display: flex; align-items: center; justify-content: center; color: #FF9933;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #FFF; display: flex; align-items: center; gap: 8px;">
                  Portal Settings & Control Center
                  <span style="font-size: 0.8rem; font-weight: 500; color: #CBD5E1; font-family: var(--font-hindi);">(नियंत्रण कक्ष)</span>
                </h3>
                <p style="margin: 2px 0 0; font-size: 0.75rem; color: #94A3B8;">Ministry of Earth Sciences — Enterprise Identity & Configuration</p>
              </div>
            </div>
            <button class="modal-close" id="settings-modal-close" style="color: #FFF; background: rgba(255,255,255,0.1); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;">&times;</button>
          </div>

          <!-- Body Content -->
          <div class="modal-body" style="padding: 24px; max-height: calc(85vh - 80px); overflow-y: auto;">

            <!-- 1. Current Officer Profile Card -->
            ${user ? `
              <div class="settings-profile-card" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--bg-subtle); border-radius: 12px; border: 1px solid var(--border-light); margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <img src="${user.avatarUrl}" alt="${user.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--ocean-cyan);" />
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 700; font-size: 0.98rem; color: var(--text-main);">${user.name}</span>
                      <span class="role-tag ${user.role}">${user.customRoleId}</span>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                      ${user.designation} · ${user.institute}
                    </div>
                    ${user.email ? `
                      <div style="font-size: 0.74rem; color: #4285F4; margin-top: 3px; display: flex; align-items: center; gap: 4px; font-weight: 600;">
                        <svg width="11" height="11" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                        ${user.email} ${(user.isGoogleAuth || user.email.includes('@gmail.com')) ? '(Google Verified)' : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" id="btn-settings-view-profile" style="font-size: 0.75rem; padding: 6px 12px; border-radius: 8px;">
                  ${t('profile.viewDetails', 'View Full Profile')}
                </button>
              </div>
            ` : ''}

            <!-- 2. Role & Persona Switcher (Testing Mode) -->
            <div style="margin-bottom: 22px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Switch Testing Persona (भूमिका बदलें)
                </label>
                <span style="font-size: 0.72rem; color: var(--saffron-gold); font-weight: 600;">Updates navbar permissions</span>
              </div>

              <div class="settings-role-grid" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                
                <!-- Option 1: Learner / Officer (Employee) -->
                <div class="role-card-option ${isEmployee ? 'selected' : ''}" data-role="employee" style="cursor: pointer; padding: 12px 16px; border-radius: 12px; border: 2px solid ${isEmployee ? 'var(--ocean-cyan)' : 'var(--border-light)'}; background: ${isEmployee ? 'rgba(0, 141, 218, 0.08)' : 'var(--bg-surface)'}; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #DCFCE7; color: #166534; display: flex; align-items: center; justify-content: center;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Learner Officer (Dr. Rajesh Sharma)</span>
                        <span style="background: #DCFCE7; color: #166534; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">EMP-001</span>
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Standard Access · Heatmap & Leaderboard hidden
                      </div>
                    </div>
                  </div>
                  <div class="role-radio-circle" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${isEmployee ? 'var(--ocean-cyan)' : 'var(--border-light)'}; display: flex; align-items: center; justify-content: center;">
                    ${isEmployee ? '<div style="width: 10px; height: 10px; border-radius: 50%; background: var(--ocean-cyan);"></div>' : ''}
                  </div>
                </div>

                <!-- Option 2: Faculty / Trainer -->
                <div class="role-card-option ${user && user.role === 'trainer' ? 'selected' : ''}" data-role="trainer" style="cursor: pointer; padding: 12px 16px; border-radius: 12px; border: 2px solid ${user && user.role === 'trainer' ? 'var(--ocean-cyan)' : 'var(--border-light)'}; background: ${user && user.role === 'trainer' ? 'rgba(0, 141, 218, 0.08)' : 'var(--bg-surface)'}; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #E0E7FF; color: #3730A3; display: flex; align-items: center; justify-content: center;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Faculty / Trainer (Dr. Anita Desai)</span>
                        <span style="background: #E0E7FF; color: #3730A3; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">TRN-001</span>
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Faculty Clearance · Heatmap, Leaderboard & Faculty Studio enabled
                      </div>
                    </div>
                  </div>
                  <div class="role-radio-circle" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${user && user.role === 'trainer' ? 'var(--ocean-cyan)' : 'var(--border-light)'}; display: flex; align-items: center; justify-content: center;">
                    ${user && user.role === 'trainer' ? '<div style="width: 10px; height: 10px; border-radius: 50%; background: var(--ocean-cyan);"></div>' : ''}
                  </div>
                </div>

                <!-- Option 3: Director General / Admin -->
                <div class="role-card-option ${isAdmin ? 'selected' : ''}" data-role="admin" style="cursor: pointer; padding: 12px 16px; border-radius: 12px; border: 2px solid ${isAdmin ? 'var(--saffron-gold)' : 'var(--border-light)'}; background: ${isAdmin ? 'rgba(255, 153, 51, 0.08)' : 'var(--bg-surface)'}; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #FEF3C7; color: #92400E; display: flex; align-items: center; justify-content: center;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">Director General (Dr. M. Ravichandran)</span>
                        <span style="background: #FEF3C7; color: #92400E; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">ADM-001</span>
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Executive Directorate · Complete Access & Leadership Intel
                      </div>
                    </div>
                  </div>
                  <div class="role-radio-circle" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${isAdmin ? 'var(--saffron-gold)' : 'var(--border-light)'}; display: flex; align-items: center; justify-content: center;">
                    ${isAdmin ? '<div style="width: 10px; height: 10px; border-radius: 50%; background: var(--saffron-gold);"></div>' : ''}
                  </div>
                </div>

              </div>
            </div>

            <!-- 3. Faculty Studio Action Card (For Trainer & Admin) -->
            ${isTrainerOrAdmin ? `
              <div style="padding: 14px 18px; border-radius: 12px; background: linear-gradient(135deg, rgba(255, 153, 51, 0.12), rgba(0, 141, 218, 0.12)); border: 1px solid rgba(255, 153, 51, 0.3); display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.9rem; color: var(--text-main);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--saffron-gold);"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                    Faculty Studio Portal
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                    Upload video lessons, add assessment questions & set exam timers
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" id="btn-settings-launch-studio" style="background: var(--saffron-gold); color: #000; border: none; font-weight: 700; padding: 7px 14px; border-radius: 8px;">
                  Open Studio
                </button>
              </div>
            ` : ''}

            <!-- 4. Portal Preferences & Controls -->
            <div style="margin-bottom: 20px;">
              <label style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 10px;">
                Preferences & Accessibility (प्राथमिकताएं)
              </label>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <!-- Theme Mode -->
                <div style="padding: 12px; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-main);">Display Mode</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${isDark ? 'Dark Mode active' : 'Light Mode active'}</div>
                  </div>
                  <button class="font-btn" id="settings-theme-toggle" title="Toggle Dark/Light Mode" style="padding: 6px 10px;">
                    ${isDark ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark'}
                  </button>
                </div>

                <!-- Language Toggle -->
                <div style="padding: 12px; background: var(--bg-subtle); border-radius: 10px; border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-main);">Bilingual UI</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-hindi);">${lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</div>
                  </div>
                  <button class="lang-toggle-btn" id="settings-lang-toggle" style="padding: 5px 10px; font-size: 0.75rem;">
                    ${lang === 'en' ? 'हिन्दी (HI)' : 'English (EN)'}
                  </button>
                </div>
              </div>
            </div>

            <!-- 5. Logout & Account Action -->
            <div style="padding-top: 14px; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                MoES Capacity Connect v2.6 · Official Govt. Portal
              </span>
              <button class="btn btn-outline btn-sm" id="btn-settings-logout" style="color: var(--emergency-red); border-color: rgba(239, 68, 68, 0.3); padding: 6px 14px; border-radius: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out (लॉग आउट)
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const overlay = container.querySelector("#settings-modal-overlay");
    const closeBtn = container.querySelector("#settings-modal-close");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Role Persona Cards Selection
    container.querySelectorAll(".role-card-option").forEach(card => {
      card.addEventListener("click", (e) => {
        const selectedRole = card.getAttribute("data-role");
        if (!selectedRole) return;
        this.close();
        if (this.appState.switchPersona) {
          this.appState.switchPersona(selectedRole);
        }
      });
    });

    // Launch Faculty Studio
    const launchStudioBtn = container.querySelector("#btn-settings-launch-studio");
    if (launchStudioBtn && this.appState.facultyStudio) {
      launchStudioBtn.addEventListener("click", () => {
        this.close();
        this.appState.facultyStudio.open("video");
      });
    }

    // View Full Profile
    const viewProfileBtn = container.querySelector("#btn-settings-view-profile");
    if (viewProfileBtn && this.appState.profileModal) {
      viewProfileBtn.addEventListener("click", () => {
        this.close();
        this.appState.profileModal.open();
      });
    }

    // Theme toggle
    const themeBtn = container.querySelector("#settings-theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("moes_theme", isDark ? "dark" : "light");
        this.render(container);
      });
    }

    // Language toggle
    const langBtn = container.querySelector("#settings-lang-toggle");
    if (langBtn && window.i18n) {
      langBtn.addEventListener("click", async () => {
        const nextLang = window.i18n.currentLang === "en" ? "hi" : "en";
        await window.i18n.setLanguage(nextLang);
        this.appState.render();
      });
    }

    // Logout
    const logoutBtn = container.querySelector("#btn-settings-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        this.close();
        if (this.appState.logout) {
          await this.appState.logout();
        } else {
          this.appState.currentUser = null;
          if (this.appState.saveLocalDb) this.appState.saveLocalDb();
          this.appState.render();
        }
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SettingsModalComponent;
}
