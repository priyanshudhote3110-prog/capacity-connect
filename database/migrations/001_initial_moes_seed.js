/**
 * 001_initial_moes_seed.js
 * Initial Master Seed Data Migration for Capacity Connect LMS (MoES)
 */

const SEED_USERS = [
  {
    id: "usr_admin_01",
    customRoleId: "ADM-001",
    name: "Dr. M. Ravichandran",
    email: "secretary@moes.gov.in",
    phone: "+91-9811001122",
    role: "admin",
    institute: "HQ",
    designation: "Secretary & Director General",
    department: "Ministry Executive Directorate",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Secretary to Govt. of India, Ministry of Earth Sciences. Overseeing nationwide ocean, polar, atmospheric, and climate missions.",
    knowledgePoints: 9500,
    learningStreak: 45,
    isVerified: true,
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "usr_trainer_01",
    customRoleId: "TRN-001",
    name: "Dr. Anita Desai",
    email: "anita.desai@imd.gov.in",
    phone: "+91-9822334455",
    role: "trainer",
    institute: "IMD",
    designation: "Chief Radar Specialist & Head Faculty",
    department: "Radar & Satellite Meteorology Division",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "Senior Scientist & Lead Instructor for Doppler Weather Radar Operations & Dual-Polarimetric Data Processing.",
    knowledgePoints: 6200,
    learningStreak: 28,
    isVerified: true,
    createdAt: "2026-01-15T00:00:00Z"
  },
  {
    id: "usr_trainer_02",
    customRoleId: "TRN-002",
    name: "Dr. P. Balakrishnan",
    email: "balakrishnan@incois.gov.in",
    phone: "+91-9833445566",
    role: "trainer",
    institute: "INCOIS",
    designation: "Principal Oceanographer",
    department: "Ocean Observation & Tsunami Warning Centre",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Expert in deep-sea Argo float telemetry, tsunami propagation modeling, and coastal warning dissemination.",
    knowledgePoints: 5800,
    learningStreak: 32,
    isVerified: true,
    createdAt: "2026-01-20T00:00:00Z"
  },
  {
    id: "usr_employee_01",
    customRoleId: "EMP-001",
    name: "Dr. Rajesh Sharma",
    email: "rajesh.sharma@imd.gov.in",
    phone: "+91-9876543210",
    role: "employee",
    institute: "IMD",
    designation: "Scientist 'D'",
    department: "Monsoon Forecasting & Severe Weather Division",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Operational forecaster focusing on severe convective storms, radar nowcasting, and regional precipitation models.",
    knowledgePoints: 1450,
    learningStreak: 12,
    isVerified: true,
    createdAt: "2026-02-01T00:00:00Z"
  },
  {
    id: "usr_employee_02",
    customRoleId: "EMP-002",
    name: "Dr. Sunita Kulkarni",
    email: "sunita.k@ncmp.gov.in",
    phone: "+91-9844556677",
    role: "employee",
    institute: "NCMRWF",
    designation: "Technical Officer 'C'",
    department: "High Performance Computing Division",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    bio: "HPC administrator specializing in Slurm queue management, MPI job scaling, and Cray supercomputer maintenance.",
    knowledgePoints: 2100,
    learningStreak: 19,
    isVerified: true,
    createdAt: "2026-02-05T00:00:00Z"
  }
];

