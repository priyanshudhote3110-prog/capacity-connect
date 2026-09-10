/* ================================================================
   CAPACITY CONNECT — MAIN APPLICATION LOGIC
   Ministry of Earth Sciences (MoES), Govt. of India
   SIH 2026 | SIH26075
   ================================================================
   
   YEH FILE KYA HAI?
   Yeh file hamare puri website ki JavaScript logic hai.
   Isme navigation, course enrollment, quiz engine,
   certificate generation, admin dashboard — sab kuch hai.

   TEAM KE LIYE IMPORTANT NOTES:
   1. Har function ke upar Hindi+English comment hai
      ki woh kya karta hai aur kahan use hota hai.
   2. Security code simple rakha hai — no unnecessary
      complexity. Production mein JWT, bcrypt wagairah
      backend pe lagega.
   3. Data "data.js" file se aata hai (imported via
      <script> tag in HTML).
   4. localStorage mein state save hota hai taaki
      page refresh pe data na jaye.
   ================================================================ */


// ================================================================
// SECTION 1: APPLICATION STATE
// ================================================================
// "appState" ek central object hai jo poori app ki
// current halat (state) track karta hai.
// Jaise: kaunsa page active hai, kaunsa user logged in
// hai, quiz mein kaunsa question dikha raha hai, etc.
//
// Yeh React ke useState ya Vue ke data() jaisa concept hai,
// lekin simple vanilla JS mein.
// ================================================================

const appState = {
  currentPage: 'home',        // Abhi kaunsa page dikh raha hai ("home", "courses", "learn", etc.)
  currentRole: 'learner',     // Abhi kaunsa role selected hai ("learner", "trainer", "admin")
  currentUser: null,          // Current logged-in user ka data object
  currentLang: 'EN',          // Language: "EN" (English) ya "HI" (Hindi)

  // Quiz / Examination State
  quiz: {
    currentIndex: 0,          // Abhi kaunsa question dikh raha hai (0-based index)
    answers: {},              // User ke answers store hote hain { 0: 1, 1: 0, 2: 3, ... }
    isSubmitted: false,       // Kya quiz submit ho chuka hai?
    score: 0,                 // Quiz ka final score (percentage)
    timerSeconds: 600         // Timer: 10 minutes = 600 seconds
  },

  // Timer ka reference (clearInterval ke liye)
  timerInterval: null
};


// ================================================================
// SECTION 2: APP INITIALIZATION
// ================================================================
// Jab page load hota hai tab yeh function chalta hai.
// 1. Default user set karta hai (Learner role)
// 2. localStorage se saved data load karta hai (agar hai toh)
// 3. Courses render karta hai
// 4. Lucide icons initialize karta hai
// ================================================================

function initializeApp() {
  // Step 1: Default user set karo (Learner)
  // "DEMO_USERS" object data.js file mein defined hai
  appState.currentUser = DEMO_USERS.learner;

  // Step 2: LocalStorage se saved state load karo (agar pehle se save hai)
  // Yeh ensure karta hai ki page refresh pe enrollment & progress na jaye
  loadSavedState();

  // Step 3: UI update karo — user ka naam, designation dikhao
  updateUserBadge();

  // Step 4: Home page ke courses render karo
  renderCourseCatalog(COURSES_DATABASE);

  // Step 5: Lucide icons ko activate karo
  // (Lucide ek icon library hai jo <i data-lucide="icon-name"> se icons dikhati hai)
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Step 6: Home page ko active set karo
  navigateTo('home');
}


// ================================================================
// SECTION 3: LOCAL STORAGE (DATA PERSISTENCE)
// ================================================================
// Browser mein data save karna aur load karna.
//
// KYA HOTA HAI AGAR LOCALSTORAGE USE NA KAREIN?
// Har page refresh pe sara progress, enrollment, quiz
// answers sab ud jayega. LocalStorage se data browser
// mein permanently save rehta hai.
//
// SECURITY NOTE (SIMPLE):
// localStorage mein sensitive data (passwords, tokens)
// nahi rakhna chahiye production mein. Yahan sirf
// progress aur enrollment data save ho raha hai
// jo sensitive nahi hai.
// ================================================================

/**
 * saveState() — Current enrollment aur progress data ko localStorage mein save karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - Jab user kisi course mein enroll karta hai (enrollInCourse function mein)
 * - Jab quiz submit hota hai (submitExamination function mein)
 *
 * KAISE KAAM KARTA HAI:
 * 1. COURSES_DATABASE array se sirf enrollment-related fields extract karta hai
 * 2. JSON string mein convert karke localStorage mein store karta hai
 */
function saveState() {
  // Sirf zaroori fields save karo (poora object nahi — storage bacha hai)
  const enrollmentData = COURSES_DATABASE.map(function(course) {
    return {
      id: course.id,
      enrolled: course.enrolled,
      progress: course.progress
    };
  });

  // "cc_enrollments" key ke saath localStorage mein save karo
  // JSON.stringify() object ko string mein convert karta hai (localStorage sirf strings store karta hai)
  localStorage.setItem('cc_enrollments', JSON.stringify(enrollmentData));

  // User ke knowledge points bhi save karo
  localStorage.setItem('cc_user_kp', appState.currentUser.knowledgePoints);
}


/**
 * loadSavedState() — Pehle se saved data localStorage se load karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - App initialize hone pe (initializeApp function mein)
 *
 * KAISE KAAM KARTA HAI:
 * 1. localStorage se "cc_enrollments" key ka data read karta hai
 * 2. Agar data milta hai toh COURSES_DATABASE mein wapas merge karta hai
 */
