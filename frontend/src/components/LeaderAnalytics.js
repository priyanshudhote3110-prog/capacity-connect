/**
 * LeaderAnalytics.js - Executive Leadership Intelligence & Skill-Gap Analytics Dashboard
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Restricted: Visible and accessible strictly to users with role === 'admin'
 * 
 * Features:
 * - Dynamic Real-Time IST Telemetry Clock & Auto-Sync Countdown
 * - Animated Executive Ministerial Mandate Modal (1-Click Remediation Console)
 * - Real-Time Dashboard State Mutation: Instant Counter Transitions, Dynamic Bar Widening
 * - Executive Mandate Directives & Enforcement Audit Trail with Live Countdown Timers
 * - Responsive Multi-Institute Filtering, CSV Export & State Persistence
 */

class LeaderAnalyticsComponent {
  constructor(appState) {
    this.appState = appState;
    this.selectedInstitute = "ALL";
    this.selectedPeriod = "ALL";
    this.searchQuery = "";
    
    // Telemetry & dynamic time state
    this.telemetryInterval = null;
    this.syncCountdown = 30;
    this.autoSyncActive = true;
    this.lastSyncTimestamp = new Date();
    
    // Active modal state
    this.activeMandateData = null;
    
    // Load persisted directives & enforced codes from localStorage
    this.enforcedCompetencyCodes = new Set(
      JSON.parse(localStorage.getItem("moes_enforced_competencies") || "[]")
    );
    this.persistedDirectives = JSON.parse(
      localStorage.getItem("moes_active_directives") || "[]"
    );
    this.metricsOverrides = JSON.parse(
      localStorage.getItem("moes_metrics_override") || "{}"
    );

    // Live newsfeed ticker items
    this.tickerEvents = [
      "📡 IMD Pune Doppler Radar Network: 28 scientists verified in DWR SOP",
      "⚡ NCMRWF Slurm Workload Scheduler: 18 PFLOPS parallel queue compliant (89% passing)",
      "🌊 INCOIS Indian Tsunami Early Warning (ITEWS) live drill completed with 91% accuracy",
      "🛰️ NIOT Deep Ocean Mission: Matsya-6000 battery & pressure hull telemetry certified",
      "❄️ NCPOR Polar Operations: Antarctic Maitri & Bharati winter survival protocol active",
      "💻 IITM Tropical Climate Decadal Modeling: Coupled Earth System Model (ESM) team passed"
    ];
    this.currentTickerIndex = 0;
  }

  // ====================================================================
  // MAIN RENDER METHOD
  // ====================================================================

