/**
 * firebase-config.js - Firebase Project Configuration & SDK Initialization
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Live Project: capacity-connect-66965
 */

const firebaseConfig = {
  apiKey: "AIzaSyDXYwG4Uzc4u8kVYdZUBQavTJ-ZSzVybvw",
  authDomain: "capacity-connect-66965.firebaseapp.com",
  projectId: "capacity-connect-66965",
  storageBucket: "capacity-connect-66965.firebasestorage.app",
  messagingSenderId: "630706969909",
  appId: "1:630706969909:web:7cca66943d6b03f7fd807c",
  measurementId: "G-JSJ7K78WGP"
};

// Initialize Firebase safely
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let googleProvider = null;

try {
  if (typeof firebase !== "undefined") {
    if (!firebase.apps || !firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }

    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();
    googleProvider = new firebase.auth.GoogleAuthProvider();

    // Set custom parameters to always prompt account selection
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    googleProvider.addScope('profile');
    googleProvider.addScope('email');

    console.log("[Firebase] Successfully initialized Capacity Connect project:", firebaseConfig.projectId);
  } else {
    console.warn("[Firebase] Firebase SDK CDN not loaded yet.");
  }
} catch (err) {
  console.error("[Firebase] Initialization error:", err);
}

// Known Administrator emails (MoES Executive Directorate)
const KNOWN_ADMIN_EMAILS = [
  "priyanshudhote3110@gmail.com",
  "admin@capacityconnect.gov.in",
  "secretary@moes.gov.in",
  "director@imd.gov.in"
];

// Known Faculty / Trainer emails
const KNOWN_TRAINER_EMAILS = [
  "trainer@capacityconnect.gov.in",
  "faculty@imd.gov.in"
];

/**
 * Fetch or create a user's Firestore profile document.
 * On first-time Google Sign-In:
 *  - Checks if user is a known Admin or Trainer email
 *  - If not, uses requestedRoleIntent or defaults to "employee"
 * Returns the full user profile object.
 */