function loadSavedState() {
  // localStorage se saved enrollment data nikalo
  const saved = localStorage.getItem('cc_enrollments');

  // Agar kuch save tha toh wapas courses mein apply karo
  if (saved) {
    try {
      const enrollmentData = JSON.parse(saved);  // String ko wapas object mein convert karo

      // Har saved course ka data original COURSES_DATABASE mein merge karo
      enrollmentData.forEach(function(savedCourse) {
        const originalCourse = COURSES_DATABASE.find(function(c) {
          return c.id === savedCourse.id;
        });

        if (originalCourse) {
          originalCourse.enrolled = savedCourse.enrolled;
          originalCourse.progress = savedCourse.progress;
        }
      });
    } catch (error) {
      // Agar data corrupt hai toh error silently ignore karo
      // Console mein dikhao taaki debugging mein madad mile
      console.warn('Saved state loading mein error aaya:', error);
    }
  }

  // Knowledge Points bhi load karo
  const savedKP = localStorage.getItem('cc_user_kp');
  if (savedKP && appState.currentUser) {
    appState.currentUser.knowledgePoints = parseInt(savedKP, 10);
  }
}


// ================================================================
// SECTION 4: PAGE NAVIGATION / ROUTING
// ================================================================
// Single-page application mein saare pages ek hi HTML
// file mein hain. Sirf ek page visible hota hai, baaki
// hidden rehte hain. navigateTo() function page switching
// handle karta hai.
//
// PRODUCTION MEIN:
// React Router ya Express routing use hogi.
// Yahan simple CSS class toggle se kaam chal raha hai.
// ================================================================

/**
 * navigateTo(pageId) — Specified page ko visible karta hai, baaki ko hide karta hai.
 *
 * @param {string} pageId — Page ka ID jisko dikhana hai (e.g., "home", "courses", "learn", "quiz", "admin", "verify", "leaderboard")
 *
 * KAHAN USE HOTA HAI:
 * - Navigation tab buttons pe click karne se
 * - enrollInCourse() ke baad ("learn" page pe le jaata hai)
 * - submitExamination() ke baad ("quiz" se certificate pe le jaata hai)
 *
 * KAISE KAAM KARTA HAI:
 * 1. Sabhi page sections se "active" class hata deta hai (sab hide ho jaate hain)
 * 2. Target page section ko "active" class de deta hai (woh visible ho jaata hai)
 * 3. Navigation tabs ka active styling update karta hai
 * 4. Page ko smoothly top pe scroll karta hai
 */
