# REST API Specification — Capacity Connect (समर्थ-पृथ्वी) LMS
**Ministry of Earth Sciences (MoES), Government of India**  
**Enterprise RESTful API Documentation**  
**Version:** `2.5.0`  
**Base URL:** `http://localhost:3000/api`

---

## 1. System Health Check

### `GET /health`
Returns system status, ministry details, and server time.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "system": "Capacity Connect LMS (समर्थ-पृथ्वी)",
  "ministry": "Ministry of Earth Sciences, Govt of India",
  "version": "2.5.0",
  "timestamp": "2026-09-22T21:40:00.000Z"
}
```

---

## 2. Authentication & Profile Endpoints

### `POST /auth/google`
Authenticates user using Google One-Tap or Google OAuth credential.
- **Request Body:**
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIs...",
    "role": "employee", // "admin" | "trainer" | "employee"
    "institute": "IMD"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr_goog_abc123",
      "customRoleId": "EMP-001",
      "name": "Dr. Rajesh Sharma",
      "email": "rajesh.sharma@imd.gov.in",
      "role": "employee",
      "institute": "IMD",
      "avatarUrl": "https://..."
    }
  }
  ```

### `POST /auth/otp/send`
Dispatches a 6-digit numeric SMS OTP to the provided mobile number.
- **Request Body:**
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to 9876543210",
    "referenceId": "REF-AB12CD",
    "expiresInSeconds": 300,
    "debugOtp": "123456"
  }
  ```

### `POST /auth/otp/verify`
Verifies entered 6-digit SMS OTP and establishes authenticated session.
- **Request Body:**
  ```json
  {
    "phone": "9876543210",
    "otp": "123456",
    "role": "employee"
  }
  ```

### `POST /auth/switch-demo`
Instant 1-click persona switcher for evaluators and SIH jury testing.
- **Request Body:** `{"persona": "admin"}` (`"admin"` | `"trainer"` | `"employee"`)

### `GET /auth/me`
Fetches authenticated user profile from session Bearer token.

### `PUT /auth/profile`
Updates user profile, circular avatar URL, institute, department, and bio.

---

## 3. Course Management & Video Playlists

### `GET /courses`
Returns all training courses. Supports query parameters:
- `?institute=IMD`
- `?category=Radar`
- `?search=calibration`

### `GET /courses/:id`
Returns full course details including modules, video lessons, and learner progress.

### `POST /courses` *(Requires Trainer / Admin)*
Publishes a new training course with syllabus and quizzes.

### `POST /courses/:id/enroll`
Enrolls learner in course.

### `POST /courses/:id/progress`
Updates current lesson position and completion percentage.

### `POST /courses/:id/notes`
Appends timestamped study note to course session.

---

## 4. Live Classroom & WebRTC Streaming

### `GET /live-classes`
Lists upcoming and active live sessions. Supports `?status=live`.

### `GET /live-classes/:id`
Retrieves live session details, stream URL, and chat history.

### `POST /live-classes` *(Requires Trainer / Admin)*
Schedules a new live masterclass.

### `PATCH /live-classes/:id/status`
Updates session broadcast status (`upcoming`, `live`, `ended`).

### `POST /live-classes/:id/chat`
Posts live interactive question to moderated stream.

---

## 5. Formal Examination & Diagnostic Scorecards

### `GET /quiz/course/:courseId`
Fetches sanitized exam questions and time limits.

### `POST /quiz/submit`
Evaluates answers, returns diagnostic topic breakdown, and automatically generates verifiable official certificate if score >= 70%.
- **Request Body:**
  ```json
  {
    "courseId": "crs_dwr_401",
    "answers": {
      "q1": 1,
      "q2": 0,
      "q3": 1
    }
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "scorecard": {
      "score": 100.0,
      "correctCount": 3,
      "totalQuestions": 3,
      "passingScore": 70,
      "isPassed": true,
      "topicBreakdown": { ... }
    },
    "certificate": {
      "certificateNumber": "MOES-CC-2026-IMD-89412",
      "digitalSignatureHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  }
  ```

---

## 6. Verifiable Digital Certificates

### `GET /certificates`
Lists earned certificates for current user or filtered by institute.

### `GET /certificates/:id`
Fetches individual certificate metadata.

### `GET /certificates/verify/:certNumber`
**Public QR lookup endpoint** verifying SHA-256 digital stamp against central Ministry registry.

### `GET /certificates/:id/render`
Renders print-ready HTML certificate.

---

## 7. Executive Analytics & Skill-Gap Heatmap

### `GET /admin/analytics`
Returns ministry-wide KPIs, institute completion rates, and cross-institute competency matrix.

### `POST /admin/mandate-cohort`
Enforces mandatory training order for institutional skill-gaps and dispatches alerts to all personnel.

### `GET /admin/export-csv`
Exports compliance data in CSV format.

---

## 8. Discussion Forum & Notifications

### `GET /discussions`
Lists doubt discussions with upvotes, faculty verified solutions, and replies.

### `POST /discussions/:id/reply`
Appends answer or faculty solution to discussion thread.

### `GET /notifications`
Returns user alerts (mandatory deadlines, live class alerts, certificate ready).
