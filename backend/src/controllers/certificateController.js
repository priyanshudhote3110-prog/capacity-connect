/**
 * certificateController.js - Official Certificate Verification & Download Controller
 */

const CertificateModel = require("../models/Certificate.js");
const pdfCertGenerator = require("../../integrations/certificate-generator/pdfCertGenerator.js");

class CertificateController {
  async getAllCertificates(req, res) {
    try {
      const { userId, institute } = req.query;
      const targetUserId = req.user ? req.user.id : userId;
      const list = CertificateModel.findAll({ userId: targetUserId, institute });
      return res.status(200).json({
        success: true,
        count: list.length,
        certificates: list
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getCertificateById(req, res) {
    try {
      const { id } = req.params;
      let cert = CertificateModel.findById(id);
      if (!cert) {
        cert = CertificateModel.findByCertificateNumber(id);
      }
      if (!cert) {
        return res.status(404).json({ success: false, error: "Certificate not found" });
      }

      return res.status(200).json({
        success: true,
        certificate: cert
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Public QR Verification Endpoint
   */
  async verifyCertificate(req, res) {
    try {
      const { certNumber } = req.params;
      const cert = CertificateModel.findByCertificateNumber(certNumber);

      if (!cert) {
        return res.status(404).json({
          success: false,
          verified: false,
          message: "Certificate number not found in official Ministry repository."
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        message: "Authentic Ministry of Earth Sciences Official Digital Certificate",
        certificate: {
          certificateNumber: cert.certificateNumber,
          userName: cert.userName,
          customRoleId: cert.customRoleId,
          courseTitle: cert.courseTitle,
          institute: cert.institute,
          score: cert.score,
          issuedDate: cert.issuedDate,
          digitalSignatureHash: cert.digitalSignatureHash,
          signatories: cert.signatories,
          status: "VALID / VERIFIED GOVT RECORD"
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Render or Download Printable PDF Certificate
   */
  async renderCertificateHtml(req, res) {
    try {
      const { id } = req.params;
      let cert = CertificateModel.findById(id);
      if (!cert) cert = CertificateModel.findByCertificateNumber(id);
      if (!cert) {
        return res.status(404).send("Certificate not found");
      }

      const html = pdfCertGenerator.generateCertificateHtml(cert);
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new CertificateController();
