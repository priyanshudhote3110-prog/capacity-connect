/* ================================================================
   CAPACITY CONNECT — MOCK DATABASE & APPLICATION DATA
   Ministry of Earth Sciences (MoES), Govt. of India
   SIH 2026 | SIH26075
   ================================================================
   
   YEH FILE KYA HAI?
   Yeh file hamare "fake database" ka kaam karti hai.
   Kyunki hackathon demo ke liye hum actual MongoDB ya 
   backend server nahi chala rahe, toh saara data
   yahan JavaScript objects mein stored hai.

   TEAM KE LIYE NOTE:
   - Agar production mein jaana ho, toh in sab ko
     MongoDB collections mein convert karna hoga.
   - Abhi yeh sab "localStorage" mein bhi save hota hai
     taaki page refresh karne pe data na jaye.
   ================================================================ */


// ================================================================
// 1. USER PROFILES (LOGIN MOCK DATA)
// ================================================================
// Yeh 3 demo users hain jinse SIH ke judge different
// roles test kar sakte hain. Passwords yahan plaintext
// mein hain kyunki yeh sirf demo ke liye hai.
//
// PRODUCTION MEIN:
// - Passwords ko bcrypt se hash karke MongoDB mein store karna
// - JWT token backend se generate hoga (yahan hum localStorage use kar rahe)
// ================================================================

const DEMO_USERS = {

  // Role 1: LEARNER — Ek scientist jo courses seekhta hai aur quiz deta hai
  learner: {
    id: 'MOES-IMD-1094',
    name: 'Dr. Rajesh Sharma',
    nameHindi: 'डॉ. राजेश शर्मा',
    email: 'rajesh.sharma@imd.gov.in',
    role: 'learner',            // Role type — "learner", "trainer", ya "admin"
    designation: "Scientist 'D'",
    institute: 'IMD',           // India Meteorological Department
    department: 'Monsoon Forecasting Division',
    avatarInitials: 'RS',       // Profile circle mein dikhne wale initials
    knowledgePoints: 480,       // Gamification points (courses complete karke milte hain)
    badges: ['FIRST_MODULE', 'RADAR_BASICS']
  },

  // Role 2: TRAINER — Faculty/SME jo courses banata hai aur students ki progress dekhta hai
  trainer: {
    id: 'MOES-HQ-2201',
    name: 'Dr. Anita Desai',
    nameHindi: 'डॉ. अनिता देसाई',
    email: 'anita.desai@moes.gov.in',
    role: 'trainer',
    designation: 'Chief Radar SME',
    institute: 'MoES HQ',
    department: 'Training & Capacity Building Directorate',
    avatarInitials: 'AD',
    knowledgePoints: 920,
    badges: ['MENTOR_GOLD', 'COURSE_CREATOR']
  },

  // Role 3: ADMIN — Director/Secretary level officer jo analytics aur compliance dekhta hai
  admin: {
    id: 'MOES-HQ-0001',
    name: 'Dr. M. Ravichandran',
    nameHindi: 'डॉ. एम. रविचन्द्रन',
    email: 'secretary@moes.gov.in',
    role: 'admin',
    designation: 'Secretary, MoES',
    institute: 'MoES HQ',
    department: 'Ministry of Earth Sciences (Directorate)',
    avatarInitials: 'MR',
    knowledgePoints: 0,        // Admin ko points nahi milte (woh dekhte hain, seekhte nahi)
    badges: []
  }
};


// ================================================================
// 2. MoES AUTONOMOUS INSTITUTES
// ================================================================
// Ministry of Earth Sciences ke 6 autonomous bodies.
// Yeh data institute filter cards mein aur course tagging mein use hota hai.
// ================================================================