const SEED_COURSES = [
  {
    id: "crs_dwr_401",
    code: "MOES-IMD-401",
    title: "Advanced Doppler Weather Radar (DWR) Calibration & Operational Nowcasting",
    description: "Master dual-polarimetric radar parameter analysis (Z, ZDR, KDP, RhoHV), clutter filtering, severe convective storm tracking, and automated nowcasting protocols for aviation and civil defense.",
    category: "Atmospheric & Radar Sciences",
    institute: "IMD",
    trainerId: "usr_trainer_01",
    trainerName: "Dr. Anita Desai",
    level: "Advanced",
    durationMinutes: 480,
    thumbnail: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80",
    isMandatory: true,
    deadline: "2026-10-30T23:59:59Z",
    status: "published",
    tags: ["Radar", "IMD", "Nowcasting", "Severe Weather", "Doppler"],
    modules: [
      {
        id: "mod_01",
        title: "Module 1: Principles of Dual-Polarization Radar",
        order: 1,
        lessons: [
          {
            id: "les_01",
            title: "Lesson 1.1: Radar Equation & Reflectivity Factor (Z)",
            type: "video",
            durationMinutes: 35,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            summary: "Fundamental radar return physics, Rayleigh scattering vs Mie scattering, and dBZ scale calibration."
          },
          {
            id: "les_02",
            title: "Lesson 1.2: Differential Reflectivity (ZDR) & Hydrometeor Identification",
            type: "video",
            durationMinutes: 42,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            summary: "Distinguishing non-spherical hailstones, heavy rain droplets, and biological clutter using ZDR and RhoHV."
          },
          {
            id: "les_03",
            title: "Lesson 1.3: Standard Operating Procedure (SOP) for Doppler Calibration",
            type: "pdf",
            durationMinutes: 25,
            contentUrl: "https://moes.gov.in/sites/default/files/DWR_Calibration_SOP_2026.pdf",
            summary: "Official IMD SOP manual for daily noise level check, sun-tracking calibration, and pedestal alignment."
          }
        ]
      },
      {
        id: "mod_02",
        title: "Module 2: Mesocyclone & Microburst Signatures",
        order: 2,
        lessons: [
          {
            id: "les_04",
            title: "Lesson 2.1: Radial Velocity Velocity De-aliasing & Tornado Vortex Signatures",
            type: "video",
            durationMinutes: 45,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            summary: "Identifying Doppler velocity couplets, storm-relative velocity analysis, and issuing 15-minute lead time warnings."
          }
        ]
      }
    ],
    quiz: {
      id: "qnz_dwr_01",
      title: "DWR Certification Examination — 2026",
      passingScore: 75,
      timeLimitMinutes: 15,
      questions: [
        {
          id: "qdwr_1",
          question: "Which dual-polarization parameter provides the primary indicator for discriminating large hail from heavy rain?",
          options: [
            "Equivalent Reflectivity Factor (Z)",
            "Differential Reflectivity (ZDR)",
            "Specific Differential Phase (KDP)",
            "Correlation Coefficient (RhoHV)"
          ],
          correctIndex: 1,
          topic: "Dual-Pol Parameters",
          explanation: "Differential Reflectivity (ZDR) measures raindrop oblateness; tumbling hailstones appear spherical on average with ZDR near 0 dB despite high reflectivity (Z > 55 dBZ)."
        },
        {
          id: "qdwr_2",
          question: "What is the standard Nyquist velocity interval limit before Doppler velocity aliasing occurs?",
          options: [
            "± Vmax = λ * PRF / 4",
            "± Vmax = λ * PRF / 2",
            "± Vmax = 2 * λ * PRF",
            "± Vmax = PRF / (2 * λ)"
          ],
          correctIndex: 0,
          topic: "Radar Velocity Theory",
          explanation: "The maximum unambiguous Doppler velocity is given by Vmax = (wavelength * PRF) / 4."
        },
        {
          id: "qdwr_3",
          question: "A sharp drop in Correlation Coefficient (RhoHV < 0.80) coincident with high reflectivity in a supercell hook echo signifies:",
          options: [
            "Stratiform snowfall",
            "Tornado Debris Signature (TDS)",
            "Pure drizzle",
            "Anomalous propagation ground clutter"
          ],
          correctIndex: 1,
          topic: "Severe Storm Signatures",
          explanation: "TDS is identified by low RhoHV (<0.80) due to chaotic non-meteorological debris lofted by a tornado."
        },
        {
          id: "qdwr_4",
          question: "In the IMD Standard Operating Procedure, how frequently must solar flux sun-tracking calibration be conducted?",
          options: [
            "Once every 24 hours (Dawn/Dusk)",
            "Once every month",
            "Only during annual overhaul",
            "Every 2 hours during active cyclone"
          ],
          correctIndex: 0,
          topic: "Operational SOP",
          explanation: "Solar flux measurements are automated during sunrise and sunset to verify receiver sensitivity and antenna alignment."
        },
        {
          id: "qdwr_5",
          question: "Which radar band is primarily deployed for coastal cyclone tracking in India due to minimal heavy rain attenuation?",
          options: [
            "X-band (3 cm)",
            "C-band (5 cm)",
            "S-band (10 cm)",
            "Ka-band (0.8 cm)"
          ],
          correctIndex: 2,
          topic: "Radar Hardware",
          explanation: "S-band (10 cm / ~2.8 GHz) experiences minimal attenuation in heavy tropical rainfall, making it the gold standard for IMD coastal cyclone radars."
        }
      ]
    }
  },
  {
    id: "crs_argo_302",
    code: "MOES-INCOIS-302",
    title: "Ocean Data Telemetry & Argo Float Quality Control Protocols",
    description: "Complete operational handbook on autonomous profiling Argo floats, CTD sensor calibration, satellite telemetry (Iridium SBD), and INCOIS Real-Time Quality Control (RTQC) flags.",
    category: "Oceanographic & Marine Sciences",
    institute: "INCOIS",
    trainerId: "usr_trainer_02",
    trainerName: "Dr. P. Balakrishnan",
    level: "Intermediate",
    durationMinutes: 360,
    thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80",
    isMandatory: false,
    deadline: "2026-11-15T23:59:59Z",
    status: "published",
    tags: ["Oceanography", "INCOIS", "Argo", "Data Science", "Python"],
    modules: [
      {
        id: "mod_argo_01",
        title: "Module 1: Argo Float Mechanics & Telemetry",
        order: 1,
        lessons: [
          {
            id: "les_argo_01",
            title: "Lesson 1.1: Hydraulic Buoyancy Engine & 2000m Profiling Cycle",
            type: "video",
            durationMinutes: 30,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            summary: "Detailed 10-day mission cycle: descent to parking depth (1000m), descent to profile depth (2000m), ascent and satellite transmission."
          }
        ]
      }
    ],
    quiz: {
      id: "qnz_argo_01",
      title: "Argo Float Operations & QC Assessment",
      passingScore: 75,
      timeLimitMinutes: 15,
      questions: [
        {
          id: "qargo_1",
          question: "What is the standard parking depth of core Argo floats in the Indian Ocean?",
          options: ["500 meters", "1,000 meters", "2,000 meters", "3,500 meters"],
          correctIndex: 1,
          topic: "Argo Profiling Cycle",
          explanation: "Standard core Argo floats drift at a parking depth of 1,000 meters for 9 days before dipping to 2,000 meters for the ascent profile."
        },
        {
          id: "qargo_2",
          question: "Under the IOC/WMO Argo data management guidelines, which QC flag represents 'Good Data'?",
          options: ["QC Flag 0", "QC Flag 1", "QC Flag 2", "QC Flag 4"],
          correctIndex: 1,
          topic: "Data QC Standards",
          explanation: "QC Flag 1 indicates verified 'Good Data' suitable for assimilation into numerical ocean models."
        },
        {
          id: "qargo_3",
          question: "Which communication system is used by modern Provor/Apex floats for high-speed bi-directional data telemetry?",
          options: ["Argos-2 Doppler", "Iridium SBD / RUDICS", "Inmarsat-C", "HF Radio link"],
          correctIndex: 1,
          topic: "Satellite Telemetry",
          explanation: "Iridium satellite communication allows bi-directional communication and transmits high-resolution profiles in less than 5 minutes at the surface."
        },
        {
          id: "qargo_4",
          question: "What bio-geochemical (BGC) sensor on advanced floats measures ocean acidification?",
          options: ["ISUS Nitrate sensor", "DuraFET pH sensor", "Aanderaa Optode", "WetLabs ECO fluorometer"],
          correctIndex: 1,
          topic: "BGC Sensors",
          explanation: "DuraFET ion-sensitive field-effect transistor pH sensors measure deep ocean pH and acidification dynamics."
        },
        {
          id: "qargo_5",
          question: "Which Indian ocean basin shows the highest seasonal salinity inversion observed by Argo?",
          options: ["Northern Arabian Sea", "Northern Bay of Bengal", "Southern Indian Ocean", "Equatorial Indian Ocean"],
          correctIndex: 1,
          topic: "Regional Oceanography",
          explanation: "Massive monsoon river discharge creates low-salinity surface layers over high-salinity subsurface water in the Northern Bay of Bengal."
        }
      ]
    }
  },
  {
    id: "crs_hpc_501",
    code: "MOES-NCMRWF-501",
    title: "High Performance Computing (HPC) & Slurm Workload Scheduling for Weather Prediction",
    description: "Operational training on Pratyush & Mihir supercomputers: MPI parallel scaling, Slurm job scripting, NetCDF4 spatial processing, and WRF/Unified Model run orchestration.",
    category: "Supercomputing & Computational Modeling",
    institute: "NCMRWF",
    trainerId: "usr_trainer_01",
    trainerName: "Dr. Anita Desai",
    level: "Advanced",
    durationMinutes: 420,
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    isMandatory: true,
    deadline: "2026-11-20T23:59:59Z",
    status: "published",
    tags: ["HPC", "NCMRWF", "Supercomputing", "Slurm", "MPI", "Linux"],
    modules: [],
    quiz: {
      id: "qnz_hpc_01",
      title: "HPC Architecture & Slurm Operations Exam",
      passingScore: 75,
      timeLimitMinutes: 15,
      questions: [
        {
          id: "qhpc_1",
          question: "Which Slurm directive sets the total number of MPI tasks required for a distributed NWP model run?",
          options: ["#SBATCH --nodes=4", "#SBATCH --ntasks=128", "#SBATCH --cpus-per-task=1", "#SBATCH --mem=64G"],
          correctIndex: 1,
          topic: "Slurm Scripting",
          explanation: "#SBATCH --ntasks specifies the exact count of MPI parallel processes to be spawned."
        },
        {
          id: "qhpc_2",
          question: "What MPI communication primitive is most prone to network bottlenecks during global grid boundary exchange?",
          options: ["MPI_Bcast", "MPI_Alltoall", "MPI_Send / MPI_Recv", "MPI_Reduce"],
          correctIndex: 1,
          topic: "Parallel Computing",
          explanation: "MPI_Alltoall causes all-to-all cross-traffic on Infiniband fabric and requires optimized topology-aware placement."
        },
        {
          id: "qhpc_3",
          question: "What file format is the international standard for multi-dimensional gridded meteorological and climate data?",
          options: ["CSV", "GeoJSON", "NetCDF / GRIB2", "SQLite"],
          correctIndex: 2,
          topic: "Data Formats",
          explanation: "NetCDF-4 (HDF5-backed) and WMO GRIB2 formats are the standard for high-dimensional atmospheric and ocean datasets."
        },
        {
          id: "qhpc_4",
          question: "What is the peak compute capacity milestone envisioned for the upgraded MoES HPC infrastructure under Mission Mausam?",
          options: ["10 PetaFLOPS", "18+ PetaFLOPS", "100 PetaFLOPS", "1 ExaFLOP"],
          correctIndex: 1,
          topic: "MoES Infrastructure",
          explanation: "MoES upgraded HPC infrastructure delivers over 18+ PetaFLOPS dedicated to high-resolution climate and weather prediction."
        },
        {
          id: "qhpc_5",
          question: "In Slurm job states, what does 'PD' indicate?",
          options: ["Process Done", "Pending (waiting for compute resource allocation)", "Process Deadlocked", "Preempted"],
          correctIndex: 1,
          topic: "Job Management",
          explanation: "'PD' stands for Pending in Slurm scheduler queue."
        }
      ]
    }
  },
  {
    id: "crs_matsya_601",
    code: "MOES-NIOT-601",
    title: "Deep Ocean Mission: Matsya-6000 Submersible Safety & Subsea Robotics",
    description: "Protocols for manned deep ocean exploration at 6,000-meter depths: titanium alloy hull integrity, life support systems, acoustic positioning (USBL), and ROV payload tele-operation.",
    category: "Deep Sea Engineering & Robotics",
    institute: "NIOT",
    trainerId: "usr_trainer_02",
    trainerName: "Dr. P. Balakrishnan",
    level: "Advanced",
    durationMinutes: 300,
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80",
    isMandatory: false,
    deadline: "2026-12-05T23:59:59Z",
    status: "published",
    tags: ["NIOT", "Matsya-6000", "Deep Ocean", "Subsea", "Robotics"],
    modules: [],
    quiz: {
      id: "qnz_matsya_01",
      title: "Matsya-6000 Subsea Systems Assessment",
      passingScore: 75,
      timeLimitMinutes: 15,
      questions: [
        {
          id: "qmatsya_1",
          question: "What hydrostatic pressure must the Matsya-6000 titanium personnel sphere withstand at 6,000 meters depth?",
          options: ["60 bar (~6 MPa)", "300 bar (~30 MPa)", "600 bar (~60 MPa)", "1200 bar (~120 MPa)"],
          correctIndex: 2,
          topic: "Hydrostatic Physics",
          explanation: "At 6,000m, seawater exerts approximately 600 times atmospheric pressure (600 bar / 60 MPa)."
        },
        {
          id: "qmatsya_2",
          question: "What material is used for the 2.1m diameter spherical pressure hull of Matsya-6000?",
          options: ["Stainless Steel 316L", "Titanium Alloy (Ti-6Al-4V ELI)", "Carbon Fiber Composite", "Marine Grade Aluminum"],
          correctIndex: 1,
          topic: "Materials Engineering",
          explanation: "Extra Low Interstitial (ELI) Titanium alloy Ti-6Al-4V provides exceptional strength-to-weight and crack resistance against immense deep-sea pressure."
        },
        {
          id: "qmatsya_3",
          question: "How long is the emergency life-support endurance designed for the 3-member crew in Matsya-6000?",
          options: ["12 Hours", "24 Hours", "72 Hours", "96 Hours"],
          correctIndex: 3,
          topic: "Life Support Safety",
          explanation: "Standard operational endurance is 12 hours, with emergency life-support endurance extending to 96 hours."
        },
        {
          id: "qmatsya_4",
          question: "Which underwater positioning system is used between the mother ship and the submersible?",
          options: ["GPS satellite signal", "Ultra-Short Baseline (USBL) Acoustic Positioning", "Wi-Fi directional beacon", "LORAN-C"],
          correctIndex: 1,
          topic: "Subsea Navigation",
          explanation: "Radio waves attenuate rapidly in seawater; Ultra-Short Baseline (USBL) acoustic transceiver pulses triangulate submersible position."
        },
        {
          id: "qmatsya_5",
          question: "What critical mineral resource is targeted for exploration in the Central Indian Ocean Basin by NIOT?",
          options: ["Polymetallic Manganese Nodules", "Lithium Brine", "Cobalt Crusts only", "Hydrothermal Uranium"],
          correctIndex: 0,
          topic: "Ocean Resources",
          explanation: "Polymetallic nodules on the abyssal plain contain valuable nickel, copper, cobalt, and manganese under the UN International Seabed Authority license."
        }
      ]
    }
  },
  {
    id: "crs_polar_201",
    code: "MOES-NCPOR-201",
    title: "Polar Expedition Safety, Cryosphere Dynamics & Antarctic Station Protocols",
    description: "Comprehensive pre-deployment training for Indian Scientific Expeditions to Antarctica (Maitri & Bharati stations) and Arctic (Himadri): crevasse rescue, extreme cold survival, and environmental protection under the Madrid Protocol.",
    category: "Polar & Cryospheric Sciences",
    institute: "NCPOR",
    trainerId: "usr_trainer_02",
    trainerName: "Dr. P. Balakrishnan",
    level: "Intermediate",
    durationMinutes: 340,
    thumbnail: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&auto=format&fit=crop&q=80",
    isMandatory: true,
    deadline: "2026-11-25T23:59:59Z",
    status: "published",
    tags: ["NCPOR", "Antarctica", "Polar", "Bharati", "Maitri", "Safety"],
    modules: [],
    quiz: {
      id: "qnz_polar_01",
      title: "Antarctic Station Operational Safety Assessment",
      passingScore: 75,
      timeLimitMinutes: 15,
      questions: [
        {
          id: "qpol_1",
          question: "What is India's third and most modern permanent research base in Antarctica located at Larsemann Hills?",
          options: ["Dakshin Gangotri", "Maitri Station", "Bharati Station", "Himadri Station"],
          correctIndex: 2,
          topic: "Indian Polar Bases",
          explanation: "Bharati Station (commissioned 2012) is located at Larsemann Hills, East Antarctica."
        },
        {
          id: "qpol_2",
          question: "Under the Antarctic Treaty Environmental Protocol (Madrid Protocol), all solid and hazardous waste generated must be:",
          options: ["Buried under deep ice shelf", "Incinerated openly", "Compacted and shipped back to the Indian mainland", "Discharged into coastal waters"],
          correctIndex: 2,
          topic: "Environmental Compliance",
          explanation: "The Madrid Protocol mandates zero waste discharge; all human and hazardous waste is treated, packed, and transported back to mainland ports."
        },
        {
          id: "qpol_3",
          question: "What is the critical first-aid treatment for deep tissue Frostbite in polar field conditions?",
          options: ["Vigorous rubbing with snow", "Direct exposure to open flame", "Rapid re-warming in warm water (37°C - 39°C)", "Immediate cold alcohol compression"],
          correctIndex: 2,
          topic: "Extreme Cold Medicine",
          explanation: "Gentle re-warming in controlled warm water without mechanical friction prevents severe tissue necrosis."
        },
        {
          id: "qpol_4",
          question: "Where is India's permanent Arctic research base 'Himadri' situated?",
          options: ["Svalbard, Norway (Ny-Ålesund)", "Greenland (Nuuk)", "Alaska (Barrow)", "Iceland (Reykjavik)"],
          correctIndex: 0,
          topic: "Arctic Research",
          explanation: "Himadri is situated at Ny-Ålesund, Svalbard Archipelago, Norway."
        },
        {
          id: "qpol_5",
          question: "What optical atmospheric phenomenon creates total loss of depth perception and horizon visibility in Antarctica?",
          options: ["Aurora Australis", "Whiteout", "Sun Halo", "Fata Morgana"],
          correctIndex: 1,
          topic: "Polar Hazards",
          explanation: "Whiteout occurs when uniform diffuse lighting between overcast skies and snow cover obliterates shadows, horizon, and depth cues."
        }
      ]
    }
  }
];

