/**
 * Leaderboard.js - Gamified Knowledge Points (KP), Streaks & MoES Badges
 * Capacity Connect LMS — MoES Govt of India
 * Clean Vector UI without raw emojis
 */

class LeaderboardComponent {
  constructor(appState) {
    this.appState = appState;
  }

  render(container) {
    const learners = [
      { rank: 1, name: "Dr. Rajesh Sharma", roleId: "EMP-001", institute: "IMD", kp: 9500, streak: 45, badge: "Radar Specialist", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
      { rank: 2, name: "Sunita Kulkarni", roleId: "EMP-002", institute: "NCMRWF", kp: 8850, streak: 38, badge: "Slurm HPC Lead", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
      { rank: 3, name: "V. R. Anand", roleId: "EMP-003", institute: "INCOIS", kp: 8200, streak: 31, badge: "Argo Float Sentinel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { rank: 4, name: "Kavita Nair", roleId: "EMP-004", institute: "NIOT", kp: 7900, streak: 26, badge: "Matsya Submersible Lead", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" },
      { rank: 5, name: "Tenzing Norbu", roleId: "EMP-005", institute: "NCPOR", kp: 7450, streak: 22, badge: "Polar Cryosphere Pioneer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" }
    ];

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 50px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; background: #FEF3C7; color: #92400E; font-size: 0.8rem; font-weight: 700; padding: 4px 14px; border-radius: 20px; border: 1px solid #FDE68A;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            NATIONAL CAPACITY LEADERBOARD
          </div>
          <h2 style="margin-top: 8px;">MoES Knowledge Points (KP) & Badges</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Recognizing excellence, learning continuity, and test scores across all Earth Science institutions</p>
        </div>

        <!-- Leaderboard Table Card -->
        <div class="card" style="max-width: 960px; margin: 0 auto; padding: 24px;">
          <table class="heatmap-table">
            <thead>
              <tr>
                <th style="width: 70px;">Rank</th>
                <th style="text-align: left;">Candidate</th>
                <th>Institute</th>
                <th>Learning Streak</th>
                <th>Specialist Badge</th>
                <th>Knowledge Points</th>
              </tr>
            </thead>
            <tbody>
              ${learners.map(l => `
                <tr style="background: ${l.rank <= 3 ? 'rgba(255, 153, 51, 0.04)' : 'transparent'};">
                  <td style="font-weight: 800; font-size: 1.1rem; color: ${l.rank === 1 ? '#D97706' : l.rank === 2 ? '#64748B' : l.rank === 3 ? '#B45309' : 'var(--text-muted)'};">
                    #${l.rank}
                  </td>
                  <td style="text-align: left;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${l.avatar}" alt="" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid ${l.rank === 1 ? 'var(--saffron-gold)' : 'var(--border-medium)'};" />
                      <div>
                        <div style="font-weight: 700; color: var(--primary-navy);">${l.name}</div>
                        <span class="role-tag employee" style="font-size: 0.65rem;">${l.roleId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-tag ${l.institute.toLowerCase()}">${l.institute}</span>
                  </td>
                  <td>
                    <span style="font-weight: 700; color: #DC2626; display: inline-flex; align-items: center; gap: 4px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                      ${l.streak} Days
                    </span>
                  </td>
                  <td>
                    <span style="background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-cyan)" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                      ${l.badge}
                    </span>
                  </td>
                  <td>
                    <span style="font-weight: 800; color: var(--ocean-cyan); font-size: 1.05rem;">
                      ${l.kp.toLocaleString()} KP
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = LeaderboardComponent;
}