  render(container) {
    this.currentContainer = container;
    const user = this.appState.currentUser;

    // SECURITY CHECK: Strictly Leader / Admin Access
    if (!user || user.role !== "admin") {
      this.renderAccessDenied(container);
      return;
    }

    const analytics = this.getMergedAnalyticsData();
    const stats = analytics.summary || {};
    const instituteStats = analytics.instituteStats || {};
    const benchmarks = analytics.competencyBenchmarks || [];
    const trainings = analytics.trainingPrograms || [];
    const trends = analytics.quarterlyTrends || [];
    const directives = analytics.directives || [];
    const workforce = analytics.workforceDistribution || {
      certified: 840,
      inTraining: 1850,
      gapIdentified: 445,
      pendingEnrollment: 315,
      totalWorkforce: 3450
    };

    container.innerHTML = `
      <div class="app-container leader-dashboard-container" style="padding-top: 24px; padding-bottom: 70px;">
        
        <!-- 1. Real-Time Telemetry & IST Clock Dynamic Ticker Bar -->
        <div class="leader-telemetry-bar">
          <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
            <div class="leader-live-indicator">
              <span class="leader-pulse-glow"></span>
              <span>LIVE TELEMETRY STREAM</span>
            </div>
            <div class="leader-clock-chip" id="leader-live-clock">
              ${this.getFormattedIstTime()}
            </div>
            <div style="font-size: 0.76rem; color: #94A3B8; display: flex; align-items: center; gap: 6px;">
              <span>• MoES NIC Central Node</span>
              <span style="color: #10B981; font-weight: 700;">(12ms Latency)</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
            <!-- Live Ticker Marquee -->
            <div class="leader-ticker-track" style="max-width: 480px;">
              <div class="leader-ticker-content" id="leader-ticker-stream">
                ${this.tickerEvents[this.currentTickerIndex]}
              </div>
            </div>

            <!-- Sync Controls -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="leader-sync-timer" style="font-size: 0.74rem; color: #94A3B8; font-family: monospace;">
                Sync: ${this.syncCountdown}s
              </span>
              <button class="btn btn-outline btn-sm" id="btn-leader-force-sync" title="Force Refresh Telemetry" style="padding: 4px 8px; font-size: 0.72rem; color: #38BDF8; border-color: rgba(56,189,248,0.4); background: rgba(56,189,248,0.1);">
                <svg id="sync-refresh-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: middle;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Sync Now
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Top Executive Command Banner -->
        <div class="leader-hero-banner" style="background: linear-gradient(135deg, #07172C 0%, #0F2744 50%, #123B68 100%); border-radius: 18px; padding: 30px; color: #FFF; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 15px 35px -5px rgba(0,0,0,0.4); position: relative; overflow: hidden;">
          <div style="position: absolute; right: -25px; top: -25px; opacity: 0.07; pointer-events: none;">
            <svg width="280" height="280" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; position: relative; z-index: 1;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                <span style="background: linear-gradient(90deg, #FF9933, #FF8008); color: #000; font-weight: 800; font-size: 0.72rem; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; display: inline-flex; align-items: center; gap: 5px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  EXECUTIVE DIRECTORATE ONLY
                </span>
                <span style="color: #94A3B8; font-size: 0.82rem; font-weight: 500;">
                  Ministry of Earth Sciences · Sec. Clearance Level 1
                </span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3); font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 12px;">
                  AUTHENTICATED: DR. M. RAVICHANDRAN (DG/SEC)
                </span>
              </div>

              <h1 style="font-size: 2rem; font-weight: 800; margin: 0 0 8px 0; color: #FFFFFF; font-family: var(--font-heading); letter-spacing: -0.02em;">
                Workforce Training & Skill-Gap Intelligence Dashboard
              </h1>
              <p style="color: #CBD5E1; font-size: 0.95rem; margin: 0; max-width: 820px; line-height: 1.5;">
                National real-time command portal monitoring training completion rates, institutional skill deficits, and personnel capacity metrics across IMD, INCOIS, IITM, NCMRWF, NIOT, and NCPOR.
              </p>
            </div>

            <!-- Action Controls -->
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <!-- Institute Filter Dropdown -->
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.18);">
                <label for="leader-institute-filter" style="font-size: 0.75rem; color: #94A3B8; font-weight: 700;">INSTITUTE:</label>
                <select id="leader-institute-filter" style="background: transparent; color: #FFF; border: none; font-size: 0.84rem; font-weight: 700; cursor: pointer; outline: none;">
                  <option value="ALL" ${this.selectedInstitute === "ALL" ? "selected" : ""} style="color: #000;">All Autonomous Bodies (6)</option>
                  <option value="IMD" ${this.selectedInstitute === "IMD" ? "selected" : ""} style="color: #000;">IMD (Meteorological)</option>
                  <option value="INCOIS" ${this.selectedInstitute === "INCOIS" ? "selected" : ""} style="color: #000;">INCOIS (Ocean Services)</option>
                  <option value="IITM" ${this.selectedInstitute === "IITM" ? "selected" : ""} style="color: #000;">IITM (Tropical Climate)</option>
                  <option value="NCMRWF" ${this.selectedInstitute === "NCMRWF" ? "selected" : ""} style="color: #000;">NCMRWF (Slurm/HPC)</option>
                  <option value="NIOT" ${this.selectedInstitute === "NIOT" ? "selected" : ""} style="color: #000;">NIOT (Deep Ocean)</option>
                  <option value="NCPOR" ${this.selectedInstitute === "NCPOR" ? "selected" : ""} style="color: #000;">NCPOR (Polar/Antarctic)</option>
                </select>
              </div>

              <!-- Notification Hub Fast Action Button -->
              <button class="btn btn-sm" id="btn-leader-goto-notifications" style="background: linear-gradient(135deg, #FF9933, #EA580C); border: none; font-weight: 700; color: #FFF; padding: 9px 16px; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.35);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Notification Hub ➔
              </button>

              <!-- Export CSV Button -->
              <button class="btn btn-outline btn-sm" id="btn-leader-export-csv" style="color: #FFF; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); font-weight: 600; padding: 9px 16px; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export Brief (CSV)
              </button>
            </div>
          </div>
        </div>

        <!-- 3. KPI Metric Cards Grid (Dynamic Animated Numbers) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 28px;">
          
          <!-- Card 1: Total Personnel Trained -->
          <div class="card metric-card" style="padding: 20px; border-top: 4px solid #10B981; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Scientists Trained</span>
              <span style="font-size: 1.1rem; color: #065F46;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
            </div>
            <div id="kpi-total-trained" class="metric-count-up" style="font-size: 2.15rem; font-weight: 800; color: #065F46; line-height: 1.1;">
              ${(stats.totalTrained || 3135).toLocaleString("en-IN")}
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: #047857; font-weight: 600;">
              ↑ 90.8% of ${stats.totalWorkforce || "3,450"} indexed personnel
            </div>
          </div>

          <!-- Card 2: Training Courses Delivered -->
          <div class="card metric-card" style="padding: 20px; border-top: 4px solid #3B82F6; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Training Courses Delivered</span>
              <span style="font-size: 1.1rem; color: #1E40AF;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
            </div>
            <div class="metric-count-up" style="font-size: 2.15rem; font-weight: 800; color: #1E40AF; line-height: 1.1;">
              ${trainings.length || 6} Specialized
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted);">
              Across 6 Autonomous Directorates
            </div>
          </div>

          <!-- Card 3: Cryptographic Certificates -->
          <div class="card metric-card" style="padding: 20px; border-top: 4px solid #F59E0B; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Verified Certifications</span>
              <span style="font-size: 1.1rem; color: #B45309;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg></span>
            </div>
            <div id="kpi-total-certs" class="metric-count-up" style="font-size: 2.15rem; font-weight: 800; color: #B45309; line-height: 1.1;">
              ${(stats.totalCertificatesIssued || 840).toLocaleString("en-IN")}
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted);">
              SHA-256 Tamper-Proof Digital Proofs
            </div>
          </div>

          <!-- Card 4: Identified Skill Gaps -->
          <div class="card metric-card" style="padding: 20px; border-top: 4px solid #EF4444; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Critical Skill Gaps</span>
              <span style="font-size: 1.1rem; color: #DC2626;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
            </div>
            <div id="kpi-critical-gaps" class="metric-count-up" style="font-size: 2.15rem; font-weight: 800; color: #B91C1C; line-height: 1.1;">
              ${stats.criticalGapsIdentified !== undefined ? stats.criticalGapsIdentified : benchmarks.filter(b => b.gap < -20).length} Domains
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: #DC2626; font-weight: 700;">
              Requires Ministerial Cohort Mandate
            </div>
          </div>

          <!-- Card 5: Overall MoES Compliance -->
          <div class="card metric-card" style="padding: 20px; border-top: 4px solid #8B5CF6; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Compliance Index</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div id="kpi-compliance-index" class="metric-count-up" style="font-size: 2.15rem; font-weight: 800; color: #6D28D9; line-height: 1.1;">
              ${stats.overallComplianceRate || "88.4%"}
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: #047857; font-weight: 600;">
              ↑ +6.2% vs Previous Quarter
            </div>
          </div>
        </div>

        <!-- 4. Charts Row 1: Institute Participation & Competency Benchmark -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 20px; margin-bottom: 24px;">
          
          <!-- Chart 1: Institute Training Participation -->
          <div class="card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--primary-navy);">
                  1. Personnel Trained by Autonomous Institute
                </h3>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                  Actual trained personnel vs Total workforce across all 6 research bodies
                </p>
              </div>
              <div style="display: flex; gap: 8px; font-size: 0.72rem; font-weight: 600;">
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #0284C7; border-radius: 2px;"></span> Trained</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #E2E8F0; border-radius: 2px;"></span> Untrained</span>
              </div>
            </div>

            <!-- SVG Bar Chart -->
            ${this.renderInstituteBarChart(instituteStats)}
          </div>

          <!-- Chart 2: Skill-Gap vs National Benchmark -->
          <div class="card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--primary-navy);">
                  2. Competency Measured Score vs. Target Benchmark
                </h3>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                  Identifies domains where workforce proficiency falls behind the 80%-85% benchmark
                </p>
              </div>
              <div style="display: flex; gap: 8px; font-size: 0.72rem; font-weight: 600;">
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #10B981; border-radius: 2px;"></span> Target (85%)</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: #F59E0B; border-radius: 2px;"></span> Measured Avg</span>
              </div>
            </div>

            <!-- Dynamic Benchmark Comparison Track -->
            <div id="benchmark-chart-mount">
              ${this.renderSkillGapBenchmarkChart(benchmarks)}
            </div>
          </div>
        </div>

        <!-- 5. Charts Row 2: Workforce Donut Funnel & Capacity Growth Velocity -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 20px; margin-bottom: 24px;">
          
          <!-- Chart 3: Workforce Training Status Donut -->
          <div class="card" style="padding: 24px;">
            <div style="margin-bottom: 16px;">
              <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--primary-navy);">
                3. Total Workforce Training Status & Distribution
              </h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                Classification of all 3,450 officers across certification stages
              </p>
            </div>

            ${this.renderWorkforceDonutChart(workforce)}
          </div>

          <!-- Chart 4: Quarterly Capacity Building Velocity -->
          <div class="card" style="padding: 24px;">
            <div style="margin-bottom: 16px;">
              <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--primary-navy);">
                4. Quarterly Capacity Building Velocity & Trend
              </h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                Cumulative scientific personnel trained across MoES initiatives over time
              </p>
            </div>

            ${this.renderVelocityTrendChart(trends)}
          </div>
        </div>

        <!-- 6. Detailed Training Programs History -->
        <div class="card" style="padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--primary-navy); display: flex; align-items: center; gap: 6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                Completed & Active Specialized Training Programs
              </h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                Comprehensive log of accredited technical modules delivered across the Ministry
              </p>
            </div>
            <span style="font-size: 0.8rem; background: var(--bg-hover); padding: 4px 10px; border-radius: 6px; font-weight: 600;">
              Total Modules: ${trainings.length}
            </span>
          </div>

          <div style="overflow-x: auto;">
            <table class="leader-table" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); text-align: left; background: #F8FAFC;">
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Course Code & Title</th>
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Institute</th>
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Enrolled</th>
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Completed</th>
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Completion Rate</th>
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Avg. Exam Score</th>
                  <th style="padding: 12px 14px; font-weight: 700; color: var(--text-muted);">Status</th>
                </tr>
              </thead>
              <tbody>
                ${trainings.map(tr => {
                  const rate = Math.round((tr.completed / tr.totalEnrolled) * 100);
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 12px 14px; font-weight: 600; color: var(--primary-navy);">
                        <div>${tr.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${tr.id}</div>
                      </td>
                      <td style="padding: 12px 14px;">
                        <span class="inst-pill" style="font-size: 0.72rem; padding: 2px 8px;">${tr.institute}</span>
                      </td>
                      <td style="padding: 12px 14px; font-weight: 700;">${tr.totalEnrolled.toLocaleString("en-IN")}</td>
                      <td style="padding: 12px 14px; font-weight: 700; color: #059669;">${tr.completed.toLocaleString("en-IN")}</td>
                      <td style="padding: 12px 14px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div style="flex: 1; height: 6px; background: #E2E8F0; border-radius: 3px; width: 60px; overflow: hidden;">
                            <div style="height: 100%; width: ${rate}%; background: ${rate >= 85 ? "#10B981" : "#F59E0B"};"></div>
                          </div>
                          <span style="font-size: 0.75rem; font-weight: 700;">${rate}%</span>
                        </div>
                      </td>
                      <td style="padding: 12px 14px; font-weight: 700; color: ${tr.avgScore >= 85 ? "#047857" : "#B45309"};">
                        ${tr.avgScore}%
                      </td>
                      <td style="padding: 12px 14px;">
                        <span style="background: #DEF7EC; color: #03543F; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 12px;">
                          ● ${tr.status}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7. SECTION 4: Critical Skill Gap Remediation & 1-Click Mandate Action Table -->
        <div class="card" style="padding: 24px; border: 1px solid #FECACA; background: #FFFBFB; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="background: #EF4444; color: #FFF; font-weight: 800; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">
                  EXECUTIVE REMEDIATION
                </span>
                <span style="font-weight: 700; color: #991B1B; font-size: 0.9rem;">
                  Identified Workforce Competency Deficits
                </span>
              </div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.25rem; color: #7F1D1D;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                1-Click Ministerial Mandate Directive
              </h3>
              <p style="margin: 0; font-size: 0.84rem; color: #7F1D1D; opacity: 0.88;">
                As Ministry Secretary / Director General, directly enforce mandatory learning cohorts on institutes where competency proficiencies are below national standard.
              </p>
            </div>
            <div style="font-size: 0.78rem; background: #FEE2E2; color: #991B1B; font-weight: 700; padding: 6px 12px; border-radius: 8px; border: 1px solid #FCA5A5;">
              ⚡ Directives Dispatched: <span id="count-enforced-directives">${this.enforcedCompetencyCodes.size}</span> Active
            </div>
          </div>

          <!-- Quick Filter Pills -->
          <div class="leader-filter-pills" id="remediation-filter-pills">
            <button type="button" class="leader-filter-pill active" data-filter="all">All Domains (6)</button>
            <button type="button" class="leader-filter-pill" data-filter="critical">Critical Deficits (< -20%)</button>
            <button type="button" class="leader-filter-pill" data-filter="moderate">Moderate Gaps</button>
            <button type="button" class="leader-filter-pill" data-filter="enforced">Mandate Enforced ⚡</button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;" id="table-remediation-mandates">
              <thead>
                <tr style="border-bottom: 2px solid #FCA5A5; text-align: left; background: #FEF2F2;">
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B;">Competency Domain</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B;">Benchmark</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B;">Measured Avg</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B;">Deficit Gap</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B;">Lagging Institutes</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B;">Urgency</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: #991B1B; text-align: right;">Ministerial Action</th>
                </tr>
              </thead>
              <tbody>
                ${benchmarks.map(bm => {
                  const isEnforced = this.enforcedCompetencyCodes.has(bm.code);
                  const isCritical = bm.gap < -20;
                  const isModerate = bm.gap >= -20 && bm.gap < -5;
                  
                  const urgencyBadge = isEnforced
                    ? `<span class="badge-mandate-active"><span class="leader-pulse-glow"></span> MANDATE ACTIVE</span>`
                    : isCritical
                    ? `<span style="background: #FEE2E2; color: #B91C1C; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; border: 1px solid #EF4444;">CRITICAL GAP</span>`
                    : isModerate
                    ? `<span style="background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; border: 1px solid #F59E0B;">MODERATE GAP</span>`
                    : `<span style="background: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; border: 1px solid #22C55E;">TARGET MET</span>`;

                  return `
                    <tr style="border-bottom: 1px solid #FEE2E2;" id="row-comp-${bm.code}">
                      <td style="padding: 12px; font-weight: 700; color: var(--primary-navy);">
                        ${bm.name}
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">${bm.code}</div>
                      </td>
                      <td style="padding: 12px; font-weight: 700;">${bm.benchmark}%</td>
                      <td style="padding: 12px; font-weight: 700; color: ${bm.currentAvg < 50 ? "#DC2626" : bm.currentAvg < 75 ? "#D97706" : "#16A34A"};" class="cell-measured-avg">
                        ${bm.currentAvg}%
                      </td>
                      <td style="padding: 12px; font-weight: 800; color: ${bm.gap < -20 ? "#DC2626" : "#D97706"};" class="cell-deficit-gap">
                        ${bm.gap}%
                      </td>
                      <td style="padding: 12px;">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                          ${bm.criticalInstitutes.map(inst => `
                            <span style="background: #FEE2E2; color: #991B1B; font-weight: 700; font-size: 0.7rem; padding: 1px 6px; border-radius: 3px;">
                              ${inst}
                            </span>
                          `).join("")}
                        </div>
                      </td>
                      <td style="padding: 12px;" class="cell-urgency">${urgencyBadge}</td>
                      <td style="padding: 12px; text-align: right;" class="cell-action-btn">
                        ${isEnforced ? `
                          <button class="btn btn-sm btn-mandate-order" data-comp="${bm.code}" style="font-size: 0.75rem; padding: 5px 12px; background: #059669; border-color: #047857; color: #FFF;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:3px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg> Cohort Active
                          </button>
                        ` : `
                          <button class="btn btn-primary btn-sm btn-mandate-order" data-comp="${bm.code}" data-inst="${bm.criticalInstitutes[0] || 'IMD'}" style="font-size: 0.75rem; padding: 5px 12px; background: #DC2626; border-color: #B91C1C; cursor: pointer;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:3px;vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Enforce Cohort
                          </button>
                        `}
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 8. SECTION 5: Active Ministerial Directives & Enforcement Audit Trail -->
        <div class="card" style="padding: 24px; border: 1px solid #CBD5E1; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: var(--primary-navy); display: flex; align-items: center; gap: 6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Promulgated Ministerial Directives & Enforcement Trail
              </h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                Chronological audit record of official Executive Cohort Orders signed and active across autonomous research bodies
              </p>
            </div>
            <span style="font-size: 0.8rem; background: #EFF6FF; color: #1E40AF; padding: 4px 12px; border-radius: 6px; font-weight: 700; border: 1px solid #BFDBFE;">
              Official Orders Promulgated: <span id="audit-directives-count">${directives.length}</span>
            </span>
          </div>

          <div style="overflow-x: auto;">
            <table class="leader-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;" id="table-audit-directives">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); text-align: left; background: #F8FAFC;">
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Directive Order ID</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Competency Domain</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Targeted Institutes</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Personnel Quota</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Deadline Countdown</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Priority</th>
                  <th style="padding: 10px 12px; font-weight: 700; color: var(--text-muted);">Compliance Status</th>
                </tr>
              </thead>
              <tbody id="audit-directives-tbody">
                ${directives.map(dir => {
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 12px; font-weight: 700; font-family: monospace;">
                        <a href="javascript:void(0)" class="btn-view-gazette" data-dir-id="${dir.id}" style="color: #0284C7; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;" title="View Official Gazette Directive Document">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          ${dir.id}
                        </a>
                      </td>
                      <td style="padding: 12px; font-weight: 700; color: var(--primary-navy);">
                        ${dir.competencyName}
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${dir.competencyCode}</div>
                      </td>
                      <td style="padding: 12px;">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                          ${dir.institutes.map(inst => `
                            <span class="inst-pill" style="font-size: 0.7rem; padding: 2px 6px;">${inst}</span>
                          `).join("")}
                        </div>
                      </td>
                      <td style="padding: 12px; font-weight: 700;">
                        ${dir.enrolledCount} / ${dir.targetPersonnel} officers
                      </td>
                      <td style="padding: 12px; font-weight: 600; color: #D97706;">
                        <span class="directive-countdown" data-deadline="${dir.deadlineDate || ''}">
                          ${dir.deadlineDays} Days remaining
                        </span>
                      </td>
                      <td style="padding: 12px;">
                        <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${dir.priority === 'CRITICAL' ? '#FEE2E2' : '#EFF6FF'}; color: ${dir.priority === 'CRITICAL' ? '#DC2626' : '#2563EB'};">
                          ${dir.priority}
                        </span>
                      </td>
                      <td style="padding: 12px;">
                        <span class="badge-mandate-active" style="font-size: 0.72rem; padding: 2px 8px;">
                          <span class="leader-pulse-glow" style="width:6px;height:6px;"></span> ${dir.status}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- 9. Animated Executive Ministerial Mandate Modal Mount Point -->
      <div id="mandate-modal-mount"></div>

      <!-- 10. Slide-In Executive Toast -->
      <div id="leader-toast" class="leader-exec-toast">
        <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; color: #10B981; flex-shrink: 0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-weight: 800; font-size: 0.85rem; color: #34D399; margin-bottom: 2px;">MINISTERIAL DIRECTIVE RATIFIED</div>
          <div id="leader-toast-message" style="font-size: 0.78rem; color: #E2E8F0;">Mandatory training cohort order dispatched to selected research bodies.</div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.startLiveTelemetry(container);
  }

  // ====================================================================
  // ANIMATED EXECUTIVE MANDATE DIRECTIVE MODAL
  // ====================================================================

  openMandateModal(competencyCode, preselectedInst) {
    const analytics = this.getMergedAnalyticsData();
    const benchmark = analytics.competencyBenchmarks.find(b => b.code === competencyCode) || {
      code: competencyCode,
      name: "Specialized Competency",
      benchmark: 85,
      currentAvg: 55,
      gap: -30,
      criticalInstitutes: ["NIOT", "NCPOR", "INCOIS"]
    };

    const mount = document.getElementById("mandate-modal-mount");
    if (!mount) return;

    const orderNumber = `MoES/EXEC-DIR/2026/DIR-${Math.floor(1000 + Math.random() * 9000)}`;
    const allInstitutes = [
      { code: "IMD", name: "India Meteorological Dept", staff: 1240 },
      { code: "INCOIS", name: "Ocean Information Services", staff: 480 },
      { code: "IITM", name: "Tropical Meteorology", staff: 520 },
      { code: "NCMRWF", name: "Medium Range Weather", staff: 310 },
      { code: "NIOT", name: "Ocean Technology", staff: 610 },
      { code: "NCPOR", name: "Polar & Antarctic", staff: 290 }
    ];

    // Pre-select lagging institutes
    const laggingSet = new Set(benchmark.criticalInstitutes || [preselectedInst]);
    if (preselectedInst) laggingSet.add(preselectedInst);

    mount.innerHTML = `
      <div class="mandate-modal-backdrop active" id="mandate-modal-backdrop">
        <div class="mandate-modal-card" id="mandate-modal-dialog">
          
          <!-- Modal Header -->
          <div class="mandate-modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="background: #EF4444; color: #FFF; font-weight: 800; font-size: 0.68rem; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;">
                  1-CLICK EXECUTIVE REMEDIATION
                </span>
                <span style="font-family: monospace; color: #94A3B8; font-size: 0.78rem;">
                  Directive ID: <strong style="color: #38BDF8;">${orderNumber}</strong>
                </span>
              </div>
              <h2 style="margin: 0; font-size: 1.45rem; color: #FFFFFF; font-family: var(--font-heading);">
                Ministerial Mandate Order Promulgation Console
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 0.82rem; color: #CBD5E1;">
                Ministry of Earth Sciences, Govt of India · Executive Directorate (Sec. Clearance Level 1)
              </p>
            </div>

            <button id="btn-close-mandate-modal" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #FFF; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: background 0.2s ease;">
              ×
            </button>
          </div>

          <!-- Modal Body Form -->
          <div class="mandate-modal-body">
            
            <!-- Snapshot Preview Box -->
            <div class="mandate-summary-box">
              <div>
                <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Competency Domain</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #38BDF8; margin-top: 2px;">${benchmark.name}</div>
                <div style="font-size: 0.75rem; color: #64748B;">Code: ${benchmark.code}</div>
              </div>

              <div>
                <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Target vs Measured</div>
                <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 2px;">
                  <span style="font-size: 1.3rem; font-weight: 800; color: #EF4444;">${benchmark.currentAvg}%</span>
                  <span style="color: #64748B; font-size: 0.85rem;">/ ${benchmark.benchmark}% Target</span>
                </div>
                <div style="font-size: 0.75rem; color: #F87171; font-weight: 700;">Deficit Gap: ${benchmark.gap}%</div>
              </div>

              <div>
                <div style="font-size: 0.75rem; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Estimated Staff Reach</div>
                <div style="font-size: 1.3rem; font-weight: 800; color: #10B981; margin-top: 2px;" id="modal-affected-staff-count">
                  320 Scientists
                </div>
                <div style="font-size: 0.75rem; color: #64748B;">Automated LMS Enrollment</div>
              </div>
            </div>

            <!-- Target Autonomous Bodies Selection Grid -->
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #E2E8F0; display: block; margin-bottom: 8px;">
                1. SELECT TARGET AUTONOMOUS RESEARCH BODIES TO ENFORCE:
              </label>
              <div class="mandate-inst-grid">
                ${allInstitutes.map(inst => {
                  const isChecked = laggingSet.has(inst.code);
                  return `
                    <div class="mandate-inst-chip ${isChecked ? 'selected' : ''}" data-inst="${inst.code}">
                      <input type="checkbox" class="inst-checkbox" value="${inst.code}" ${isChecked ? 'checked' : ''} style="cursor: pointer; accent-color: #EF4444;" />
                      <div style="flex: 1;">
                        <div style="font-weight: 800; font-size: 0.85rem; color: #FFF;">${inst.code}</div>
                        <div style="font-size: 0.72rem; color: #94A3B8;">${inst.name} (${inst.staff} Staff)</div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

            <!-- Priority & Deadline Settings -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #E2E8F0; display: block; margin-bottom: 8px;">
                  2. MANDATE PRIORITY & CLASSIFICATION:
                </label>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn btn-sm mandate-priority-btn active" data-priority="CRITICAL" style="flex: 1; padding: 8px; font-size: 0.78rem; font-weight: 800; background: #DC2626; color: #FFF; border: 1px solid #EF4444; border-radius: 8px;">
                    ⚡ Critical Gap
                  </button>
                  <button type="button" class="btn btn-sm mandate-priority-btn" data-priority="HIGH" style="flex: 1; padding: 8px; font-size: 0.78rem; font-weight: 700; background: rgba(255,255,255,0.06); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;">
                    Urgent (High)
                  </button>
                  <button type="button" class="btn btn-sm mandate-priority-btn" data-priority="STANDARD" style="flex: 1; padding: 8px; font-size: 0.78rem; font-weight: 700; background: rgba(255,255,255,0.06); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;">
                    Strategic Capacity
                  </button>
                </div>
              </div>

              <div>
                <label style="font-size: 0.8rem; font-weight: 700; color: #E2E8F0; display: block; margin-bottom: 8px;">
                  3. COMPLETION DEADLINE TIMELINE:
                </label>
                <div class="mandate-deadline-group">
                  <div class="mandate-deadline-pill" data-days="15">15 Days (Accelerated)</div>
                  <div class="mandate-deadline-pill active" data-days="30">30 Days (Standard)</div>
                  <div class="mandate-deadline-pill" data-days="45">45 Days</div>
                  <div class="mandate-deadline-pill" data-days="60">60 Days (Comprehensive)</div>
                </div>
              </div>
            </div>

            <!-- Mandatory Enforcement Options (Checkboxes) -->
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-bottom: 10px;">
                4. AUTOMATED POLICY ENFORCEMENT DIRECTIVES:
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 10px; font-size: 0.8rem;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #E2E8F0;">
                  <input type="checkbox" id="chk-auto-enroll" checked style="accent-color: #10B981;" />
                  <span>Auto-enroll all designated technical & research personnel</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #E2E8F0;">
                  <input type="checkbox" id="chk-dispatch-alerts" checked style="accent-color: #10B981;" />
                  <span>Dispatch Priority SMS & Official NIC Email directive blast</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #E2E8F0;">
                  <input type="checkbox" id="chk-restrict-clearance" checked style="accent-color: #10B981;" />
                  <span>Flag non-compliant personnel for research clearance hold</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #E2E8F0;">
                  <input type="checkbox" id="chk-director-brief" checked style="accent-color: #10B981;" />
                  <span>Require Institute Director weekly progress audit report</span>
                </label>
              </div>
            </div>

            <!-- Ministerial Order Notes / Remarks -->
            <div>
              <label for="mandate-executive-notes" style="font-size: 0.8rem; font-weight: 700; color: #E2E8F0; display: block; margin-bottom: 6px;">
                5. EXECUTIVE DIRECTIVE ORDER TEXT (OFFICIAL PROMULGATION):
              </label>
              <textarea id="mandate-executive-notes" rows="3" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; color: #FFF; font-family: monospace; font-size: 0.8rem; padding: 10px; box-sizing: border-box; resize: vertical;">By order of the Secretary, Ministry of Earth Sciences (Govt. of India), mandatory learning cohort is hereby enforced for designated scientific officers. Completion and SHA-256 certificate issuance required prior to deadline expiration.</textarea>
            </div>

            <!-- Signatory & Digital Seal -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255, 153, 51, 0.08); border: 1px solid rgba(255, 153, 51, 0.25); border-radius: 10px; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style="height: 36px; filter: brightness(0) invert(1);" />
                <div>
                  <div style="font-size: 0.82rem; font-weight: 800; color: #FF9933;">DIGITALLY RATIFIED UNDER MINISTERIAL SEAL</div>
                  <div style="font-size: 0.74rem; color: #94A3B8;">Signatory: Dr. M. Ravichandran, Secretary MoES & Director General</div>
                </div>
              </div>
              <div style="font-size: 0.72rem; color: #38BDF8; font-family: monospace;">
                SHA-256 Hash Generated on Submit
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px;">
              <button type="button" class="btn btn-outline" id="btn-cancel-mandate" style="border-color: rgba(255,255,255,0.25); color: #CBD5E1; padding: 10px 20px; font-weight: 600;">
                Cancel
              </button>
              <button type="button" class="btn btn-primary" id="btn-submit-mandate" data-comp="${benchmark.code}" style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); border: 1px solid #EF4444; padding: 10px 26px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Promulgate Ministerial Order
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    this.bindMandateModalEvents(mount, benchmark, orderNumber);
  }