const SEED_LIVE_CLASSES = [
  {
    id: "live_001",
    title: "Live Interactive Workshop: Doppler Weather Radar Calibration SOP & Data Ingestion",
    courseId: "crs_dwr_401",
    courseTitle: "Advanced Doppler Weather Radar (DWR) Calibration",
    trainerId: "usr_trainer_01",
    trainerName: "Dr. Anita Desai",
    institute: "IMD",
    scheduledStart: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // Started 15 mins ago (ACTIVE LIVE)
    scheduledEnd: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    status: "live",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    attendeesCount: 42,
    liveChat: [
      { id: "c1", senderId: "usr_employee_01", senderName: "Dr. Rajesh Sharma (IMD)", role: "employee", message: "Namaskar Dr. Anita. Are we using the dual-pol algorithm for the new Agartala X-band radar?", timestamp: "10:18 AM" },
      { id: "c2", senderId: "usr_trainer_01", senderName: "Dr. Anita Desai (Faculty)", role: "trainer", message: "Yes Rajesh, the hydrometeor classification table has been updated for north-eastern terrain.", timestamp: "10:19 AM" },
      { id: "c3", senderId: "usr_employee_02", senderName: "Sunita Kulkarni (NCMRWF)", role: "employee", message: "Data assimilation pipelines on Mihir cluster have also been linked to real-time radial velocity feeds.", timestamp: "10:21 AM" }
    ]
  },
  {
    id: "live_002",
    title: "Masterclass: Slurm Scripting & MPI Scaling for 18 PFLOP Supercomputing",
    courseId: "crs_hpc_501",
    courseTitle: "High Performance Computing (HPC) & Slurm",
    trainerId: "usr_trainer_01",
    trainerName: "Dr. Anita Desai",
    institute: "NCMRWF",
    scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // in 3 hours
    scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    status: "upcoming",
    streamUrl: "",
    attendeesCount: 88,
    liveChat: []
  },
  {
    id: "live_003",
    title: "Mission Briefing: Matsya-6000 Deep Sea Robotics & Acoustic Comms",
    courseId: "crs_matsya_601",
    courseTitle: "Deep Ocean Mission: Matsya-6000 Submersible Safety",
    trainerId: "usr_trainer_02",
    trainerName: "Dr. P. Balakrishnan",
    institute: "NIOT",
    scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    status: "upcoming",
    streamUrl: "",
    attendeesCount: 115,
    liveChat: []
  }
];

