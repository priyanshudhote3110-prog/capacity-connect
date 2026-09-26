/**
 * seedTrainers.js - 10 Predefined Specialist Faculty Trainer Accounts
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 * 
 * IMPORTANT: These 10 accounts represent the authorized Trainers.
 * Any other user attempting to claim the trainer role will be rejected by the PBAC engine.
 */

const SEED_TRAINERS = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    customRoleId: "TRN-001",
    name: "Dr. Anita Desai",
    email: "anita.desai@imd.gov.in",
    password: "Trainer@IMD#2026!",
    role: "trainer",
    institute: "IMD",
    designation: "Chief Radar Specialist & Faculty Head",
    department: "Radar & Satellite Meteorology",
    knowledgePoints: 3400,
    learningStreak: 18,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    customRoleId: "TRN-002",
    name: "Dr. P. Balakrishnan",
    email: "balakrishnan@incois.gov.in",
    password: "Trainer@INCOIS#2026!",
    role: "trainer",
    institute: "INCOIS",
    designation: "Ocean Dynamics & Early Warning Specialist",
    department: "Ocean Information Services",
    knowledgePoints: 3200,
    learningStreak: 15,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    customRoleId: "TRN-003",
    name: "Dr. Ravi Kumar",
    email: "ravi.kumar@iitm.gov.in",
    password: "Trainer@IITM#2026!",
    role: "trainer",
    institute: "IITM",
    designation: "Climate Modeling Faculty Lead",
    department: "Monsoon Mission & Dynamics",
    knowledgePoints: 3100,
    learningStreak: 14,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    customRoleId: "TRN-004",
    name: "Dr. Meena Sharma",
    email: "meena.sharma@ncmrwf.gov.in",
    password: "Trainer@NCMRWF#2026!",
    role: "trainer",
    institute: "NCMRWF",
    designation: "NWP High Performance Computing Instructor",
    department: "Numerical Weather Prediction",
    knowledgePoints: 3050,
    learningStreak: 12,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    customRoleId: "TRN-005",
    name: "Dr. Suresh Nair",
    email: "suresh.nair@niot.gov.in",
    password: "Trainer@NIOT#2026!",
    role: "trainer",
    institute: "NIOT",
    designation: "Deep Ocean Technology Lead Trainer",
    department: "Ocean Energy & Deep Sea Mining",
    knowledgePoints: 2950,
    learningStreak: 10,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000006",
    customRoleId: "TRN-006",
    name: "Dr. Kavita Patel",
    email: "kavita.patel@ncpor.gov.in",
    password: "Trainer@NCPOR#2026!",
    role: "trainer",
    institute: "NCPOR",
    designation: "Polar Sciences & Glaciology Faculty",
    department: "Antarctic & Arctic Research",
    knowledgePoints: 2900,
    learningStreak: 11,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000007",
    customRoleId: "TRN-007",
    name: "Faculty CC",
    email: "faculty@imd.gov.in",
    password: "Faculty@IMD#2026!",
    role: "trainer",
    institute: "IMD",
    designation: "Senior Meteorological Training Officer",
    department: "Training Division",
    knowledgePoints: 2850,
    learningStreak: 9,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000008",
    customRoleId: "TRN-008",
    name: "Trainer CC",
    email: "trainer@capacityconnect.gov.in",
    password: "Trainer@CC#2026!",
    role: "trainer",
    institute: "HQ",
    designation: "MoES Master Capacity Instructor",
    department: "Human Resource Development",
    knowledgePoints: 2800,
    learningStreak: 8,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000009",
    customRoleId: "TRN-009",
    name: "Dr. Arun Verma",
    email: "arun.verma@imd.gov.in",
    password: "Trainer@IMD2#2026!",
    role: "trainer",
    institute: "IMD",
    designation: "Aviation & Marine Forecasting Instructor",
    department: "Aviation Meteorological Division",
    knowledgePoints: 2750,
    learningStreak: 7,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "b0000000-0000-0000-0000-000000000010",
    customRoleId: "TRN-010",
    name: "Dr. Priya Singh",
    email: "priya.singh@incois.gov.in",
    password: "Trainer@INCOIS2#2026!",
    role: "trainer",
    institute: "INCOIS",
    designation: "Coastal Oceanography Lead Instructor",
    department: "Marine Observation Network",
    knowledgePoints: 2700,
    learningStreak: 6,
    isVerified: true,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
  }
];

module.exports = {
  SEED_TRAINERS
};
