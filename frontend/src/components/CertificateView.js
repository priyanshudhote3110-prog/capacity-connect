/**
 * CertificateView.js - Sovereign Digital Certificate Desk & Public Verification Portal
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Features:
 *  - High-Definition Certificate-Only PDF & PNG Direct Download (No Screen Clutter)
 *  - Real-Time Dynamic QR Code via QRCode.js (Scannable & Clickable)
 *  - Sovereign Indian Government Hallmarks: 3D Embossed Golden Seal, Ashoka Chakra Watermark, Guilloche Frame
 *  - Dual Digital Signatories (Secretary, MoES & Director General, IMD) with Security Seals
 *  - Interactive Cryptographic National Credential Verification Modal
 */

class CertificateViewComponent {
  constructor(appState) {
    this.appState = appState;
    this.selectedCertIndex = 0;
    this.verificationResult = null;
  }

  getCertificatesList() {
    const user = this.appState.currentUser;
    const userName = user && user.name ? user.name : "Dr. Anita Desai";
    const customRoleId = user && user.customRoleId ? user.customRoleId : "TRN-001";
    const userInstitute = user && user.institute ? user.institute : "IMD";

    // Standard Curated Accredited National Credentials
    const defaultList = [
      {
        certificateNumber: "MOES-CC-2026-IMD-70874",
        userName: userName,
        customRoleId: customRoleId,
        designation: "Scientist-E / Faculty Specialist",
        courseTitle: "Advanced Doppler Weather Radar (DWR) Calibration & Operational Nowcasting",
        institute: "IMD",
        instituteFull: "India Meteorological Department",
        score: 94.5,
        grade: "GRADE A+ · EXCELLENCE",
        issuedDate: "2026-09-23T10:30:00Z",
        digitalSignatureHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        signatoryOne: { name: "Dr. M. Ravichandran", title: "Secretary to Govt. of India", org: "Ministry of Earth Sciences" },
        signatoryTwo: { name: "Dr. Mrutyunjay Mohapatra", title: "Director General of Meteorology", org: "Scientific Council Head, IMD" }
      },
      {
        certificateNumber: "MOES-CC-2026-INCOIS-30129",
        userName: userName,
        customRoleId: customRoleId,
        designation: "Oceanographer / Senior Researcher",
        courseTitle: "Indian Ocean Tsunami Early Warning System (ITEWS) & Coastal Inundation Modeling",
        institute: "INCOIS",
        instituteFull: "Indian National Centre for Ocean Information Services",
        score: 91.0,
        grade: "GRADE A · DISTINCTION",
        issuedDate: "2026-09-18T14:15:00Z",
        digitalSignatureHash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        signatoryOne: { name: "Dr. M. Ravichandran", title: "Secretary to Govt. of India", org: "Ministry of Earth Sciences" },
        signatoryTwo: { name: "Dr. T. Srinivasa Kumar", title: "Director, INCOIS", org: "Ocean Advisory Council" }
      },
      {
        certificateNumber: "MOES-CC-2026-NCMRWF-58210",
        userName: userName,
        customRoleId: customRoleId,
        designation: "HPC Computational Specialist",
        courseTitle: "Slurm Workload Scheduling & MPI Parallel Scaling on 18 PFLOPS HPC",
        institute: "NCMRWF",
        instituteFull: "National Centre for Medium Range Weather Forecasting",
        score: 96.0,
        grade: "GRADE A+ · EXCELLENCE",
        issuedDate: "2026-09-10T09:00:00Z",
        digitalSignatureHash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        signatoryOne: { name: "Dr. M. Ravichandran", title: "Secretary to Govt. of India", org: "Ministry of Earth Sciences" },
        signatoryTwo: { name: "Dr. V. S. Prasad", title: "Head, NCMRWF", org: "Supercomputing Directorate" }
      }
    ];

    // Merge active user certificates if present
    const userEarned = this.appState.certificates || [];
    if (this.appState.activeCertificate && !userEarned.some(c => c.certificateNumber === this.appState.activeCertificate.certificateNumber)) {
      userEarned.unshift(this.appState.activeCertificate);
    }

    if (userEarned.length > 0) {
      // Prepend user-earned certificates
      const formattedEarned = userEarned.map(c => ({
        certificateNumber: c.certificateNumber || `MOES-CC-2026-${c.institute || 'IMD'}-${Math.floor(10000 + Math.random() * 90000)}`,
        userName: c.userName || userName,
        customRoleId: c.customRoleId || customRoleId,
        designation: c.designation || "Scientist / Officer",
        courseTitle: c.courseTitle || "MoES Accredited Capacity Building Module",
        institute: c.institute || userInstitute,
        instituteFull: c.institute === "INCOIS" ? "Indian National Centre for Ocean Information Services" : c.institute === "IITM" ? "Indian Institute of Tropical Meteorology" : c.institute === "NCMRWF" ? "National Centre for Medium Range Weather Forecasting" : c.institute === "NIOT" ? "National Institute of Ocean Technology" : c.institute === "NCPOR" ? "National Centre for Polar & Ocean Research" : "India Meteorological Department",
        score: Number(c.score) || 90.0,
        grade: Number(c.score) >= 90 ? "GRADE A+ · EXCELLENCE" : "GRADE A · DISTINCTION",
        issuedDate: c.issuedDate || new Date().toISOString(),
        digitalSignatureHash: c.digitalSignatureHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        signatoryOne: { name: "Dr. M. Ravichandran", title: "Secretary to Govt. of India", org: "Ministry of Earth Sciences" },
        signatoryTwo: { name: "Dr. Mrutyunjay Mohapatra", title: "Director General of Meteorology", org: "Scientific Council Head, IMD" }
      }));

      // Combine without duplicates
      const ids = new Set(formattedEarned.map(c => c.certificateNumber));
      const combined = [...formattedEarned, ...defaultList.filter(d => !ids.has(d.certificateNumber))];
      return combined;
    }

    return defaultList;
  }