const SEED_CERTIFICATES = [
  {
    id: "cert_001",
    certificateNumber: "MOES-CC-2026-IMD-89412",
    userId: "usr_employee_01",
    userName: "Dr. Rajesh Sharma",
    customRoleId: "EMP-001",
    courseId: "crs_dwr_401",
    courseTitle: "Advanced Doppler Weather Radar (DWR) Calibration & Operational Nowcasting",
    institute: "IMD",
    score: 90.0,
    issuedDate: "2026-09-08T14:35:00Z",
    verificationUrl: "https://capacityconnect.gov.in/verify/MOES-CC-2026-IMD-89412",
    digitalSignatureHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    signatoryTitle: "Secretary, Ministry of Earth Sciences, Govt. of India"
  }
];

const SEED_SKILL_HEATMAP = {
  competencies: [
    { id: "c1", name: "Doppler Radar Calibration (DWR)", code: "RADAR_CAL" },
    { id: "c2", name: "HPC Slurm & MPI Scripting", code: "HPC_SLURM" },
    { id: "c3", name: "Ocean Data Python & Argo Floats", code: "OCEAN_ARGO" },
    { id: "c4", name: "Deep-Sea Submersible & ROV Safety", code: "SUBSEA_ROV" },
    { id: "c5", name: "Polar Cryosphere Survival & SOP", code: "POLAR_SOP" },
    { id: "c6", name: "GeM Govt Procurement & Compliance", code: "GEM_COMP" }
  ],
  institutes: [
    {
      code: "IMD",
      name: "India Meteorological Department",
      totalPersonnel: 1240,
      scores: { RADAR_CAL: 94, HPC_SLURM: 68, OCEAN_ARGO: 42, SUBSEA_ROV: 18, POLAR_SOP: 55, GEM_COMP: 88 }
    },
    {
      code: "INCOIS",
      name: "Indian National Centre for Ocean Information Services",
      totalPersonnel: 480,
      scores: { RADAR_CAL: 35, HPC_SLURM: 82, OCEAN_ARGO: 96, SUBSEA_ROV: 74, POLAR_SOP: 40, GEM_COMP: 82 }
    },
    {
      code: "IITM",
      name: "Indian Institute of Tropical Meteorology",
      totalPersonnel: 520,
      scores: { RADAR_CAL: 78, HPC_SLURM: 92, OCEAN_ARGO: 70, SUBSEA_ROV: 20, POLAR_SOP: 35, GEM_COMP: 75 }
    },
    {
      code: "NCMRWF",
      name: "National Centre for Medium Range Weather Forecasting",
      totalPersonnel: 310,
      scores: { RADAR_CAL: 60, HPC_SLURM: 98, OCEAN_ARGO: 65, SUBSEA_ROV: 15, POLAR_SOP: 25, GEM_COMP: 79 }
    },
    {
      code: "NIOT",
      name: "National Institute of Ocean Technology",
      totalPersonnel: 610,
      scores: { RADAR_CAL: 22, HPC_SLURM: 58, OCEAN_ARGO: 85, SUBSEA_ROV: 95, POLAR_SOP: 48, GEM_COMP: 85 }
    },
    {
      code: "NCPOR",
      name: "National Centre for Polar and Ocean Research",
      totalPersonnel: 290,
      scores: { RADAR_CAL: 28, HPC_SLURM: 62, OCEAN_ARGO: 68, SUBSEA_ROV: 52, POLAR_SOP: 98, GEM_COMP: 81 }
    }
  ]
};

