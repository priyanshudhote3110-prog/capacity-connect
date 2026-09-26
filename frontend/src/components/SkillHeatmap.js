/**
 * SkillHeatmap.js - Executive Skill-Gap Heatmap Matrix & 1-Click Mandate Action
 * Capacity Connect LMS — MoES Govt of India
 */

class SkillHeatmapComponent {
  constructor(appState) {
    this.appState = appState;
  }

  render(container) {
    const analytics = this.appState.analyticsData || {
      summary: {
        totalLearners: 1420,
        totalCourses: 12,
        totalCertificatesIssued: 840,
        overallComplianceRate: "88.4%"
      },
      skillHeatmap: {
        competencies: [
          { code: "RADAR_CAL", name: "Radar Calibration" },
          { code: "HPC_SLURM", name: "HPC & Slurm" },
          { code: "OCEAN_ARGO", name: "Ocean Telemetry" },
          { code: "SUBSEA_ROV", name: "Deep-Sea Robotics" },
          { code: "POLAR_SOP", name: "Polar Field Safety" },
          { code: "GEM_COMP", name: "GeM Compliance" }
        ],
        institutes: [
          { code: "IMD", name: "India Meteorological Dept", totalPersonnel: 1250, scores: { RADAR_CAL: 92, HPC_SLURM: 74, OCEAN_ARGO: 35, SUBSEA_ROV: 20, POLAR_SOP: 45, GEM_COMP: 88 } },
          { code: "INCOIS", name: "Indian National Centre for Ocean Info", totalPersonnel: 480, scores: { RADAR_CAL: 40, HPC_SLURM: 82, OCEAN_ARGO: 96, SUBSEA_ROV: 78, POLAR_SOP: 30, GEM_COMP: 84 } },
          { code: "IITM", name: "Indian Institute of Tropical Meteorology", totalPersonnel: 520, scores: { RADAR_CAL: 85, HPC_SLURM: 94, OCEAN_ARGO: 60, SUBSEA_ROV: 25, POLAR_SOP: 40, GEM_COMP: 79 } },
          { code: "NCMRWF", name: "National Centre for Medium Range Weather", totalPersonnel: 310, scores: { RADAR_CAL: 65, HPC_SLURM: 98, OCEAN_ARGO: 55, SUBSEA_ROV: 18, POLAR_SOP: 25, GEM_COMP: 82 } },
          { code: "NIOT", name: "National Institute of Ocean Technology", totalPersonnel: 610, scores: { RADAR_CAL: 22, HPC_SLURM: 58, OCEAN_ARGO: 85, SUBSEA_ROV: 95, POLAR_SOP: 48, GEM_COMP: 85 } },
          { code: "NCPOR", name: "National Centre for Polar and Ocean Research", totalPersonnel: 290, scores: { RADAR_CAL: 28, HPC_SLURM: 62, OCEAN_ARGO: 68, SUBSEA_ROV: 52, POLAR_SOP: 98, GEM_COMP: 81 } }
        ]
      }
    };

    const heatmap = analytics.skillHeatmap;
    const summary = analytics.summary;

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 50px;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="role-tag admin">EXECUTIVE INTELLIGENCE</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Ministry Capacity Diagnostic</span>
            </div>
            <h2>Ministry-Wide Institutional Skill-Gap Heatmap</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Mapping cross-institute competency proficiencies across IMD, INCOIS, IITM, NCMRWF, NIOT, and NCPOR
            </p>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-sm" id="btn-export-csv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Compliance CSV
            </button>
          </div>
        </div>

        <!-- KPI Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="padding: 18px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Total Personnel</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary-navy); margin-top: 4px;">3,460</div>
            <span style="font-size: 0.75rem; color: var(--forest-green); font-weight: 600;">↑ 94.2% Onboarded</span>
          </div>

          <div class="card" style="padding: 18px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Overall Compliance Rate</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--forest-green); margin-top: 4px;">${summary.overallComplianceRate || '88.4%'}</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">MoES Quality Standard</span>
          </div>

          <div class="card" style="padding: 18px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Active Certifications</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--ocean-cyan); margin-top: 4px;">${summary.totalCertificatesIssued || 840}</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Cryptographically Verified</span>
          </div>

          <div class="card" style="padding: 18px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Identified Skill-Gaps</span>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--emergency-red); margin-top: 4px;">4 Cohorts</div>
            <span style="font-size: 0.75rem; color: var(--saffron-gold); font-weight: 600;">1-Click Mandate Ready</span>
          </div>
        </div>

        <!-- The Matrix Table Card -->
        <div class="card" style="padding: 24px; overflow-x: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="margin: 0;">Institutional Competency Matrix</h4>
            <div style="display: flex; gap: 12px; font-size: 0.75rem; font-weight: 600;">
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 2px;"></span> &lt;50% Critical Gap</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 2px;"></span> 50-74% Moderate</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; background: #DCFCE7; border: 1px solid #10B981; border-radius: 2px;"></span> ≥75% Proficient</span>
            </div>
          </div>

          <table class="heatmap-table">
            <thead>
              <tr>
                <th style="text-align: left;">Institute</th>
                <th>Staff</th>
                ${heatmap.competencies.map(c => `<th>${c.name}</th>`).join('')}
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              ${heatmap.institutes.map(inst => `
                <tr>
                  <td style="text-align: left; font-weight: 700;">
                    <div style="color: var(--primary-navy);">${inst.code}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">${inst.name}</div>
                  </td>
                  <td style="font-weight: 600; color: var(--text-muted);">${inst.totalPersonnel}</td>
                  ${heatmap.competencies.map(c => {
                    const score = inst.scores[c.code] !== undefined ? inst.scores[c.code] : 50;
                    let badgeClass = "score-high";
                    if (score < 50) badgeClass = "score-low";
                    else if (score < 75) badgeClass = "score-medium";

                    return `
                      <td>
                        <span class="heatmap-cell ${badgeClass}" title="${inst.code} - ${c.name}: ${score}%">
                          ${score}%
                        </span>
                      </td>
                    `;
                  }).join('')}
                  <td>
                    <button class="btn btn-outline btn-sm mandate-cohort-btn" data-inst="${inst.code}" data-comp="HPC_SLURM" style="font-size: 0.75rem; padding: 4px 8px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:3px;vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Mandate Cohort
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Mandate Cohort Action
    container.querySelectorAll(".mandate-cohort-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const inst = e.currentTarget.getAttribute("data-inst");
        const comp = e.currentTarget.getAttribute("data-comp");

        if (confirm(`Mandate mandatory MoES Executive training cohort for ${inst} on '${comp}'? This will notify all institute personnel.`)) {
          const res = await this.appState.mandateTrainingCohort(inst, comp);
          alert(res.message || `Mandatory cohort scheduled for ${inst}!`);
          this.render(container);
        }
      });
    });

    // Export CSV
    const exportBtn = container.querySelector("#btn-export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const csvContent = "data:text/csv;charset=utf-8,Institute,RADAR_CAL,HPC_SLURM,OCEAN_ARGO,SUBSEA_ROV,POLAR_SOP,GEM_COMP\nIMD,92,74,35,20,45,88\nINCOIS,40,82,96,78,30,84\nIITM,85,94,60,25,40,79\nNCMRWF,65,98,55,18,25,82\nNIOT,22,58,85,95,48,85\nNCPOR,28,62,68,52,98,81\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "moes_skill_heatmap_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SkillHeatmapComponent;
}
