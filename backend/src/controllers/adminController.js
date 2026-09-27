/**
 * adminController.js - Ministry Executive Analytics, Skill Heatmap & Cohort Mandates
 */

const UserModel = require("../models/User.js");
const CourseModel = require("../models/Course.js");
const CertificateModel = require("../models/Certificate.js");
const LiveClassModel = require("../models/LiveClass.js");
const NotificationModel = require("../models/Notification.js");
const { SEED_SKILL_HEATMAP } = require("../../database/migrations/001_initial_moes_seed.js");

class AdminController {
  constructor() {
    this.heatmap = JSON.parse(JSON.stringify(SEED_SKILL_HEATMAP));
    this.competencyBenchmarks = [
      { code: "RADAR_CAL", name: "Radar Calibration (DWR)", benchmark: 85, currentAvg: 56, gap: -29, criticalInstitutes: ["NIOT", "NCPOR", "INCOIS"], status: "Critical Gap" },
      { code: "HPC_SLURM", name: "HPC Slurm & Parallel Scaling", benchmark: 85, currentAvg: 79, gap: -6, criticalInstitutes: ["NIOT", "NCPOR"], status: "Moderate Gap" },
      { code: "OCEAN_ARGO", name: "Ocean Telemetry & Argo Floats", benchmark: 80, currentAvg: 64, gap: -16, criticalInstitutes: ["IMD", "NCMRWF"], status: "Moderate Gap" },
      { code: "SUBSEA_ROV", name: "Deep-Sea Robotics & Submersibles", benchmark: 80, currentAvg: 40, gap: -40, criticalInstitutes: ["NCMRWF", "IMD", "IITM"], status: "Critical Gap" },
      { code: "POLAR_SOP", name: "Polar Safety & Extreme Survival", benchmark: 80, currentAvg: 48, gap: -32, criticalInstitutes: ["NCMRWF", "INCOIS", "IITM"], status: "Critical Gap" },
      { code: "GEM_COMP", name: "GeM Procurement & Vigilance", benchmark: 85, currentAvg: 81, gap: -4, criticalInstitutes: ["IITM"], status: "Target Met" }
    ];
    this.directives = [
      {
        id: "MoES/DIR/2026/0828-HPC",
        competencyCode: "HPC_SLURM",
        competencyName: "HPC Slurm & Parallel Scaling",
        institutes: ["NIOT", "NCPOR"],
        deadlineDays: 45,
        deadlineDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        targetPersonnel: 180,
        enrolledCount: 168,
        priority: "HIGH",
        mandatedBy: "Dr. M. Ravichandran (Secretary & DG)",
        dispatchedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        status: "In Progress (93% Enrolled)",
        notes: "Accelerated HPC Slurm queue scheduling for monsoon coupled forecast modelers."
      }
    ];
  }