const MOES_INSTITUTES = [
  {
    code: 'IMD',
    fullName: 'India Meteorological Department',
    nameHindi: 'भारत मौसम विज्ञान विभाग',
    hq: 'New Delhi',
    scientistCount: 840,       // Approximate scientist cadre strength
    focus: 'Weather Forecasting & Doppler Radar'
  },
  {
    code: 'INCOIS',
    fullName: 'Indian National Centre for Ocean Information Services',
    nameHindi: 'भारतीय राष्ट्रीय महासागर सूचना सेवा केंद्र',
    hq: 'Hyderabad',
    scientistCount: 420,
    focus: 'Tsunami Warning & Ocean State'
  },
  {
    code: 'IITM',
    fullName: 'Indian Institute of Tropical Meteorology',
    nameHindi: 'भारतीय उष्णदेशीय मौसम विज्ञान संस्थान',
    hq: 'Pune',
    scientistCount: 380,
    focus: 'Climate Modeling & Monsoon'
  },
  {
    code: 'NCMRWF',
    fullName: 'National Centre for Medium Range Weather Forecasting',
    nameHindi: 'राष्ट्रीय मध्यम अवधि मौसम पूर्वानुमान केंद्र',
    hq: 'Noida',
    scientistCount: 310,
    focus: 'HPC & Numerical Weather Prediction'
  },
  {
    code: 'NIOT',
    fullName: 'National Institute of Ocean Technology',
    nameHindi: 'राष्ट्रीय समुद्र प्रौद्योगिकी संस्थान',
    hq: 'Chennai',
    scientistCount: 550,
    focus: 'Deep Sea Tech & Submersibles'
  },
  {
    code: 'NCPOR',
    fullName: 'National Centre for Polar and Ocean Research',
    nameHindi: 'राष्ट्रीय ध्रुवीय एवं समुद्री अनुसंधान केंद्र',
    hq: 'Goa',
    scientistCount: 260,
    focus: 'Antarctic & Arctic Expeditions'
  }
];


// ================================================================
// 3. COURSE CATALOG (TRAINING MODULES)
// ================================================================
// Yeh hamare LMS ke courses hain. Har course ka data
// realistic hai — actual MoES domain topics se liya gaya.
//
// FIELDS EXPLANATION:
// - code: Official training reference number
// - institute: Kis autonomous body ke liye relevant hai
// - mandatory: Agar true hai toh employee ko complete karna zaroori hai
// - modules: Course ke andar ke chapters/lessons
// - enrolled: Kya current user already enrolled hai
// - progress: 0-100 (percent completion)
// ================================================================

