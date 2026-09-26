/**
 * postgresService.js - PostgreSQL Data Access Service for Capacity Connect LMS
 * Ministry of Earth Sciences (MoES), Govt. of India
 * Live Supabase PostgreSQL Integration
 */

class PostgresDbService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client && typeof window !== "undefined" && window.supabaseClient) {
      this.client = window.supabaseClient;
    }
    return this.client;
  }

  /**
   * Fetch all published courses along with modules, lessons, and quizzes from PostgreSQL
   */
  async getCourses() {
    const supabase = this.getClient();
    if (!supabase) return null;

    try {
      // 1. Fetch courses
      const { data: courses, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;
      if (!courses || courses.length === 0) return null;

      // 2. Fetch modules and lessons
      const { data: modules } = await supabase
        .from("course_modules")
        .select("*, lessons(*)")
        .order("module_order", { ascending: true });

      // 3. Fetch quizzes
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("*");

      // Assemble course objects
      return courses.map(course => {
        const courseModules = (modules || [])
          .filter(m => m.course_id === course.id)
          .map(m => ({
            id: m.id,
            title: m.title,
            lessons: (m.lessons || []).map(l => ({
              id: l.id,
              title: l.title,
              duration: l.duration || "15:00",
              durationMinutes: l.duration_minutes || 15,
              videoUrl: l.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              summary: l.summary || ""
            }))
          }));

        const courseQuiz = (quizzes || []).find(q => q.course_id === course.id);

        return {
          id: course.id,
          code: course.course_code,
          title: course.title,
          description: course.description,
          category: course.category,
          institute: course.institute,
          trainerId: course.trainer_id,
          trainerName: course.trainer_name || "MoES Faculty",
          level: course.level || "Intermediate",
          durationMinutes: course.duration_minutes || 180,
          thumbnail: course.thumbnail_url || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80",
          isMandatory: Boolean(course.is_mandatory),
          deadline: course.deadline,
          tags: course.tags || [course.institute, course.category],
          modules: courseModules,
          quiz: courseQuiz ? {
            id: courseQuiz.id,
            title: courseQuiz.title,
            passingScore: Number(courseQuiz.passing_score) || 75,
            timeLimitMinutes: courseQuiz.time_limit_minutes || 15,
            questions: courseQuiz.questions || []
          } : null
        };
      });
    } catch (err) {
      console.warn("[PostgresService] getCourses notice:", err.message);
      return null;
    }
  }

  /**
   * Fetch all Live Classes from PostgreSQL
   */
  async getLiveClasses() {
    const supabase = this.getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_start", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map(item => ({
        id: item.id,
        title: item.title,
        courseId: item.course_id,
        trainerId: item.trainer_id,
        trainerName: item.trainer_name || "Faculty Specialist",
        institute: item.institute,
        scheduledStart: item.scheduled_start,
        scheduledEnd: item.scheduled_end,
        streamUrl: item.stream_url || "https://meet.google.com/lookup/moes-live",
        status: item.status || "upcoming",
        attendeesCount: item.attendees_count || 0
      }));
    } catch (err) {
      console.warn("[PostgresService] getLiveClasses notice:", err.message);
      return null;
    }
  }

  /**
   * Fetch user enrollments from PostgreSQL
   */
  async getUserEnrollments(userId) {
    const supabase = this.getClient();
    if (!supabase || !userId) return [];

    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("[PostgresService] getUserEnrollments error:", err.message);
      return [];
    }
  }

  /**
   * Save or update enrollment progress in PostgreSQL
   */
  async saveEnrollmentProgress(userId, courseId, progressPercentage, completedLessons = [], status = "in-progress") {
    const supabase = this.getClient();
    if (!supabase || !userId || !courseId) return false;

    try {
      const payload = {
        id: `enr_${userId.slice(0, 6)}_${courseId.slice(0, 6)}`,
        user_id: userId,
        course_id: courseId,
        progress_percentage: Number(progressPercentage.toFixed(2)),
        completed_lessons: completedLessons,
        status: progressPercentage >= 100 ? "completed" : status,
        completed_at: progressPercentage >= 100 ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from("enrollments")
        .upsert(payload, { onConflict: "user_id,course_id" });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("[PostgresService] saveEnrollmentProgress notice:", err.message);
      return false;
    }
  }

  /**
   * Issue and store a verified Certificate in PostgreSQL
   */
  async issueCertificate(certData) {
    const supabase = this.getClient();
    if (!supabase) return null;

    try {
      const payload = {
        id: certData.id || `cert_${Date.now().toString(36)}`,
        certificate_number: certData.certificateNumber,
        user_id: certData.userId,
        user_name: certData.userName,
        course_id: certData.courseId,
        course_title: certData.courseTitle,
        institute: certData.institute || "IMD",
        score: certData.score || 85,
        verification_url: certData.verificationUrl || window.location.href,
        digital_signature_hash: certData.digitalSignatureHash || "SHA256-" + Date.now(),
        signatory_title: certData.signatoryTitle || "Secretary, Ministry of Earth Sciences, Govt. of India"
      };

      const { data, error } = await supabase
        .from("certificates")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("[PostgresService] issueCertificate notice:", err.message);
      return certData;
    }
  }

  /**
   * Fetch leaderboard rankings from PostgreSQL
   */
  async getLeaderboard() {
    const supabase = this.getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, custom_role_id, name, email, role, institute, designation, avatar_url, knowledge_points, learning_streak")
        .order("knowledge_points", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("[PostgresService] getLeaderboard notice:", err.message);
      return null;
    }
  }
}

// Global instance export
const postgresService = new PostgresDbService();
if (typeof window !== "undefined") {
  window.postgresService = postgresService;
}