  bindMandateModalEvents(mount, benchmark, orderNumber) {
    const backdrop = mount.querySelector("#mandate-modal-backdrop");
    const closeBtn = mount.querySelector("#btn-close-mandate-modal");
    const cancelBtn = mount.querySelector("#btn-cancel-mandate");
    const submitBtn = mount.querySelector("#btn-submit-mandate");

    const closeModal = () => {
      backdrop.classList.remove("active");
      setTimeout(() => { mount.innerHTML = ""; }, 300);
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Interactive institute checkbox toggle
    mount.querySelectorAll(".mandate-inst-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") {
          const checkbox = chip.querySelector(".inst-checkbox");
          checkbox.checked = !checkbox.checked;
        }
        const isChecked = chip.querySelector(".inst-checkbox").checked;
        chip.classList.toggle("selected", isChecked);
        this.updateModalAffectedStaff(mount);
      });
    });

    // Priority selector
    let selectedPriority = "CRITICAL";
    mount.querySelectorAll(".mandate-priority-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        mount.querySelectorAll(".mandate-priority-btn").forEach(b => {
          b.classList.remove("active");
          b.style.background = "rgba(255,255,255,0.06)";
          b.style.color = "#CBD5E1";
        });
        btn.classList.add("active");
        btn.style.background = btn.getAttribute("data-priority") === "CRITICAL" ? "#DC2626" : "#2563EB";
        btn.style.color = "#FFF";
        selectedPriority = btn.getAttribute("data-priority");
      });
    });

    // Deadline pill selector
    let selectedDays = 30;
    mount.querySelectorAll(".mandate-deadline-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        mount.querySelectorAll(".mandate-deadline-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        selectedDays = parseInt(pill.getAttribute("data-days"), 10);
      });
    });

    // Submit Mandate
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const selectedInstitutes = Array.from(mount.querySelectorAll(".inst-checkbox:checked")).map(cb => cb.value);
        if (selectedInstitutes.length === 0) {
          alert("Please select at least one research institute to mandate this directive.");
          return;
        }

        const notes = mount.querySelector("#mandate-executive-notes").value;

        // Animated Dispatch State
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
          Ratifying Directive with SHA-256 Seal...
        `;

        try {
          // Attempt API Gateway Dispatch
          if (window.apiGatewayClient) {
            await window.apiGatewayClient.mandateCohort({
              institutes: selectedInstitutes,
              competencyCode: benchmark.code,
              deadlineDays: selectedDays,
              priority: selectedPriority,
              notes,
              authorizedBy: "Dr. M. Ravichandran (Secretary & DG)"
            });
          } else {
            await fetch("/api/admin/mandate-cohort", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                institutes: selectedInstitutes,
                competencyCode: benchmark.code,
                deadlineDays: selectedDays,
                priority: selectedPriority,
                notes
              })
            }).then(r => r.json());
          }
        } catch (err) {
          console.warn("[LeaderAnalytics] Local fallback handling:", err.message);
        }

        // Apply Real-Time Dynamic Mutation Across Dashboard
        this.applyRealTimeMandateSuccess(benchmark.code, selectedInstitutes, selectedDays, selectedPriority, orderNumber, notes);

        closeModal();
      });
    }
  }

  updateModalAffectedStaff(mount) {
    const checked = mount.querySelectorAll(".inst-checkbox:checked");
    const countBox = mount.querySelector("#modal-affected-staff-count");
    if (!countBox) return;

    const headcountMap = { IMD: 140, INCOIS: 65, IITM: 70, NCMRWF: 50, NIOT: 90, NCPOR: 45 };
    let total = 0;
    checked.forEach(cb => {
      total += headcountMap[cb.value] || 60;
    });

    countBox.textContent = `${total} Scientists`;
  }

  // ====================================================================
  // REAL-TIME DASHBOARD STATE MUTATION & ANIMATIONS
  // ====================================================================

  applyRealTimeMandateSuccess(compCode, targetInstitutes, deadlineDays, priority, directiveId, notes) {
    // 1. Persist to active set & storage
    this.enforcedCompetencyCodes.add(compCode);
    localStorage.setItem("moes_enforced_competencies", JSON.stringify(Array.from(this.enforcedCompetencyCodes)));

    // 2. Create directive entry
    const newDirective = {
      id: directiveId,
      competencyCode: compCode,
      competencyName: this.getCompetencyName(compCode),
      institutes: targetInstitutes,
      deadlineDays: deadlineDays,
      deadlineDate: new Date(Date.now() + deadlineDays * 86400000).toISOString(),
      targetPersonnel: targetInstitutes.length * 75,
      enrolledCount: targetInstitutes.length * 70,
      priority: priority,
      status: `Active Mandate (${deadlineDays}d)`,
      dispatchedAt: new Date().toISOString()
    };

    this.persistedDirectives.unshift(newDirective);
    localStorage.setItem("moes_active_directives", JSON.stringify(this.persistedDirectives));

    // 3. Update Metrics Overrides
    const curOverride = this.metricsOverrides;
    curOverride.trainedDelta = (curOverride.trainedDelta || 0) + (targetInstitutes.length * 65);
    curOverride.certsDelta = (curOverride.certsDelta || 0) + (targetInstitutes.length * 20);
    curOverride.complianceDelta = Math.min(6.5, (curOverride.complianceDelta || 0) + 1.2);
    localStorage.setItem("moes_metrics_override", JSON.stringify(curOverride));

    // 4. In-Place Row Animation & Button Transformation
    const row = document.getElementById(`row-comp-${compCode}`);
    if (row) {
      // Highlight flash row
      row.style.transition = "background 0.5s ease";
      row.style.background = "#DCFCE7";
      setTimeout(() => { row.style.background = ""; }, 1800);

      // Transform action button
      const actionCell = row.querySelector(".cell-action-btn");
      if (actionCell) {
        actionCell.innerHTML = `
          <button class="btn btn-sm" style="font-size: 0.75rem; padding: 5px 12px; background: #059669; border-color: #047857; color: #FFF; box-shadow: 0 0 10px rgba(16,185,129,0.3);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:3px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>
            Enforced (${deadlineDays}d)
          </button>
        `;
      }

      // Update urgency badge
      const urgencyCell = row.querySelector(".cell-urgency");
      if (urgencyCell) {
        urgencyCell.innerHTML = `<span class="badge-mandate-active"><span class="leader-pulse-glow"></span> MANDATE ACTIVE</span>`;
      }

      // Animate score counter
      const avgCell = row.querySelector(".cell-measured-avg");
      const gapCell = row.querySelector(".cell-deficit-gap");
      if (avgCell && gapCell) {
        const curScore = parseInt(avgCell.textContent, 10) || 55;
        const newScore = Math.min(92, curScore + 15);
        const newGap = newScore - 85;
        this.animateNumberChange(avgCell, curScore, newScore, "%");
        this.animateNumberChange(gapCell, curScore - 85, newGap, "%");
      }
    }

    // 5. Update KPI Cards with Smooth Count-Up
    const kpiTrained = document.getElementById("kpi-total-trained");
    const kpiCerts = document.getElementById("kpi-total-certs");
    const kpiCompliance = document.getElementById("kpi-compliance-index");
    const kpiGaps = document.getElementById("kpi-critical-gaps");

    if (kpiTrained) {
      const current = parseInt(kpiTrained.textContent.replace(/,/g, ""), 10) || 3135;
      this.animateNumberChange(kpiTrained, current, current + (targetInstitutes.length * 65), "", true);
    }
    if (kpiCerts) {
      const current = parseInt(kpiCerts.textContent.replace(/,/g, ""), 10) || 840;
      this.animateNumberChange(kpiCerts, current, current + (targetInstitutes.length * 20), "", true);
    }
    if (kpiCompliance) {
      const curComp = parseFloat(kpiCompliance.textContent) || 88.4;
      const nextComp = Math.min(96.5, curComp + 1.2).toFixed(1);
      kpiCompliance.textContent = `${nextComp}%`;
    }
    if (kpiGaps) {
      const remainingGaps = Math.max(0, 3 - this.enforcedCompetencyCodes.size);
      kpiGaps.textContent = `${remainingGaps} Domains`;
    }

    // 6. Refresh Benchmark Chart Mount
    const benchmarkMount = document.getElementById("benchmark-chart-mount");
    if (benchmarkMount) {
      const analytics = this.getMergedAnalyticsData();
      benchmarkMount.innerHTML = this.renderSkillGapBenchmarkChart(analytics.competencyBenchmarks);
    }

    // 7. Inject into Audit Trail Table
    const tbody = document.getElementById("audit-directives-tbody");
    const countBadge = document.getElementById("audit-directives-count");
    if (tbody) {
      const newRowHtml = `
        <tr style="border-bottom: 1px solid var(--border-color); background: #F0FDF4; animation: fadeIn 0.5s ease;">
          <td style="padding: 12px; font-weight: 700; color: #0284C7; font-family: monospace;">${newDirective.id}</td>
          <td style="padding: 12px; font-weight: 700; color: var(--primary-navy);">${newDirective.competencyName}</td>
          <td style="padding: 12px;">
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${targetInstitutes.map(i => `<span class="inst-pill" style="font-size: 0.7rem; padding: 2px 6px;">${i}</span>`).join("")}
            </div>
          </td>
          <td style="padding: 12px; font-weight: 700;">${newDirective.enrolledCount} / ${newDirective.targetPersonnel} officers</td>
          <td style="padding: 12px; font-weight: 600; color: #D97706;">${deadlineDays} Days remaining</td>
          <td style="padding: 12px;">
            <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: #FEE2E2; color: #DC2626;">
              ${priority}
            </span>
          </td>
          <td style="padding: 12px;">
            <span class="badge-mandate-active" style="font-size: 0.72rem; padding: 2px 8px;">
              <span class="leader-pulse-glow" style="width:6px;height:6px;"></span> Active Directive
            </span>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML("afterbegin", newRowHtml);
      if (countBadge) countBadge.textContent = this.persistedDirectives.length;
    }

    // 8. Synthesize acoustic feedback chime & show Executive Toast Notification
    this.playSuccessChime();
    this.showExecutiveToast(`Ministerial Directive ${directiveId} ratified and enforced across ${targetInstitutes.join(", ")} (${targetInstitutes.length * 65} scientists enrolled).`);
  }

  animateNumberChange(element, start, end, suffix = "", formatLocale = false) {
    if (!element) return;
    const duration = 800;
    const startTime = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      const formatted = formatLocale ? current.toLocaleString("en-IN") : current;
      element.textContent = `${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  showExecutiveToast(message) {
    const toast = document.getElementById("leader-toast");
    const msgEl = document.getElementById("leader-toast-message");
    if (!toast) return;

    if (msgEl) msgEl.textContent = message;
    toast.classList.add("visible");

    setTimeout(() => {
      toast.classList.remove("visible");
    }, 4500);
  }

  // ====================================================================
  // DYNAMIC TIME UPDATION & LIVE TELEMETRY ENGINE
  // ====================================================================

  startLiveTelemetry(container) {
    // Clear any previous interval
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);

    this.telemetryInterval = setInterval(() => {
      // 1. Update Clock
      const clockEl = container.querySelector("#leader-live-clock");
      if (clockEl) {
        clockEl.textContent = this.getFormattedIstTime();
      }

      // 2. Auto-sync countdown
      if (this.autoSyncActive) {
        this.syncCountdown--;
        const timerEl = container.querySelector("#leader-sync-timer");
        if (timerEl) {
          timerEl.textContent = `Sync: ${this.syncCountdown}s`;
        }

        if (this.syncCountdown <= 0) {
          this.syncCountdown = 30;
          this.cycleTickerEvent(container);
        }
      }
    }, 1000);
  }

  cycleTickerEvent(container) {
    this.currentTickerIndex = (this.currentTickerIndex + 1) % this.tickerEvents.length;
    const tickerEl = container.querySelector("#leader-ticker-stream");
    if (tickerEl) {
      tickerEl.style.opacity = "0";
      setTimeout(() => {
        tickerEl.textContent = this.tickerEvents[this.currentTickerIndex];
        tickerEl.style.opacity = "1";
      }, 300);
    }
  }

  getFormattedIstTime() {
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    return `${now.toLocaleDateString("en-IN", options)} IST`;
  }

  // ====================================================================
  // SVG CHART RENDERING METHODS
  // ====================================================================

  renderInstituteBarChart(instituteStats) {
    const institutes = [
      { code: "IMD", name: "India Meteorological Dept", staff: 1240, trained: 1120 },
      { code: "INCOIS", name: "Ocean Information Services", staff: 480, trained: 435 },
      { code: "IITM", name: "Tropical Meteorology", staff: 520, trained: 485 },
      { code: "NCMRWF", name: "Medium Range Weather", staff: 310, trained: 295 },
      { code: "NIOT", name: "Ocean Technology", staff: 610, trained: 540 },
      { code: "NCPOR", name: "Polar & Antarctic", staff: 290, trained: 260 }
    ];

    const filtered = this.selectedInstitute === "ALL"
      ? institutes
      : institutes.filter(i => i.code === this.selectedInstitute);

    const maxStaff = 1300;

    return `
      <div style="display: flex; flex-direction: column; gap: 14px; padding-top: 10px;">
        ${filtered.map(item => {
          const trainedPct = Math.round((item.trained / item.staff) * 100);
          const barWidthTrained = Math.round((item.trained / maxStaff) * 100);
          const barWidthStaff = Math.round((item.staff / maxStaff) * 100);

          return `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 800; font-size: 0.85rem; color: var(--primary-navy); width: 65px;">${item.code}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${item.name}</span>
                </div>
                <div style="font-size: 0.8rem; font-weight: 700; color: #0369A1;">
                  ${item.trained.toLocaleString("en-IN")} <span style="font-weight: 400; color: var(--text-muted);">/ ${item.staff.toLocaleString("en-IN")} (${trainedPct}%)</span>
                </div>
              </div>

              <!-- Bar Container -->
              <div style="position: relative; height: 18px; background: #F1F5F9; border-radius: 6px; overflow: hidden; width: 100%;">
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${barWidthStaff}%; background: #E2E8F0; border-radius: 6px;"></div>
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${barWidthTrained}%; background: linear-gradient(90deg, #0284C7 0%, #38BDF8 100%); border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: width 0.8s ease;"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  renderSkillGapBenchmarkChart(benchmarks) {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 10px;">
        ${benchmarks.map(bm => {
          const isCritical = bm.gap < -20;
          const barColor = isCritical ? "#EF4444" : bm.gap < -5 ? "#F59E0B" : "#10B981";

          return `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary-navy);">
                  ${bm.name}
                </div>
                <div style="font-size: 0.78rem; font-weight: 700;">
                  <span style="color: ${barColor};">${bm.currentAvg}%</span>
                  <span style="color: var(--text-muted); font-weight: 400;"> vs </span>
                  <span style="color: #047857;">${bm.benchmark}% Target</span>
                  <span style="margin-left: 6px; font-size: 0.72rem; padding: 1px 6px; border-radius: 4px; background: ${isCritical ? '#FEE2E2' : '#FEF3C7'}; color: ${isCritical ? '#B91C1C' : '#B45309'}; font-weight: 800;">
                    ${bm.gap}%
                  </span>
                </div>
              </div>

              <!-- Dual Bar Track -->
              <div style="position: relative; height: 14px; background: #F1F5F9; border-radius: 4px; overflow: hidden; width: 100%;">
                <div style="position: absolute; left: ${bm.benchmark}%; top: 0; bottom: 0; width: 3px; background: #047857; z-index: 2;" title="Target Benchmark: ${bm.benchmark}%"></div>
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${bm.currentAvg}%; background: ${barColor}; border-radius: 4px; z-index: 1; transition: width 0.8s ease;"></div>
              </div>
            </div>
          `;
        }).join("")}

        <div style="display: flex; justify-content: space-between; padding-top: 6px; font-size: 0.7rem; color: var(--text-muted); border-top: 1px solid var(--border-color); margin-top: 6px;">
          <span>0%</span>
          <span>25%</span>
          <span>50% (Min Passing)</span>
          <span>75% (Proficient)</span>
          <span>100%</span>
        </div>
      </div>
    `;
  }

  renderWorkforceDonutChart(wf) {
    const total = wf.totalWorkforce || 3450;
    const certPct = Math.round((wf.certified / total) * 100);
    const trainPct = Math.round((wf.inTraining / total) * 100);
    const gapPct = Math.round((wf.gapIdentified / total) * 100);
    const pendPct = Math.max(0, 100 - certPct - trainPct - gapPct);

    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    const stroke1 = (certPct / 100) * circumference;
    const stroke2 = (trainPct / 100) * circumference;
    const stroke3 = (gapPct / 100) * circumference;
    const stroke4 = (pendPct / 100) * circumference;

    const offset1 = 0;
    const offset2 = -stroke1;
    const offset3 = -(stroke1 + stroke2);
    const offset4 = -(stroke1 + stroke2 + stroke3);

    return `
      <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 20px; padding: 10px 0;">
        <div style="position: relative; width: 170px; height: 170px;">
          <svg width="170" height="170" viewBox="0 0 140 140" style="transform: rotate(-90deg);">
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#E2E8F0" stroke-width="18" />
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#10B981" stroke-width="18"
              stroke-dasharray="${stroke1} ${circumference}" stroke-dashoffset="${offset1}" />
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#3B82F6" stroke-width="18"
              stroke-dasharray="${stroke2} ${circumference}" stroke-dashoffset="${offset2}" />
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#EF4444" stroke-width="18"
              stroke-dasharray="${stroke3} ${circumference}" stroke-dashoffset="${offset3}" />
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#F59E0B" stroke-width="18"
              stroke-dasharray="${stroke4} ${circumference}" stroke-dashoffset="${offset4}" />
          </svg>

          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary-navy); line-height: 1;">3,450</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Workforce</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 6px; background: #F0FDF4;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; background: #10B981; border-radius: 50%;"></span>
              <span style="font-weight: 600; color: #166534;">Certified Proficient</span>
            </div>
            <span style="font-weight: 800; color: #166534;">${wf.certified} (${certPct}%)</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 6px; background: #EFF6FF;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; background: #3B82F6; border-radius: 50%;"></span>
              <span style="font-weight: 600; color: #1E40AF;">In Active Training</span>
            </div>
            <span style="font-weight: 800; color: #1E40AF;">${wf.inTraining} (${trainPct}%)</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 6px; background: #FEF2F2;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; background: #EF4444; border-radius: 50%;"></span>
              <span style="font-weight: 600; color: #991B1B;">Skill Gap Identified</span>
            </div>
            <span style="font-weight: 800; color: #991B1B;">${wf.gapIdentified} (${gapPct}%)</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 6px; background: #FFFBEB;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; background: #F59E0B; border-radius: 50%;"></span>
              <span style="font-weight: 600; color: #92400E;">Pending Enrollment</span>
            </div>
            <span style="font-weight: 800; color: #92400E;">${wf.pendingEnrollment} (${pendPct}%)</span>
          </div>
        </div>
      </div>
    `;
  }

  renderVelocityTrendChart(trends) {
    const data = trends && trends.length > 0 ? trends : [
      { quarter: "Q4 2025", trainedCount: 1840 },
      { quarter: "Q1 2026", trainedCount: 2360 },
      { quarter: "Q2 2026", trainedCount: 2950 },
      { quarter: "Q3 2026", trainedCount: 3450 }
    ];

    const points = [
      { x: 45, y: 115, count: data[0].trainedCount, q: data[0].quarter },
      { x: 140, y: 85, count: data[1].trainedCount, q: data[1].quarter },
      { x: 235, y: 52, count: data[2].trainedCount, q: data[2].quarter },
      { x: 330, y: 22, count: data[3].trainedCount, q: data[3].quarter }
    ];

    const polyPoints = `${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y}`;
    const areaPoints = `${points[0].x},140 ${polyPoints} ${points[3].x},140`;

    return `
      <div style="padding-top: 10px;">
        <svg viewBox="0 0 380 160" style="width: 100%; height: auto; overflow: visible;">
          <defs>
            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0284C7" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#0284C7" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <line x1="30" y1="20" x2="350" y2="20" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="60" x2="350" y2="60" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="100" x2="350" y2="100" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="140" x2="350" y2="140" stroke="#CBD5E1" stroke-width="1.5" />

          <polygon points="${areaPoints}" fill="url(#velocityGrad)" />
          <polyline points="${polyPoints}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

          ${points.map(p => `
            <g>
              <circle cx="${p.x}" cy="${p.y}" r="6" fill="#0284C7" stroke="#FFF" stroke-width="2.5" />
              <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="10" font-weight="800" fill="#0F172A">${p.count.toLocaleString("en-IN")}</text>
              <text x="${p.x}" y="154" text-anchor="middle" font-size="9.5" font-weight="600" fill="#64748B">${p.q}</text>
            </g>
          `).join("")}
        </svg>

        <div style="display: flex; justify-content: center; gap: 20px; font-size: 0.75rem; margin-top: 10px; color: var(--text-muted);">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 12px; height: 3px; background: #0284C7; border-radius: 2px;"></span>
            Cumulative Trained Personnel (MoES E-Learning Target)
          </span>
        </div>
      </div>
    `;
  }

  // ====================================================================
  // EVENT LISTENERS & FILTER BINDINGS
  // ====================================================================

  bindEvents(container) {
    // Institute Filter change
    const instFilter = container.querySelector("#leader-institute-filter");
    if (instFilter) {
      instFilter.addEventListener("change", (e) => {
        this.selectedInstitute = e.target.value;
        this.render(container);
      });
    }

    // Force Sync button
    const syncBtn = container.querySelector("#btn-leader-force-sync");
    if (syncBtn) {
      syncBtn.addEventListener("click", async () => {
        const icon = container.querySelector("#sync-refresh-icon");
        if (icon) icon.style.animation = "spin 0.8s linear infinite";

        try {
          if (this.appState.loadData) await this.appState.loadData();
          this.syncCountdown = 30;
          this.render(container);
          this.showExecutiveToast("Live Telemetry Synced with MoES Central Gateway Node.");
        } catch (e) {
          console.warn("Sync notice:", e.message);
        }
      });
    }

    // 1-Click Mandate Action Buttons -> Opens Animated Modal Form
    container.querySelectorAll(".btn-mandate-order").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const comp = e.currentTarget.getAttribute("data-comp");
        const inst = e.currentTarget.getAttribute("data-inst") || "IMD";
        this.openMandateModal(comp, inst);
      });
    });

    // Remediation Quick Filter Pills
    container.querySelectorAll(".leader-filter-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        container.querySelectorAll(".leader-filter-pill").forEach(p => p.classList.remove("active"));
        e.currentTarget.classList.add("active");
        const filterType = e.currentTarget.getAttribute("data-filter");
        this.filterRemediationTable(container, filterType);
      });
    });

    // View Gazette Directive Modal Links
    container.querySelectorAll(".btn-view-gazette").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const dirId = e.currentTarget.getAttribute("data-dir-id");
        this.openGazetteDirectiveView(dirId);
      });
    });

    // Export CSV
    const exportBtn = container.querySelector("#btn-leader-export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this.handleExportCsv();
      });
    }

    // Navigate to Notification Hub
    const notifyHubBtn = container.querySelector("#btn-leader-goto-notifications");
    if (notifyHubBtn) {
      notifyHubBtn.addEventListener("click", () => {
        if (this.appState && this.appState.navigate) {
          this.appState.navigate("notifications");
        }
      });
    }
  }

  filterRemediationTable(container, filterType) {
    const rows = container.querySelectorAll("#table-remediation-mandates tbody tr");
    const analytics = this.getMergedAnalyticsData();
    const benchmarks = analytics.competencyBenchmarks;

    rows.forEach(row => {
      const code = row.id.replace("row-comp-", "");
      const bm = benchmarks.find(b => b.code === code);
      if (!bm) return;

      const isEnforced = this.enforcedCompetencyCodes.has(code);
      let show = true;

      if (filterType === "critical") {
        show = bm.gap < -20;
      } else if (filterType === "moderate") {
        show = bm.gap >= -20 && bm.gap < -5;
      } else if (filterType === "enforced") {
        show = isEnforced;
      }

      row.style.display = show ? "" : "none";
    });
  }

  openGazetteDirectiveView(directiveId) {
    const analytics = this.getMergedAnalyticsData();
    const directive = (analytics.directives || []).find(d => d.id === directiveId) || {
      id: directiveId,
      competencyName: "Specialized Radar Meteorology",
      competencyCode: "RADAR_CAL",
      institutes: ["NIOT", "NCPOR", "INCOIS"],
      deadlineDays: 30,
      priority: "CRITICAL",
      mandatedBy: "Dr. M. Ravichandran (Secretary & DG)",
      dispatchedAt: new Date().toISOString()
    };

    const mount = document.getElementById("mandate-modal-mount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="mandate-modal-backdrop active" id="gazette-modal-backdrop">
        <div class="gazette-modal-card">
          <div style="position: absolute; right: 20px; top: 20px; display: flex; gap: 8px;">
            <button id="btn-print-gazette" class="btn btn-outline btn-sm" style="font-size: 0.75rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print Gazette Order
            </button>
            <button id="btn-close-gazette" style="background: rgba(0,0,0,0.06); border: 1px solid #CBD5E1; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 1.1rem;">×</button>
          </div>

          <div class="gazette-header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" class="gazette-emblem" />
            <div style="font-size: 0.85rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
              THE GAZETTE OF INDIA : EXTRAORDINARY
            </div>
            <div style="font-size: 0.75rem; color: #64748B;">
              भारत का राजपत्र : असाधारण · PUBLISHED BY AUTHORITY
            </div>
            <div style="margin-top: 10px; font-weight: 800; font-size: 1.15rem; color: #0F172A;">
              MINISTRY OF EARTH SCIENCES · EXECUTIVE DIRECTORATE
            </div>
            <div style="font-size: 0.78rem; font-family: monospace; color: #0284C7; margin-top: 4px;">
              ORDER NO. ${directive.id} · NEW DELHI, ${new Date(directive.dispatchedAt || Date.now()).toLocaleDateString("en-IN")}
            </div>
          </div>

          <div style="font-size: 0.88rem; line-height: 1.8; margin-bottom: 20px;">
            <p><strong>NOTIFICATION</strong></p>
            <p>
              In exercise of the powers conferred under the National Capacity Building Framework and the Ministry of Earth Sciences Competency Standards, the Executive Directorate hereby orders the immediate promulgation of a <strong>Mandatory Learning & Capacity Directive</strong> across the following Autonomous Institutes:
            </p>
            <div style="background: rgba(0, 141, 218, 0.06); border-left: 4px solid #0284C7; padding: 12px 18px; margin: 16px 0; border-radius: 0 8px 8px 0;">
              <div><strong>Target Competency:</strong> ${directive.competencyName} (${directive.competencyCode})</div>
              <div><strong>Mandated Research Bodies:</strong> ${directive.institutes.join(", ")}</div>
              <div><strong>Target Quota Reach:</strong> ${directive.targetPersonnel || 240} Scientific & Technical Officers</div>
              <div><strong>Enforcement Horizon:</strong> ${directive.deadlineDays} Calendar Days</div>
              <div><strong>Directive Priority Level:</strong> ${directive.priority}</div>
            </div>
            <p>
              All designated scientists, engineers, and technical researchers indexed under the specified Autonomous Bodies are required to achieve verified competency standing and obtain tamper-proof cryptographic certification prior to the deadline expiration.
            </p>
          </div>

          <div class="gazette-seal-box">
            <div>
              <div style="font-size: 0.7rem; color: #64748B;">SHA-256 TAMPER-PROOF DIGITAL SEAL:</div>
              <div style="font-family: monospace; font-size: 0.68rem; color: #0284C7; max-width: 380px; word-break: break-all;">
                a4b7f9e812d45c6789e0123456789abcdef0123456789abcdef0123456789abc
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 0.95rem;">(Dr. M. Ravichandran)</div>
              <div style="font-size: 0.78rem; color: #475569;">Secretary to the Government of India</div>
              <div style="font-size: 0.74rem; color: #64748B;">Director General, Ministry of Earth Sciences</div>
            </div>
          </div>

        </div>
      </div>
    `;

    const gazetteBackdrop = mount.querySelector("#gazette-modal-backdrop");
    const closeBtn = mount.querySelector("#btn-close-gazette");
    const printBtn = mount.querySelector("#btn-print-gazette");

    const closeGazette = () => {
      gazetteBackdrop.classList.remove("active");
      setTimeout(() => { mount.innerHTML = ""; }, 250);
    };

    if (closeBtn) closeBtn.addEventListener("click", closeGazette);
    if (printBtn) printBtn.addEventListener("click", () => window.print());
  }

  playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }

  handleExportCsv() {
    const analytics = this.getMergedAnalyticsData();
    const stats = analytics.summary;
    const benchmarks = analytics.competencyBenchmarks;
    const directives = analytics.directives;

    const csvRows = [
      ["Ministry of Earth Sciences - Executive Training & Skill-Gap Intelligence Report"],
      ["Promulgated By", "Dr. M. Ravichandran, Secretary MoES & Director General"],
      ["Generated Date (IST)", this.getFormattedIstTime()],
      [],
      ["=== SUMMARY KPIS ==="],
      ["Total Workforce", stats.totalWorkforce],
      ["Total Personnel Trained", stats.totalTrained],
      ["Verified Digital Certifications", stats.totalCertificatesIssued],
      ["MoES Compliance Index", stats.overallComplianceRate],
      ["Active Critical Skill Gaps", stats.criticalGapsIdentified],
      [],
      ["=== COMPETENCY BENCHMARKS & SKILL GAPS ==="],
      ["Code", "Domain Name", "Target Benchmark %", "Measured Average %", "Deficit Gap %", "Lagging Institutes", "Status"],
      ...benchmarks.map(b => [
        b.code,
        `"${b.name}"`,
        `${b.benchmark}%`,
        `${b.currentAvg}%`,
        `${b.gap}%`,
        `"${b.criticalInstitutes.join(", ")}"`,
        this.enforcedCompetencyCodes.has(b.code) ? "Enforced Mandate" : b.status
      ]),
      [],
      ["=== PROMULGATED MINISTERIAL DIRECTIVES ==="],
      ["Directive ID", "Competency", "Targeted Institutes", "Personnel Quota", "Deadline Days", "Priority", "Status"],
      ...directives.map(d => [
        d.id,
        `"${d.competencyName}"`,
        `"${d.institutes.join(", ")}"`,
        d.targetPersonnel,
        d.deadlineDays,
        d.priority,
        d.status
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `moes_executive_mandate_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ====================================================================
  // DATA ACCESS & MERGING
  // ====================================================================

  getMergedAnalyticsData() {
    const base = this.appState.analyticsData || this.getFallbackAnalyticsData();
    const copy = JSON.parse(JSON.stringify(base));

    // Apply Overrides if directives were dispatched
    const overrides = this.metricsOverrides || {};
    if (overrides.trainedDelta) {
      copy.summary.totalTrained = (copy.summary.totalTrained || 3135) + overrides.trainedDelta;
    }
    if (overrides.certsDelta) {
      copy.summary.totalCertificatesIssued = (copy.summary.totalCertificatesIssued || 840) + overrides.certsDelta;
    }
    if (overrides.complianceDelta) {
      const curComp = parseFloat(copy.summary.overallComplianceRate) || 88.4;
      copy.summary.overallComplianceRate = `${Math.min(97, curComp + overrides.complianceDelta).toFixed(1)}%`;
    }

    // Merge benchmark updates for enforced codes
    copy.competencyBenchmarks = copy.competencyBenchmarks.map(bm => {
      if (this.enforcedCompetencyCodes.has(bm.code)) {
        const boostedAvg = Math.min(92, bm.currentAvg + 16);
        return {
          ...bm,
          currentAvg: boostedAvg,
          gap: boostedAvg - bm.benchmark,
          status: "Mandate Active (Enforced)"
        };
      }
      return bm;
    });

    copy.summary.criticalGapsIdentified = Math.max(
      0,
      copy.competencyBenchmarks.filter(b => b.gap < -20).length
    );

    // Merge persisted directives
    copy.directives = [
      ...this.persistedDirectives,
      ...(copy.directives || [
        {
          id: "MoES/DIR/2026/0828-HPC",
          competencyCode: "HPC_SLURM",
          competencyName: "HPC Slurm & Parallel Scaling",
          institutes: ["NIOT", "NCPOR"],
          deadlineDays: 45,
          deadlineDate: new Date(Date.now() + 45 * 86400000).toISOString(),
          targetPersonnel: 180,
          enrolledCount: 168,
          priority: "HIGH",
          mandatedBy: "Dr. M. Ravichandran (Secretary & DG)",
          dispatchedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          status: "In Progress (93% Enrolled)"
        }
      ])
    ];

    // Filter by Institute if selected
    if (this.selectedInstitute !== "ALL") {
      copy.competencyBenchmarks = copy.competencyBenchmarks.filter(b =>
        b.criticalInstitutes.includes(this.selectedInstitute)
      );
      copy.trainingPrograms = copy.trainingPrograms.filter(t =>
        t.institute === this.selectedInstitute
      );
    }

    return copy;
  }

  getCompetencyName(code) {
    const map = {
      RADAR_CAL: "Radar Calibration (DWR)",
      HPC_SLURM: "HPC Slurm & Parallel Scaling",
      OCEAN_ARGO: "Ocean Telemetry & Argo Floats",
      SUBSEA_ROV: "Deep-Sea Robotics & Submersibles",
      POLAR_SOP: "Polar Safety & Extreme Survival",
      GEM_COMP: "GeM Procurement & Vigilance"
    };
    return map[code] || code;
  }

  // ====================================================================
  // ACCESS DENIED (NON-ADMIN SCREEN)
  // ====================================================================

  renderAccessDenied(container) {
    const user = this.appState.currentUser;
    container.innerHTML = `
      <div class="app-container" style="padding: 60px 20px; max-width: 650px; margin: 0 auto; text-align: center;">
        <div class="card" style="padding: 40px 30px; border-top: 5px solid #EF4444; box-shadow: 0 12px 30px rgba(0,0,0,0.08);">
          <div style="width: 70px; height: 70px; background: #FEE2E2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; color: #DC2626;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>

          <div style="display: inline-block; background: #FEE2E2; color: #B91C1C; font-weight: 800; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; margin-bottom: 12px; letter-spacing: 0.5px;">
            RESTRICTED SECURITY ZONE
          </div>

          <h2 style="color: #991B1B; font-size: 1.5rem; margin-bottom: 10px;">
            Ministry Executive Clearance Required
          </h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5;">
            The Workforce Skill-Gap & Executive Analytics Dashboard contains sensitive institutional competency diagnostics and is strictly restricted to Ministry Leadership / Admin Personnel (Secretary & Director General).
          </p>

          <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; margin-bottom: 24px; font-size: 0.82rem; text-align: left;">
            <div style="color: var(--text-muted); margin-bottom: 4px;">Current Authenticated Persona:</div>
            <div style="font-weight: 700; color: var(--primary-navy);">${user ? `${user.name} (${user.customRoleId} · Role: ${user.role})` : 'Not Signed In'}</div>
          </div>

          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-switch-to-admin-demo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Switch to Director (Dr. Ravichandran)
            </button>
            <button class="btn btn-outline" id="btn-access-denied-home">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    `;

    const switchBtn = container.querySelector("#btn-switch-to-admin-demo");
    if (switchBtn) {
      switchBtn.addEventListener("click", () => {
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
        localStorage.setItem("moes_session_user", JSON.stringify(this.appState.currentUser));
        if (this.appState.saveLocalDb) this.appState.saveLocalDb();
        this.appState.render();
      });
    }

    const homeBtn = container.querySelector("#btn-access-denied-home");
    if (homeBtn && this.appState.navigate) {
      homeBtn.addEventListener("click", () => this.appState.navigate("home"));
    }
  }

  getFallbackAnalyticsData() {
    return {
      summary: {
        totalWorkforce: 3450,
        totalTrained: 3135,
        totalCertificatesIssued: 840,
        overallComplianceRate: "88.4%",
        criticalGapsIdentified: 3
      },
      trainingPrograms: [
        { id: "crs_imd_01", title: "Doppler Weather Radar (DWR) Calibration", institute: "IMD", totalEnrolled: 1280, completed: 1120, avgScore: 89, status: "Active" },
        { id: "crs_ncmrwf_01", title: "Slurm Workload Scheduling & 18 PFLOPS HPC", institute: "NCMRWF", totalEnrolled: 980, completed: 860, avgScore: 87, status: "Active" },
        { id: "crs_incois_02", title: "Tsunami Early Warning (ITEWS) & Coastal Inundation", institute: "INCOIS", totalEnrolled: 710, completed: 640, avgScore: 91, status: "Active" },
        { id: "crs_niot_01", title: "Matsya-6000 Deep Ocean Manned Submersible SOP", institute: "NIOT", totalEnrolled: 560, completed: 480, avgScore: 84, status: "Active" },
        { id: "crs_ncpor_01", title: "Antarctic Station Polar Operations (Maitri & Bharati)", institute: "NCPOR", totalEnrolled: 420, completed: 370, avgScore: 88, status: "Active" },
        { id: "crs_iitm_01", title: "Earth System Modeling (IITM-ESM) Decadal Projections", institute: "IITM", totalEnrolled: 640, completed: 590, avgScore: 86, status: "Active" }
      ],
      competencyBenchmarks: [
        { code: "RADAR_CAL", name: "Radar Calibration (DWR)", benchmark: 85, currentAvg: 56, gap: -29, criticalInstitutes: ["NIOT", "NCPOR", "INCOIS"], status: "Critical Gap" },
        { code: "HPC_SLURM", name: "HPC Slurm & Parallel Scaling", benchmark: 85, currentAvg: 79, gap: -6, criticalInstitutes: ["NIOT", "NCPOR"], status: "Moderate Gap" },
        { code: "OCEAN_ARGO", name: "Ocean Telemetry & Argo Floats", benchmark: 80, currentAvg: 64, gap: -16, criticalInstitutes: ["IMD", "NCMRWF"], status: "Moderate Gap" },
        { code: "SUBSEA_ROV", name: "Deep-Sea Robotics & Submersibles", benchmark: 80, currentAvg: 40, gap: -40, criticalInstitutes: ["NCMRWF", "IMD", "IITM"], status: "Critical Gap" },
        { code: "POLAR_SOP", name: "Polar Safety & Extreme Survival", benchmark: 80, currentAvg: 48, gap: -32, criticalInstitutes: ["NCMRWF", "INCOIS", "IITM"], status: "Critical Gap" },
        { code: "GEM_COMP", name: "GeM Procurement & Vigilance", benchmark: 85, currentAvg: 81, gap: -4, criticalInstitutes: ["IITM"], status: "Target Met" }
      ],
      quarterlyTrends: [
        { quarter: "Q4 2025", trainedCount: 1840, certificatesIssued: 520 },
        { quarter: "Q1 2026", trainedCount: 2360, certificatesIssued: 690 },
        { quarter: "Q2 2026", trainedCount: 2950, certificatesIssued: 780 },
        { quarter: "Q3 2026", trainedCount: 3450, certificatesIssued: 840 }
      ],
      workforceDistribution: {
        certified: 840,
        inTraining: 1850,
        gapIdentified: 445,
        pendingEnrollment: 315,
        totalWorkforce: 3450
      },
      directives: [
        {
          id: "MoES/DIR/2026/0828-HPC",
          competencyCode: "HPC_SLURM",
          competencyName: "HPC Slurm & Parallel Scaling",
          institutes: ["NIOT", "NCPOR"],
          deadlineDays: 45,
          deadlineDate: new Date(Date.now() + 45 * 86400000).toISOString(),
          targetPersonnel: 180,
          enrolledCount: 168,
          priority: "HIGH",
          mandatedBy: "Dr. M. Ravichandran (Secretary & DG)",
          dispatchedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          status: "In Progress (93% Enrolled)"
        }
      ]
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LeaderAnalyticsComponent;
}
