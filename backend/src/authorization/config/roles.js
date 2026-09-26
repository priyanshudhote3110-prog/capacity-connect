/**
 * roles.js - Official Role Definitions & Hierarchy Config
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * Policy-Based Access Control (PBAC) Architecture
 */

const ROLES = Object.freeze({
  ADMIN: "admin",
  TRAINER: "trainer",
  EMPLOYEE: "employee"
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.ADMIN]: 100,
  [ROLES.TRAINER]: 50,
  [ROLES.EMPLOYEE]: 10
});

/**
 * 5 Predefined Executive Admin Accounts (Authorized for Admin Panel)
 */
const PREDEFINED_ADMINS = Object.freeze([
  {
    customRoleId: "ADM-001",
    name: "Dr. M. Ravichandran",
    email: "secretary@moes.gov.in",
    institute: "HQ",
    designation: "Secretary, MoES & Executive Chair",
    department: "Executive Council"
  },
  {
    customRoleId: "ADM-002",
    name: "Priyanshu Dhote",
    email: "priyanshudhote3110@gmail.com",
    institute: "HQ",
    designation: "Project Lead & Super Admin",
    department: "Digital Transformation Division"
  },
  {
    customRoleId: "ADM-003",
    name: "Director IMD",
    email: "director@imd.gov.in",
    institute: "IMD",
    designation: "Director General of Meteorology",
    department: "IMD Directorate"
  },
  {
    customRoleId: "ADM-004",
    name: "Admin CC",
    email: "admin@capacityconnect.gov.in",
    institute: "HQ",
    designation: "Platform System Administrator",
    department: "MoES Knowledge Systems"
  },
  {
    customRoleId: "ADM-005",
    name: "Director INCOIS",
    email: "director@incois.gov.in",
    institute: "INCOIS",
    designation: "Director, INCOIS",
    department: "Executive Directorate"
  }
]);

/**
 * 10 Predefined Specialist Trainer Accounts (Authorized for Training & Course Publishing)
 */
const PREDEFINED_TRAINERS = Object.freeze([
  {
    customRoleId: "TRN-001",
    name: "Dr. Anita Desai",
    email: "anita.desai@imd.gov.in",
    institute: "IMD",
    designation: "Chief Radar Specialist & Faculty Head",
    department: "Radar & Satellite Meteorology"
  },
  {
    customRoleId: "TRN-002",
    name: "Dr. P. Balakrishnan",
    email: "balakrishnan@incois.gov.in",
    institute: "INCOIS",
    designation: "Ocean Dynamics & Early Warning Specialist",
    department: "Ocean Information Services"
  },
  {
    customRoleId: "TRN-003",
    name: "Dr. Ravi Kumar",
    email: "ravi.kumar@iitm.gov.in",
    institute: "IITM",
    designation: "Climate Modeling Faculty Lead",
    department: "Monsoon Mission & Dynamics"
  },
  {
    customRoleId: "TRN-004",
    name: "Dr. Meena Sharma",
    email: "meena.sharma@ncmrwf.gov.in",
    institute: "NCMRWF",
    designation: "NWP High Performance Computing Instructor",
    department: "Numerical Weather Prediction"
  },
  {
    customRoleId: "TRN-005",
    name: "Dr. Suresh Nair",
    email: "suresh.nair@niot.gov.in",
    institute: "NIOT",
    designation: "Deep Ocean Technology Lead Trainer",
    department: "Ocean Energy & Deep Sea Mining"
  },
  {
    customRoleId: "TRN-006",
    name: "Dr. Kavita Patel",
    email: "kavita.patel@ncpor.gov.in",
    institute: "NCPOR",
    designation: "Polar Sciences & Glaciology Faculty",
    department: "Antarctic & Arctic Research"
  },
  {
    customRoleId: "TRN-007",
    name: "Faculty CC",
    email: "faculty@imd.gov.in",
    institute: "IMD",
    designation: "Senior Meteorological Training Officer",
    department: "Training Division"
  },
  {
    customRoleId: "TRN-008",
    name: "Trainer CC",
    email: "trainer@capacityconnect.gov.in",
    institute: "HQ",
    designation: "MoES Master Capacity Instructor",
    department: "Human Resource Development"
  },
  {
    customRoleId: "TRN-009",
    name: "Dr. Arun Verma",
    email: "arun.verma@imd.gov.in",
    institute: "IMD",
    designation: "Aviation & Marine Forecasting Instructor",
    department: "Aviation Meteorological Division"
  },
  {
    customRoleId: "TRN-010",
    name: "Dr. Priya Singh",
    email: "priya.singh@incois.gov.in",
    institute: "INCOIS",
    designation: "Coastal Oceanography Lead Instructor",
    department: "Marine Observation Network"
  }
]);

const ADMIN_EMAIL_SET = new Set(PREDEFINED_ADMINS.map(a => a.email.toLowerCase()));
const TRAINER_EMAIL_SET = new Set(PREDEFINED_TRAINERS.map(t => t.email.toLowerCase()));

/**
 * Checks whether an email is strictly an authorized Admin
 */
function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return ADMIN_EMAIL_SET.has(email.toLowerCase().trim());
}

/**
 * Checks whether an email is strictly an authorized Trainer
 */
function isTrainerEmail(email) {
  if (!email || typeof email !== "string") return false;
  return TRAINER_EMAIL_SET.has(email.toLowerCase().trim());
}

/**
 * Authoritative role resolver based on strict email validation
 * Ensures that no user can escalate privilege without being whitelisted.
 */
function resolveRoleFromEmail(email) {
  if (!email) return ROLES.EMPLOYEE;
  const clean = email.toLowerCase().trim();
  if (ADMIN_EMAIL_SET.has(clean)) return ROLES.ADMIN;
  if (TRAINER_EMAIL_SET.has(clean)) return ROLES.TRAINER;
  return ROLES.EMPLOYEE;
}

/**
 * Finds predefined account details if available
 */
function getPredefinedAccount(email) {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  const admin = PREDEFINED_ADMINS.find(a => a.email.toLowerCase() === clean);
  if (admin) return { ...admin, role: ROLES.ADMIN };
  const trainer = PREDEFINED_TRAINERS.find(t => t.email.toLowerCase() === clean);
  if (trainer) return { ...trainer, role: ROLES.TRAINER };
  return null;
}

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PREDEFINED_ADMINS,
  PREDEFINED_TRAINERS,
  ADMIN_EMAIL_SET,
  TRAINER_EMAIL_SET,
  isAdminEmail,
  isTrainerEmail,
  resolveRoleFromEmail,
  getPredefinedAccount
};
