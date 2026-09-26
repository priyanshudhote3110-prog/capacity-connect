/**
 * supabase-config.js - Supabase Client Initialization & Modular Export Hub
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 * Live Project: https://prmbjchjpetkuoirbwvt.supabase.co
 */

// Master Supabase Credentials
const SUPABASE_URL = "https://prmbjchjpetkuoirbwvt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kJ_v_MijVe3j52B5fQ2phw_lELRIX9l";

let supabaseClient = null;

try {
  if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    window.supabaseClient = supabaseClient;
    console.log("[Supabase] PostgreSQL Client initialized successfully for Capacity Connect.");
  } else {
    console.warn("[Supabase] Supabase JS CDN not loaded yet.");
  }
} catch (err) {
  console.error("[Supabase] Client initialization error:", err);
}

// Global Delegations to Dedicated Services (supabaseAuthService & postgresService)
function getRoleFromEmailOrIntent(email = "", requestedRoleIntent = "employee") {
  return window.supabaseAuthService
    ? window.supabaseAuthService.resolveRole(email, requestedRoleIntent)
    : requestedRoleIntent;
}

function mapSupabaseUserToAppUser(supabaseUser, requestedRoleIntent = null) {
  return window.supabaseAuthService
    ? window.supabaseAuthService.mapUser(supabaseUser, requestedRoleIntent)
    : null;
}

async function getOrCreateSupabaseUserProfile(supabaseUser, requestedRoleIntent = null) {
  return window.supabaseAuthService
    ? await window.supabaseAuthService.getOrCreateUserProfile(supabaseUser, requestedRoleIntent)
    : mapSupabaseUserToAppUser(supabaseUser, requestedRoleIntent);
}

async function signInWithGoogleSupabase(roleIntent = "employee") {
  if (!window.supabaseAuthService) {
    throw new Error("Supabase Auth Service is not loaded yet.");
  }
  return await window.supabaseAuthService.signInWithGoogle(roleIntent);
}

async function signInWithEmailSupabase(email, password, roleIntent = "employee") {
  if (!window.supabaseAuthService) {
    throw new Error("Supabase Auth Service is not loaded yet.");
  }
  return await window.supabaseAuthService.signInWithEmail(email, password, roleIntent);
}

async function signOutSupabase() {
  if (window.supabaseAuthService) {
    await window.supabaseAuthService.signOut();
  } else if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
}

// Window Global Exports for compatibility across all UI components
if (typeof window !== "undefined") {
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
  window.supabaseClient = supabaseClient;
  window.getRoleFromEmailOrIntent = getRoleFromEmailOrIntent;
  window.mapSupabaseUserToAppUser = mapSupabaseUserToAppUser;
  window.getOrCreateSupabaseUserProfile = getOrCreateSupabaseUserProfile;
  window.signInWithGoogleSupabase = signInWithGoogleSupabase;
  window.signInWithEmailSupabase = signInWithEmailSupabase;
  window.signOutSupabase = signOutSupabase;
}