async function getOrCreateUserProfile(firebaseUser, requestedRoleIntent = null) {
  if (!firebaseUser) return null;

  const uid = firebaseUser.uid;
  const email = (firebaseUser.email || "").toLowerCase().trim();
  const displayName = firebaseUser.displayName || "Officer " + uid.slice(0, 5);
  const photoURL = firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0A2647&color=fff&size=150`;

  // Determine role based on known directory or role intent
  let initialRole = "employee";
  if (KNOWN_ADMIN_EMAILS.includes(email) || email.includes("admin")) {
    initialRole = "admin";
  } else if (KNOWN_TRAINER_EMAILS.includes(email)) {
    initialRole = "trainer";
  } else if (requestedRoleIntent && ["employee", "trainer", "admin"].includes(requestedRoleIntent)) {
    initialRole = requestedRoleIntent;
  }

  const rolePrefixes = { employee: "EMP", trainer: "TRN", admin: "ADM" };
  const customRoleId = `${rolePrefixes[initialRole] || "EMP"}-${String(Date.now()).slice(-4)}`;

  // If Firestore is available, read/write user record
  if (firebaseDb) {
    try {
      const docRef = firebaseDb.collection("users").doc(uid);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();
        // If the user is in known admin list, enforce admin role
        let updatedRole = data.role || initialRole;
        if (KNOWN_ADMIN_EMAILS.includes(email) && updatedRole !== "admin") {
          updatedRole = "admin";
          await docRef.update({ role: "admin", customRoleId: "ADM-001" });
        }

        // Update last login timestamp
        try {
          await docRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            photoURL: photoURL
          });
        } catch (e) {
          console.warn("[Firebase] Could not update lastLogin timestamp:", e.message);
        }

        return {
          uid,
          ...data,
          role: updatedRole,
          displayName: data.displayName || displayName,
          email: data.email || email,
          photoURL: photoURL
        };
      } else {
        // First-time user creation in Firestore
        const newProfile = {
          uid,
          email,
          displayName,
          photoURL,
          role: initialRole,
          customRoleId: initialRole === "admin" ? "ADM-001" : initialRole === "trainer" ? "TRN-001" : customRoleId,
          institute: initialRole === "admin" ? "HQ" : "IMD",
          designation: initialRole === "admin" ? "Executive Director" : initialRole === "trainer" ? "Faculty Specialist" : "Scientist",
          department: initialRole === "admin" ? "MoES Secretariat" : "Atmospheric & Radar Sciences",
          knowledgePoints: initialRole === "admin" ? 12000 : initialRole === "trainer" ? 7500 : 1500,
          learningStreak: 10,
          coursesCompleted: initialRole === "admin" ? 25 : initialRole === "trainer" ? 15 : 2,
          certsEarned: initialRole === "admin" ? 18 : initialRole === "trainer" ? 10 : 1,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
          await docRef.set(newProfile);
        } catch (setErr) {
          console.warn("[Firebase] Could not set document in Firestore:", setErr.message);
        }

        return newProfile;
      }
    } catch (fsErr) {
      console.warn("[Firebase] Firestore query failed, falling back to local session:", fsErr.message);
    }
  }

  // Fallback profile if Firestore is offline or restricted
  return {
    uid,
    email,
    displayName,
    photoURL,
    role: initialRole,
    customRoleId: initialRole === "admin" ? "ADM-001" : initialRole === "trainer" ? "TRN-001" : customRoleId,
    institute: initialRole === "admin" ? "HQ" : "IMD",
    designation: initialRole === "admin" ? "Executive Director" : initialRole === "trainer" ? "Faculty Specialist" : "Scientist",
    department: initialRole === "admin" ? "MoES Secretariat" : "Atmospheric & Radar Sciences",
    knowledgePoints: initialRole === "admin" ? 12000 : initialRole === "trainer" ? 7500 : 1500,
    learningStreak: 10,
    coursesCompleted: initialRole === "admin" ? 25 : initialRole === "trainer" ? 15 : 2,
    certsEarned: initialRole === "admin" ? 18 : initialRole === "trainer" ? 10 : 1
  };
}

/**
 * Update user role in Firestore (Admin function or Persona switcher)
 */
async function updateUserRoleInFirestore(uid, newRole) {
  if (!firebaseDb || !uid) return false;
  try {
    const rolePrefixes = { employee: "EMP", trainer: "TRN", admin: "ADM" };
    const customRoleId = `${rolePrefixes[newRole] || "EMP"}-001`;
    await firebaseDb.collection("users").doc(uid).update({
      role: newRole,
      customRoleId: customRoleId,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn("[Firebase] Could not update role in Firestore:", err.message);
    return false;
  }
}

/**
 * Map a Firestore user profile to the app's currentUser schema
 */
function mapFirebaseProfileToAppUser(profile) {
  if (!profile) return null;
  const roleIdPrefix = { employee: "EMP", trainer: "TRN", admin: "ADM" };
  const fallbackRoleId = (roleIdPrefix[profile.role] || "EMP") + "-001";

  return {
    id: profile.uid || ("usr_" + (profile.role || "emp") + "_fb"),
    customRoleId: profile.customRoleId || fallbackRoleId,
    name: profile.displayName || "MoES Officer",
    email: profile.email || "",
    phone: profile.phone || "+91 9876543210",
    role: profile.role || "employee",
    institute: profile.institute || (profile.role === "admin" ? "HQ" : "IMD"),
    designation: profile.designation || (profile.role === "admin" ? "Executive Director" : profile.role === "trainer" ? "Faculty Specialist" : "Scientist"),
    department: profile.department || (profile.role === "admin" ? "MoES Secretariat" : "Atmospheric & Radar Sciences"),
    avatarUrl: profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || 'MoES')}&background=0A2647&color=fff&size=150`,
    knowledgePoints: profile.knowledgePoints !== undefined ? profile.knowledgePoints : 1500,
    learningStreak: profile.learningStreak !== undefined ? profile.learningStreak : 12,
    coursesCompleted: profile.coursesCompleted !== undefined ? profile.coursesCompleted : 3,
    certsEarned: profile.certsEarned !== undefined ? profile.certsEarned : 2
  };
}

// Expose globally for vanilla JS components
window.firebaseConfig = firebaseConfig;
window.firebaseAuth = firebaseAuth;
window.firebaseDb = firebaseDb;
window.googleProvider = googleProvider;
window.getOrCreateUserProfile = getOrCreateUserProfile;
window.mapFirebaseProfileToAppUser = mapFirebaseProfileToAppUser;
window.updateUserRoleInFirestore = updateUserRoleInFirestore;