const COURSES_DATABASE = [
  {
    id: 'course-001',
    code: 'MOES/TRG/IMD-401',
    title: 'Doppler Weather Radar (DWR) Operational Calibration & Severe Storm Diagnostics',
    titleHindi: 'डॉप्लर मौसम रडार परिचालन कैलिब्रेशन',
    institute: 'IMD',
    category: 'Atmospheric Sciences',
    level: 'Intermediate to Advanced',
    eligibility: "Scientist 'B', 'C', 'D' & Technical Officers",
    durationHours: 18,
    lessonsCount: 12,
    mandatory: true,
    deadline: '2026-10-15',    // Mandatory completion deadline
    instructor: {
      name: 'Dr. Anita Desai',
      title: 'Chief Radar Subject Matter Expert, MoES'
    },
    description: 'Comprehensive operational guide on dual-polarization parameters (ZDR, KDP, CC), ground clutter suppression along Western Ghats stations, sun-tracking calibration SOPs, and cyclone eye-wall tracking techniques.',
    
    // Course ke andar ke modules/chapters
    modules: [
      {
        id: 'mod-1',
        title: 'Radar Hardware Architecture',
        status: 'completed',   // "completed", "current", "locked"
        lessons: [
          { id: 'l-101', title: 'Klystron vs Solid State Transmitters', duration: '12 min', done: true },
          { id: 'l-102', title: 'Antenna Feed & Pedestal Mechanics', duration: '15 min', done: true }
        ]
      },
      {
        id: 'mod-2',
        title: 'Dual-Polarization Echo Interpretation',
        status: 'current',
        lessons: [
          { id: 'l-201', title: 'ZDR & Differential Phase Shifts', duration: '18 min', done: true },
          { id: 'l-202', title: 'Doppler Velocity Dealiasing', duration: '19 min', done: false }
        ]
      },
      {
        id: 'mod-3',
        title: 'Calibration SOP & Monthly Audit',
        status: 'locked',
        lessons: [
          { id: 'l-301', title: 'Sun-Tracking Calibration Routine', duration: '25 min', done: false },
          { id: 'l-302', title: 'Quality Audit Documentation', duration: '14 min', done: false }
        ]
      }
    ],

    enrolled: true,            // Dr. Rajesh is already enrolled
    progress: 75               // 75% done
  },
  {
    id: 'course-002',
    code: 'MOES/TRG/NCMRWF-502',
    title: 'Slurm Batch Scheduling & HPC Numerical Weather Prediction Models',
    titleHindi: 'HPC स्लर्म बैच शेड्यूलिंग',
    institute: 'NCMRWF',
    category: 'High Performance Computing',
    level: 'Advanced',
    eligibility: "Scientist 'C', 'D' & HPC Engineers",
    durationHours: 24,
    lessonsCount: 16,
    mandatory: true,
    deadline: '2026-10-31',
    instructor: {
      name: 'Dr. A. K. Mitra',
      title: 'Chief HPC Architect, NCMRWF'
    },
    description: 'Operational training for running high-resolution GFS/Unified Models on multi-petascale supercomputers with MPI and OpenMP optimizations, Slurm job scripting, and resource accounting.',
    modules: [],
    enrolled: false,
    progress: 0
  },
  {
    id: 'course-003',
    code: 'MOES/TRG/INCOIS-301',
    title: 'Ocean State Forecasting & Argo Float Telemetry Analysis',
    titleHindi: 'महासागर स्थिति पूर्वानुमान और आर्गो फ्लोट',
    institute: 'INCOIS',
    category: 'Oceanography',
    level: 'Intermediate',
    eligibility: "Scientist 'B' & Research Fellows",
    durationHours: 14,
    lessonsCount: 10,
    mandatory: false,
    deadline: null,
    instructor: {
      name: 'Dr. S. C. Shenoi',
      title: 'Senior Ocean Scientist, INCOIS'
    },
    description: 'Processing real-time CTD sensor arrays, salinity anomalies, potential fishing zone (PFZ) advisory generation, and Argo float data assimilation using Python xarray.',
    modules: [],
    enrolled: false,
    progress: 0
  },
  {
    id: 'course-004',
    code: 'MOES/TRG/NIOT-601',
    title: 'Deep Ocean Mission: Manned Submersible Safety Standard Operating Procedures',
    titleHindi: 'गहरे समुद्र मिशन: पनडुब्बी सुरक्षा SOP',
    institute: 'NIOT',
    category: 'Marine Robotics',
    level: 'Advanced',
    eligibility: "Scientist 'C', 'D', 'E' & Deep Sea Engineers",
    durationHours: 30,
    lessonsCount: 20,
    mandatory: true,
    deadline: '2026-11-30',
    instructor: {
      name: 'Er. K. Murugan',
      title: 'Lead Submersible Engineer, NIOT'
    },
    description: 'Operating protocols for 6,000-meter depth titanium hull integrity (Matsya-6000), emergency life support systems, deep-sea acoustics, and ascent safety procedures.',
    modules: [],
    enrolled: false,
    progress: 0
  },
  {
    id: 'course-005',
    code: 'MOES/TRG/NCPOR-201',
    title: 'Antarctic Cryosphere Field Safety & Station Operations',
    titleHindi: 'अंटार्कटिक हिमक्षेत्र फील्ड सुरक्षा',
    institute: 'NCPOR',
    category: 'Polar Sciences',
    level: 'Basic / Mandatory Inductive',
    eligibility: 'All Expedition Scientists & Technical Staff',
    durationHours: 16,
    lessonsCount: 8,
    mandatory: true,
    deadline: '2026-12-01',
    instructor: {
      name: 'Dr. Thamban Meloth',
      title: 'Director, NCPOR'
    },
    description: 'Extreme hypothermia management, crevasse rescue techniques, whiteout navigation, and environmental compliance protocols at Maitri and Bharati stations in Antarctica.',
    modules: [],
    enrolled: false,
    progress: 0
  },
  {
    id: 'course-006',
    code: 'MOES/TRG/IITM-405',
    title: 'Coupled Ocean-Atmospheric Climate Simulation (IITM Earth System Model)',
    titleHindi: 'IITM पृथ्वी प्रणाली मॉडल जलवायु सिमुलेशन',
    institute: 'IITM',
    category: 'Climate Modeling',
    level: 'Advanced',
    eligibility: "Scientist 'B', 'C', 'D'",
    durationHours: 22,
    lessonsCount: 14,
    mandatory: false,
    deadline: null,
    instructor: {
      name: 'Dr. Roxy Mathew Koll',
      title: 'Climate Scientist, IITM'
    },
    description: 'Simulating long-term monsoon variability, teleconnections with ENSO, Indian Ocean Dipole feedback mechanisms, and interpreting CMIP6 projection ensembles.',
    modules: [],
    enrolled: false,
    progress: 0
  }
];


