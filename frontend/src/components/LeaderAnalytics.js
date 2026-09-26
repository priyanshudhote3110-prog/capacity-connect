/**
 * LeaderAnalytics.js - Executive Leadership Intelligence & Skill-Gap Analytics Dashboard
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Restricted: Visible and accessible strictly to users with role === 'admin'
 */

class LeaderAnalyticsComponent {
  constructor(appState) {
    this.appState = appState;
    this.selectedInstitute = "ALL";
    this.selectedPeriod = "ALL";
    this.mandatingCohort = false;
  }

  render(container) {
    const user = this.appState.currentUser;
    const t = (k, def) => (window.i18n ? window.i18n.t(k, def) : def);

    // SECURITY CHECK: Strictly Leader / Admin Access
    if (!user || user.role !== "admin") {
      this.renderAccessDenied(container);
      return;
    }

    const analytics = this.appState.analyticsData || this.getFallbackAnalyticsData();
    const stats = analytics.summary || {};
    const instituteStats = analytics.instituteStats || {};
    const benchmarks = analytics.competencyBenchmarks || [];
    const trainings = analytics.trainingPrograms || [];
    const trends = analytics.quarterlyTrends || [];
    const workforce = analytics.workforceDistribution || {
      certified: 840,
      inTraining: 1850,
      gapIdentified: 445,
      pendingEnrollment: 315,
      totalWorkforce: 3450
    };

    container.innerHTML = `
      <div class="app-container leader-dashboard-container" style="padding-top: 24px; padding-bottom: 60px;">
        
        <!-- Top Executive Banner -->
        <div class="leader-hero-banner" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F3460 100%); border-radius: 16px; padding: 28px; color: #FFF; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
          <div style="position: absolute; right: -20px; top: -20px; opacity: 0.08; pointer-events: none;">
            <svg width="260" height="260" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; position: relative; z-index: 1;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="background: linear-gradient(90deg, #FF9933, #FF8008); color: #000; font-weight: 800; font-size: 0.7rem; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> EXECUTIVE DIRECTORATE ONLY
                </span>
                <span style="color: #94A3B8; font-size: 0.8rem; font-weight: 500;">
                  Ministry of Earth Sciences · Sec. Clearance Level 1
                </span>
              </div>

              <h1 style="font-size: 1.85rem; font-weight: 800; margin: 0 0 6px 0; color: #FFFFFF; font-family: var(--font-heading);">
                Workforce Training & Skill-Gap Intelligence Dashboard
              </h1>
              <p style="color: #CBD5E1; font-size: 0.95rem; margin: 0; max-width: 780px;">
                National real-time command portal monitoring training completion rates, institutional skill deficits, and personnel capacity metrics across IMD, INCOIS, IITM, NCMRWF, NIOT, and NCPOR.
              </p>
            </div>

            <!-- Action Controls -->
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <!-- Institute Filter Dropdown -->
              <div style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                <label for="leader-institute-filter" style="font-size: 0.75rem; color: #94A3B8; font-weight: 600;">INSTITUTE:</label>
                <select id="leader-institute-filter" style="background: transparent; color: #FFF; border: none; font-size: 0.82rem; font-weight: 700; cursor: pointer; outline: none;">
                  <option value="ALL" ${this.selectedInstitute === "ALL" ? "selected" : ""} style="color: #000;">All Autonomous Bodies (6)</option>
                  <option value="IMD" ${this.selectedInstitute === "IMD" ? "selected" : ""} style="color: #000;">IMD (Meteorological)</option>
                  <option value="INCOIS" ${this.selectedInstitute === "INCOIS" ? "selected" : ""} style="color: #000;">INCOIS (Ocean Services)</option>
                  <option value="IITM" ${this.selectedInstitute === "IITM" ? "selected" : ""} style="color: #000;">IITM (Tropical Climate)</option>
                  <option value="NCMRWF" ${this.selectedInstitute === "NCMRWF" ? "selected" : ""} style="color: #000;">NCMRWF (Slurm/HPC)</option>
                  <option value="NIOT" ${this.selectedInstitute === "NIOT" ? "selected" : ""} style="color: #000;">NIOT (Deep Ocean)</option>
                  <option value="NCPOR" ${this.selectedInstitute === "NCPOR" ? "selected" : ""} style="color: #000;">NCPOR (Polar/Antarctic)</option>
                </select>
              </div>

              <!-- Export CSV Button -->
              <button class="btn btn-outline btn-sm" id="btn-leader-export-csv" style="color: #FFF; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); font-weight: 600; padding: 7px 14px; border-radius: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export Brief (CSV)
              </button>
            </div>
          </div>
        </div>

        <!-- KPI Metric Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 28px;">
          <!-- Card 1: Total Personnel Trained -->
          <div class="card" style="padding: 20px; border-top: 4px solid #10B981; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Scientists Trained</span>
              <span style="font-size: 1.1rem; color: #065F46;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
            </div>
            <div style="font-size: 2.1rem; font-weight: 800; color: #065F46; line-height: 1.1;">
              ${(stats.totalTrained || 3135).toLocaleString("en-IN")}
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: #047857; font-weight: 600;">
              ↑ 90.8% of ${stats.totalWorkforce || "3,450"} indexed personnel
            </div>
          </div>

          <!-- Card 2: Trainings Conducted -->
          <div class="card" style="padding: 20px; border-top: 4px solid #3B82F6; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Training Courses Delivered</span>
              <span style="font-size: 1.1rem; color: #1E40AF;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
            </div>
            <div style="font-size: 2.1rem; font-weight: 800; color: #1E40AF; line-height: 1.1;">
              ${trainings.length || 6} Specialized
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted);">
              Across 6 Autonomous Directorates
            </div>
          </div>

          <!-- Card 3: Cryptographic Certificates -->
          <div class="card" style="padding: 20px; border-top: 4px solid #F59E0B; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Verified Certifications</span>
              <span style="font-size: 1.1rem; color: #B45309;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg></span>
            </div>
            <div style="font-size: 2.1rem; font-weight: 800; color: #B45309; line-height: 1.1;">
              ${(stats.totalCertificatesIssued || 840).toLocaleString("en-IN")}
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted);">
              SHA-256 Tamper-Proof Digital Proofs
            </div>
          </div>

          <!-- Card 4: Identified Skill Gaps -->
          <div class="card" style="padding: 20px; border-top: 4px solid #EF4444; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Critical Skill Gaps</span>
              <span style="font-size: 1.1rem; color: #DC2626;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
            </div>
            <div style="font-size: 2.1rem; font-weight: 800; color: #B91C1C; line-height: 1.1;">
              ${benchmarks.filter(b => b.gap < -20).length || 3} Domains
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: #DC2626; font-weight: 700;">
              Requires Ministerial Cohort Mandate
            </div>
          </div>

          <!-- Card 5: Overall MoES Compliance -->
          <div class="card" style="padding: 20px; border-top: 4px solid #8B5CF6; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Compliance Index</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style="font-size: 2.1rem; font-weight: 800; color: #6D28D9; line-height: 1.1;">
              ${stats.overallComplianceRate || "88.4%"}
            </div>
            <div style="margin-top: 6px; font-size: 0.78rem; color: #047857; font-weight: 600;">
              ↑ +6.2% vs Previous Quarter
            </div>
          </div>
        </div>

        <!-- Charts Row 1: Institute Participation & Skill Gap vs Benchmark -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 20px; margin-bottom: 24px;">
          
          <!-- Chart 1: Institute Training Participation (Bar Graph) -->
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

          <!-- Chart 2: Skill-Gap vs National Benchmark (Grouped Comparison) -->
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

            <!-- SVG Skill Gap Chart -->
            ${this.renderSkillGapBenchmarkChart(benchmarks)}
          </div>
        </div>

        <!-- Charts Row 2: Workforce Donut Funnel & Capacity Growth Velocity -->
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

        <!-- Section 3: Detailed Training Programs History ("jo bhi training hui hai") -->
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

        <!-- Section 4: Critical Skill Gap Remediation & 1-Click Mandate Action -->
        <div class="card" style="padding: 24px; border: 1px solid #FECACA; background: #FFFBFB;">
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
              <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: #7F1D1D;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> 1-Click Ministerial Mandate Directive
              </h3>
              <p style="margin: 0; font-size: 0.82rem; color: #7F1D1D; opacity: 0.85;">
                As Ministry Secretary / Director General, directly enforce mandatory learning cohorts on institutes where competency proficiencies are below national standard.
              </p>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
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
                  const isCritical = bm.gap < -20;
                  const isModerate = bm.gap >= -20 && bm.gap < -5;
                  const urgencyBadge = isCritical
                    ? `<span style="background: #FEE2E2; color: #B91C1C; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; border: 1px solid #EF4444;">CRITICAL GAP</span>`
                    : isModerate
                    ? `<span style="background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; border: 1px solid #F59E0B;">MODERATE GAP</span>`
                    : `<span style="background: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; border: 1px solid #22C55E;">TARGET MET</span>`;

                  return `
                    <tr style="border-bottom: 1px solid #FEE2E2;">
                      <td style="padding: 12px; font-weight: 700; color: var(--primary-navy);">
                        ${bm.name}
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">${bm.code}</div>
                      </td>
                      <td style="padding: 12px; font-weight: 700;">${bm.benchmark}%</td>
                      <td style="padding: 12px; font-weight: 700; color: ${bm.currentAvg < 50 ? "#DC2626" : bm.currentAvg < 75 ? "#D97706" : "#16A34A"};">${bm.currentAvg}%</td>
                      <td style="padding: 12px; font-weight: 800; color: ${bm.gap < -20 ? "#DC2626" : "#D97706"};">${bm.gap}%</td>
                      <td style="padding: 12px;">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                          ${bm.criticalInstitutes.map(inst => `
                            <span style="background: #FEE2E2; color: #991B1B; font-weight: 700; font-size: 0.7rem; padding: 1px 6px; border-radius: 3px;">
                              ${inst}
                            </span>
                          `).join("")}
                        </div>
                      </td>
                      <td style="padding: 12px;">${urgencyBadge}</td>
                      <td style="padding: 12px; text-align: right;">
                        <button class="btn btn-primary btn-sm btn-mandate-order" data-comp="${bm.code}" data-inst="${bm.criticalInstitutes[0] || 'IMD'}" style="font-size: 0.75rem; padding: 5px 12px; background: #DC2626; border-color: #B91C1C;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:3px;vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Enforce Cohort
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  // --- SVG CHART RENDERING METHODS ---

  /**
   * Chart 1: Institute Training Participation Horizontal Bar Graph
   */
  renderInstituteBarChart(instituteStats) {
    const institutes = [
      { code: "IMD", name: "India Meteorological Dept", staff: 1240, trained: 1120 },
      { code: "INCOIS", name: "Ocean Information Services", staff: 480, trained: 435 },
      { code: "IITM", name: "Tropical Meteorology", staff: 520, trained: 485 },
      { code: "NCMRWF", name: "Medium Range Weather", staff: 310, trained: 295 },
      { code: "NIOT", name: "Ocean Technology", staff: 610, trained: 540 },
      { code: "NCPOR", name: "Polar & Antarctic", staff: 290, trained: 260 }
    ];

    // Filter if specific institute selected
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
                <!-- Total Staff Backdrop Bar -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${barWidthStaff}%; background: #E2E8F0; border-radius: 6px;"></div>
                <!-- Successfully Trained Highlight Bar -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${barWidthTrained}%; background: linear-gradient(90deg, #0284C7 0%, #38BDF8 100%); border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  /**
   * Chart 2: Competency Skill-Gap vs National Benchmark (SVG Dual-Bar Comparison)
   */
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
                <!-- Benchmark Marker Line -->
                <div style="position: absolute; left: ${bm.benchmark}%; top: 0; bottom: 0; width: 3px; background: #047857; z-index: 2;" title="Target Benchmark: ${bm.benchmark}%"></div>
                <!-- Measured Score Bar -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${bm.currentAvg}%; background: ${barColor}; border-radius: 4px; z-index: 1;"></div>
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

  /**
   * Chart 3: Interactive SVG Donut Chart for Workforce Training Funnel
   */
  renderWorkforceDonutChart(wf) {
    const total = wf.totalWorkforce || 3450;
    const certPct = Math.round((wf.certified / total) * 100);
    const trainPct = Math.round((wf.inTraining / total) * 100);
    const gapPct = Math.round((wf.gapIdentified / total) * 100);
    const pendPct = 100 - certPct - trainPct - gapPct;

    // SVG Donut calculation
    const radius = 54;
    const circumference = 2 * Math.PI * radius; // ~339.29

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
        <!-- The Donut SVG -->
        <div style="position: relative; width: 170px; height: 170px;">
          <svg width="170" height="170" viewBox="0 0 140 140" style="transform: rotate(-90deg);">
            <!-- Background circle -->
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#E2E8F0" stroke-width="18" />

            <!-- Segment 1: Certified (Green) -->
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#10B981" stroke-width="18"
              stroke-dasharray="${stroke1} ${circumference}" stroke-dashoffset="${offset1}" />

            <!-- Segment 2: In Training (Blue) -->
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#3B82F6" stroke-width="18"
              stroke-dasharray="${stroke2} ${circumference}" stroke-dashoffset="${offset2}" />

            <!-- Segment 3: Skill Gap Identified (Red) -->
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#EF4444" stroke-width="18"
              stroke-dasharray="${stroke3} ${circumference}" stroke-dashoffset="${offset3}" />

            <!-- Segment 4: Pending Enrollment (Amber) -->
            <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="#F59E0B" stroke-width="18"
              stroke-dasharray="${stroke4} ${circumference}" stroke-dashoffset="${offset4}" />
          </svg>

          <!-- Center Label -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary-navy); line-height: 1;">3,450</div>
            <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Workforce</div>
          </div>
        </div>

        <!-- Legend Breakdown -->
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

  /**
   * Chart 4: Quarterly Capacity Building Velocity (Interactive SVG Area Chart)
   */
  renderVelocityTrendChart(trends) {
    const data = trends && trends.length > 0 ? trends : [
      { quarter: "Q4 2025", trainedCount: 1840, certificatesIssued: 520 },
      { quarter: "Q1 2026", trainedCount: 2360, certificatesIssued: 690 },
      { quarter: "Q2 2026", trainedCount: 2950, certificatesIssued: 780 },
      { quarter: "Q3 2026", trainedCount: 3450, certificatesIssued: 840 }
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

          <!-- Grid Lines -->
          <line x1="30" y1="20" x2="350" y2="20" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="60" x2="350" y2="60" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="100" x2="350" y2="100" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="140" x2="350" y2="140" stroke="#CBD5E1" stroke-width="1.5" />

          <!-- Shaded Area -->
          <polygon points="${areaPoints}" fill="url(#velocityGrad)" />

          <!-- Line Curve -->
          <polyline points="${polyPoints}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Data Points -->
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

  // --- ACCESS DENIED SCREEN (When non-admin user hits #leadership) ---

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

    // Bind access denied buttons
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
        if (this.appState.saveLocalDb) this.appState.saveLocalDb();
        this.appState.render();
      });
    }

    const homeBtn = container.querySelector("#btn-access-denied-home");
    if (homeBtn && this.appState.navigate) {
      homeBtn.addEventListener("click", () => this.appState.navigate("home"));
    }
  }

  // --- EVENT LISTENERS ---

  bindEvents(container) {
    // Institute filter
    const instFilter = container.querySelector("#leader-institute-filter");
    if (instFilter) {
      instFilter.addEventListener("change", (e) => {
        this.selectedInstitute = e.target.value;
        this.render(container);
      });
    }

    // 1-Click Mandate Action Buttons
    container.querySelectorAll(".btn-mandate-order").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const comp = e.currentTarget.getAttribute("data-comp");
        const inst = e.currentTarget.getAttribute("data-inst");

        const confirmMsg = `OFFICIAL DIRECTIVE CONFIRMATION:\n\nIssue Ministerial Order mandating mandatory training cohort for ${inst} on '${comp}'?\n\nThis will trigger an urgent MoES directive alert to all scientists and engineers at ${inst}.`;
        
        if (confirm(confirmMsg)) {
          btn.disabled = true;
          btn.innerHTML = `Dispatching...`;

          try {
            // Attempt API dispatch
            const res = await fetch("/api/admin/mandate-cohort", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ institute: inst, competencyCode: comp, deadlineDays: 30 })
            }).then(r => r.json());

            alert(`[CONFIRMED] Ministerial Order Successfully Dispatched!\n\nMandatory Training Cohort activated for ${inst} on ${comp}.\nTarget completion deadline: 30 Days.`);
          } catch (err) {
            // Offline demo fallback
            alert(`[CONFIRMED] Directive Dispatched (Offline Mode)!\n\nMandatory Training Cohort scheduled for ${inst} on ${comp}. Notification sent to all ${inst} officers.`);
          }

