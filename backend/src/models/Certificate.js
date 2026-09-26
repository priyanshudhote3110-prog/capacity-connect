/**
 * Certificate.js - Verifiable Certificate Model
 */

const crypto = require("crypto");
const { SEED_CERTIFICATES } = require("../../database/migrations/001_initial_moes_seed.js");

class CertificateModel {
  constructor() {
    this.certificates = new Map();
    SEED_CERTIFICATES.forEach(c => this.certificates.set(c.id, JSON.parse(JSON.stringify(c))));
  }

  findAll(filters = {}) {
    let list = Array.from(this.certificates.values());
    if (filters.userId) {
      list = list.filter(c => c.userId === filters.userId);
    }
    if (filters.institute && filters.institute !== "ALL") {
      list = list.filter(c => c.institute === filters.institute);
    }
    return list;
  }

  findById(id) {
    return this.certificates.get(id) || null;
  }

  findByCertificateNumber(certNumber) {
    if (!certNumber) return null;
    const clean = certNumber.trim().toUpperCase();
    for (const c of this.certificates.values()) {
      if (c.certificateNumber && c.certificateNumber.toUpperCase() === clean) {
        return c;
      }
    }
    return null;
  }

  create(certData) {
    const id = certData.id || "cert_" + Date.now().toString(36);
    const randCode = Math.floor(10000 + Math.random() * 90000);
    const institute = certData.institute || "MOES";
    const certNumber = certData.certificateNumber || `MOES-CC-2026-${institute}-${randCode}`;

    // Generate cryptographic SHA-256 hash for official verification
    const hashPayload = `${certNumber}|${certData.userId}|${certData.courseId}|${certData.score}|${new Date().toISOString()}`;
    const digitalSignatureHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

    const newCert = {
      id,
      certificateNumber: certNumber,
      userId: certData.userId,
      userName: certData.userName || "MoES Official",
      customRoleId: certData.customRoleId || "EMP-001",
      courseId: certData.courseId,
      courseTitle: certData.courseTitle || "MoES Capacity Building Program",
      institute: institute,
      score: certData.score || 85.0,
      issuedDate: certData.issuedDate || new Date().toISOString(),
      verificationUrl: certData.verificationUrl || `https://capacityconnect.gov.in/verify/${certNumber}`,
      digitalSignatureHash: certData.digitalSignatureHash || digitalSignatureHash,
      signatories: certData.signatories || [
        { name: "Dr. M. Ravichandran", title: "Secretary, Ministry of Earth Sciences", seal: "MoES Govt of India Official Seal" },
        { name: certData.trainerName || "Dr. Anita Desai", title: "Faculty Director & Course Head", seal: "Accredited Training Division" }
      ]
    };

    this.certificates.set(id, newCert);
    return newCert;
  }
}

module.exports = new CertificateModel();