  /**
   * Ministry-Wide Executive Analytics
   */
  async getMinistryAnalytics(req, res) {
    try {
      const users = UserModel.findAll();
      const courses = CourseModel.findAll();
      const certificates = CertificateModel.findAll();
      const liveClasses = LiveClassModel.findAll();

      const totalEmployees = users.filter(u => u.role === "employee").length;
      const totalTrainers = users.filter(u => u.role === "trainer").length;
      const totalAdmins = users.filter(u => u.role === "admin").length;

      // Institute-wise participant breakdown
      const instituteStats = {};
      const instituteHeadcounts = {
        IMD: 1240,
        INCOIS: 480,
        IITM: 520,
        NCMRWF: 310,
        NIOT: 610,
        NCPOR: 290
      };

      const instituteTrainedCounts = {
        IMD: 1120,
        INCOIS: 435,
        IITM: 485,
        NCMRWF: 295,
        NIOT: 540,
        NCPOR: 265
      };

      ["IMD", "INCOIS", "IITM", "NCMRWF", "NIOT", "NCPOR"].forEach(inst => {
        const staff = instituteHeadcounts[inst] || 400;
        const trained = instituteTrainedCounts[inst] || 350;
        instituteStats[inst] = {
          totalStaff: staff,
          trainedCount: trained,
          activeLearners: users.filter(u => u.institute === inst).length || Math.round(staff * 0.4),
          certificatesEarned: certificates.filter(c => c.institute === inst).length || Math.round(trained * 0.7),
          complianceRate: Math.round((trained / staff) * 100) + "%"
        };
      });

      // Training programs breakdown
      const trainingPrograms = [
        { id: "crs_imd_01", title: "Doppler Weather Radar (DWR) Calibration", institute: "IMD", totalEnrolled: 1280, completed: 1120, avgScore: 89, status: "Active" },
        { id: "crs_ncmrwf_01", title: "Slurm Workload Scheduling & 18 PFLOPS HPC", institute: "NCMRWF", totalEnrolled: 980, completed: 860, avgScore: 87, status: "Active" },
        { id: "crs_incois_02", title: "Tsunami Early Warning (ITEWS) & Coastal Inundation", institute: "INCOIS", totalEnrolled: 710, completed: 640, avgScore: 91, status: "Active" },
        { id: "crs_niot_01", title: "Matsya-6000 Deep Ocean Manned Submersible SOP", institute: "NIOT", totalEnrolled: 560, completed: 480, avgScore: 84, status: "Active" },
        { id: "crs_ncpor_01", title: "Antarctic Station Polar Operations (Maitri & Bharati)", institute: "NCPOR", totalEnrolled: 420, completed: 370, avgScore: 88, status: "Active" },
        { id: "crs_iitm_01", title: "Earth System Modeling (IITM-ESM) Decadal Projections", institute: "IITM", totalEnrolled: 640, completed: 590, avgScore: 86, status: "Active" }
      ];

      // Quarterly training growth trends
      const quarterlyTrends = [
        { quarter: "Q4 2025", trainedCount: 1840, certificatesIssued: 520, compliancePct: 68 },
        { quarter: "Q1 2026", trainedCount: 2360, certificatesIssued: 690, compliancePct: 75 },
        { quarter: "Q2 2026", trainedCount: 2950, certificatesIssued: 780, compliancePct: 82 },
        { quarter: "Q3 2026", trainedCount: 3450, certificatesIssued: 840, compliancePct: 88 }
      ];

      // Workforce training distribution funnel
      const workforceDistribution = {
        certified: 840,
        inTraining: 1850,
        gapIdentified: 445,
        pendingEnrollment: 315,
        totalWorkforce: 3450
      };

      const criticalCount = this.competencyBenchmarks.filter(b => b.gap < -20).length;

      return res.status(200).json({
        success: true,
        summary: {
          totalUsers: users.length,
          totalWorkforce: 3450,
          totalTrained: 3135 + (this.directives.length * 45),
          totalLearners: totalEmployees,
          totalTrainers: totalTrainers,
          totalAdmins: totalAdmins,
          totalCourses: courses.length,
          totalCertificatesIssued: 840 + (this.directives.length * 15),
          activeLiveSessions: liveClasses.filter(l => l.status === "live").length,
          overallComplianceRate: `${Math.min(96, 88.4 + (this.directives.length * 1.8)).toFixed(1)}%`,
          averageExamScore: "86.2%",
          criticalGapsIdentified: Math.max(0, criticalCount)
        },
        instituteStats,
        trainingPrograms,
        competencyBenchmarks: this.competencyBenchmarks,
        quarterlyTrends,
        workforceDistribution,
        directives: this.directives,
        skillHeatmap: this.heatmap
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * 1-Click Mandate Training Cohort for Skill-Gaps
   */
  async mandateTrainingCohort(req, res) {
    try {
      const {
        institute,
        institutes,
        competencyCode,
        deadlineDays,
        courseId,
        priority = "CRITICAL",
        targetCount,
        notes = "",
        authorizedBy = "Dr. M. Ravichandran (Secretary & DG)"
      } = req.body;

      const targetInstitutes = Array.isArray(institutes) && institutes.length > 0
        ? institutes
        : institute ? [institute] : [];

      if (!competencyCode || targetInstitutes.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Competency code and at least one target institute are required"
        });
      }

      const days = parseInt(deadlineDays, 10) || 30;
      const directiveId = `MoES/EXEC-DIR/2026/DIR-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update Heatmap scores for target institutes
      targetInstitutes.forEach(instCode => {
        const instData = this.heatmap.institutes.find(i => i.code === instCode);
        if (instData && instData.scores[competencyCode] !== undefined) {
          instData.scores[competencyCode] = Math.min(100, instData.scores[competencyCode] + 18);
        }
      });

      // Update benchmark score in active state
      const benchmark = this.competencyBenchmarks.find(b => b.code === competencyCode);
      let competencyName = competencyCode;
      if (benchmark) {
        competencyName = benchmark.name;
        // Boost measured score
        benchmark.currentAvg = Math.min(95, benchmark.currentAvg + 16);
        benchmark.gap = benchmark.currentAvg - benchmark.benchmark;
        benchmark.status = benchmark.gap >= 0 ? "Target Met" : benchmark.gap >= -15 ? "Moderate Gap" : "Critical Gap";
      }

      // Calculate target personnel
      const headcountPerInst = { IMD: 140, INCOIS: 65, IITM: 70, NCMRWF: 50, NIOT: 90, NCPOR: 45 };
      const calculatedTarget = targetCount || targetInstitutes.reduce((sum, inst) => sum + (headcountPerInst[inst] || 60), 0);

      // Create official Directive Record
      const newDirective = {
        id: directiveId,
        competencyCode,
        competencyName,
        institutes: targetInstitutes,
        deadlineDays: days,
        deadlineDate: new Date(Date.now() + days * 86400000).toISOString(),
        targetPersonnel: calculatedTarget,
        enrolledCount: calculatedTarget,
        priority: priority.toUpperCase(),
        mandatedBy: authorizedBy,
        dispatchedAt: new Date().toISOString(),
        status: "Active Mandate (Enforced)",
        notes: notes || `Mandatory national competency cohort directive enforced across ${targetInstitutes.join(", ")}.`
      };

      this.directives.unshift(newDirective);

      // Dispatch mandatory notification to all users
      const notif = NotificationModel.create({
        userId: "all",
        title: `🚨 MINISTERIAL DIRECTIVE: ${directiveId}`,
        message: `By order of Ministry Executive DG (${authorizedBy}): Mandatory learning cohort enforced for ${targetInstitutes.join(", ")} on '${competencyName}'. Deadline: ${days} days.`,
        type: "mandatory_alert",
        linkUrl: "#leadership"
      });

      return res.status(200).json({
        success: true,
        message: `Ministerial Directive ${directiveId} ratified and dispatched successfully across ${targetInstitutes.join(", ")}.`,
        directive: newDirective,
        updatedBenchmarks: this.competencyBenchmarks,
        directives: this.directives,
        updatedHeatmap: this.heatmap,
        notification: notif
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get all active ministerial directives
   */
  async getMandateDirectives(req, res) {
    try {
      return res.status(200).json({
        success: true,
        count: this.directives.length,
        directives: this.directives
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * List all users with filtering
   */
  async getAllUsers(req, res) {
    try {
      const users = UserModel.findAll();
      return res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(req, res) {
    try {
      const { userId, role } = req.body;
      if (!userId || !role) {
        return res.status(400).json({ success: false, error: "userId and role are required" });
      }

      const updated = UserModel.update(userId, { role });
      if (!updated) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        user: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Export CSV compliance report
   */
  async exportCsvReport(req, res) {
    try {
      const certificates = CertificateModel.findAll();
      let csv = "Certificate Number,Learner Name,Role ID,Course Title,Institute,Score,Issued Date\n";
      certificates.forEach(c => {
        csv += `"${c.certificateNumber}","${c.userName}","${c.customRoleId}","${c.courseTitle}","${c.institute}",${c.score},"${c.issuedDate}"\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="moes_training_compliance_report.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new AdminController();
