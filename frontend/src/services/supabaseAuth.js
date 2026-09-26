/**
 * supabaseAuth.js - Dedicated Authentication & RBAC Service for Supabase
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 */

class SupabaseAuthService {
  constructor() {
    this.knownAdmins = [
      "priyanshudhote3110@gmail.com",
      "admin@capacityconnect.gov.in",
      "secretary@moes.gov.in",
      "director@imd.gov.in"
    ];

    this.knownTrainers = [
      "trainer@capacityconnect.gov.in",
      "faculty@imd.gov.in",
      "anita.desai@imd.gov.in"
    ];
  }

  getClient() {
    return (typeof window !== "undefined" && window.supabaseClient) || null;
  }

  /**
   * Determine role from user email or explicit login intent
   */
  resolveRole(email = "", requestedIntent = "employee") {
    const cleanEmail = (email || "").toLowerCase().trim();
    if (this.knownAdmins.includes(cleanEmail) || cleanEmail.includes("admin")) {
      return "admin";
    }
    if (this.knownTrainers.includes(cleanEmail) || cleanEmail.includes("trainer") || cleanEmail.includes("faculty")) {
      return "trainer";
    }
    if (requestedIntent && ["employee", "trainer", "admin"].includes(requestedIntent)) {
      return requestedIntent;
    }
    return "employee";
  }