function navigateTo(pageId) {
  // State mein current page update karo
  appState.currentPage = pageId;

  // STEP 1: Sabhi page sections ko hide karo
  var allPages = document.querySelectorAll('.page-section');
  allPages.forEach(function(page) {
    page.classList.remove('active');
  });

  // STEP 2: Target page ko show karo
  var targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // STEP 3: Navigation tabs ka styling update karo
  // Active tab ko blue highlight dena hai, baaki ko normal
  var allTabs = document.querySelectorAll('.nav-tab');
  allTabs.forEach(function(tab) {
    // "data-page" attribute se check karo ki yeh tab kis page ke liye hai
    if (tab.getAttribute('data-page') === pageId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // STEP 4: Page ka top pe smooth scroll karo
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // STEP 5: Lucide icons ko refresh karo (naye page ke icons render karne ke liye)
  refreshIcons();
}


// ================================================================
// SECTION 5: ROLE SWITCHING (DEMO PERSONA CHANGER)
// ================================================================
// SIH ke judges ko different roles test karne dena hai.
// Jab role switch hota hai, user ka naam, designation,
// avatar, aur default page change hota hai.
//
// SECURITY NOTE (SIMPLE):
// Yeh sirf demo ke liye hai. Production mein role
// backend se JWT token ke andar aata hai. Client-side
// role switching nahi hoti — woh security vulnerability hai.
// ================================================================

/**
 * switchRole(role) — Demo persona switch karta hai.
 *
 * @param {string} role — "learner", "trainer", ya "admin"
 *
 * KAHAN USE HOTA HAI:
 * - Top bar ke role selector dropdown se
 *
 * KAISE KAAM KARTA HAI:
 * 1. appState.currentUser ko naye role ke user se replace karta hai
 * 2. Header mein naam aur designation update karta hai
 * 3. Appropriate default page pe navigate karta hai:
 *    - Learner → Home page
 *    - Trainer → Classroom page
 *    - Admin   → Skill Heatmap page
 */
function switchRole(role) {
  // Role validate karo — sirf allowed values accept karo
  if (!DEMO_USERS[role]) {
    console.warn('Invalid role:', role);
    return;
  }

  // State update karo
  appState.currentRole = role;
  appState.currentUser = DEMO_USERS[role];

  // UI update karo — user badge mein naam/designation dikhao
  updateUserBadge();

  // Role ke hisaab se default page pe le jao
  if (role === 'learner') {
    navigateTo('home');
  } else if (role === 'trainer') {
    navigateTo('learn');
  } else if (role === 'admin') {
    navigateTo('admin');
  }
}


/**
 * updateUserBadge() — Header mein user ka naam, designation, aur avatar update karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - initializeApp() mein (pehli baar load pe)
 * - switchRole() mein (role change hone pe)
 */
function updateUserBadge() {
  var user = appState.currentUser;
  if (!user) return;

  // DOM elements mein data set karo
  var nameEl = document.getElementById('userDisplayName');
  var designEl = document.getElementById('userDisplayDesignation');
  var avatarEl = document.getElementById('userAvatarInitials');

  if (nameEl) nameEl.textContent = user.name;
  if (designEl) designEl.textContent = user.designation + ' | ID: ' + user.id;
  if (avatarEl) avatarEl.textContent = user.avatarInitials;
}


// ================================================================
// SECTION 6: LANGUAGE TOGGLE (BILINGUAL SUPPORT)
// ================================================================
// Rajbhasha (Official Language) mandate ke tahat
// govt portals bilingual hone chahiye. Yeh toggle
// English aur Hindi ke beech switch karta hai.
//
// PRODUCTION MEIN: i18n (internationalization) library
// jaise react-intl ya i18next use hogi poore
// content translation ke liye.
// ================================================================

/**
 * toggleLanguage() — English aur Hindi ke beech switch karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - Top bar ke "हिन्दी / English" button pe click se
 */
function toggleLanguage() {
  var btn = document.getElementById('langToggleBtn');

  if (appState.currentLang === 'EN') {
    appState.currentLang = 'HI';
    if (btn) btn.textContent = 'English';
    // Demo alert — production mein poora page translate hoga
    alert('भाषा बदली गई: हिन्दी (राजभाषा संस्करण सक्रिय)\nNote: Full Hindi translation will be available in production version.');
  } else {
    appState.currentLang = 'EN';
    if (btn) btn.textContent = 'हिन्दी';
  }
}


// ================================================================
// SECTION 7: FONT SIZE ACCESSIBILITY
// ================================================================
// NIC (National Informatics Centre) accessibility
// guidelines ke mutaabiq, govt websites mein font
// resize ka option hona chahiye.
// ================================================================

/**
 * adjustFontSize(delta) — Body ka font size badhata ya ghatata hai.
 *
 * @param {number} delta — Kitna change karna hai:
 *   -1 = chhota karo
 *    0 = default (14px) pe reset karo
 *   +1 = bada karo
 *
 * KAHAN USE HOTA HAI:
 * - Top bar ke A-, A, A+ buttons pe click se
 */
function adjustFontSize(delta) {
  // Current font size nikalo (browser se computed style read karo)
  var currentSize = parseFloat(window.getComputedStyle(document.body).fontSize);

  if (delta === 0) {
    // Reset to default
    document.body.style.fontSize = '14px';
  } else {
    // 1px increment/decrement karo
    document.body.style.fontSize = (currentSize + delta) + 'px';
  }
}


// ================================================================
// SECTION 8: COURSE CATALOG RENDERING
// ================================================================
// Course catalog page pe courses ki list dikhana.
// Search aur institute filter ke saath.
// ================================================================

/**
 * renderCourseCatalog(courses) — Given courses array ko HTML cards mein convert karke page pe dikhata hai.
 *
 * @param {Array} courses — Courses ka array (COURSES_DATABASE ya filtered subset)
 *
 * KAHAN USE HOTA HAI:
 * - initializeApp() mein (puri list dikhane ke liye)
 * - applyCatalogFilters() mein (filtered results dikhane ke liye)
 *
 * KAISE KAAM KARTA HAI:
 * 1. Container element ko dhundhta hai
 * 2. Har course ke liye ek HTML card banata hai (createElement)
 * 3. Card mein course code, title, institute badge, description, aur enroll button lagata hai
 * 4. Agar user already enrolled hai toh progress bar dikhata hai "Enroll" button ki jagah
 */
function renderCourseCatalog(courses) {
  var container = document.getElementById('catalogGrid');
  if (!container) return;

  // Pehle purane cards hatao (clean start)
  container.innerHTML = '';

  // Har course ke liye ek card banao
  courses.forEach(function(course) {
    var card = document.createElement('div');
    card.className = 'course-card';

    // Card ka HTML content build karo
    var html = '';

    // TOP ROW: Course code + Institute badge
    html += '<div class="flex-between mb-2">';
    html += '  <span class="course-code-badge">' + course.code + '</span>';
    html += '  <span class="course-inst-badge">' + course.institute + '</span>';
    html += '</div>';

    // Course title
    html += '<h3 class="course-title">' + course.title + '</h3>';

    // Short description
    html += '<p class="course-desc">' + course.description + '</p>';

    // Meta information (category, eligibility, duration)
    html += '<div class="course-meta">';
    html += '  <div><strong>Category:</strong> ' + course.category + '</div>';
    html += '  <div><strong>Eligibility:</strong> ' + course.eligibility + '</div>';
    html += '  <div><strong>Duration:</strong> ' + course.durationHours + ' Hours (' + course.lessonsCount + ' Lessons)</div>';

    // Agar mandatory hai toh deadline dikhao
    if (course.mandatory) {
      html += '  <div style="color: var(--color-warning); font-weight: 700;">⚠ Mandatory | Deadline: ' + formatDate(course.deadline) + '</div>';
    }
    html += '</div>';

    // BOTTOM: Enroll button ya Progress bar
    html += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border-light);">';

    if (course.enrolled) {
      // Already enrolled — progress bar dikhao
      html += '<div class="progress-container">';
      html += '  <div class="progress-header">';
      html += '    <span>Completion Status</span>';
      html += '    <span class="progress-value">' + course.progress + '%</span>';
      html += '  </div>';
      html += '  <div class="progress-track">';
      html += '    <div class="progress-fill" style="width: ' + course.progress + '%;"></div>';
      html += '  </div>';
      html += '</div>';
      html += '<button class="btn btn-primary btn-sm" style="width: 100%; margin-top: 8px;" onclick="navigateTo(\'learn\')">';
      html += '  Open Classroom';
      html += '</button>';
    } else {
      // Not enrolled — Enroll button dikhao
      html += '<button class="btn btn-secondary" style="width: 100%;" onclick="enrollInCourse(\'' + course.id + '\')">';
      html += '  Enroll in this Course';
      html += '</button>';
    }

    html += '</div>';

    card.innerHTML = html;
    container.appendChild(card);
  });

  // Icons refresh karo (naye cards mein agar icons hain toh)
  refreshIcons();
}


/**
 * applyCatalogFilters() — Search bar aur institute dropdown ke filter apply karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - Search input mein typing karne pe (oninput event)
 * - Institute dropdown change karne pe (onchange event)
 *
 * KAISE KAAM KARTA HAI:
 * 1. Search text aur selected institute value read karta hai
 * 2. COURSES_DATABASE ko filter karta hai (jo match kare woh dikhao)
 * 3. Filtered results ko renderCourseCatalog() ko pass karta hai
 */
function applyCatalogFilters() {
  // Search text nikalo (lowercase mein compare karne ke liye)
  var searchInput = document.getElementById('catalogSearchInput');
  var instSelect = document.getElementById('catalogInstSelect');

  var searchText = searchInput ? searchInput.value.toLowerCase() : '';
  var selectedInst = instSelect ? instSelect.value : 'ALL';

  // Courses ko filter karo
  var filtered = COURSES_DATABASE.filter(function(course) {
    // Search text match check — title, code, ya description mein dhundho
    var matchesSearch = (
      course.title.toLowerCase().indexOf(searchText) !== -1 ||
      course.code.toLowerCase().indexOf(searchText) !== -1 ||
      course.description.toLowerCase().indexOf(searchText) !== -1
    );

    // Institute filter check — "ALL" matlab sab dikhao
    var matchesInstitute = (selectedInst === 'ALL' || course.institute === selectedInst);

    // Dono conditions true honi chahiye
    return matchesSearch && matchesInstitute;
  });

  // Filtered results render karo
  renderCourseCatalog(filtered);
}


/**
 * filterByInstitute(instCode) — Home page ke institute cards se course catalog filter karta hai.
 *
 * @param {string} instCode — Institute ka code (e.g., "IMD", "INCOIS", "NIOT")
 *
 * KAHAN USE HOTA HAI:
 * - Home page ke institute filter buttons pe click se
 *
 * KAISE KAAM KARTA HAI:
 * 1. Courses page pe navigate karta hai
 * 2. Institute dropdown ko set karta hai
 * 3. Filter apply karta hai
 */
function filterByInstitute(instCode) {
  // Pehle courses page pe jao
  navigateTo('courses');

  // Dropdown ko update karo
  var instSelect = document.getElementById('catalogInstSelect');
  if (instSelect) {
    instSelect.value = instCode;
  }

  // Filter apply karo
  applyCatalogFilters();
}


// ================================================================
// SECTION 9: COURSE ENROLLMENT
// ================================================================
// Jab user "Enroll" button click kare toh course mein
// register ho jaye aur classroom pe redirect ho.
// ================================================================

/**
 * enrollInCourse(courseId) — User ko course mein enroll karta hai.
 *
 * @param {string} courseId — Course ka unique ID (e.g., "course-001")
 *
 * KAHAN USE HOTA HAI:
 * - Course catalog ke "Enroll in this Course" button pe click se
 *
 * KAISE KAAM KARTA HAI:
 * 1. COURSES_DATABASE mein course dhundhta hai
 * 2. enrolled = true aur progress = 10 set karta hai (10% = just started)
 * 3. State save karta hai (localStorage mein)
 * 4. User ko alert deta hai aur classroom page pe le jaata hai
 *
 * PRODUCTION MEIN:
 * - Backend API call hogi: POST /api/courses/:id/enroll
 * - Server enrollment record MongoDB mein create karega
 */
function enrollInCourse(courseId) {
  // Course dhundho
  var course = COURSES_DATABASE.find(function(c) {
    return c.id === courseId;
  });

  if (!course) {
    console.error('Course nahi mila:', courseId);
    return;
  }

  // Enroll karo
  course.enrolled = true;
  course.progress = 10;  // 10% = enrollment confirmed, started

  // State save karo (refresh pe data bana rahe)
  saveState();

  // User ko batao
  alert('Enrollment Confirmed!\n\nCourse: ' + course.title + '\n\nYou are being redirected to the learning desk.');

  // Catalog re-render karo (button update hone ke liye) aur classroom pe jao
  renderCourseCatalog(COURSES_DATABASE);
  navigateTo('learn');
}


// ================================================================
// SECTION 10: VIDEO PLAYER (SIMULATED)
// ================================================================
// Classroom page pe video player ka play/pause toggle.
// Actual video embed nahi hai — yeh visual simulation hai.
// ================================================================

/**
 * toggleVideoPlayback() — Video play/pause toggle karta hai (visual demo).
 *
 * KAHAN USE HOTA HAI:
 * - Classroom page ke center play button pe click se
 *
 * NOTE: Yeh sirf icon change karta hai (play → pause aur wapas).
 * Actual video streaming production mein implement hogi
 * Cloudinary ya AWS MediaConvert ke saath.
 */
var isVideoPlaying = false;

function toggleVideoPlayback() {
  isVideoPlaying = !isVideoPlaying;

  var icon = document.getElementById('videoPlayIcon');
  if (icon) {
    // Play/Pause icon switch karo
    icon.setAttribute('data-lucide', isVideoPlaying ? 'pause' : 'play');
    refreshIcons();
  }

  if (isVideoPlaying) {
    // Demo feedback — production mein actual video chalega
    console.log('Video playback started — attendance timestamp logged.');
  }
}


// ================================================================
// SECTION 11: CLASSROOM CONTENT TABS
// ================================================================
// Classroom mein Notes, Q&A, aur Downloads ke beech
// switch karne ke liye tabs.
// ================================================================

/**
 * switchContentTab(tabName) — Classroom ke content tabs mein switch karta hai.
 *
 * @param {string} tabName — Tab ka naam: "notes", "qa", ya "downloads"
 *
 * KAHAN USE HOTA HAI:
 * - Classroom page ke tab buttons pe click se
 *
 * KAISE KAAM KARTA HAI:
 * 1. Sabhi tab buttons se "active" class hatata hai
 * 2. Sabhi tab panels ko hide karta hai
 * 3. Selected tab button aur panel ko active karta hai
 */
function switchContentTab(tabName) {
  // Tab buttons update karo
  var tabButtons = document.querySelectorAll('.content-tab-btn');
  tabButtons.forEach(function(btn) {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Tab panels update karo
  var tabPanels = document.querySelectorAll('.tab-panel');
  tabPanels.forEach(function(panel) {
    if (panel.getAttribute('data-tab') === tabName) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}


// ================================================================
// SECTION 12: EXAMINATION / QUIZ ENGINE
// ================================================================
// Auto-graded quiz system — 5 questions, countdown
// timer, auto-scoring, aur pass/fail decision.
//
// YEH SABSE IMPORTANT MODULE HAI SIH DEMO KE LIYE!
// ================================================================

/**
 * startExamination() — Quiz session start karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - Home page ka "Take Final Assessment" button
 * - Classroom page ka "Launch Final Examination" button
 *
 * KAISE KAAM KARTA HAI:
 * 1. Quiz state reset karta hai (fresh start)
 * 2. Quiz page pe navigate karta hai
 * 3. Pehla question render karta hai
 * 4. Countdown timer start karta hai (10 minutes)
 */
function startExamination() {
  // Quiz state reset karo — fresh attempt
  appState.quiz.currentIndex = 0;
  appState.quiz.answers = {};
  appState.quiz.isSubmitted = false;
  appState.quiz.score = 0;
  appState.quiz.timerSeconds = 600;  // 10 min = 600 seconds

  // Quiz page pe jao
  navigateTo('quiz');

  // Pehla question dikhao
  renderQuizQuestion();

  // Timer start karo
  startExamTimer();
}


/**
 * renderQuizQuestion() — Current question aur uske options ko screen pe dikhata hai.
 *
 * KAHAN USE HOTA HAI:
 * - startExamination() mein (pehla question)
 * - nextQuizQuestion() mein (next question pe jaane se)
 * - prevQuizQuestion() mein (previous question pe jaane se)
 * - selectQuizOption() mein (option select karne ke baad re-render)
 *
 * KAISE KAAM KARTA HAI:
 * 1. QUIZ_BANK array se current index ka question nikalte hain
 * 2. Question text DOM mein set karte hain
 * 3. Options ko dynamically create karte hain
 * 4. Agar user ne pehle se answer select kiya tha toh woh highlighted dikhta hai
 * 5. Previous/Next/Submit buttons ki visibility manage karte hain
 */
function renderQuizQuestion() {
  var idx = appState.quiz.currentIndex;
  var question = QUIZ_BANK[idx];
  var totalQuestions = QUIZ_BANK.length;

  // Question number indicator update karo ("Question 2 of 5")
  var numIndicator = document.getElementById('questionNumber');
  if (numIndicator) {
    numIndicator.textContent = 'Question ' + (idx + 1) + ' of ' + totalQuestions;
  }

  // Question text update karo
  var questionTextEl = document.getElementById('questionText');
  if (questionTextEl) {
    questionTextEl.textContent = question.q;
  }

  // Options container mein options render karo
  var optionsContainer = document.getElementById('optionsContainer');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';  // Pehle purane options hatao

    question.options.forEach(function(optionText, optIndex) {
      // Check karo ki yeh option pehle se selected hai ya nahi
      var isSelected = (appState.quiz.answers[idx] === optIndex);

      // Option row element banao
      var optDiv = document.createElement('div');
      optDiv.className = 'option-row' + (isSelected ? ' selected' : '');

      // Option text set karo (A, B, C, D prefix ke saath)
      var prefix = String.fromCharCode(65 + optIndex);  // 0→A, 1→B, 2→C, 3→D
      optDiv.innerHTML = '<span>' + prefix + '. ' + optionText + '</span>' +
                          '<span class="option-radio"></span>';

      // Click event — jab option pe click ho toh select karo
      optDiv.addEventListener('click', function() {
        selectQuizOption(optIndex);
      });

      optionsContainer.appendChild(optDiv);
    });
  }

  // Previous/Next/Submit buttons manage karo
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var submitBtn = document.getElementById('submitBtn');

  // Previous button: Pehle question pe disable
  if (prevBtn) {
    prevBtn.disabled = (idx === 0);
    prevBtn.style.opacity = (idx === 0) ? '0.4' : '1';
  }

  // Last question pe: "Next" hide karo, "Submit" dikhao
  if (nextBtn && submitBtn) {
    if (idx === totalQuestions - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
  }
}


/**
 * selectQuizOption(optionIndex) — User ka selected answer record karta hai.
 *
 * @param {number} optionIndex — Selected option ka index (0-3)
 *
 * KAHAN USE HOTA HAI:
 * - Quiz option rows pe click se (event listener renderQuizQuestion mein lagta hai)
 *
 * KAISE KAAM KARTA HAI:
 * 1. Current question ke liye user ka answer appState.quiz.answers mein save karta hai
 * 2. Question ko re-render karta hai (selected option highlight dikhane ke liye)
 */
function selectQuizOption(optionIndex) {
  // Answer record karo
  appState.quiz.answers[appState.quiz.currentIndex] = optionIndex;

  // Re-render karo (highlight update ke liye)
  renderQuizQuestion();
}


/**
 * nextQuizQuestion() — Next question pe forward karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - Quiz page ka "Save & Next" button
 */
function nextQuizQuestion() {
  if (appState.quiz.currentIndex < QUIZ_BANK.length - 1) {
    appState.quiz.currentIndex++;
    renderQuizQuestion();
  }
}


/**
 * prevQuizQuestion() — Previous question pe wapas jaata hai.
 *
 * KAHAN USE HOTA HAI:
 * - Quiz page ka "Previous" button
 */
function prevQuizQuestion() {
  if (appState.quiz.currentIndex > 0) {
    appState.quiz.currentIndex--;
    renderQuizQuestion();
  }
}


/**
 * startExamTimer() — 10-minute countdown timer start karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - startExamination() function mein
 *
 * KAISE KAAM KARTA HAI:
 * 1. setInterval se har 1 second pe timer value ghatata hai
 * 2. Timer display (MM:SS format) update karta hai
 * 3. Jab timer 0 pe pahunche toh auto-submit karta hai
 * 4. Last 2 minutes mein timer red/warning color mein dikhta hai
 */
function startExamTimer() {
  // Pehle se koi timer chal raha ho toh band karo
  if (appState.timerInterval) {
    clearInterval(appState.timerInterval);
  }

  // Har 1 second pe chalne wala interval set karo
  appState.timerInterval = setInterval(function() {
    appState.quiz.timerSeconds--;

    // Timer display update karo (seconds ko MM:SS format mein)
    var minutes = Math.floor(appState.quiz.timerSeconds / 60);
    var seconds = appState.quiz.timerSeconds % 60;
    var timeString = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

    var timerDisplay = document.getElementById('examTimerDisplay');
    if (timerDisplay) {
      timerDisplay.textContent = timeString;

      // Last 2 minutes mein warning color
      if (appState.quiz.timerSeconds <= 120) {
        timerDisplay.style.color = '#ef4444';  // Red color for urgency
      }
    }

    // Timer khatam — auto submit!
    if (appState.quiz.timerSeconds <= 0) {
      clearInterval(appState.timerInterval);
      alert('Time is up! Your examination is being auto-submitted.');
      submitExamination();
    }
  }, 1000);  // 1000ms = 1 second
}


/**
 * submitExamination() — Quiz submit karta hai, score calculate karta hai, aur result dikhata hai.
 *
 * KAHAN USE HOTA HAI:
 * - Quiz page ka "Submit Examination" button
 * - Auto-submit jab timer 0 pe pahunche
 *
 * KAISE KAAM KARTA HAI:
 * 1. Timer band karta hai
 * 2. Har question ke user answer ko correct answer se compare karta hai
 * 3. Percentage score calculate karta hai
 * 4. Agar score >= 60% → PASS: Certificate dikhata hai + knowledge points award karta hai
 * 5. Agar score < 60%  → FAIL: Re-attempt message dikhata hai
 *
 * SCORING LOGIC:
 * - Har sahi answer = 1 mark
 * - Koi negative marking nahi
 * - Pass percentage = 60% (3 out of 5 minimum)
 * - Actual production mein yeh 75% hogi (ministry standard)
 */
function submitExamination() {
  // Timer band karo
  if (appState.timerInterval) {
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
  }

  // Correct answers count karo
  var correctCount = 0;
  QUIZ_BANK.forEach(function(question, index) {
    // User ka answer aur correct answer compare karo
    if (appState.quiz.answers[index] === question.correct) {
      correctCount++;
    }
  });

  // Percentage calculate karo (round off karo)
  var scorePercent = Math.round((correctCount / QUIZ_BANK.length) * 100);
  appState.quiz.score = scorePercent;
  appState.quiz.isSubmitted = true;

  // RESULT LOGIC: Pass ya Fail?
  if (scorePercent >= 60) {
    // ✅ PASSED — Certificate generate karo

    // Knowledge Points award karo (+150 for passing)
    if (appState.currentUser) {
      appState.currentUser.knowledgePoints += 150;
    }

    // Certificate data update karo
    DEFAULT_CERTIFICATE.score = scorePercent;
    DEFAULT_CERTIFICATE.recipientName = appState.currentUser ? appState.currentUser.name : 'Candidate';

    // State save karo
    saveState();

    // Success alert dikhao
    alert(
      '🎓 Examination Result\n\n' +
      'Score: ' + scorePercent + '% (' + correctCount + '/' + QUIZ_BANK.length + ' correct)\n' +
      'Result: QUALIFIED (Passed)\n\n' +
      'Your official digital certificate has been issued.\n' +
      '+150 Knowledge Points awarded!'
    );

    // Certificate modal open karo
    openCertificateModal();

  } else {
    // ❌ FAILED — Re-attempt batao
    alert(
      'Examination Result\n\n' +
      'Score: ' + scorePercent + '% (' + correctCount + '/' + QUIZ_BANK.length + ' correct)\n' +
      'Result: Did not meet qualifying threshold (60%)\n\n' +
      'Please review Module 2 (Dual-Pol Interpretation) and re-attempt the examination.'
    );

    // Home page pe wapas le jao
    navigateTo('home');
  }
}


// ================================================================
// SECTION 13: DIGITAL CERTIFICATE
// ================================================================
// Government-style certificate dikhana aur usmein
// QR code generate karna jisse certificate verify ho sake.
// ================================================================

/**
 * openCertificateModal() — Certificate modal window ko visible karta hai + QR code generate karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - submitExamination() mein jab user pass kare
 * - "View Certificate" links pe click se
 * - Certificate verification page se "View Official Certificate" button
 *
 * KAISE KAAM KARTA HAI:
 * 1. Modal overlay ko visible karta hai (CSS class toggle)
 * 2. Certificate ke fields mein data fill karta hai (naam, score, course title)
 * 3. QRCode.js library se dynamic QR code generate karta hai
 *
 * QR CODE KYA HAI?
 * QR code ek 2D barcode hota hai jise phone camera se scan karke
 * verification URL pe directly pahunch sakte hain.
 * Library: qrcode.js (CDN se load hai HTML mein)
 */
function openCertificateModal() {
  var modal = document.getElementById('certificateModal');
  if (modal) {
    modal.classList.add('visible');
  }

  // Certificate fields mein data fill karo
  var nameEl = document.getElementById('certRecipientName');
  var designEl = document.getElementById('certRecipientDesig');
  var scoreEl = document.getElementById('certScoreValue');
  var courseEl = document.getElementById('certCourseTitle');
  var uuidEl = document.getElementById('certUUID');

  if (nameEl) nameEl.textContent = DEFAULT_CERTIFICATE.recipientName;
  if (designEl) designEl.textContent = DEFAULT_CERTIFICATE.recipientDesignation;
  if (scoreEl) scoreEl.textContent = DEFAULT_CERTIFICATE.score + '%';
  if (courseEl) courseEl.textContent = DEFAULT_CERTIFICATE.courseTitle;
  if (uuidEl) uuidEl.textContent = DEFAULT_CERTIFICATE.id;

  // QR Code generate karo
  generateCertificateQR(DEFAULT_CERTIFICATE.verificationUrl);

  refreshIcons();
}


/**
 * closeCertificateModal() — Certificate modal ko band karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - Modal ke X (close) button pe click se
 */
function closeCertificateModal() {
  var modal = document.getElementById('certificateModal');
  if (modal) {
    modal.classList.remove('visible');
  }
}


/**
 * generateCertificateQR(url) — Certificate ke andar QR code image generate karta hai.
 *
 * @param {string} url — QR code mein encode karne wala URL
 *
 * KAHAN USE HOTA HAI:
 * - openCertificateModal() mein
 *
 * KAISE KAAM KARTA HAI:
 * 1. QR code container element ko dhundhta hai
 * 2. Pehle se koi QR hai toh hatata hai
 * 3. QRCode library se naya QR generate karta hai
 *
 * DEPENDENCY:
 * qrcode.js library (HTML mein CDN se loaded)
 */
function generateCertificateQR(url) {
  var container = document.getElementById('certQRContainer');
  if (!container) return;

  // Purana QR hatao
  container.innerHTML = '';

  // Naya QR banao (agar library available hai)
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: url,
      width: 64,
      height: 64,
      colorDark: '#0b2545',     // QR dots ka color (navy blue)
      colorLight: '#ffffff',     // QR background (white)
      correctLevel: QRCode.CorrectLevel.M   // Error correction level: Medium
    });
  } else {
    // Agar library load nahi hui toh placeholder dikhao
    container.textContent = '[QR Code]';
  }
}


// ================================================================
// SECTION 14: PUBLIC CERTIFICATE VERIFICATION
// ================================================================
// Koi bhi (public) certificate ID dalke verify kar
// sake ki yeh asli certificate hai ya fake.
// ================================================================

/**
 * verifyCertificate() — Certificate ID enter karke verification result dikhata hai.
 *
 * KAHAN USE HOTA HAI:
 * - Verify Certificate page ka "Verify" button
 *
 * KAISE KAAM KARTA HAI:
 * 1. Input field se certificate ID read karta hai
 * 2. Demo mein hum sirf default certificate ID match karte hain
 *    (production mein backend API call hogi)
 * 3. Match ho toh "Verified" result dikhata hai
 * 4. Match na ho toh "Not Found" dikhata hai
 *
 * PRODUCTION MEIN:
 * - GET /api/certificates/:certId endpoint call hogi
 * - Response mein certificate ka poora data aayega
 * - Blockchain ya SHA-256 hash verify hoga server pe
 */
function verifyCertificate() {
  var input = document.getElementById('certVerifyInput');
  var resultBox = document.getElementById('verifyResultBox');

  if (!input || !resultBox) return;

  var enteredId = input.value.trim();

  if (enteredId === DEFAULT_CERTIFICATE.id) {
    // Certificate found — verified!
    resultBox.style.display = 'block';
    resultBox.innerHTML =
      '<div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--color-success);">' +
      '  <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>' +
      '  <span>Certificate Status: Authenticated & Active</span>' +
      '</div>' +
      '<div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 8px; line-height: 1.8;">' +
      '  <div><strong>Recipient:</strong> ' + DEFAULT_CERTIFICATE.recipientName + '</div>' +
      '  <div><strong>Competency:</strong> ' + DEFAULT_CERTIFICATE.courseTitle + '</div>' +
      '  <div><strong>Score:</strong> ' + DEFAULT_CERTIFICATE.score + '%</div>' +
      '  <div><strong>Issue Date:</strong> ' + DEFAULT_CERTIFICATE.issueDate + '</div>' +
      '</div>' +
      '<button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="openCertificateModal()">' +
      '  View Official Certificate Copy' +
      '</button>';

    refreshIcons();
  } else if (enteredId.length > 0) {
    // Certificate not found
    resultBox.style.display = 'block';
    resultBox.style.borderColor = '#fca5a5';
    resultBox.style.background = '#fef2f2';
    resultBox.innerHTML =
      '<div style="font-weight: 700; color: var(--color-danger);">' +
      '  ⚠ No matching certificate found for ID: ' + enteredId +
      '</div>' +
      '<div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">' +
      '  Please verify the certificate number and try again.' +
      '</div>';
  }
}


// ================================================================
// SECTION 15: ADMIN ACTIONS (SKILL HEATMAP INTERACTIONS)
// ================================================================

/**
 * mandateTraining(institute, skill) — Admin se emergency training cohort schedule karne ka action.
 *
 * @param {string} institute — Kis institute ke liye (e.g., "IMD", "NIOT")
 * @param {string} skill — Kis skill domain mein (e.g., "Polar Safety")
 *
 * KAHAN USE HOTA HAI:
 * - Admin dashboard ke Skill Heatmap table mein "Mandate TRG" buttons se
 *
 * PRODUCTION MEIN:
 * - Backend API call: POST /api/admin/mandate-training
 * - Email notifications jayengi institute ke nodal officers ko
 * - Calendar event create hoga training scheduling system mein
 */
function mandateTraining(institute, skill) {
  alert(
    '📋 Administrative Action Logged\n\n' +
    'Institute: ' + institute + '\n' +
    'Skill Domain: ' + skill + '\n\n' +
    'Emergency training cohort has been scheduled.\n' +
    'Notification dispatched to the respective Nodal Officer.'
  );
}


/**
 * mandateNewCohort() — Admin se naya mandatory training cohort create karne ka prompt.
 *
 * KAHAN USE HOTA HAI:
 * - Admin page ka "Mandate New Cohort" button
 */
function mandateNewCohort() {
  var topic = prompt(
    'Enter the specialized technical domain for the new mandatory cohort:',
    'Slurm HPC Batch Scripting for NWP Models'
  );

  if (topic) {
    alert(
      '✅ Mandatory Training Cohort Created\n\n' +
      'Topic: ' + topic + '\n' +
      'Scope: All 6 Autonomous Institutes\n\n' +
      'Circulars dispatched to IMD, INCOIS, IITM, NCMRWF, NIOT, and NCPOR.'
    );
  }
}


/**
 * exportComplianceCSV() — Compliance report CSV download ka simulation.
 *
 * KAHAN USE HOTA HAI:
 * - Admin page ka "Export CSV" button
 *
 * PRODUCTION MEIN:
 * - Backend endpoint se actual CSV file download hogi
 * - xlsx ya csv-writer library se generate hogi
 */
function exportComplianceCSV() {
  alert(
    '📊 Export Initiated\n\n' +
    'Generating Official MoES Capacity Building Compliance Report...\n' +
    'Format: CSV (Excel Compatible)\n' +
    'File: MoES_Compliance_Report_Sept2026.csv\n\n' +
    'Download will begin shortly.'
  );
}


// ================================================================
// SECTION 16: UTILITY / HELPER FUNCTIONS
// ================================================================

/**
 * refreshIcons() — Lucide icon library ko re-initialize karta hai.
 *
 * KYUN ZAROORI HAI:
 * Jab hum JavaScript se dynamically naye HTML elements
 * add karte hain (createElement, innerHTML), toh unke
 * andar ke <i data-lucide="..."> elements ko icon mein
 * convert karna padta hai. Yeh function woh karta hai.
 *
 * KAHAN USE HOTA HAI:
 * - navigateTo() mein
 * - renderCourseCatalog() mein
 * - openCertificateModal() mein
 * - Basically har jagah jahan naya HTML DOM mein aata hai
 */
function refreshIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}


/**
 * formatDate(dateString) — Date string ko readable format mein convert karta hai.
 *
 * @param {string} dateString — ISO format date (e.g., "2026-10-15")
 * @returns {string} — Formatted date (e.g., "15 Oct 2026")
 *
 * KAHAN USE HOTA HAI:
 * - Course cards mein deadline dikhane ke liye
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';

  // Date object banao
  var date = new Date(dateString);

  // Month names
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}


// ================================================================
// SECTION 17: APP STARTUP
// ================================================================
// Jab poora HTML load ho jaye tab app ko initialize karo.
// "DOMContentLoaded" event ensure karta hai ki sab
// HTML elements ready hain BEFORE JavaScript unhe
// access kare.
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Backup: agar DOMContentLoaded miss ho jaye
window.addEventListener('load', function() {
  // Double-check ki icons render ho chuke hain
  refreshIcons();
});
