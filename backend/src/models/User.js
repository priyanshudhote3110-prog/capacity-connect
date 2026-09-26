/**
 * User.js - PBAC-Enabled Database Model for Users & Role Identities
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { SEED_USERS } = require("../../database/migrations/001_initial_moes_seed.js");
const { SEED_ADMINS } = require("../authorization/seeds/seedAdmins.js");
const { SEED_TRAINERS } = require("../authorization/seeds/seedTrainers.js");
const crypto = require("crypto");

class UserModel {
  constructor() {
    this.users = new Map();

    // 1. Load initial base seed users
    SEED_USERS.forEach(u => this.users.set(u.id, { ...u, isActive: true }));

    // 2. Pre-seed the 5 Official Ministry Admins
    SEED_ADMINS.forEach(admin => {
      this.users.set(admin.id, {
        ...admin,
        passwordHash: this.hashPassword(admin.password)
      });
    });

    // 3. Pre-seed the 10 Specialist Faculty Trainers
    SEED_TRAINERS.forEach(trainer => {
      this.users.set(trainer.id, {
        ...trainer,
        passwordHash: this.hashPassword(trainer.password)
      });
    });
  }

  hashPassword(password) {
    if (!password) return null;
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  verifyPassword(user, candidatePassword) {
    if (!user) return false;
    // Check direct match or SHA-256 hash match
    if (user.password && user.password === candidatePassword) {
      return true;
    }
    if (user.passwordHash) {
      const hashedCandidate = this.hashPassword(candidatePassword);
      return user.passwordHash === hashedCandidate;
    }
    return false;
  }

  findAll() {
    return Array.from(this.users.values()).map(u => this.sanitize(u));
  }

  findRawAll() {
    return Array.from(this.users.values());
  }

  findById(id) {
    const u = this.users.get(id);
    return u || null;
  }

  findByEmail(email) {
    if (!email) return null;
    const lower = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email && u.email.toLowerCase() === lower) return u;
    }
    return null;
  }

  findByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, "");
    for (const u of this.users.values()) {
      if (u.phone && u.phone.replace(/\D/g, "") === cleanPhone) return u;
    }
    return null;
  }

  findByCustomRoleId(roleId) {
    if (!roleId) return null;
    const target = roleId.toUpperCase().trim();
    for (const u of this.users.values()) {
      if (u.customRoleId && u.customRoleId.toUpperCase() === target) return u;
    }
    return null;
  }

  findAdmins() {
    return Array.from(this.users.values())
      .filter(u => u.role === "admin")
      .map(u => this.sanitize(u));
  }

  findTrainers() {
    return Array.from(this.users.values())
      .filter(u => u.role === "trainer")
      .map(u => this.sanitize(u));
  }

  create(userData) {
    const id = userData.id || "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const count = this.users.size + 1;
    const prefixes = { admin: "ADM", trainer: "TRN", employee: "EMP" };
    const prefix = prefixes[userData.role] || "EMP";
    const customRoleId = userData.customRoleId || `${prefix}-${String(count).padStart(3, "0")}`;

    const newUser = {
      id,
      customRoleId,
      name: userData.name || "MoES Official",
      email: userData.email ? userData.email.toLowerCase().trim() : null,
      phone: userData.phone || "",
      password: userData.password || null,
      passwordHash: userData.password ? this.hashPassword(userData.password) : null,
      role: userData.role || "employee",
      institute: userData.institute || "IMD",
      designation: userData.designation || "Scientific Officer",
      department: userData.department || "Earth Sciences Research",
      avatarUrl: userData.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: userData.bio || "",
      knowledgePoints: userData.knowledgePoints || 0,
      learningStreak: 1,
      isVerified: true,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString()
    };

    this.users.set(id, newUser);
    return newUser;
  }

  update(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;

    if (updates.password) {
      updates.passwordHash = this.hashPassword(updates.password);
    }

    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  updateLastLogin(id) {
    return this.update(id, { lastLoginAt: new Date().toISOString() });
  }

  sanitize(user) {
    if (!user) return null;
    const copy = { ...user };
    delete copy.password;
    delete copy.passwordHash;
    return copy;
  }
}

module.exports = new UserModel();

