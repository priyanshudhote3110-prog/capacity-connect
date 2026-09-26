/**
 * DoubtForum.js - Edtech Discussion & Doubt Solving Forum
 * Capacity Connect LMS — MoES Govt of India
 */

class DoubtForumComponent {
  constructor(appState) {
    this.appState = appState;
    this.searchQuery = "";
  }

  render(container) {
    const discussions = (this.appState.discussions || []).filter(d => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q);
    });

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 50px;">
        
        <!-- Header & Post CTA -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2>Scientific Discussion & Doubt Forum</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Ask technical questions, get verified answers from senior scientists & training faculty</p>
          </div>

          <button class="btn btn-primary btn-sm" id="btn-ask-doubt">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Post Question / Doubt
          </button>
        </div>

        <!-- Search Bar -->
        <div class="card" style="padding: 16px; margin-bottom: 24px;">
          <input 
            type="text" 
            class="form-control" 
            id="forum-search-input" 
            placeholder="Search discussion threads by keyword (e.g. Slurm, Radar, Argo, Matsya)..." 
            value="${this.searchQuery}" 
          />
        </div>

        <!-- Threads List -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${discussions.length === 0 ? `
            <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
              No discussions found matching '${this.searchQuery}'. Be the first to ask!
            </div>
          ` : discussions.map(d => `
            <div class="card" style="padding: 24px;">
              <div style="display: flex; gap: 16px;">
                <!-- Upvote Counter -->
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
                  <button class="btn btn-outline btn-sm upvote-btn" data-id="${d.id}" style="padding: 6px 10px; border-radius: var(--radius-sm); font-size: 0.85rem;">
                    ▲
                  </button>
                  <span style="font-weight: 700; color: var(--primary-navy); margin-top: 4px; font-size: 0.95rem;">${d.upvotes || 0}</span>
                </div>

                <!-- Thread Content -->
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                    <h3 style="font-size: 1.15rem; color: var(--primary-navy);">${d.title}</h3>
                    <span class="role-tag" style="background: #E2E8F0; color: #334155;">${d.courseTitle || 'General MoES'}</span>
                  </div>

                  <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 14px; line-height: 1.5;">
                    ${d.content}
                  </p>

                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${d.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}" alt="" style="width: 24px; height: 24px; border-radius: 50%;" />
                      <span><strong>${d.authorName}</strong> (${d.authorRole})</span>
                    </div>
                    <span>Posted on: ${new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>

                  <!-- Replies / Faculty Solutions -->
                  ${(d.replies && d.replies.length > 0) ? `
                    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border-medium); display: flex; flex-direction: column; gap: 10px;">
                      ${d.replies.map(r => `
                        <div style="background: ${r.isTrainerSolution ? '#F0FDF4' : 'var(--bg-subtle)'}; border-left: 3px solid ${r.isTrainerSolution ? 'var(--forest-green)' : 'var(--ocean-cyan)'}; padding: 12px 16px; border-radius: var(--radius-sm);">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 0.8rem; font-weight: 700; color: ${r.isTrainerSolution ? '#166534' : 'var(--primary-navy)'};">
                              ${r.authorName} ${r.isTrainerSolution ? '<span style="display:inline-flex;align-items:center;gap:3px;color:var(--forest-green);font-size:0.75rem;margin-left:6px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>VERIFIED FACULTY SOLUTION</span>' : ''}
                            </span>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">${r.authorRole}</span>
                          </div>
                          <div style="font-size: 0.85rem; line-height: 1.4;">${r.content}</div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  <!-- Quick Reply Input -->
                  <div style="margin-top: 14px; display: flex; gap: 8px;">
                    <input type="text" class="form-control reply-input" data-id="${d.id}" placeholder="Write an answer or peer comment..." style="font-size: 0.8125rem; padding: 6px 12px;" />
                    <button class="btn btn-outline btn-sm send-reply-btn" data-id="${d.id}" style="font-size: 0.8125rem;">
                      Reply
                    </button>
                  </div>

                </div>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Search input
    const searchInput = container.querySelector("#forum-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
      });
    }

    // Upvote
    container.querySelectorAll(".upvote-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        await this.appState.upvoteDiscussion(id);
        this.render(container);
      });
    });

    // Send reply
    container.querySelectorAll(".send-reply-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const input = container.querySelector(`.reply-input[data-id="${id}"]`);
        const text = input ? input.value.trim() : "";
        if (!text) return;

        await this.appState.addDiscussionReply(id, text);
        this.render(container);
      });
    });

    // Post new doubt
    const askBtn = container.querySelector("#btn-ask-doubt");
    if (askBtn) {
      askBtn.addEventListener("click", async () => {
        const title = prompt("Enter Discussion Topic / Question:");
        if (!title) return;
        const content = prompt("Provide Technical Details / Description:");
        if (!content) return;

        await this.appState.createDiscussion({ title, content });
        this.render(container);
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DoubtForumComponent;
}
