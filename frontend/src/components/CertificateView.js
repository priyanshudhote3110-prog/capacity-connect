/**
 * CertificateView.js - Government Official Verifiable Certificate & Public Lookup
 * Capacity Connect LMS — MoES Govt of India
 */

class CertificateViewComponent {
  constructor(appState) {
    this.appState = appState;
    this.lookupCertNumber = "";
    this.verificationResult = null;
  }

  render(container) {
    const certs = this.appState.certificates || [];
    const activeCert = this.appState.activeCertificate || certs[0] || {
      certificateNumber: "MOES-CC-2026-IMD-89412",
      userName: "Dr. Rajesh Sharma",
      customRoleId: "EMP-001",
      courseTitle: "Advanced Doppler Weather Radar (DWR) Calibration & Operational Nowcasting",
      institute: "IMD",
      score: 90.0,
      issuedDate: new Date().toISOString(),
      digitalSignatureHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    };

    container.innerHTML = `
      <div class="app-container" style="padding-top: 24px; padding-bottom: 50px;">
        
        <!-- Action Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2>Official Digital Certificate Desk</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Cryptographically verified accreditation issued under Ministry of Earth Sciences, Govt. of India</p>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-sm" id="btn-print-cert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              Print Certificate
            </button>
            <button class="btn btn-saffron btn-sm" id="btn-download-pdf">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
          </div>
        </div>

        <!-- The Formal Printable Certificate Container -->
        <div class="cert-container" id="printable-certificate">
          <div class="cert-corner-ornament cert-corner-tl"></div>
          <div class="cert-corner-ornament cert-corner-tr"></div>
          <div class="cert-corner-ornament cert-corner-bl"></div>
          <div class="cert-corner-ornament cert-corner-br"></div>

          <!-- National Emblem -->
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="National Emblem of India" class="cert-emblem" />
          
          <div class="cert-subtitle">GOVERNMENT OF INDIA · MINISTRY OF EARTH SCIENCES</div>
          <div class="cert-title">Certificate of Competency</div>

          <p style="text-align: center; font-size: 1rem; color: #4B5563; margin-top: 20px;">
            This is to officially certify that
          </p>

          <div class="cert-candidate">
            ${activeCert.userName}
          </div>

          <p style="text-align: center; font-size: 0.95rem; color: #4B5563; max-width: 680px; margin: 0 auto; line-height: 1.6;">
            bearing Official Identification <strong style="color: #07172C;">[ ${activeCert.customRoleId || 'EMP-001'} ]</strong> from the 
            <strong>${activeCert.institute || 'IMD'}</strong> division has successfully qualified the national examination with an evaluation score of 
            <strong style="color: #10B981;">${activeCert.score}%</strong>, fulfilling all prescribed standards for:
          </p>

          <h3 style="text-align: center; color: #07172C; font-size: 1.35rem; margin: 18px 0; font-family: var(--font-heading);">
            "${activeCert.courseTitle}"
          </h3>

          <!-- Footer Row: QR Code + Digital Hash + Signatures -->
          <div class="cert-footer-row">
            <!-- QR Code Box -->
            <div class="cert-qr-box">
              <div id="cert-qrcode-container" style="width: 84px; height: 84px; margin: 0 auto 6px; background: #FFF; padding: 4px; border: 1px solid #CBD5E1; display: flex; align-items: center; justify-content: center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=84x84&data=https://capacityconnect.gov.in/verify/${activeCert.certificateNumber}" alt="QR Code" style="width: 100%; height: 100%;" />
              </div>
              <span style="font-size: 0.65rem; color: #6B7280; font-weight: 700;">SCAN TO VERIFY RECORD</span>
            </div>

            <!-- Cryptographic Stamp -->
            <div style="text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #07172C; margin-bottom: 2px;">
                CERTIFICATE ID: ${activeCert.certificateNumber}
              </div>
              <div class="cert-hash-stamp">
                SHA-256: ${activeCert.digitalSignatureHash}
              </div>
              <div style="font-size: 0.7rem; color: #6B7280; margin-top: 4px;">
                Issued on: ${new Date(activeCert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <!-- Signatory Seals -->
            <div style="text-align: right;">
              <div style="border-bottom: 1.5px solid #1F2937; width: 160px; margin-bottom: 6px; margin-left: auto;"></div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #07172C;">Dr. M. Ravichandran</div>
              <div style="font-size: 0.7rem; color: #6B7280;">Secretary to Govt. of India<br />Ministry of Earth Sciences</div>
            </div>
          </div>
        </div>

        <!-- Public Online Verification Lookup Box -->
        <div class="card" style="max-width: 900px; margin: 40px auto 0; padding: 30px;">
          <h4 style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-cyan)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Public National Verification Desk
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
            Verify any Capacity Connect credential using the official certificate registration number.
          </p>

          <div style="display: flex; gap: 10px;">
            <input 
              type="text" 
              class="form-control" 
              id="verify-input-code" 
              placeholder="e.g. MOES-CC-2026-IMD-89412" 
              value="${activeCert.certificateNumber}" 
            />
            <button class="btn btn-primary" id="btn-verify-lookup" style="white-space: nowrap;">
              Verify Credential
            </button>
          </div>

          <div id="verify-lookup-result" style="margin-top: 16px;"></div>
        </div>

      </div>
    `;

    this.bindEvents(container, activeCert);
  }

  bindEvents(container, activeCert) {
    // Print & Download buttons
    const printBtn = container.querySelector("#btn-print-cert");
    const downloadBtn = container.querySelector("#btn-download-pdf");

    const doPrint = () => window.print();
    if (printBtn) printBtn.addEventListener("click", doPrint);
    if (downloadBtn) downloadBtn.addEventListener("click", doPrint);

    // Verification Lookup
    const verifyBtn = container.querySelector("#btn-verify-lookup");
    const verifyInput = container.querySelector("#verify-input-code");
    const resultBox = container.querySelector("#verify-lookup-result");

    if (verifyBtn && verifyInput && resultBox) {
      verifyBtn.addEventListener("click", async () => {
        const code = verifyInput.value.trim();
        if (!code) return;

        resultBox.innerHTML = `<div style="font-size: 0.85rem; color: var(--ocean-cyan);">Checking Ministry central repository...</div>`;
        const res = await this.appState.verifyCertificateOnline(code);

        if (res && res.verified) {
          resultBox.innerHTML = `
            <div style="background: #ECFDF5; border: 1.5px solid #10B981; padding: 16px; border-radius: var(--radius-md); color: #065F46;">
              <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                AUTHENTIC MINISTRY CERTIFICATE VERIFIED
              </div>
              <div style="font-size: 0.85rem;">
                <strong>Candidate:</strong> ${res.certificate.userName} (${res.certificate.customRoleId})<br />
                <strong>Course:</strong> ${res.certificate.courseTitle}<br />
                <strong>Score:</strong> ${res.certificate.score}% · <strong>Institute:</strong> ${res.certificate.institute}<br />
                <strong>Signature:</strong> <code style="font-size: 0.75rem;">${res.certificate.digitalSignatureHash.substring(0, 32)}...</code>
              </div>
            </div>
          `;
        } else {
          resultBox.innerHTML = `
            <div style="background: #FEF2F2; border: 1.5px solid #EF4444; padding: 16px; border-radius: var(--radius-md); color: #991B1B; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Credential '${code}' not found in official Ministry records.
            </div>
          `;
        }
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CertificateViewComponent;
}