// ================================================================
// 4. QUIZ QUESTIONS (EXAMINATION BANK)
// ================================================================
// 5 real domain-specific questions for the DWR course assessment.
// Yeh actual atmospheric & earth science topics pe based hain.
//
// FIELDS:
// - q: Question text
// - options: 4 choices (array index 0-3)
// - correct: Correct answer ka index (0-based)
// - explanation: Sahi answer ka scientific explanation
// ================================================================

const QUIZ_BANK = [
  {
    q: "Which Doppler radar parameter is the primary indicator used to identify giant hail stones in severe thunderstorms?",
    options: [
      "Reflectivity Factor (Z) alone",
      "Differential Reflectivity (ZDR) near 0 dB combined with high Z (>60 dBZ)",
      "Specific Differential Phase (KDP) alone",
      "Radial Velocity gradient alone"
    ],
    correct: 1,
    explanation: "Hail is tumble-shaped (nearly spherical), resulting in ZDR near 0 dB while maintaining extremely high radar reflectivity Z. This combination is the textbook hail signature."
  },
  {
    q: "In the MoES NCMRWF High-Performance Computing cluster, what is the default batch scheduler utilized to submit MPI forecast jobs?",
    options: [
      "Slurm Workload Manager",
      "Apache Mesos",
      "Kubernetes Kubelet",
      "Docker Swarm"
    ],
    correct: 0,
    explanation: "Slurm (Simple Linux Utility for Resource Management) is the premier workload manager used across supercomputing facilities globally, including NCMRWF's Pratyush and Mihir systems."
  },
  {
    q: "At what target profiling depth do standard INCOIS global Argo floats drift before surfacing to transmit CTD telemetry via Iridium satellite?",
    options: [
      "500 meters",
      "1,000m parking depth to 2,000m profile depth",
      "5,000 meters",
      "100 meters"
    ],
    correct: 1,
    explanation: "Standard core Argo floats drift at a 1,000-meter parking depth and profile temperature, salinity, and pressure down to 2,000 meters before surfacing for satellite data upload."
  },
  {
    q: "Under India's Deep Ocean Mission (NIOT), what is the targeted operational depth capability for the Matsya-6000 manned submersible?",
    options: [
      "1,500 meters",
      "3,000 meters",
      "6,000 meters",
      "11,000 meters"
    ],
    correct: 2,
    explanation: "Matsya-6000 is India's indigenously developed deep-ocean manned submersible, engineered for exploration missions up to 6,000 meters depth with a 3-person crew."
  },
  {
    q: "What is India's operational year-round research station situated in the Larsemann Hills, East Antarctica, administered by NCPOR?",
    options: [
      "Dakshin Gangotri",
      "Bharati Station",
      "Himadri Station",
      "Maitri Station"
    ],
    correct: 1,
    explanation: "Bharati is India's third Antarctic station, commissioned in 2012 at Larsemann Hills. (Maitri is at Schirmacher Oasis; Himadri is in the Arctic at Svalbard.)"
  }
];


