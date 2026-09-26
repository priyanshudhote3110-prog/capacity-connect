/**
 * Navbar.js - Government Header, Accessibility & Navigation Component
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Phase 2: Hamburger mobile menu, smooth animations, Hindi bilingual labels
 */

class NavbarComponent {
  constructor(appState) {
    this.appState = appState;
    this.mobileMenuOpen = false;
  }

  render(container) {
    const user = this.appState.currentUser;
    const lang = window.i18n ? window.i18n.currentLang : "en";
    const t = (k, def) => (window.i18n ? window.i18n.t(k, def) : def);
    const isTrainerOrAdmin = user && (user.role === "trainer" || user.role === "admin");
    const isAdmin = user && user.role === "admin";

    // Navigation items with SVG icons
    // Base items accessible to all users (including Employee)
    const navItems = [
      { key: 'home', label: t('nav.home', 'Home'), labelHi: 'होम', shortLabel: t('nav.home', 'Home'), icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
      { key: 'courses', label: t('nav.courses', 'Courses'), labelHi: 'पाठ्यक्रम', shortLabel: t('nav.courses', 'Courses'), icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>' },
      { key: 'live', label: t('nav.liveClasses', 'Classroom'), labelHi: 'कक्षा', shortLabel: 'Classroom', icon: 'live' },
      { key: 'exam', label: t('nav.examinations', 'Tests & Quiz'), labelHi: 'परीक्षा', shortLabel: 'Tests', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>' },
      { key: 'certificates', label: t('nav.certificates', 'Certificates'), labelHi: 'प्रमाणपत्र', shortLabel: 'Certs', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' }
    ];

    // Heatmap: Show ONLY if Trainer or Admin (HIDDEN for Employee)
    if (isTrainerOrAdmin) {
      navItems.push({
        key: 'heatmap',
        label: t('nav.heatmap', 'Heatmap'),
        labelHi: 'हीटमैप',
        shortLabel: 'Heatmap',
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
      });
    }

    // Forum: Visible to all
    navItems.push({
      key: 'forum',
      label: t('nav.forum', 'Forum'),
      labelHi: 'फोरम',
      shortLabel: 'Forum',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    });

    // Leaderboard: Show ONLY if Trainer or Admin (HIDDEN for Employee)
    if (isTrainerOrAdmin) {
      navItems.push({
        key: 'leaderboard',
        label: t('nav.leaderboard', 'Ranks'),
        labelHi: 'रैंक',
        shortLabel: 'Ranks',
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
      });
    }

    // RESTRICTED TO LEADERS / ADMINS ONLY: Executive Training & Skill-Gap Analytics
    if (isAdmin) {
      navItems.push({
        key: 'leadership',
        label: t('nav.leadership', 'Leadership Intel'),
        labelHi: 'नेतृत्व',
        shortLabel: 'Leadership',
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        isLeaderSpecial: true
      });
    }

    const renderNavLink = (item, idx) => {
      const isActive = this.appState.activeTab === item.key;
      const leaderBadge = item.isLeaderSpecial ? '<span class="leader-nav-dot" title="Executive Clearance"></span>' : '';
      const shortText = item.shortLabel || item.label;
      const labelMarkup = shortText !== item.label
        ? `<span class="nav-text-full">${item.label}</span><span class="nav-text-short">${shortText}</span>`
        : `<span class="nav-text">${item.label}</span>`;

      if (item.icon === 'live') {
        return `<a class="nav-link ${isActive ? 'active' : ''}" data-nav="${item.key}" data-index="${idx}">
          <span class="live-badge"><span class="pulse-dot"></span>LIVE</span>
          ${labelMarkup}
        </a>`;
      }
      return `<a class="nav-link ${isActive ? 'active' : ''} ${item.isLeaderSpecial ? 'nav-link-leader' : ''}" data-nav="${item.key}" data-index="${idx}" ${item.isLeaderSpecial ? 'style="color: var(--saffron-gold); font-weight: 700;"' : ''}>
        ${item.icon}
        ${labelMarkup}
        ${leaderBadge}
      </a>`;
    };

    const renderMobileNavLink = (item) => {
      const isActive = this.appState.activeTab === item.key;
      const leaderBadge = item.isLeaderSpecial ? '<span style="background: var(--saffron-gold); color: #000; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">LEADER</span>' : '';
      if (item.icon === 'live') {
        return `<a class="nav-link ${isActive ? 'active' : ''}" data-nav="${item.key}">
          <span class="live-badge" style="padding: 2px 6px; font-size: 0.65rem;"><span class="pulse-dot" style="width: 6px; height: 6px;"></span>LIVE</span>
          ${item.label} <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-hindi);">(${item.labelHi})</span>
        </a>`;
      }
      return `<a class="nav-link ${isActive ? 'active' : ''}" data-nav="${item.key}" ${item.isLeaderSpecial ? 'style="color: var(--saffron-gold); font-weight: 700;"' : ''}>
        ${item.icon}
        ${item.label} <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-hindi);">(${item.labelHi})</span>
        ${leaderBadge}
      </a>`;
    };

    container.innerHTML = `
      <!-- 1. Indian National Flag Tricolor Ribbon -->
      <div class="tricolor-stripe"></div>

      <!-- 2. Accessibility & Official National Identity Top Bar -->
      <div class="gov-top-bar">
        <div class="app-container inner">
          <div class="gov-identity">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" class="emblem-small" />
            <span class="gov-title">भारत सरकार | Government of India — Ministry of Earth Sciences</span>
          </div>

          <div class="tools">
            <!-- Active Institute Quick Switcher -->
            <div class="institute-ticker" style="display: flex; gap: 8px; font-size: 0.75rem; align-items: center; color: #CBD5E1;">
              <span style="font-weight: 600; color: #94A3B8;">${t('nav.autonomousBodies', 'Autonomous Bodies')}:</span>
              <button class="inst-pill" data-inst="IMD">IMD</button>
              <button class="inst-pill" data-inst="INCOIS">INCOIS</button>
              <button class="inst-pill" data-inst="IITM">IITM</button>
              <button class="inst-pill" data-inst="NCMRWF">NCMRWF</button>
              <button class="inst-pill" data-inst="NIOT">NIOT</button>
              <button class="inst-pill" data-inst="NCPOR">NCPOR</button>
            </div>

            <!-- Accessibility Controls -->
            <div class="font-resizer">
              <button class="font-btn" id="font-dec" title="Decrease Font Size">A-</button>
              <button class="font-btn active" id="font-reset" title="Standard Font Size">A</button>
              <button class="font-btn" id="font-inc" title="Increase Font Size">A+</button>
            </div>

            <!-- Bilingual Switcher -->
            <button class="lang-toggle-btn" id="lang-toggle-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              ${lang === "en" ? "हिन्दी (HI)" : "English (EN)"}
            </button>

            <!-- Dark / Light Mode Toggle -->
            <button class="font-btn" id="theme-toggle" title="Toggle Dark/Light Mode">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Master Brand Header & Navigation Mega-Bar -->
      <nav class="main-navbar">
        <div class="app-container nav-inner">
          <div class="brand-section" id="nav-brand-logo" style="cursor: pointer;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="National Emblem" class="brand-emblem" />
            <div class="brand-text">
              <h1>
                Capacity Connect
                <span class="hindi-sub">(समर्थ-पृथ्वी)</span>
              </h1>
              <span class="ministry-sub">${t('nav.ministryTagline', 'Centralized HR Capacity Building & Enterprise LMS Portal')}</span>
            </div>
          </div>

          <!-- Desktop Navigation: Spotlight Navbar Mega-Bar -->
          <div class="spotlight-nav-wrapper">
            <div class="spotlight-nav" id="spotlight-navbar">
              <ul class="nav-links">
                ${navItems.map((item, idx) => `<li>${renderNavLink(item, idx)}</li>`).join('')}
              </ul>

              <!-- 1. The Moving Spotlight Layer (Follows Mouse Cursor) -->
              <div class="spotlight-layer" id="spotlight-moving-glow" aria-hidden="true"></div>

              <!-- 2. The Active State Ambience (Glows at Active Tab) -->
              <div class="ambience-layer" id="spotlight-ambience-glow" aria-hidden="true"></div>

              <!-- 3. Bottom Accent Ambience Line -->
              <div class="ambience-line" id="spotlight-ambience-line" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Clean, Managed Right Actions: Settings & Profile -->
          <div class="nav-actions">
            <!-- Portal Settings & Control Center Button -->
            <button class="btn-settings-pill" id="btn-navbar-settings" title="${t('nav.settings', 'Settings & Control Center')}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span class="settings-pill-label">${t('nav.settings', 'Settings')}</span>
            </button>

            ${user ? `
              <div class="user-profile-chip" id="profile-chip-btn" title="Officer Identity & Settings">
                <img src="${user.avatarUrl}" alt="${user.name}" class="avatar-circle" id="nav-avatar-img" />
                <div class="profile-info">
                  <span class="profile-name">${user.name.split(' ')[0]}</span>
                  <span class="role-tag ${user.role}">${user.customRoleId}</span>
                </div>
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" id="btn-nav-login">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                ${t('nav.login', 'Sign In')}
              </button>
            `}

            <!-- Hamburger Menu Button (Mobile) -->
            <button class="hamburger-btn" id="hamburger-toggle" aria-label="Open Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Slide-in Drawer -->
      <div class="mobile-drawer-overlay ${this.mobileMenuOpen ? 'open' : ''}" id="mobile-drawer-overlay">
        <div class="mobile-drawer">
          <div class="mobile-drawer-header">
            <h3>समर्थ-पृथ्वी Menu</h3>
            <button class="mobile-drawer-close" id="mobile-drawer-close">&times;</button>
          </div>
          <ul class="mobile-drawer-nav">
            ${navItems.map(item => `<li>${renderMobileNavLink(item)}</li>`).join('')}
            <li>
              <a class="nav-link" id="mobile-settings-btn" style="color: var(--ocean-cyan); font-weight: 700;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings & Switch Persona / सेटिंग्स
              </a>
            </li>
          </ul>
          <div class="mobile-drawer-footer">
            ${user ? `
              <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0;">
                <img src="${user.avatarUrl}" alt="${user.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--ocean-cyan);" />
                <div>
                  <div style="font-weight: 700; font-size: 0.9rem;">${user.name}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${user.customRoleId} · ${user.institute}</div>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" id="mobile-logout-btn" style="width: 100%;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out / लॉग आउट
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" id="mobile-login-btn" style="width: 100%;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Sign In / साइन इन
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Brand click -> home
    const brand = container.querySelector("#nav-brand-logo");
    if (brand && this.appState.navigate) {
      brand.addEventListener("click", () => this.appState.navigate("home"));
    }

    // Nav link click (both desktop and mobile)
    container.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        const target = e.currentTarget.getAttribute("data-nav");
        if (target && this.appState.navigate) {
          this.appState.navigate(target);
          this.closeMobileMenu(container);
        }
      });
    });

    // Spotlight Navbar Animation (Mouse following spotlight + active ambience indicator)
    const spotlightNav = container.querySelector("#spotlight-navbar");
    if (spotlightNav) {
      let spotlightX = 0;
      let ambienceX = 0;

      const getActiveCenter = () => {
        const activeLink = spotlightNav.querySelector(".nav-link.active") || spotlightNav.querySelector(".nav-link");
        if (activeLink) {
          const navRect = spotlightNav.getBoundingClientRect();
          const itemRect = activeLink.getBoundingClientRect();
          if (itemRect.width > 0) {
            return (itemRect.left - navRect.left) + (itemRect.width / 2);
          }
        }
        return spotlightNav.clientWidth / 2;
      };

      const setAmbienceX = (val) => {
        ambienceX = val;
        spotlightNav.style.setProperty("--ambience-x", `${val}px`);
      };

      const setSpotlightX = (val) => {
        spotlightX = val;
        spotlightNav.style.setProperty("--spotlight-x", `${val}px`);
      };

      // Set initial position
      const alignToActive = (immediate = false) => {
        const targetX = getActiveCenter();
        if (immediate || typeof gsap === "undefined") {
          setAmbienceX(targetX);
          setSpotlightX(targetX);
        } else {
          gsap.to({ aX: ambienceX, sX: spotlightX }, {
            aX: targetX,
            sX: targetX,
            duration: 0.45,
            ease: "power2.out",
            onUpdate: function () {
              setAmbienceX(this.targets()[0].aX);
              if (!spotlightNav.classList.contains("is-hovering")) {
                setSpotlightX(this.targets()[0].sX);
              }
            }
          });
        }
      };

      setTimeout(() => alignToActive(true), 60);

      // Direct snappy update on mousemove
      spotlightNav.addEventListener("mousemove", (e) => {
        const rect = spotlightNav.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setSpotlightX(x);
        spotlightNav.classList.add("is-hovering");
      });

      // Spring back on mouseleave
      spotlightNav.addEventListener("mouseleave", () => {
        spotlightNav.classList.remove("is-hovering");
        const targetX = getActiveCenter();
        if (typeof gsap !== "undefined") {
          gsap.to({ sX: spotlightX }, {
            sX: targetX,
            duration: 0.55,
            ease: "back.out(1.5)",
            onUpdate: function () {
              setSpotlightX(this.targets()[0].sX);
            }
          });
        } else {
          setSpotlightX(targetX);
        }
      });

      // Keep ambience glow aligned on window resize / browser zoom
      window.addEventListener("resize", () => {
        alignToActive(true);
      });
    }

    // Hamburger toggle
    const hamburger = container.querySelector("#hamburger-toggle");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        this.mobileMenuOpen = true;
        const overlay = container.querySelector("#mobile-drawer-overlay");
        if (overlay) overlay.classList.add("open");
      });
    }

    // Mobile drawer close
    const drawerClose = container.querySelector("#mobile-drawer-close");
    if (drawerClose) {
      drawerClose.addEventListener("click", () => this.closeMobileMenu(container));
    }

    // Click overlay to close
    const drawerOverlay = container.querySelector("#mobile-drawer-overlay");
    if (drawerOverlay) {
      drawerOverlay.addEventListener("click", (e) => {
        if (e.target === drawerOverlay) this.closeMobileMenu(container);
      });
    }

    // Mobile Faculty Studio
    const mobileFacultyBtn = container.querySelector("#mobile-faculty-studio-btn");
    if (mobileFacultyBtn) {
      mobileFacultyBtn.addEventListener("click", () => {
        this.closeMobileMenu(container);
        if (this.appState.facultyStudio) this.appState.facultyStudio.open("video");
      });
    }

    // Mobile login/logout
    const mobileLoginBtn = container.querySelector("#mobile-login-btn");
    if (mobileLoginBtn && this.appState.authModal) {
      mobileLoginBtn.addEventListener("click", () => {
        this.closeMobileMenu(container);
        this.appState.authModal.open();
      });
    }

    const mobileLogoutBtn = container.querySelector("#mobile-logout-btn");
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener("click", () => {
        this.closeMobileMenu(container);
        if (this.appState.logout) {
          this.appState.logout();
        } else {
          this.appState.currentUser = null;
          if (this.appState.saveLocalDb) this.appState.saveLocalDb();
          this.appState.render();
        }
      });
    }

    // Institute Quick Filters
    container.querySelectorAll(".inst-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        const inst = e.currentTarget.getAttribute("data-inst");
        if (this.appState.navigate) {
          this.appState.navigate("courses");
          setTimeout(() => {
            const courseFilter = document.querySelector(`.inst-btn[data-institute="${inst}"]`);
            if (courseFilter) courseFilter.click();
          }, 150);
        }
      });
    });

    // Faculty Studio button
    const facultyBtn = container.querySelector("#btn-open-faculty-studio");
    if (facultyBtn) {
      facultyBtn.addEventListener("click", () => {
        if (this.appState.facultyStudio) {
          this.appState.facultyStudio.open("video");
        }
      });
    }

    // Role switcher dropdown
    const roleSwitcher = container.querySelector("#nav-role-switcher");
    if (roleSwitcher) {
      roleSwitcher.addEventListener("change", (e) => {
        const selectedRole = e.target.value;
        if (selectedRole === "trainer") {
          this.appState.currentUser = {
            id: "usr_trainer_01",
            customRoleId: "TRN-001",
            name: "Dr. Anita Desai",
            email: "anita.desai@imd.gov.in",
            phone: "+91 9876500001",
            role: "trainer",
            institute: "IMD",
            designation: "Chief Radar Specialist & Faculty Head",
            department: "Radar & Satellite Meteorology Division",
            avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            knowledgePoints: 6200,
            learningStreak: 28,
            coursesCompleted: 12,
            certsEarned: 8
          };
        } else if (selectedRole === "admin") {
          this.appState.currentUser = {
            id: "usr_admin_01",
            customRoleId: "ADM-001",
            name: "Dr. M. Ravichandran",
            email: "secretary@moes.gov.in",
            phone: "+91 9876500002",
            role: "admin",
            institute: "HQ",
            designation: "Secretary & Director General",
            department: "Ministry Executive Directorate",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            knowledgePoints: 9500,
            learningStreak: 45,
            coursesCompleted: 24,
            certsEarned: 15
          };
        } else {
          this.appState.currentUser = {
            id: "usr_employee_01",
            customRoleId: "EMP-001",
            name: "Dr. Rajesh Sharma",
            email: "rajesh.sharma@imd.gov.in",
            phone: "+91 9876543210",
            role: "employee",
            institute: "IMD",
            designation: "Scientist 'D'",
            department: "Monsoon Forecasting & Severe Weather Division",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            knowledgePoints: 1450,
            learningStreak: 12,
            coursesCompleted: 3,
            certsEarned: 2
          };
        }

        // Redirect safely if active tab is restricted for the selected role
        if (selectedRole === "employee") {
          if (this.appState.activeTab === "heatmap" || this.appState.activeTab === "leaderboard" || this.appState.activeTab === "leadership") {
            this.appState.activeTab = "courses";
            window.location.hash = "courses";
          }
        } else if (selectedRole === "trainer") {
          if (this.appState.activeTab === "leadership") {
            this.appState.activeTab = "heatmap";
            window.location.hash = "heatmap";
          }
        }

        if (this.appState.saveLocalDb) this.appState.saveLocalDb();
        this.appState.render();
      });
    }

    // Font resizing
    const decBtn = container.querySelector("#font-dec");
    const resetBtn = container.querySelector("#font-reset");
    const incBtn = container.querySelector("#font-inc");

    if (decBtn && resetBtn && incBtn) {
      decBtn.addEventListener("click", () => {
        document.documentElement.style.fontSize = "14px";
        [decBtn, resetBtn, incBtn].forEach(b => b.classList.remove("active"));
        decBtn.classList.add("active");
      });
      resetBtn.addEventListener("click", () => {
        document.documentElement.style.fontSize = "16px";
        [decBtn, resetBtn, incBtn].forEach(b => b.classList.remove("active"));
        resetBtn.classList.add("active");
      });
      incBtn.addEventListener("click", () => {
        document.documentElement.style.fontSize = "18px";
        [decBtn, resetBtn, incBtn].forEach(b => b.classList.remove("active"));
        incBtn.classList.add("active");
      });
    }

    // Language toggle
    const langBtn = container.querySelector("#lang-toggle-btn");
    if (langBtn && window.i18n) {
      langBtn.addEventListener("click", () => {
        window.i18n.toggleLanguage();
        this.appState.render();
      });
    }

    // Dark/Light Theme toggle
    const themeBtn = container.querySelector("#theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("moes_theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
      });
    }

    // Settings Trigger
    const settingsBtn = container.querySelector("#btn-navbar-settings");
    if (settingsBtn && this.appState.settingsModal) {
      settingsBtn.addEventListener("click", () => {
        this.appState.settingsModal.open();
      });
    }

    // Profile Chip opens Settings & Control Center, Avatar opens Profile Modal
    const profileChip = container.querySelector("#profile-chip-btn");
    const navAvatar = container.querySelector("#nav-avatar-img");

    if (navAvatar && this.appState.profileModal) {
      navAvatar.addEventListener("click", (e) => {
        e.stopPropagation();
        this.appState.profileModal.open();
      });
    }

    if (profileChip && this.appState.settingsModal) {
      profileChip.addEventListener("click", () => {
        this.appState.settingsModal.open();
      });
    }

    // Mobile Settings Trigger
    const mobileSettingsBtn = container.querySelector("#mobile-settings-btn");
    if (mobileSettingsBtn && this.appState.settingsModal) {
      mobileSettingsBtn.addEventListener("click", () => {
        this.closeMobileMenu(container);
        this.appState.settingsModal.open();
      });
    }

    // Login Modal trigger
    const loginBtn = container.querySelector("#btn-nav-login");
    if (loginBtn && this.appState.authModal) {
      loginBtn.addEventListener("click", () => {
        this.appState.authModal.open();
      });
    }

    // Logout
    const logoutBtn = container.querySelector("#btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (this.appState.logout) {
          this.appState.logout();
        } else {
          this.appState.currentUser = null;
          if (this.appState.saveLocalDb) this.appState.saveLocalDb();
          this.appState.render();
        }
      });
    }
  }

  closeMobileMenu(container) {
    this.mobileMenuOpen = false;
    const overlay = container.querySelector("#mobile-drawer-overlay");
    if (overlay) overlay.classList.remove("open");
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = NavbarComponent;
}
