/**
 * Discussion.js - Doubt Solving & Knowledge Forum Model
 */

const { SEED_DISCUSSIONS } = require("../../database/migrations/001_initial_moes_seed.js");

class DiscussionModel {
  constructor() {
    this.discussions = new Map();
    SEED_DISCUSSIONS.forEach(d => this.discussions.set(d.id, JSON.parse(JSON.stringify(d))));
  }

  findAll(filters = {}) {
    let list = Array.from(this.discussions.values());
    if (filters.courseId) {
      list = list.filter(d => d.courseId === filters.courseId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || (d.tags && d.tags.some(t => t.toLowerCase().includes(q))));
    }
    // Sort by latest or top upvotes
    return list.sort((a, b) => b.upvotes - a.upvotes);
  }

  findById(id) {
    return this.discussions.get(id) || null;
  }

  create(data) {
    const id = "disc_" + Date.now().toString(36);
    const newDiscussion = {
      id,
      courseId: data.courseId || "general",
      courseTitle: data.courseTitle || "General Discussion",
      authorName: data.authorName || "MoES Official",
      authorRole: data.authorRole || "Officer",
      authorAvatar: data.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title: data.title,
      content: data.content,
      upvotes: 0,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      replies: []
    };
    this.discussions.set(id, newDiscussion);
    return newDiscussion;
  }

  addReply(discussionId, replyData) {
    const disc = this.discussions.get(discussionId);
    if (!disc) return null;
    const replyId = "rep_" + Date.now().toString(36);
    const newReply = {
      id: replyId,
      authorName: replyData.authorName || "Faculty / Peer",
      authorRole: replyData.authorRole || "Reviewer",
      isTrainerSolution: !!replyData.isTrainerSolution,
      content: replyData.content,
      upvotes: 0,
      createdAt: new Date().toISOString()
    };
    disc.replies = disc.replies || [];
    disc.replies.push(newReply);
    this.discussions.set(discussionId, disc);
    return newReply;
  }

  upvote(discussionId, replyId = null) {
    const disc = this.discussions.get(discussionId);
    if (!disc) return null;
    if (replyId) {
      const rep = (disc.replies || []).find(r => r.id === replyId);
      if (rep) rep.upvotes = (rep.upvotes || 0) + 1;
    } else {
      disc.upvotes = (disc.upvotes || 0) + 1;
    }
    this.discussions.set(discussionId, disc);
    return disc;
  }
}

module.exports = new DiscussionModel();
