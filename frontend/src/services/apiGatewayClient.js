/**
 * apiGatewayClient.js - Frontend Client for the Backend API Gateway
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES)
 * Automatically manages JWT token lifecycle, headers, and CRUD requests.
 */

class ApiGatewayClient {
  constructor() {
    this.baseUrl = window.location.origin.includes("5500") || window.location.origin.includes("5173")
      ? "http://localhost:3000" // Point to Backend API Gateway port when developing on Live Server
      : window.location.origin; // Same origin when deployed
    this.tokenKey = "moes_jwt_bearer_token";
  }

  getToken() {
    return sessionStorage.getItem(this.tokenKey) || localStorage.getItem(this.tokenKey) || null;
  }

  setToken(token) {
    if (token) {
      sessionStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.tokenKey, token);
    }
  }

  clearToken() {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Internal HTTP Request Dispatcher with automatic JWT Bearer Injection
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return data;
    } catch (err) {
      console.warn(`[API Gateway Client] Request failed [${options.method || "GET"} ${endpoint}]:`, err.message);
      throw err;
    }
  }

  // ====================================================================
  // AUTHENTICATION CRUD via API Gateway
  // ====================================================================

  /**
   * Google Sign-In via API Gateway
   */
  async loginWithGoogle(googleData = {}, roleIntent = "employee") {
    const payload = {
      ...googleData,
      role: roleIntent
    };
    const response = await this.request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Official Email/Password Sign-In via API Gateway
   */
  async loginWithEmail(email, password, roleIntent = "employee") {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: roleIntent })
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Get Current Authenticated Profile from API Gateway
   */
  async getCurrentUser() {
    return await this.request("/api/auth/me", { method: "GET" });
  }

  /**
   * Logout and revoke session on server and client
   */
  async logout() {
    try {
      await this.request("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors during logout
    }
    this.clearToken();
  }

  /**
   * Get list of official authorized admins
   */
  async getAuthorizedAdmins() {
    return await this.request("/api/auth/admins", { method: "GET" });
  }

  /**
   * Get list of official authorized faculty trainers
   */
  async getAuthorizedTrainers() {
    return await this.request("/api/auth/trainers", { method: "GET" });
  }

  /**
   * Get security audit logs (Admin only)
   */
  async getAuditLogs(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/api/admin/audit-logs?${query}` : "/api/admin/audit-logs";
    return await this.request(endpoint, { method: "GET" });
  }

  // ====================================================================
  // COURSE CRUD OPERATIONS (Protected by JWT & RBAC)
  // ====================================================================

  /**
   * READ: Get all courses (Public or Authenticated)
   */
  async getCourses(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/api/courses?${query}` : "/api/courses";
    return await this.request(endpoint, { method: "GET" });
  }

  /**
   * READ: Get single course details by ID
   */
  async getCourseById(courseId) {
    return await this.request(`/api/courses/${courseId}`, { method: "GET" });
  }

  /**
   * CREATE: Create new course (Requires Trainer or Admin JWT)
   */
  async createCourse(courseData) {
    return await this.request("/api/courses", {
      method: "POST",
      body: JSON.stringify(courseData)
    });
  }

  /**
   * UPDATE: Update course details (Requires Trainer owner or Admin JWT)
   */
  async updateCourse(courseId, courseData) {
    return await this.request(`/api/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(courseData)
    });
  }

  /**
   * DELETE: Delete course (Requires Admin JWT)
   */
  async deleteCourse(courseId) {
    return await this.request(`/api/courses/${courseId}`, {
      method: "DELETE"
    });
  }

  /**
   * ENROLL: Enroll current authenticated user in course
   */
  async enrollCourse(courseId) {
    return await this.request(`/api/courses/${courseId}/enroll`, {
      method: "POST"
    });
  }

  /**
   * PROGRESS: Update lesson progress
   */
  async updateCourseProgress(courseId, progressData) {
    return await this.request(`/api/courses/${courseId}/progress`, {
      method: "POST",
      body: JSON.stringify(progressData)
    });
  }
}

// Global instance export
const apiGatewayClient = new ApiGatewayClient();
if (typeof window !== "undefined") {
  window.apiGatewayClient = apiGatewayClient;
}