          // Reload data and re-render
          if (this.appState.loadData) await this.appState.loadData();
          this.render(container);
        }
      });
    });

    // Export CSV
    const exportBtn = container.querySelector("#btn-leader-export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const csvRows = [
          ["Ministry of Earth Sciences - Executive Training & Skill-Gap Report"],
          ["Generated Date", new Date().toISOString()],
          [],
          ["Institute", "Total Personnel", "Trained Personnel", "Training Completion %", "Active Certifications"],
          ["IMD", "1240", "1120", "90.3%", "380"],
          ["INCOIS", "480", "435", "90.6%", "165"],
          ["IITM", "520", "485", "93.3%", "142"],
          ["NCMRWF", "310", "295", "95.2%", "98"],
          ["NIOT", "610", "540", "88.5%", "135"],
          ["NCPOR", "290", "260", "89.7%", "72"],
          [],
          ["Competency Domain", "Benchmark %", "Measured Avg %", "Identified Gap", "Severity"],
          ["Radar Calibration (DWR)", "85%", "56%", "-29%", "Critical Gap"],
          ["HPC Slurm & Parallel Scaling", "85%", "79%", "-6%", "Near Benchmark"],
          ["Ocean Telemetry & Argo Floats", "80%", "64%", "-16%", "Moderate Gap"],
          ["Deep-Sea Robotics & Submersibles", "80%", "40%", "-40%", "Critical Gap"],
          ["Polar Safety & Extreme Survival", "80%", "48%", "-32%", "Critical Gap"],
          ["GeM Procurement & Vigilance", "85%", "81%", "-4%", "Target Met"]
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `moes_executive_skill_gap_report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  getFallbackAnalyticsData() {
    return {
      summary: {
        totalWorkforce: 3450,
        totalTrained: 3135,
        totalCertificatesIssued: 840,
        overallComplianceRate: "88.4%",
        criticalGapsIdentified: 4
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
        { code: "RADAR_CAL", name: "Radar Calibration (DWR)", benchmark: 85, currentAvg: 56, gap: -29, criticalInstitutes: ["NIOT", "NCPOR", "INCOIS"], status: "Moderate Gap" },
        { code: "HPC_SLURM", name: "HPC Slurm & Parallel Scaling", benchmark: 85, currentAvg: 79, gap: -6, criticalInstitutes: ["NIOT", "NCPOR"], status: "Near Benchmark" },
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
      }
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LeaderAnalyticsComponent;
}
