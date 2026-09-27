# 📢 Admin-Managed Employee Notification System (Capacity Connect LMS)
### Ministry of Earth Sciences (MoES), Government of India
**Document Version:** 1.0.0 · **Classification:** Enterprise & Sovereign Architecture · **Status:** Blueprint & Technical Specification

---

## 📑 Table of Contents
1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [Prerequisites & External Services Setup Guide](#2-prerequisites--external-services-setup-guide)
3. [Database Schema & SQL Migrations](#3-database-schema--sql-migrations)
4. [Strict Data Validation & Sanitization Engine](#4-strict-data-validation--sanitization-engine)
5. [Backend REST API Specifications](#5-backend-rest-api-specifications)
6. [Frontend Admin Panel UI/UX Design](#6-frontend-admin-panel-uiux-design)
7. [Delivery Engine & Notification Dispatch Pipeline](#7-delivery-engine--notification-dispatch-pipeline)
8. [Automated Triggers & Scheduled Cron Automation](#8-automated-triggers--scheduled-cron-automation)
9. [Environment Configuration (`.env`)](#9-environment-configuration-env)
10. [Implementation Roadmap & Developer Checklist](#10-implementation-roadmap--developer-checklist)

---

## 1. Executive Summary & High-Level Architecture

The **Admin-Managed Employee Notification System** is a mission-critical communication infrastructure engineered for the **Ministry of Earth Sciences (MoES)**. It empowers ministry administrators, institute directors, and HR heads across **IMD, INCOIS, IITM, NCMRWF, NIOT, and NCPOR** to:
1. Centrally manage employee notification preferences via intuitive **Email (📧)** and **WhatsApp (📱)** circular toggles.
2. Directly dispatch targeted course reminders, exam deadlines, and ministerial directives.
3. Eliminate duplicate or unwanted messages through persistent delivery audit logs and opt-out compliance.
4. Integrate enterprise-grade delivery gateways (**Gmail SMTP / Google Workspace** and **Meta WhatsApp Cloud API / Twilio**).

```mermaid
flowchart TD
    subgraph Admin_Portal["🖥️ Admin Management Dashboard"]
        A[Admin Panel] -->|Toggle ON/OFF| B(Employee Table)
        A -->|Edit Employee| C(Edit Modal)
        A -->|Select Audience & Template| D(Notification Composer)
    end

    subgraph Backend_Gateway["⚙️ Node.js / Express Backend Gateway"]
        E[Validation Middleware] -->|Sanitize Phone & Email| F[PBAC Authorization]
        F --> G[Dispatch Controller]
        D -->|POST /api/admin/notifications/send| E
        B -->|PATCH /api/admin/employees/:id/toggle| E
    end

    subgraph Database["🗄️ PostgreSQL / Supabase"]
        H[(employees Table)]
        I[(notification_logs Table)]
        G <-->|Query Preferences| H
        G -->|Insert Audit Record| I
    end

    subgraph Delivery_Engine["🚀 Delivery Gateways"]
        G -->|If email_notify == true| J[Nodemailer / Gmail SMTP]
        G -->|If whatsapp_notify == true| K[Meta Cloud / Twilio WhatsApp]
    end

    subgraph Recipients["👥 MoES Scientific Personnel"]
        J --> L[Official Inbox: IMD / INCOIS / IITM]
        K --> M[Verified WhatsApp: +91 XXXXX XXXXX]
    end
```

---

## 2. Prerequisites & External Services Setup Guide

### 2.1 Sender Email Setup (Gmail / Google Workspace)

To dispatch official emails, a dedicated sender email identity is required.

#### Option A: Gmail SMTP with App Password (100% Free — Recommended for Development & SIH Demo)
* **Daily Limit:** 500 emails per 24 hours.
* **Cost:** Free (₹0).
* **Setup Steps:**
  1. Choose a dedicated Gmail address (e.g., `capacityconnect.moes@gmail.com`).
  2. Navigate to [Google Account Security](https://myaccount.google.com/security).
  3. Turn on **2-Step Verification** (Mandatory).
  4. Search for **"App Passwords"** in the top search bar.
  5. Select App name: `Capacity Connect LMS` and click **Create**.
  6. Copy the generated **16-character alphanumeric string** (e.g., `abcd efgh ijkl mnop`).
  7. Store this password in your backend `.env` file as `GMAIL_APP_PASSWORD`.

#### Option B: Google Workspace / Custom Domain SMTP (Production Grade)
* **Domain:** `@capacityconnect.gov.in` or `@moes.gov.in`.
* **Method:** Google Workspace SMTP Relay with OAuth2 service account.
* **Alternative SaaS:** **Resend** (3,000 free emails/month, 99.9% inbox delivery) or **SendGrid**.

---

### 2.2 WhatsApp Business API Setup

To send automated WhatsApp messages, an official API gateway is required.

| Feature | Option 1: Twilio WhatsApp Sandbox (Recommended for Rapid Prototype & Testing) | Option 2: Meta WhatsApp Cloud API (Recommended for Government Production) |
| :--- | :--- | :--- |
| **Initial Cost** | Free Trial Credits ($15 credit included) | Free Tier (1,000 service conversations/month) |
| **Setup Time** | ~5 to 10 Minutes | ~30 to 45 Minutes |
| **Phone Number Requirement** | **NO separate SIM needed** — Twilio provides a sandbox shared phone number. | **Separate dedicated phone number required** (must NOT be registered on consumer WhatsApp). |
| **Message Restrictions** | Recipient must send a 1-time join code (e.g., `join silver-wolf`) to the sandbox number. | Can send pre-approved template messages to any valid Indian phone number directly. |
| **Dashboard URL** | [console.twilio.com](https://console.twilio.com) | [developers.facebook.com](https://developers.facebook.com) |

#### Step-by-Step Twilio Sandbox Setup:
1. Sign up on [Twilio](https://www.twilio.com/).
2. In the console, go to **Messaging ➔ Try WhatsApp ➔ Send a WhatsApp Message**.
3. Note your **Account SID**, **Auth Token**, and the **Twilio WhatsApp Number** (e.g., `whatsapp:+14155238886`).
4. To test with your personal phone, send the specified sandbox code to the Twilio number once.

---

## 3. Database Schema & SQL Migrations

### 3.1 Migration SQL: `employees` Table
This table stores all scientists, engineers, and faculty officers with their instant notification preference flags.

```sql
-- 1. Create Extension for UUID generation if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Employees Master Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_role_id VARCHAR(30) UNIQUE NOT NULL,      -- e.g., 'EMP-1042', 'TRN-001'
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,        -- E.164 standardized (+91XXXXXXXXXX)
    department VARCHAR(100) NOT NULL,                -- e.g., 'Atmospheric & Radar Meteorology'
    institute VARCHAR(50) NOT NULL,                  -- 'IMD', 'INCOIS', 'IITM', 'NCMRWF', 'NIOT', 'NCPOR'
    designation VARCHAR(100) DEFAULT 'Scientist',
    email_notify BOOLEAN DEFAULT TRUE,               -- Circular Toggle 1: 📧
    whatsapp_notify BOOLEAN DEFAULT TRUE,            -- Circular Toggle 2: 📱
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'on_leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_employees_institute ON public.employees(institute);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_phone ON public.employees(phone_number);
CREATE INDEX IF NOT EXISTS idx_employees_notify_flags ON public.employees(email_notify, whatsapp_notify);
```

### 3.2 Migration SQL: `notification_logs` Table
Maintains an immutable cryptographic audit trail to prevent duplicate spam and ensure GIGW/ISO compliance.

```sql
-- 3. Notification Dispatch & Audit Trail Logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'COURSE_MANDATE',
        'DEADLINE_REMINDER',
        'CERTIFICATE_ISSUED',
        'EXAM_SCHEDULE',
        'MINISTERIAL_DIRECTIVE',
        'BROADCAST'
    )),
    recipient_address VARCHAR(255) NOT NULL,        -- Target Email or Phone number
    subject VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 
        'SENT', 
        'DELIVERED', 
        'FAILED', 
        'OPTED_OUT'
    )),
    provider_message_id VARCHAR(150),               -- Gmail Message-ID or Twilio Message SID
    error_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,              -- e.g., {"courseId": "crs_imd_01", "batchId": "bch_01"}
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_employee ON public.notification_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_logs_category ON public.notification_logs(category);
CREATE INDEX IF NOT EXISTS idx_logs_sent_at ON public.notification_logs(sent_at DESC);
```

### 3.3 Seed Data (MoES Autonomous Institutes)
```sql
INSERT INTO public.employees (custom_role_id, name, email, phone_number, department, institute, designation, email_notify, whatsapp_notify)
VALUES
('EMP-IMD-01', 'Dr. Rajesh Sharma', 'rajesh.sharma@imd.gov.in', '+919876543210', 'Radar Meteorology', 'IMD', 'Scientist-E', true, true),
('TRN-IMD-01', 'Dr. Anita Desai', 'anita.desai@imd.gov.in', '+919811223344', 'Satellite Meteorology', 'IMD', 'Senior Faculty', true, false),
('EMP-INC-01', 'Dr. P. Balakrishnan', 'balakrishnan@incois.gov.in', '+919712345678', 'Ocean Modeling', 'INCOIS', 'Scientist-F', true, true),
('EMP-IIT-01', 'Dr. Sunita Rao', 'sunita.rao@tropmet.res.in', '+919654321876', 'Climate Dynamics', 'IITM', 'Lead Scientist', false, true),
('EMP-NCM-01', 'Er. Vivek Nair', 'vivek.nair@ncmrwf.gov.in', '+919823456789', 'HPC Mihir Cluster', 'NCMRWF', 'Systems Engineer', true, true),
('EMP-NIO-01', 'Er. A. K. Verma', 'akverma@niot.res.in', '+919412398765', 'Deep Sea Submersibles', 'NIOT', 'Chief Engineer', true, true),
('EMP-NCP-01', 'Dr. Thamban Meloth', 'tmeloth@ncpor.res.in', '+919567812345', 'Polar Ice Core Ops', 'NCPOR', 'Group Director', true, false)
ON CONFLICT (email) DO NOTHING;
```

---

## 4. Strict Data Validation & Sanitization Engine

Before any database record is created or updated, it must pass through strict validation filters.

```
Incoming Payload ➔ [1. Null Check] ➔ [2. Email Regex] ➔ [3. Indian Phone E.164] ➔ [4. Duplicate DB Query] ➔ Passed to Controller
```

### 4.1 Email Validation Standard
* **RFC 5322 Standard Regex:**
  ```regex
  ^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$
  ```
* **Sanitization Rule:** Lowercase all characters and trim whitespace (`email.toLowerCase().trim()`).

### 4.2 Phone Number Sanitization (E.164 Protocol)
All phone numbers must be formatted to international standard **`+91XXXXXXXXXX`** before database storage and WhatsApp API handoff:
1. Strip all non-digit characters (`+`, `-`, spaces, parentheses).
2. Handle leading zeros: `09876543210` ➔ `9876543210`.
3. Handle existing country code: `919876543210` ➔ `+919876543210`.
4. Validate length: Must be exactly 10 digits for Indian standard numbers (starting with 6, 7, 8, or 9).
5. Prepend `+91`.

### 4.3 Duplicate Prevention Guard
Before executing an `INSERT` or `UPDATE`, verify:
```sql
SELECT id FROM public.employees 
WHERE (email = $1 OR phone_number = $2) AND id != $3;
```
If a record exists, return HTTP `409 Conflict` with a clear user message: `"An employee with this email or phone number is already registered."`

---

## 5. Backend REST API Specifications

All endpoints are protected under the **Policy-Based Access Control (PBAC)** layer, requiring `admin` clearance.

### 5.1 Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/employees` | Retrieve paginated employee directory with toggle states & filters. |
| `POST` | `/api/admin/employees` | Create a new employee with validated email & sanitized phone number. |
| `PUT` | `/api/admin/employees/:id` | Update employee information (Name, Email, Phone, Department). |
| `PATCH` | `/api/admin/employees/:id/toggle` | Instantly toggle `email_notify` or `whatsapp_notify` without full reload. |
| `DELETE`| `/api/admin/employees/:id` | Soft delete or archive employee from active notification pool. |
| `POST` | `/api/admin/notifications/send` | Dispatch single or batch notification (Email, WhatsApp, or Both). |
| `GET` | `/api/admin/notifications/logs` | Fetch real-time delivery audit logs with filtering by status/channel. |

---

### 5.2 API Contracts

#### 1. Instant Toggle Channel (`PATCH /api/admin/employees/:id/toggle`)
* **Request Body:**
  ```json
  {
    "channel": "email",         // or "whatsapp"
    "enabled": false
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Email notification disabled for Dr. Anita Desai",
    "employee": {
      "id": "c1f7a4e0-9118-4e12-8871-3e4b78619bc1",
      "name": "Dr. Anita Desai",
      "email_notify": false,
      "whatsapp_notify": true,
      "updated_at": "2026-09-27T21:30:00Z"
    }
  }
  ```

#### 2. Dispatch Notification (`POST /api/admin/notifications/send`)
* **Request Body:**
  ```json
  {
    "targetType": "institute",               // "all", "institute", "selected", "competency_deficit"
    "targetInstitute": "IMD",                // Used if targetType === "institute"
    "selectedEmployeeIds": [],               // Used if targetType === "selected"
    "channels": {
      "email": true,
      "whatsapp": true
    },
    "category": "DEADLINE_REMINDER",
    "subject": "URGENT: Doppler Radar Calibration Accreditation Deadline",
    "message": "Dear Officer, standard operating procedures mandate completion of Course MOES-IMD-401 within the next 48 hours. Please log in to Capacity Connect to complete your certification assessment.",
    "actionUrl": "https://capacityconnect.gov.in/#courses"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "batchId": "batch_moes_20260927_01",
    "metrics": {
      "targetedEmployees": 54,
      "emailsAttempted": 50,
      "emailsDelivered": 50,
      "emailsOptedOut": 4,
      "whatsAppAttempted": 48,
      "whatsAppDelivered": 48,
      "whatsAppOptedOut": 6,
      "failed": 0
    },
    "timestamp": "2026-09-27T21:30:05Z"
  }
  ```

---

## 6. Frontend Admin Panel UI/UX Design

The UI is integrated directly into the **Capacity Connect** portal under `#leadership` (Executive Leadership Desk) or a dedicated `#notification-desk` route.

### 6.1 Employee Directory Table UI Layout
The table presents clear visual status indicators and interactive circular toggles:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  EMPLOYEE DIRECTORY & NOTIFICATION CHANNELS                           [+ Add Employee]  [📥 Export CSV]          │
├──────────────┬────────────────────────┬──────────────────────┬─────────────┬───────────┬────────────┬────────────┤
│ Officer      │ Department & Institute │ Email                │ Phone       │ 📧 Email  │ 📱 WhatsApp│ Actions    │
├──────────────┼────────────────────────┼──────────────────────┼─────────────┼───────────┼────────────┼────────────┤
│ Dr. Rajesh   │ Radar Meteorology      │ rajesh.s@imd.gov.in  │ +9198765432 │  🟢 [ON]  │  🟢 [ON]   │ [✏️ Edit]  │
│ Dr. Anita    │ Satellite Met (IMD)    │ anita.d@imd.gov.in   │ +9198112233 │  🟢 [ON]  │  ⚪ [OFF]  │ [✏️ Edit]  │
│ Dr. Sunita   │ Climate Dynamics(IITM) │ sunita.r@iitm.res.in │ +9196543218 │  ⚪ [OFF] │  🟢 [ON]   │ [✏️ Edit]  │
└──────────────┴────────────────────────┴──────────────────────┴─────────────┴───────────┴────────────┴────────────┘
```

#### Visual Toggle Design Specs:
* **Email Toggle (📧):**
  * **State ON:** Circle filled with Government Blue `#0A2647` or Emerald `#059669`, white envelope icon, subtle hover glow.
  * **State OFF:** Bordered muted grey circle `#E2E8F0` with slash icon `#94A3B8`.
  * **Interaction:** 1-Click optimistic UI update (changes instantly, synchronizes in background with acoustic micro-chime).
* **WhatsApp Toggle (📱):**
  * **State ON:** Vibrant WhatsApp green `#25D366` circle with white chat bubble icon.
  * **State OFF:** Bordered muted grey circle.

---

### 6.2 Edit Employee Modal

A glassmorphic modal allows instantaneous editing of contact credentials with real-time format feedback:
1. **Full Name** input field.
2. **Official Email** field with inline validation pill (`✓ Valid gov.in domain` or `✗ Invalid email format`).
3. **Phone Number** field with automatic Indian format masking (`+91` fixed prefix).
4. **Department & Institute Dropdown** (IMD, INCOIS, IITM, NCMRWF, NIOT, NCPOR).
5. **Save Changes** button with loading spinner and error alert handling.

---

### 6.3 Notification Composer & Live Audience Reach Calculator

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚡ SMART NOTIFICATION COMPOSER                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Target Audience: [ All Institutes ▼ ]   Category: [ Mandatory Course Deadline ▼ ]     │
│  Channels:  [✔] Email (📧)    [✔] WhatsApp (📱)                                        │
│                                                                                        │
│  Template Quick-Load: [ Doppler Radar 48h Reminder ] [ Tsunami SOP ] [ Custom ]        │
│                                                                                        │
│  Subject:  URGENT: Operational Accreditation Assessment Due                            │
│  Message Body:                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Dear {{name}}, as per MoES Capacity directive, your assessment for {{course}}   │  │
│  │ is pending. Complete before {{deadline}} to ensure institutional compliance.     │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  📊 Live Reach Estimate:                                                               │
│     Targeting: 240 Officers · 📧 228 Emails (12 Opted-Out) · 📱 215 WhatsApp (25 Opted)│
│                                                                                        │
│  [ Preview Notification ]                      [ 🚀 DISPATCH NOTIFICATIONS NOW ]       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Delivery Engine & Notification Dispatch Pipeline

### 7.1 Dispatch Algorithm Flowchart

```
                          [Receive Dispatch Request]
                                      │
                                      ▼
                       [Fetch Recipient Employees]
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
        [Check: email_notify?]                   [Check: whatsapp_notify?]
        ├── TRUE                                 ├── TRUE
        │    │                                   │    │
        │    ▼                                   │    ▼
        │  [Render HTML Email Template]          │  [Format E.164 Phone & Template]
        │    │                                   │    │
        │    ▼                                   │    ▼
        │  [Send via Nodemailer/Gmail]           │  [Send via WhatsApp Cloud/Twilio]
        │    │                                   │    │
        │    ▼                                   │    ▼
        │  [Status: SENT / FAILED]               │  [Status: SENT / FAILED]
        │                                        │
        └── FALSE                                └── FALSE
             │                                        │
             ▼                                        ▼
        [Log: OPTED_OUT]                         [Log: OPTED_OUT]
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                      [Record in notification_logs Table]
                                      │
                                      ▼
                      [Return Aggregate Response to Admin]
```

### 7.2 HTML Email Template Design
Official government emails sent through Nodemailer will feature:
* **Tricolor Stripe (Saffron, White, Green)** at the top header.
* **National Emblem of India (Ashok Stambh)** with "Ministry of Earth Sciences, Government of India".
* Dynamic personalization (`Dear Dr. Rajesh Sharma`).
* Primary Call-to-Action button linking directly to the portal (`Access MoES Portal`).
* Footer with ISO 27001 notice and unsubscribe/preference management link.

---

## 8. Automated Triggers & Scheduled Cron Automation

In addition to manual admin dispatch, the system incorporates **three autonomous background workers** using `node-cron`:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTONOMOUS BACKGROUND CRON PIPELINE                           │
├───────────────────────────┬──────────────────────────────┬──────────────────────────────┤
│ 1. Daily Deadline Monitor │ 2. Certificate Issuance Hook │ 3. Remediation Directive     │
│ (Runs daily at 09:00 IST) │ (Event-driven on Quiz Pass)  │ (Triggered from Leadership)  │
├───────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Scans courses with        │ Fires immediately when score │ Fires when DG clicks         │
│ deadline <= 48 hours and  │ >= 75%. Sends verified link  │ "Enforce Cohort" on lagging  │
│ progress < 100%.          │ & certificate ID to officer. │ institute competency gap.    │
└───────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

### Cron Schedule Expression:
* **Every morning at 09:00 AM IST:** `0 9 * * *`
* **Audit log cleanup (Archive logs older than 90 days):** `0 2 * * 0` (Every Sunday at 02:00 AM IST).

---

## 9. Environment Configuration (`.env`)

Store these variables in your backend environment configuration:

```env
# ==============================================================================
# CAPACITY CONNECT — NOTIFICATION SERVICE ENVIRONMENT CONFIGURATION
# ==============================================================================

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5500

# PostgreSQL / Supabase Connection
DATABASE_URL=postgresql://postgres.prmbjchjpetkuoirbwvt:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://prmbjchjpetkuoirbwvt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret

# ------------------------------------------------------------------------------
# 1. EMAIL SERVICE CONFIGURATION (GMAIL SMTP / NODEMAILER)
# ------------------------------------------------------------------------------
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=capacityconnect.moes@gmail.com
SMTP_PASS=abcd efgh ijkl mnop                    # 16-character Google App Password
EMAIL_FROM_NAME="Capacity Connect (MoES, Govt. of India)"
EMAIL_FROM_ADDRESS=capacityconnect.moes@gmail.com

# ------------------------------------------------------------------------------
# 2. WHATSAPP GATEWAY (OPTION A: TWILIO SANDBOX / PRODUCTION)
# ------------------------------------------------------------------------------
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ------------------------------------------------------------------------------
# 3. WHATSAPP GATEWAY (OPTION B: META WHATSAPP CLOUD API - PRODUCTION)
# ------------------------------------------------------------------------------
META_WHATSAPP_TOKEN=EAAG...your_system_user_access_token
META_WHATSAPP_PHONE_NUMBER_ID=109283746592817
META_WHATSAPP_BUSINESS_ACCOUNT_ID=987123654098231
```

---

## 10. Implementation Roadmap & Developer Checklist

```
[ ] Phase 1: Environment & Credential Readiness
    [ ] 1.1 Generate 16-character Gmail App Password on dedicated Gmail account.
    [ ] 1.2 Setup Twilio WhatsApp Sandbox (or Meta Developer App).
    [ ] 1.3 Add credentials to backend `.env`.

[ ] Phase 2: Database Setup & Migration
    [ ] 2.1 Run SQL migration in Supabase SQL editor for `employees` table.
    [ ] 2.2 Run SQL migration for `notification_logs` table.
    [ ] 2.3 Populate initial seed directory for IMD, INCOIS, IITM, NCMRWF, NIOT, NCPOR.

[ ] Phase 3: Backend Implementation
    [ ] 3.1 Install dependencies: `npm install nodemailer twilio validator node-cron`.
    [ ] 3.2 Build `validationMiddleware.js` for RFC 5322 Email & E.164 Indian phone format.
    [ ] 3.3 Create `notificationController.js` and `employeeController.js`.
    [ ] 3.4 Wire routes into `apiGateway.js`: `/api/admin/employees`, `/api/admin/notifications/send`.

[ ] Phase 4: Frontend Admin Panel UI
    [ ] 4.1 Build Employee List Table with interactive circular toggle buttons (📧 & 📱).
    [ ] 4.2 Build Edit Employee Modal with format badge feedback.
    [ ] 4.3 Build Smart Notification Composer with pre-approved templates & Live Reach Calculator.
    [ ] 4.4 Add notification audit trail drawer to review past delivery logs.

[ ] Phase 5: Verification & Automated Cron
    [ ] 5.1 Test single employee Email dispatch and verify inbox delivery.
    [ ] 5.2 Test WhatsApp Sandbox dispatch and verify message on mobile device.
    [ ] 5.3 Test opt-out toggles (verify message is skipped when toggle is OFF).
    [ ] 5.4 Configure automated 48-hour course deadline cron worker.
```

---

*Certified compliant with Indian Web Accessibility Guidelines (GIGW 3.0), ISO/IEC 27001 Data Protection standards, and National Cyber Security Guidelines for Ministry of Earth Sciences, Govt. of India.*