// ================================================================
// 5. SKILL-GAP HEATMAP DATA (ADMIN ANALYTICS)
// ================================================================
// Yeh admin dashboard ke flagship "Skill-Gap Heatmap"
// ke liye data hai. Har institute ke saath different
// competency areas mein kitne % scientists certified hain.
//
// STATUS LOGIC:
// - >= 80  → "proficient" (green)
// - 50-79  → "moderate" (yellow/amber)
// - < 50   → "deficit" (red — critical)
// - null   → "N/A" (not applicable for that institute)
// ================================================================

const SKILL_HEATMAP_DATA = {
  // Column headers (competency areas)
  competencies: [
    'Doppler Radar Calibration',
    'HPC Slurm Cluster Scripting',
    'Ocean Data Python (xarray)',
    'Deep-Sea Submersible SOP',
    'Polar Cryosphere Safety'
  ],

  // Row data — institute-wise percentage values
  rows: [
    {
      institute: 'IMD',
      location: 'New Delhi',
      staffCount: 840,
      scores: [92, 64, 71, null, 38]    // null = not applicable
    },
    {
      institute: 'INCOIS',
      location: 'Hyderabad',
      staffCount: 420,
      scores: [null, 85, 94, 58, null]
    },
    {
      institute: 'NCMRWF',
      location: 'Noida',
      staffCount: 310,
      scores: [60, 98, 89, null, null]
    },
    {
      institute: 'NIOT',
      location: 'Chennai',
      staffCount: 550,
      scores: [null, 42, 66, 91, 40]
    },
    {
      institute: 'NCPOR',
      location: 'Goa',
      staffCount: 260,
      scores: [null, 52, 68, null, 99]
    }
  ]
};


// ================================================================
// 6. LEADERBOARD DATA (TOP SCIENTISTS)
// ================================================================
// Gamification ke liye — top 3 scientists jo sabse
// zyada courses complete karke Knowledge Points earn kar chuke hain.
// ================================================================

const LEADERBOARD_DATA = [
  {
    rank: 1,
    name: 'Dr. A. K. Mitra',
    institute: 'NCMRWF',
    title: 'Chief HPC Modeler',
    points: 1450,
    certCount: 11,
    medal: '🥇'
  },
  {
    rank: 2,
    name: 'Dr. S. C. Shenoi',
    institute: 'INCOIS',
    title: 'Ocean Scientist',
    points: 1280,
    certCount: 7,
    medal: '🥈'
  },
  {
    rank: 3,
    name: 'Dr. Sunitha Devi',
    institute: 'IMD',
    title: 'Cyclone Specialist',
    points: 1190,
    certCount: 6,
    medal: '🥉'
  }
];


// ================================================================
// 7. CERTIFICATE TEMPLATE DATA
// ================================================================
// Default certificate details — yeh tab update hota hai
// jab koi user quiz pass karta hai.
// ================================================================

const DEFAULT_CERTIFICATE = {
  id: 'MOES/2026/IMD/89412',
  recipientName: 'Dr. Rajesh Sharma',
  recipientDesignation: "Scientist 'D', India Meteorological Department (IMD)",
  courseTitle: 'Doppler Weather Radar (DWR) Operational Calibration & Severe Storm Diagnostics',
  score: 90,
  issueDate: '10 September 2026',
  verificationUrl: 'https://capacityconnect.gov.in/verify/MOES/2026/IMD/89412',
  // SHA-256 hash — production mein yeh backend pe generate hota
  digitalHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  signatories: {
    left: { name: 'M. Ravichandran', title: 'Secretary, MoES', subtitle: 'Government of India' },
    right: { name: 'Anita Desai', title: 'Director General / SME', subtitle: 'Training Board' }
  }
};