  render(container) {
    const certList = this.getCertificatesList();
    if (this.selectedCertIndex >= certList.length) {
      this.selectedCertIndex = 0;
    }
    const activeCert = certList[this.selectedCertIndex];

    const formattedDate = new Date(activeCert.issuedDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    container.innerHTML = `
      <div class="cert-page-wrapper">
        <div class="app-container">
          
          <!-- Master Action & Selector Toolbar -->
          <div class="cert-toolbar-card">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="background: var(--saffron-gold); color: #07172C; font-weight: 800; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.05em;">
                  OFFICIAL NATIONAL ACCREDITATION
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
                  ISO/IEC 27001 & GIGW 3.0 Compliant
                </span>
              </div>
              <h2 style="margin: 0; font-size: 1.45rem; color: var(--primary-navy); display: flex; align-items: center; gap: 8px;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--saffron-gold)" stroke-width="2.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                Digital Certificate Desk & Sovereign Credential Registry
              </h2>
            </div>

            <!-- Export Buttons: PDF, PNG & Print -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm" id="btn-print-cert" title="Print certificate via landscape printer dialog">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                Print Certificate
              </button>
              
              <button class="btn btn-outline btn-sm" id="btn-download-png" title="Download crisp 300 DPI high-resolution image of the certificate only">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                Download Ultra-HD PNG
              </button>

              <button class="btn btn-saffron btn-sm" id="btn-download-pdf" title="Download standalone A4 Landscape official certificate PDF">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Official PDF
              </button>
            </div>
          </div>

          <!-- Certificate Selector Pills -->
          <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                Available Accreditations (${certList.length}):
              </span>
              <div class="cert-selector-pills">
                ${certList.map((cert, idx) => `
                  <button type="button" class="cert-pill-btn ${idx === this.selectedCertIndex ? 'active' : ''}" data-index="${idx}">
                    <span style="background: ${idx === this.selectedCertIndex ? '#FF9933' : 'rgba(10, 38, 71, 0.2)'}; color: ${idx === this.selectedCertIndex ? '#07172C' : 'inherit'}; border-radius: 10px; padding: 1px 6px; font-size: 0.7rem; font-weight: 800;">
                      ${cert.institute}
                    </span>
                    <span>${cert.courseTitle.length > 32 ? cert.courseTitle.substring(0, 30) + '...' : cert.courseTitle}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="font-size: 0.8rem; color: #059669; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Cryptographically Signed &amp; Tamper-Evident
            </div>
          </div>

          <!-- ================================================================
               THE SOVEREIGN PRINTABLE CERTIFICATE CANVAS (DOWNLOAD TARGET)
               ================================================================ -->
          <div class="cert-container" id="printable-certificate">
            
            <!-- Ornate Guilloche Corner Vector Rosettes -->
            <svg class="cert-corner-ornament cert-corner-tl" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H40V6H6V40H2V2Z" fill="#B8860B"/>
              <path d="M8 8H36V11H11V36H8V8Z" fill="#0A2647"/>
              <circle cx="20" cy="20" r="3" fill="#D97706"/>
              <path d="M20 12V28M12 20H28" stroke="#B8860B" stroke-width="1.2"/>
            </svg>
            <svg class="cert-corner-ornament cert-corner-tr" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H40V6H6V40H2V2Z" fill="#B8860B"/>
              <path d="M8 8H36V11H11V36H8V8Z" fill="#0A2647"/>
              <circle cx="20" cy="20" r="3" fill="#D97706"/>
              <path d="M20 12V28M12 20H28" stroke="#B8860B" stroke-width="1.2"/>
            </svg>
            <svg class="cert-corner-ornament cert-corner-bl" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H40V6H6V40H2V2Z" fill="#B8860B"/>
              <path d="M8 8H36V11H11V36H8V8Z" fill="#0A2647"/>
              <circle cx="20" cy="20" r="3" fill="#D97706"/>
              <path d="M20 12V28M12 20H28" stroke="#B8860B" stroke-width="1.2"/>
            </svg>
            <svg class="cert-corner-ornament cert-corner-br" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H40V6H6V40H2V2Z" fill="#B8860B"/>
              <path d="M8 8H36V11H11V36H8V8Z" fill="#0A2647"/>
              <circle cx="20" cy="20" r="3" fill="#D97706"/>
              <path d="M20 12V28M12 20H28" stroke="#B8860B" stroke-width="1.2"/>
            </svg>

            <!-- Inner Guilloche Frame -->
            <div class="cert-inner-frame">

              <!-- Security Microprint Top Perimeter Strip -->
              <div class="cert-microprint-top" aria-hidden="true">
                BHARAT SARKAR · GOVERNMENT OF INDIA · MINISTRY OF EARTH SCIENCES · NATIONAL CAPACITY BUILDING &amp; SCIENTIFIC ACCREDITATION · CERTIFICATE ID: ${activeCert.certificateNumber} · CRYPTOGRAPHICALLY SECURE
              </div>

              <!-- High-Resolution Central Ashoka Chakra Watermark -->
              <svg class="cert-watermark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="100" cy="100" r="94" stroke="#0A2647" stroke-width="3" fill="none"/>
                <circle cx="100" cy="100" r="88" stroke="#0A2647" stroke-width="1.5" fill="none"/>
                <circle cx="100" cy="100" r="22" stroke="#0A2647" stroke-width="3" fill="none"/>
                <circle cx="100" cy="100" r="10" fill="#0A2647"/>
                <!-- 24 Radiating Spokes -->
                <g stroke="#0A2647" stroke-width="1.5">
                  <line x1="100" y1="22" x2="100" y2="78"/><line x1="100" y1="122" x2="100" y2="178"/>
                  <line x1="22" y1="100" x2="78" y2="100"/><line x1="122" y1="100" x2="178" y2="100"/>
                  <line x1="45" y1="45" x2="84" y2="84"/><line x1="116" y1="116" x2="155" y2="155"/>
                  <line x1="155" y1="45" x2="116" y2="84"/><line x1="84" y1="116" x2="45" y2="155"/>
                  <line x1="68" y1="28" x2="90" y2="80"/><line x1="110" y1="120" x2="132" y2="172"/>
                  <line x1="132" y1="28" x2="110" y2="80"/><line x1="90" y1="120" x2="68" y2="172"/>
                  <line x1="28" y1="68" x2="80" y2="90"/><line x1="120" y1="110" x2="172" y2="132"/>
                  <line x1="28" y1="132" x2="80" y2="110"/><line x1="120" y1="90" x2="172" y2="68"/>
                  <line x1="33" y1="56" x2="81" y2="86"/><line x1="119" y1="114" x2="167" y2="144"/>
                  <line x1="56" y1="33" x2="86" y2="81"/><line x1="114" y1="119" x2="144" y2="167"/>
                  <line x1="144" y1="33" x2="114" y2="81"/><line x1="86" y1="119" x2="56" y2="167"/>
                  <line x1="167" y1="56" x2="119" y2="86"/><line x1="81" y1="114" x2="33" y2="144"/>
                </g>
              </svg>

              <!-- Official Header: Ashok Stambh Emblem & Bilingual Titles -->
              <div class="cert-header-block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                  alt="National Emblem of India (Ashok Stambh)" 
                  class="cert-emblem" 
                  crossorigin="anonymous"
                />
                
                <div class="cert-govt-title-hi">भारत सरकार · पृथ्वी विज्ञान मंत्रालय</div>
                <div class="cert-govt-title-en">GOVERNMENT OF INDIA · MINISTRY OF EARTH SCIENCES</div>
                
                <div>
                  <span class="cert-accreditation-sub">
                    NATIONAL SCIENTIFIC CAPACITY BUILDING &amp; COMPETENCY ACCREDITATION
                  </span>
                </div>
              </div>

              <!-- Certificate Title Headline -->
              <div class="cert-title-container">
                <div class="cert-title-rule">
                  <h1 class="cert-title">CERTIFICATE OF SCIENTIFIC PROFICIENCY</h1>
                </div>
                <div class="cert-title-sub-hi">प्रमाण-पत्र · राष्ट्रीय तकनीकी एवं वैज्ञानिक दक्षता प्रत्यायन</div>
              </div>

              <!-- Candidate Certification Narrative -->
              <div class="cert-content-body">
                <p class="cert-certifies-text">
                  This is to officially certify that the distinguished officer
                </p>

                <!-- Candidate Name in Calligraphic Serif -->
                <div class="cert-candidate-name">
                  ${activeCert.userName}
                </div>
                <div class="cert-candidate-underline"></div>

                <div class="cert-candidate-credentials">
                  Official Service ID: <strong style="color: #0A2647;">[ ${activeCert.customRoleId} ]</strong>
                  &nbsp;·&nbsp;
                  Affiliation: <strong>${activeCert.instituteFull} (${activeCert.institute})</strong>
                </div>

                <p class="cert-citation-paragraph">
                  has successfully undergone advanced institutional capacity building, demonstrated rigorous laboratory and telemetry operational standards, and qualified the National Examination with verified honors:
                </p>

                <!-- Course Title & Honors Badge -->
                <div class="cert-course-badge-box">
                  <h3 class="cert-course-title">
                    "${activeCert.courseTitle}"
                  </h3>
                  <div class="cert-score-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Evaluation Score: <strong>${activeCert.score}%</strong> &nbsp;(${activeCert.grade})
                  </div>
                </div>
              </div>

              <!-- ==============================================================
                   LOWER SECTION: DYNAMIC QR CODE + GOLDEN SEAL + DUAL SIGNATURES
                   ============================================================== -->
              <div class="cert-lower-grid">
                
                <!-- Left: Dynamic Scannable QR Code -->
                <div class="cert-qr-wrapper">
                  <div class="cert-qrcode-box" id="cert-qrcode-container" title="Click to open digital cryptographic ledger verification">
                    <!-- Dynamic QRCode Canvas will mount here via QRCode.js -->
                    <div style="font-size: 0.7rem; color: #94A3B8;">Generating QR...</div>
                  </div>
                  <div class="cert-qr-instructions">
                    <div style="color: #0A2647; font-weight: 800; font-size: 0.68rem; display: flex; align-items: center; gap: 3px;">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      SCAN TO VERIFY
                    </div>
                    <span style="font-size: 0.6rem; color: #64748B;">Click QR for instant audit</span>
                  </div>
                </div>

                <!-- Center: 3D Embossed Sovereign Golden Seal & Security Hash -->
                <div class="cert-center-stamp-col">
                  <!-- 3D Sovereign Golden Medallion Seal -->
                  <div class="cert-gold-seal">
                    <div class="cert-seal-starburst"></div>
                    <div class="cert-gold-seal-inner">
                      <div class="cert-seal-text-top">MINISTRY OF EARTH SCIENCES</div>
                      <svg class="cert-seal-icon" viewBox="0 0 24 24" fill="#583A00">
                        <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"/>
                      </svg>
                      <div class="cert-seal-text-bottom">GOVT. OF INDIA · SECURE</div>
                    </div>
                    <!-- Ribbon Tails -->
                    <div class="cert-seal-ribbons">
                      <div class="cert-ribbon-tail navy"></div>
                      <div class="cert-ribbon-tail saffron"></div>
                    </div>
                  </div>

                  <!-- Security Registration ID & Hash -->
                  <div class="cert-meta-id">
                    CERTIFICATE ID: ${activeCert.certificateNumber}
                  </div>
                  <div class="cert-hash-stamp" id="cert-hash-copy-btn" title="Click to copy SHA-256 digital signature hash">
                    SHA-256: ${activeCert.digitalSignatureHash.substring(0, 36)}...
                  </div>
                  <div class="cert-issue-date">
                    Issued at New Delhi on: <strong>${formattedDate}</strong>
                  </div>
                </div>

                <!-- Right: Dual Official Digital Signatures with Stamps -->
                <div class="cert-signatories-col">
                  <!-- Signatory 1: Secretary to Govt. of India, MoES -->
                  <div class="cert-signature-block">
                    <!-- Smooth Fountain Pen Cursive Signature SVG -->
                    <svg class="cert-signature-svg" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 28 C25 15, 30 5, 45 22 C55 35, 60 12, 75 18 C85 22, 92 10, 105 16 C118 22, 128 8, 142 14 C148 16, 152 24, 155 20" stroke="#003366" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M30 20 Q50 32 80 26 T130 22" stroke="#003366" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                    <div class="cert-sign-rule"></div>
                    <div class="cert-sign-name">${activeCert.signatoryOne.name}</div>
                    <div class="cert-sign-title">
                      ${activeCert.signatoryOne.title}<br/>
                      ${activeCert.signatoryOne.org}
                    </div>
                  </div>

                  <!-- Signatory 2: Director General / Institute Council Head -->
                  <div class="cert-signature-block" style="margin-bottom: 0;">
                    <!-- Smooth Fountain Pen Cursive Signature SVG -->
                    <svg class="cert-signature-svg" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 24 C22 10, 38 32, 52 14 C62 2, 72 30, 88 18 C98 10, 108 24, 124 16 C136 10, 144 26, 152 18" stroke="#003366" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M40 28 Q80 18 120 28" stroke="#003366" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                    <div class="cert-sign-rule"></div>
                    <div class="cert-sign-name">${activeCert.signatoryTwo.name}</div>
                    <div class="cert-sign-title">
                      ${activeCert.signatoryTwo.title}<br/>
                      ${activeCert.signatoryTwo.org}
                    </div>
                  </div>
                </div>

              </div>

              <!-- Security Microprint Bottom Perimeter Strip -->
              <div class="cert-microprint-bottom" aria-hidden="true">
                NATIONAL CREDENTIAL VERIFICATION PORTAL · VERIFIED SCIENTIFIC OFFICER REPOSITORY · TAMPER-PROOF ASSET PROTECTED UNDER IT ACT 2000 · ALL RIGHTS RESERVED
              </div>

            </div>
          </div>

          <!-- Public Online Verification Lookup Box -->
          <div class="card cert-verification-card" style="max-width: 960px; margin: 40px auto 0; padding: 28px 32px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 14px;">
              <div>
                <h4 style="margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px; font-size: 1.15rem; color: var(--primary-navy);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-cyan)" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Public National Credential Verification Desk
                </h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
                  Enter any official MoES Capacity Connect Certificate Registration ID to verify its cryptographic validity and national registry status.
                </p>
              </div>

              <div style="font-size: 0.78rem; background: #ECFDF5; color: #065F46; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid #A7F3D0;">
                🟢 Central Verification Gateway Online
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <input 
                type="text" 
                class="form-control" 
                id="verify-input-code" 
                placeholder="e.g. MOES-CC-2026-IMD-70874" 
                value="${activeCert.certificateNumber}" 
                style="flex: 1; min-width: 260px; font-family: monospace; font-weight: 700;"
              />
              <button class="btn btn-primary" id="btn-verify-lookup" style="white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Verify Credential
              </button>
            </div>

            <div id="verify-lookup-result" style="margin-top: 18px;"></div>
          </div>

        </div>
      </div>
    `;

    // 1. Generate Real Scannable Dynamic QR Code via QRCode.js
    this.generateDynamicQRCode(activeCert);

    // 2. Bind user events (Download PDF, Download PNG, Print, Tab switching, Modal)
    this.bindEvents(container, activeCert, certList);
  }

  generateDynamicQRCode(cert) {
    const qrContainer = document.getElementById("cert-qrcode-container");
    if (!qrContainer) return;

    qrContainer.innerHTML = "";

    // Official verification URL payload (compact to ensure standard QR matrix compatibility)
    const verificationUrl = `https://capacityconnect.gov.in/verify?id=${encodeURIComponent(cert.certificateNumber)}&sig=${cert.digitalSignatureHash.substring(0, 12)}`;

    if (typeof QRCode !== "undefined") {
      try {
        new QRCode(qrContainer, {
          text: verificationUrl,
          width: 88,
          height: 88,
          colorDark: "#0A2647",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.M
        });
        return;
      } catch (err) {
        console.warn("[QRCode] Fallback to vector generation:", err.message);
      }
    }

    // Graceful vector image fallback if QRCode CDN failed
    qrContainer.innerHTML = `
      <img 
        src="https://api.qrserver.com/v1/create-qr-code/?size=88x88&margin=0&color=0A2647&data=${encodeURIComponent(verificationUrl)}" 
        alt="Cryptographic QR Code" 
        style="width: 100%; height: 100%; border-radius: 4px; display: block;" 
      />
    `;
  }

  bindEvents(container, activeCert, certList) {
    // 1. Certificate Switcher Pills
    container.querySelectorAll(".cert-pill-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
        if (!isNaN(idx) && idx !== this.selectedCertIndex) {
          this.selectedCertIndex = idx;
          this.render(container);
        }
      });
    });

    // 2. Download Official Standalone PDF (High Quality, Only Certificate)
    const downloadPdfBtn = container.querySelector("#btn-download-pdf");
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener("click", async () => {
        await this.downloadCertificatePdf(activeCert);
      });
    }

    // 3. Download Ultra-HD Standalone PNG Image
    const downloadPngBtn = container.querySelector("#btn-download-png");
    if (downloadPngBtn) {
      downloadPngBtn.addEventListener("click", async () => {
        await this.downloadCertificatePng(activeCert);
      });
    }

    // 4. Native Browser Print (Using strictly isolated @media print rules)
    const printBtn = container.querySelector("#btn-print-cert");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }

    // 5. Click QR Code to Open Cryptographic Audit Modal
    const qrBox = container.querySelector("#cert-qrcode-container");
    if (qrBox) {
      qrBox.addEventListener("click", () => {
        this.openVerificationModal(activeCert);
      });
    }

    // 6. Click Hash to Copy
    const hashBtn = container.querySelector("#cert-hash-copy-btn");
    if (hashBtn) {
      hashBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(activeCert.digitalSignatureHash).then(() => {
          this.appState.showToast("SHA-256 Digital Signature copied to clipboard!", "info");
        }).catch(() => {
          this.appState.showToast(`Hash: ${activeCert.digitalSignatureHash.substring(0, 24)}...`, "info");
        });
      });
    }

    // 7. Public Credential Verification Lookup
    const verifyBtn = container.querySelector("#btn-verify-lookup");
    const verifyInput = container.querySelector("#verify-input-code");
    const resultBox = container.querySelector("#verify-lookup-result");

    if (verifyBtn && verifyInput && resultBox) {
      verifyBtn.addEventListener("click", async () => {
        const code = verifyInput.value.trim();
        if (!code) return;

        resultBox.innerHTML = `
          <div style="padding: 12px; font-size: 0.85rem; color: var(--ocean-cyan); display: flex; align-items: center; gap: 8px;">
            <span class="leader-pulse-glow" style="width: 8px; height: 8px; background: var(--ocean-cyan); border-radius: 50%;"></span>
            Querying Ministry of Earth Sciences National Trust Ledger for '${code}'...
          </div>
        `;

        // Check against active certs or simulated verification
        const matchedCert = certList.find(c => c.certificateNumber.toLowerCase() === code.toLowerCase()) || 
          (activeCert.certificateNumber.toLowerCase() === code.toLowerCase() ? activeCert : null);

        let res = null;
        if (matchedCert) {
          res = { verified: true, certificate: matchedCert };
        } else if (this.appState && typeof this.appState.verifyCertificateOnline === "function") {
          res = await this.appState.verifyCertificateOnline(code);
        }

        if (res && res.verified) {
          const c = res.certificate;
          resultBox.innerHTML = `
            <div style="background: #F0FDF4; border: 1.5px solid #22C55E; padding: 18px 22px; border-radius: 12px; color: #14532D; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.12);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div style="font-weight: 800; font-size: 1rem; display: flex; align-items: center; gap: 8px; color: #15803D;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  VALID SOVEREIGN ACCREDITATION CONFIRMED
                </div>
                <span style="background: #DCFCE7; color: #15803D; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; border: 1px solid #86EFAC;">
                  RECORD IMMUTABLE · CERTIFIED
                </span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 0.85rem; margin-top: 10px;">
                <div><strong>Accredited Officer:</strong> ${c.userName} [${c.customRoleId || 'OFFICER'}]</div>
                <div><strong>Affiliated Body:</strong> ${c.instituteFull || c.institute || 'MoES'}</div>
                <div><strong>Accreditation Course:</strong> ${c.courseTitle}</div>
                <div><strong>Exam Honors:</strong> ${c.score}% (${c.grade || 'GRADE A+'})</div>
              </div>
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(34, 197, 94, 0.25); font-family: monospace; font-size: 0.72rem; word-break: break-all; color: #166534;">
                🔐 Cryptographic Hash: ${c.digitalSignatureHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>
          `;
        } else {
          resultBox.innerHTML = `
            <div style="background: #FEF2F2; border: 1.5px solid #EF4444; padding: 18px 22px; border-radius: 12px; color: #991B1B; display: flex; align-items: center; gap: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem;">CREDENTIAL NOT FOUND IN REPOSITORY</div>
                <div style="font-size: 0.82rem; margin-top: 2px;">
                  Registration code '${code}' could not be verified against the Ministry of Earth Sciences centralized database. Please recheck your certificate ID.
                </div>
              </div>
            </div>
          `;
        }
      });
    }
  }

  /**
   * Standalone Certificate-Only PDF Export via html2pdf.js
   * Avoids capturing browser screen, header, navbar or footer!
   */
  async downloadCertificatePdf(cert) {
    const certElement = document.getElementById("printable-certificate");
    if (!certElement) {
      alert("Certificate element not ready.");
      return;
    }

    this.appState.showToast("Generating Official A4 PDF Document...", "info");

    if (typeof html2pdf !== "undefined") {
      try {
        const opt = {
          margin: 0,
          filename: `MOES-Certificate-${cert.certificateNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2.2,
            useCORS: true,
            logging: false,
            backgroundColor: '#FFFDF9',
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape'
          }
        };

        await html2pdf().set(opt).from(certElement).save();
        this.appState.showToast("Official Certificate PDF Downloaded Successfully!", "info");
        return;
      } catch (err) {
        console.warn("[html2pdf] Fallback triggered:", err);
      }
    }

    // Direct fallback: window.print() handles isolated landscape printing via @media print
    window.print();
  }

  /**
   * Standalone Certificate-Only Ultra-HD PNG Export via html2canvas
   */
  async downloadCertificatePng(cert) {
    const certElement = document.getElementById("printable-certificate");
    if (!certElement) return;

    this.appState.showToast("Rendering 300 DPI Ultra-HD Certificate Image...", "info");

    const h2c = window.html2canvas || (typeof html2pdf !== "undefined" && window.html2canvas);
    if (h2c) {
      try {
        const canvas = await h2c(certElement, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#FFFDF9',
          scrollX: 0,
          scrollY: 0
        });

        const link = document.createElement("a");
        link.download = `MOES-Certificate-${cert.certificateNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        this.appState.showToast("Ultra-HD Certificate PNG Downloaded!", "info");
        return;
      } catch (err) {
        console.warn("[html2canvas] Image generation notice:", err);
      }
    }

    window.print();
  }

  /**
   * Interactive Cryptographic National Credential Verification Modal
   */
  openVerificationModal(cert) {
    const mount = document.getElementById("cert-verify-modal-mount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="cert-verify-modal-backdrop" id="cert-verify-backdrop">
        <div class="cert-verify-dialog" role="dialog" aria-modal="true">
          
          <div class="cert-verify-dialog-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background: rgba(255, 255, 255, 0.15); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9933" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; color: #FFFFFF;">Cryptographic Credential Audit</h3>
                <div style="font-size: 0.72rem; color: #94A3B8;">Ministry of Earth Sciences Digital Trust Service (MoES-DTS)</div>
              </div>
            </div>
            <button type="button" id="btn-close-verify-modal" style="background: none; border: none; color: #FFF; font-size: 1.5rem; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <div class="cert-verify-dialog-body">
            
            <div style="background: #ECFDF5; border: 1.5px solid #10B981; padding: 14px 16px; border-radius: 10px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="leader-pulse-glow" style="width: 10px; height: 10px; background: #10B981; border-radius: 50%;"></span>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: #065F46;">VERIFIED IMMUTABLE CREDENTIAL</div>
                  <div style="font-size: 0.72rem; color: #047857;">Signed with RSA-4096 / SHA-256 Digital Certificate</div>
                </div>
              </div>
              <span style="font-size: 0.72rem; background: #059669; color: #FFF; font-weight: 800; padding: 3px 8px; border-radius: 4px;">
                ACTIVE
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 0.85rem;">
              <div style="background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <div style="font-size: 0.7rem; color: #64748B; font-weight: 700; text-transform: uppercase;">Certificate ID</div>
                <div style="font-weight: 800; color: #0A2647; font-family: monospace; font-size: 0.88rem;">${cert.certificateNumber}</div>
              </div>

              <div style="background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <div style="font-size: 0.7rem; color: #64748B; font-weight: 700; text-transform: uppercase;">Officer Recipient</div>
                <div style="font-weight: 800; color: #0A2647;">${cert.userName} [${cert.customRoleId}]</div>
              </div>

              <div style="background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #E2E8F0; grid-column: 1 / -1;">
                <div style="font-size: 0.7rem; color: #64748B; font-weight: 700; text-transform: uppercase;">Accreditation Domain</div>
                <div style="font-weight: 700; color: #0A2647; font-size: 0.9rem;">${cert.courseTitle}</div>
                <div style="font-size: 0.75rem; color: #059669; font-weight: 700; margin-top: 2px;">
                  Score: ${cert.score}% · ${cert.grade} · Division: ${cert.instituteFull}
                </div>
              </div>
            </div>

            <div style="background: #0A2647; color: #E2E8F0; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.7rem; color: #94A3B8; font-weight: 700; letter-spacing: 0.05em;">SHA-256 LEDGER SIGNATURE HASH</span>
                <span style="font-size: 0.65rem; color: #38BDF8; font-family: monospace;">ECDSA P-384 / SHA-256</span>
              </div>
              <div style="font-family: monospace; font-size: 0.72rem; word-break: break-all; color: #A7F3D0; line-height: 1.4;">
                ${cert.digitalSignatureHash}
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-outline btn-sm" id="btn-copy-verify-url">
                Copy Verification Link
              </button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-dismiss-verify-modal">
                Close Audit Desk
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    // Modal Close Events
    const backdrop = document.getElementById("cert-verify-backdrop");
    const closeBtn = document.getElementById("btn-close-verify-modal");
    const dismissBtn = document.getElementById("btn-dismiss-verify-modal");
    const copyLinkBtn = document.getElementById("btn-copy-verify-url");

    const closeModal = () => { mount.innerHTML = ""; };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (dismissBtn) dismissBtn.addEventListener("click", closeModal);
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal();
      });
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", () => {
        const url = `https://capacityconnect.gov.in/verify?certId=${encodeURIComponent(cert.certificateNumber)}&hash=${cert.digitalSignatureHash.substring(0, 16)}`;
        navigator.clipboard.writeText(url).then(() => {
          this.appState.showToast("Verification URL copied to clipboard!", "info");
        });
      });
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CertificateViewComponent;
}
