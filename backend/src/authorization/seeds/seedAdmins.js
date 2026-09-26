/**
 * seedAdmins.js - 5 Predefined Ministry Executive Admin Accounts
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * 
 * IMPORTANT: These 5 accounts represent the ONLY authorized Administrators.
 * Any other user attempting to claim the admin role will be rejected by the PBAC engine.
 */

const SEED_ADMINS = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    customRoleId: "ADM-001",
    name: "Dr. M. Ravichandran",
    email: "secretary@moes.gov.in",
    password: "MoES@Admin#2026!",
    role: "admin",
    institute: "HQ",
    designation: "Secretary, MoES & Executive Chair",
    department: "Executive Council",
    knowledgePoints: 5000,
    learningStreak: 45,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    customRoleId: "ADM-002",
    name: "Priyanshu Dhote",
    email: "priyanshudhote3110@gmail.com",
    password: "Admin@CC#2026!",
    role: "admin",
    institute: "HQ",
    designation: "Project Lead & Super Admin",
    department: "Digital Transformation Division",
    knowledgePoints: 4800,
    learningStreak: 30,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    customRoleId: "ADM-003",
    name: "Director IMD",
    email: "director@imd.gov.in",
    password: "IMD@Dir#2026!",
    role: "admin",
    institute: "IMD",
    designation: "Director General of Meteorology",
    department: "IMD Directorate",
    knowledgePoints: 4200,
    learningStreak: 25,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    customRoleId: "ADM-004",
    name: "Admin CC",
    email: "admin@capacityconnect.gov.in",
    password: "CC@Admin#2026!",
    role: "admin",
    institute: "HQ",
    designation: "Platform System Administrator",
    department: "MoES Knowledge Systems",
    knowledgePoints: 4000,
    learningStreak: 20,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    customRoleId: "ADM-005",
    name: "Director INCOIS",
    email: "director@incois.gov.in",
    password: "INCOIS@Dir#2026!",
    role: "admin",
    institute: "INCOIS",
    designation: "Director, INCOIS",
    department: "Executive Directorate",
    knowledgePoints: 4100,
    learningStreak: 22,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  }
];

module.exports = {
  SEED_ADMINS
};
