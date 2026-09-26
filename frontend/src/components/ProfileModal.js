/**
 * ProfileModal.js - Full Profile Dashboard with User Details, Stats & Photo Uploader
 * Capacity Connect LMS — MoES Govt of India
 * Phase 2: Added Gmail, phone, unique ID, learning stats, SVG icons, Hindi labels
 */

class ProfileModalComponent {
  constructor(appState) {
    this.appState = appState;
    this.previewPhotoUrl = null;
    this.isEditing = false;
  }

  open() {
    this.appState.isProfileModalOpen = true;
    this.isEditing = false;
    this.appState.render();
  }

  close() {
    this.appState.isProfileModalOpen = false;
    this.appState.render();
  }

  render(container) {
    const user = this.appState.currentUser;
    if (!user) {
      container.innerHTML = "";
      return;
    }

    const t = (k, def) => (window.i18n ? window.i18n.t(k, def) : def);
    const currentAvatar = this.previewPhotoUrl || user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    const uniqueId = user.customRoleId || "EMP-001";
    const kp = user.knowledgePoints || 0;
    const streak = user.learningStreak || 0;
    const coursesCompleted = user.coursesCompleted || 3;
    const certsEarned = user.certsEarned || 2;

    container.innerHTML = `
      <div class="modal-overlay ${this.appState.isProfileModalOpen ? 'active' : ''}" id="profile-modal-overlay">
        <div class="modal-card" style="max-width: 680px;">
          <div class="modal-header" style="background: linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-light) 100%); border-bottom: 3px solid var(--saffron-gold);">
            <div>
              <h3>${t('profile.title', 'Official Profile & Identity')} / ${t('profile.titleHi', 'आधिकारिक प्रोफाइल')}</h3>
              <p style="font-size: 0.8rem; color: #94A3B8; margin-top: 4px;">${t('profile.subtitle', 'Verified Govt. of India Training Credential')}</p>
            </div>
            <button class="modal-close" id="profile-modal-close">&times;</button>
          </div>

          <div class="modal-body" style="padding: 24px;">
            
            <!-- Profile Dashboard Layout -->
            <div class="profile-dashboard">
              
              <!-- Left Sidebar: Avatar, ID, Stats -->
              <div class="profile-sidebar">
                <!-- Avatar -->
                <div style="position: relative;">
                  <img src="${currentAvatar}" alt="Profile Avatar" class="profile-avatar-large" id="avatar-preview-img" />
                  <label style="position: absolute; bottom: 4px; right: 4px; background: var(--ocean-cyan); color: #FFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-md); transition: var(--transition);" title="Upload Photo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <input type="file" id="avatar-file-input" accept="image/*" style="display: none;" />
                  </label>
                </div>

                <!-- Unique ID Badge -->
                <div class="profile-id-badge">
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                    ${t('profile.uniqueId', 'System ID')} / सिस्टम आई.डी.
                  </div>
                  <div class="unique-id">${uniqueId}</div>
                  <span class="role-tag ${user.role}" style="margin-top: 6px;">${user.role === 'admin' ? 'Administrator' : user.role === 'trainer' ? 'Faculty / Trainer' : 'Learner / Employee'}</span>
                </div>

                <!-- Learning Stats Grid -->
                <div class="profile-stats-grid">
                  <div class="profile-stat-card">
                    <div class="stat-value">${kp}</div>
                    <div class="stat-label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      KP Points
                    </div>
                  </div>
                  <div class="profile-stat-card">
                    <div class="stat-value">${streak}</div>
                    <div class="stat-label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 2px;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      Day Streak
                    </div>
                  </div>
                  <div class="profile-stat-card">
                    <div class="stat-value">${coursesCompleted}</div>
                    <div class="stat-label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 2px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                      Courses
                    </div>
                  </div>
                  <div class="profile-stat-card">
                    <div class="stat-value">${certsEarned}</div>
                    <div class="stat-label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 2px;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                      Certificates
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Side: Details Section -->
              <div class="profile-details-section">
                
                ${this.isEditing ? this.renderEditForm(user, t) : this.renderViewMode(user, t)}

              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  renderViewMode(user, t) {
    const isGoogleUser = Boolean(user.isGoogleAuth || user.authProvider === 'google' || (user.email && user.email.toLowerCase().includes('gmail.com')));

    return `
      <!-- Full Name -->
      <div class="profile-field" style="border-left: 3px solid var(--ocean-cyan);">
        <div class="field-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ${t('profile.fullName', 'Full Name')} / पूरा नाम
        </div>
        <div class="field-value">${user.name || 'Not Set'}</div>
      </div>

      <!-- Email & Phone -->
      <div class="profile-field-row">
        <div class="profile-field" style="border-left: 3px solid ${isGoogleUser ? '#4285F4' : 'var(--ocean-cyan)'};">
          <div class="field-label" style="display: flex; justify-content: space-between; align-items: center;">
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              ${t('profile.email', 'Email / Gmail')}
            </span>
            ${isGoogleUser ? `
              <span style="font-size: 0.65rem; color: #4285F4; background: rgba(66, 133, 244, 0.1); padding: 1px 6px; border-radius: 4px; font-weight: 700; border: 1px solid rgba(66, 133, 244, 0.25); display: inline-flex; align-items: center; gap: 3px;">
                <svg width="10" height="10" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                Google Verified
              </span>
            ` : ''}
          </div>
          <div class="field-value" style="font-size: 0.88rem; font-weight: 600; color: var(--text-main); word-break: break-all;">
            ${user.email || user.googleEmail || 'Not linked'}
          </div>
        </div>

        <div class="profile-field">
          <div class="field-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${t('profile.phone', 'Phone No.')} / फ़ोन
          </div>
          <div class="field-value">${user.phone || '+91 98XXXXXXXX'}</div>
        </div>
      </div>

      <!-- Dedicated Option: Google Identity & Sign-In Synchronization -->
      <div class="profile-field" style="background: var(--bg-subtle); border-radius: 12px; padding: 12px 14px; border: 1px solid ${isGoogleUser ? 'rgba(66, 133, 244, 0.35)' : 'var(--border-light)'}; margin-top: 2px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 8px; background: #FFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); flex-shrink: 0;">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 18px; height: 18px;" />
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                Google Sign-In Account
                <span style="font-size: 0.65rem; color: #16A34A; background: #DCFCE7; padding: 1px 6px; border-radius: 4px; font-weight: 700;">
                  ${isGoogleUser ? 'Connected' : 'Available'}
                </span>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 1px;">
                Verified ID: <strong style="color: #4285F4;">${user.email || user.googleEmail || 'priyanshudhote3110@gmail.com'}</strong>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-profile-switch-google" style="font-size: 0.72rem; padding: 5px 10px; border-radius: 8px; border-color: rgba(66, 133, 244, 0.4); color: #4285F4; flex-shrink: 0;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Switch Google ID
          </button>
        </div>
      </div>

      <!-- Institute & Designation -->
      <div class="profile-field-row" style="margin-top: 6px;">
        <div class="profile-field">
          <div class="field-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>
            ${t('profile.institute', 'MoES Institute')} / संस्थान
          </div>
          <div class="field-value">${user.institute || 'IMD'}</div>
        </div>
        <div class="profile-field">
          <div class="field-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            ${t('profile.designation', 'Designation')} / पदनाम
          </div>
          <div class="field-value">${user.designation || 'Scientific Officer'}</div>
        </div>
      </div>

      <!-- Department -->
      <div class="profile-field">
        <div class="field-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${t('profile.department', 'Department / Wing')} / विभाग
        </div>
        <div class="field-value">${user.department || 'Research & Development'}</div>
      </div>

      <!-- Bio -->
      ${user.bio ? `
        <div class="profile-field">
          <div class="field-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            ${t('profile.bio', 'Bio / Specialization')} / विशेषज्ञता
          </div>
          <div class="field-value" style="font-size: 0.85rem; line-height: 1.5;">${user.bio}</div>
        </div>
      ` : ''}

      <!-- Edit Button -->
      <button class="btn btn-primary" style="width: 100%; margin-top: 8px;" id="btn-edit-profile">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        ${t('profile.editBtn', 'Edit Profile Details')} / प्रोफ़ाइल संपादित करें
      </button>
    `;
  }

  renderEditForm(user, t) {
    return `
      <!-- Editable Fields -->
      <div class="form-group">
        <label class="form-label">${t('profile.fullName', 'Full Name & Title')} / पूरा नाम</label>
        <input type="text" class="form-control" id="profile-name" value="${user.name || ''}" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">${t('profile.email', 'Email / Gmail')}</label>
          <input type="email" class="form-control" id="profile-email" value="${user.email || ''}" placeholder="user@gmail.com" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('profile.phone', 'Phone No.')} / फ़ोन</label>
          <input type="tel" class="form-control" id="profile-phone" value="${user.phone || ''}" placeholder="+91 98XXXXXXXX" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">${t('profile.institute', 'MoES Institute')} / संस्थान</label>
          <select class="form-control" id="profile-institute">
            <option value="IMD" ${user.institute === 'IMD' ? 'selected' : ''}>IMD (Meteorological)</option>
            <option value="INCOIS" ${user.institute === 'INCOIS' ? 'selected' : ''}>INCOIS (Ocean Info)</option>
            <option value="IITM" ${user.institute === 'IITM' ? 'selected' : ''}>IITM (Tropical Met)</option>
            <option value="NCMRWF" ${user.institute === 'NCMRWF' ? 'selected' : ''}>NCMRWF (Weather Forecast)</option>
            <option value="NIOT" ${user.institute === 'NIOT' ? 'selected' : ''}>NIOT (Ocean Tech)</option>
            <option value="NCPOR" ${user.institute === 'NCPOR' ? 'selected' : ''}>NCPOR (Polar Research)</option>
            <option value="HQ" ${user.institute === 'HQ' ? 'selected' : ''}>MoES HQ (New Delhi)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t('profile.designation', 'Designation')} / पदनाम</label>
          <input type="text" class="form-control" id="profile-designation" value="${user.designation || 'Scientific Officer'}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t('profile.department', 'Department / Wing')} / विभाग</label>
        <input type="text" class="form-control" id="profile-department" value="${user.department || 'Research & Development'}" />
      </div>

      <div class="form-group">
        <label class="form-label">${t('profile.bio', 'Professional Bio / Specialization')} / विशेषज्ञता</label>
        <textarea class="form-control" id="profile-bio" rows="2">${user.bio || ''}</textarea>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-outline" style="flex: 1;" id="btn-cancel-edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ${t('profile.cancel', 'Cancel')}
        </button>
        <button class="btn btn-primary" style="flex: 2;" id="btn-save-profile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          ${t('profile.saveBtn', 'Save Profile Updates')} / सहेजें
        </button>
      </div>
    `;
  }

  bindEvents(container) {
    const overlay = container.querySelector("#profile-modal-overlay");
    const closeBtn = container.querySelector("#profile-modal-close");

    if (closeBtn) closeBtn.addEventListener("click", () => this.close());
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Photo file uploader & instant preview
    const fileInput = container.querySelector("#avatar-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (loadEvt) => {
            this.previewPhotoUrl = loadEvt.target.result;
            const previewImg = container.querySelector("#avatar-preview-img");
            if (previewImg) previewImg.src = this.previewPhotoUrl;

            // If user uploaded photo while in view mode, automatically persist to profile immediately!
            if (!this.isEditing && this.appState.updateUserProfile) {
              await this.appState.updateUserProfile({ avatarUrl: this.previewPhotoUrl });
              this.previewPhotoUrl = null;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Switch / Connect Google Account button
    const switchGoogleBtn = container.querySelector("#btn-profile-switch-google");
    if (switchGoogleBtn) {
      switchGoogleBtn.addEventListener("click", () => {
        this.close();
        if (this.appState.authModal) {
          this.appState.authModal.isGooglePickerOpen = true;
          this.appState.authModal.open();
        }
      });
    }

    // Edit button
    const editBtn = container.querySelector("#btn-edit-profile");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.isEditing = true;
        this.render(container);
      });
    }

    // Cancel edit
    const cancelBtn = container.querySelector("#btn-cancel-edit");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.isEditing = false;
        this.previewPhotoUrl = null;
        this.render(container);
      });
    }

    // Save profile updates
    const saveBtn = container.querySelector("#btn-save-profile");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const name = container.querySelector("#profile-name")?.value?.trim();
        const email = container.querySelector("#profile-email")?.value?.trim();
        const phone = container.querySelector("#profile-phone")?.value?.trim();
        const institute = container.querySelector("#profile-institute")?.value;
        const designation = container.querySelector("#profile-designation")?.value?.trim();
        const department = container.querySelector("#profile-department")?.value?.trim();
        const bio = container.querySelector("#profile-bio")?.value?.trim();

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (institute) updates.institute = institute;
        if (designation) updates.designation = designation;
        if (department) updates.department = department;
        if (bio !== undefined) updates.bio = bio;
        if (this.previewPhotoUrl) {
          updates.avatarUrl = this.previewPhotoUrl;
        }

        if (this.appState.updateUserProfile) {
          await this.appState.updateUserProfile(updates);
        }
        this.previewPhotoUrl = null;
        this.isEditing = false;
        this.render(container);
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ProfileModalComponent;
}