const SEED_DISCUSSIONS = [
  {
    id: "disc_01",
    courseId: "crs_dwr_401",
    courseTitle: "Advanced Doppler Weather Radar (DWR) Calibration",
    authorName: "Dr. Rajesh Sharma",
    authorRole: "Scientist 'D' (IMD)",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Difference in RhoHV threshold during heavy monsoon vs hail in Himalayas",
    content: "During high-altitude radar operations in Mukteshwar and Shimla, we noticed Correlation Coefficient (RhoHV) dipping to 0.88 in heavy mixed melting layers. Should we tune the hydrometeor threshold specifically for mountain clutter?",
    upvotes: 14,
    tags: ["RhoHV", "High Altitude", "Radar Clutter"],
    createdAt: "2026-09-18T11:20:00Z",
    replies: [
      {
        id: "rep_01",
        authorName: "Dr. Anita Desai",
        authorRole: "Chief Radar Specialist & Faculty",
        isTrainerSolution: true,
        content: "Excellent observation Rajesh. In orographic terrain, the melting layer (0°C isotherm) induces depolarization. We recommend activating the Orographic Hydrometeor Masking Profile (OHMP-3) in your radar signal processor.",
        upvotes: 11,
        createdAt: "2026-09-18T12:05:00Z"
      }
    ]
  },
  {
    id: "disc_02",
    courseId: "crs_hpc_501",
    courseTitle: "High Performance Computing (HPC) & Slurm",
    authorName: "Sunita Kulkarni",
    authorRole: "Technical Officer 'C' (NCMRWF)",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    title: "Slurm heterogeneous job step allocation with GPU nodes on Mihir-II",
    content: "How do we allocate 64 CPU MPI ranks alongside 4 H100 GPU nodes in a single submission script for AI-based weather post-processing?",
    upvotes: 9,
    tags: ["Slurm", "GPU", "Mihir-II", "MPI"],
    createdAt: "2026-09-19T16:40:00Z",
    replies: [
      {
        id: "rep_02",
        authorName: "Dr. Anita Desai",
        authorRole: "Chief Radar Specialist & Faculty",
        isTrainerSolution: true,
        content: "Use `#SBATCH --gres=gpu:4` with `srun --het-group` syntax. This binds MPI ranks to local NUMA sockets while sharing the unified virtual memory space.",
        upvotes: 8,
        createdAt: "2026-09-19T18:10:00Z"
      }
    ]
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: "notif_01",
    userId: "usr_employee_01",
    title: "Mandatory Training Deadline",
    message: "High Performance Computing (MOES-NCMRWF-501) compliance deadline is Oct 30, 2026. Please complete your assessment.",
    type: "mandatory_alert",
    linkUrl: "#courses",
    isRead: false,
    createdAt: "2026-09-21T09:00:00Z"
  },
  {
    id: "notif_02",
    userId: "usr_employee_01",
    title: "Live Class Starting Soon",
    message: "Dr. Anita Desai is live now on 'Doppler Weather Radar Calibration SOP & Data Ingestion'. Click to join interactive session.",
    type: "live_class",
    linkUrl: "#live-classes",
    isRead: false,
    createdAt: "2026-09-22T10:15:00Z"
  },
  {
    id: "notif_03",
    userId: "usr_employee_01",
    title: "Official Digital Certificate Issued",
    message: "Congratulations! Your Certificate for 'Advanced Doppler Weather Radar Calibration' (MOES-CC-2026-IMD-89412) is ready for download.",
    type: "cert_issued",
    linkUrl: "#certificates",
    isRead: true,
    createdAt: "2026-09-08T14:35:00Z"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SEED_USERS,
    SEED_COURSES,
    SEED_LIVE_CLASSES,
    SEED_CERTIFICATES,
    SEED_SKILL_HEATMAP,
    SEED_DISCUSSIONS,
    SEED_NOTIFICATIONS
  };
}