  /**
   * Map Supabase Auth user to standardized application user model
   */
  mapUser(supabaseUser, requestedRoleIntent = null) {
    if (!supabaseUser) return null;

    const email = (supabaseUser.email || "").toLowerCase().trim();
    const metadata = supabaseUser.user_metadata || {};
    const role = metadata.role || this.resolveRole(email, requestedRoleIntent);

    const rolePrefixes = { employee: "EMP", trainer: "TRN", admin: "ADM" };
    const customRoleId = metadata.customRoleId || `${rolePrefixes[role] || "EMP"}-${supabaseUser.id.slice(0, 4).toUpperCase()}`;

    const displayName = metadata.full_name || metadata.name || supabaseUser.displayName || (email ? email.split("@")[0].replace(".", " ") : "Officer");
    const avatarUrl = metadata.avatar_url || metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0A2647&color=fff&size=150`;

    const institute = role === "admin" ? "HQ" : role === "trainer" ? "IMD" : (metadata.institute || "IMD");
    const designation = role === "admin" 
      ? "Executive Director" 
      : role === "trainer" 
        ? "Faculty Specialist" 
        : "Scientist / Officer";

    const department = role === "admin"
      ? "MoES Secretariat"
      : role === "trainer"
        ? "Faculty Studio & Atmospheric Sciences"
        : "Atmospheric & Radar Sciences";

    return {
      id: supabaseUser.id,
      customRoleId: customRoleId,
      name: displayName,
      email: email,
      phone: supabaseUser.phone || metadata.phone || "",
      role: role,
      institute: institute,
      designation: designation,
      department: department,
      avatarUrl: avatarUrl,
      knowledgePoints: role === "admin" ? 12000 : role === "trainer" ? 7500 : 1500,
      learningStreak: role === "admin" ? 30 : role === "trainer" ? 20 : 12,
      coursesCompleted: role === "admin" ? 25 : role === "trainer" ? 15 : 3,
      certsEarned: role === "admin" ? 18 : role === "trainer" ? 10 : 2
    };
  }

  /**
   * Fetch from or Synchronize into PostgreSQL `public.users` table
   */
  async getOrCreateUserProfile(supabaseUser, requestedRoleIntent = null) {
    if (!supabaseUser) return null;

    const fallback = this.mapUser(supabaseUser, requestedRoleIntent);
    const client = this.getClient();
    if (!client) return fallback;

    const email = (supabaseUser.email || "").toLowerCase().trim();
    const userId = supabaseUser.id;

    try {
      // 1. Fetch from PostgreSQL
      const { data: dbUser, error: fetchErr } = await client
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (dbUser) {
        let userRole = dbUser.role || fallback.role;
        if (this.knownAdmins.includes(email) && userRole !== "admin") {
          userRole = "admin";
          await client.from("users").update({ role: "admin" }).eq("id", userId);
        }

        return {
          id: dbUser.id,
          customRoleId: dbUser.custom_role_id || fallback.customRoleId,
          name: dbUser.name || fallback.name,
          email: dbUser.email || fallback.email,
          phone: dbUser.phone || fallback.phone,
          role: userRole,
          institute: dbUser.institute || fallback.institute,
          designation: dbUser.designation || fallback.designation,
          department: dbUser.department || fallback.department,
          avatarUrl: dbUser.avatar_url || fallback.avatarUrl,
          knowledgePoints: dbUser.knowledge_points || fallback.knowledgePoints,
          learningStreak: dbUser.learning_streak || fallback.learningStreak,
          coursesCompleted: fallback.coursesCompleted,
          certsEarned: fallback.certsEarned
        };
      }

      // 2. New User: Insert into PostgreSQL
      const determinedRole = this.resolveRole(email, requestedRoleIntent);
      const rolePrefixes = { employee: "EMP", trainer: "TRN", admin: "ADM" };
      const customRoleId = `${rolePrefixes[determinedRole] || "EMP"}-${userId.slice(0, 4).toUpperCase()}`;

      const newRecord = {
        id: userId,
        custom_role_id: customRoleId,
        name: fallback.name,
        email: email,
        phone: fallback.phone || null,
        role: determinedRole,
        institute: fallback.institute,
        designation: fallback.designation,
        department: fallback.department,
        avatar_url: fallback.avatarUrl,
        knowledge_points: fallback.knowledgePoints,
        learning_streak: fallback.learningStreak,
        is_verified: true
      };

      const { data: inserted } = await client
        .from("users")
        .upsert(newRecord)
        .select()
        .maybeSingle();

      const res = inserted || newRecord;
      return {
        id: res.id,
        customRoleId: res.custom_role_id || customRoleId,
        name: res.name || fallback.name,
        email: res.email || email,
        phone: res.phone || "",
        role: res.role || determinedRole,
        institute: res.institute || fallback.institute,
        designation: res.designation || fallback.designation,
        department: res.department || fallback.department,
        avatarUrl: res.avatar_url || fallback.avatarUrl,
        knowledgePoints: res.knowledge_points || fallback.knowledgePoints,
        learningStreak: res.learning_streak || fallback.learningStreak,
        coursesCompleted: fallback.coursesCompleted,
        certsEarned: fallback.certsEarned
      };
    } catch (e) {
      console.warn("[SupabaseAuth] PostgreSQL profile fetch notice:", e.message);
      return fallback;
    }
  }

  /**
   * Google OAuth 2.0 Sign-In
   */
  async signInWithGoogle(roleIntent = "employee") {
    const client = this.getClient();
    if (!client) throw new Error("Supabase client is not initialized.");

    if (window.location.protocol === "file:") {
      alert("Google OAuth requires running on an HTTP server (e.g. Live Server at http://localhost:5500).");
      throw new Error("Cannot run OAuth from file:// protocol.");
    }

    sessionStorage.setItem("moes_auth_role_intent", roleIntent);
    const redirectUrl = window.location.origin + window.location.pathname;

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Prevents sudden window redirect if provider is disabled in Supabase
          queryParams: {
            access_type: "offline",
            prompt: "select_account"
          },
          data: {
            role: roleIntent
          }
        }
      });

      if (error) {
        console.warn("[Supabase OAuth] Provider error:", error.message);
        throw error;
      }
      return data;
    } catch (err) {
      console.warn("[Supabase OAuth Notice] Google provider not enabled in remote Supabase dashboard:", err.message);
      throw err;
    }
  }

  /**
   * Email and Password Sign-In
   */
  async signInWithEmail(email, password, roleIntent = "employee") {
    const client = this.getClient();
    if (!client) throw new Error("Supabase client is not initialized.");

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return await this.getOrCreateUserProfile(data.user, roleIntent);
  }

  /**
   * Sign-Out
   */
  async signOut() {
    const client = this.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {}
    }
    sessionStorage.removeItem("moes_auth_role_intent");
    localStorage.removeItem("moes_session_user");
  }
}

// Global instance export
const supabaseAuthService = new SupabaseAuthService();
if (typeof window !== "undefined") {
  window.supabaseAuthService = supabaseAuthService;
}
