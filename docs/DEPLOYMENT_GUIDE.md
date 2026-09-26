# Deployment & Infrastructure Guide — Capacity Connect (समर्थ-पृथ्वी)
**Ministry of Earth Sciences (MoES), Government of India**  
**Production & Infrastructure Deployment Architecture**

---

## 1. Dual-Layer Deployment Architecture

Capacity Connect is engineered for high operational resilience using a **Dual-Layer Architecture**:

1. **Production Full-Stack Mode (Node.js Server):**
   - API endpoints under `/api/*`
   - Static asset hosting for client application
   - WebSocket / WebRTC signaling readiness
   - Zero external npm dependency requirement for core server execution (`http`, `crypto`, `fs`, `path`, `url`)

2. **Zero-Config Client Preview Mode:**
   - Any modern browser can open `frontend/index.html` or root `index.html` directly or through any static file server (`python -m http.server`, Nginx, Apache, GitHub Pages, or NIC MeghRaj Cloud static storage).
   - In-memory mock service layer provides instantaneous offline fallback so presentations never fail due to network drops.

---

## 2. Quick Start: Local Execution

### Option A: Node.js API Server
```bash
# Navigate to project root
cd "d:\SIH Project"

# Start production server
node backend/src/server.js
```
The server will bind to port `3000` (or `PORT` environment variable):
- Web Portal: `http://localhost:3000/`
- Modular Frontend: `http://localhost:3000/frontend/`
- REST API Root: `http://localhost:3000/api/health`

### Option B: Zero-Config Static Server (Python / VS Code Live Server)
```bash
# Python 3
python -m http.server 8080

# Or open frontend/index.html directly in Chrome / Edge / Firefox
```

---

## 3. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security & Tokens
JWT_SECRET=moes_capacity_connect_super_secret_key_2026_sih
JWT_EXPIRES_IN=604800

# Google OAuth 2.0 Integration
GOOGLE_CLIENT_ID=moes-capacity-connect.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=moes_google_oauth_secret

# SMS Gateway (NIC / CDAC SMS Gateway)
SMS_GATEWAY_URL=https://smsgw.sms.gov.in/failsafe/HttpLink
SMS_API_KEY=mock_nic_sms_key_2026
SMS_SENDER_ID=MOESTR

# Database (For enterprise scale PostgreSQL / Mongo)
DATABASE_URL=postgresql://moes_admin:password@localhost:5432/capacity_connect_db
```

---

## 4. Docker Containerization

### `Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "backend/src/server.js"]
```

### Build & Run
```bash
docker build -t capacity-connect:latest .
docker run -d -p 3000:3000 --name moes-lms capacity-connect:latest
```

---

## 5. Government NIC MeghRaj Cloud Deployment Checklist

1. **Domain & SSL Binding:** Bind to official `.gov.in` domain (e.g., `https://capacityconnect.moes.gov.in`) with Cert-IN approved TLS 1.3 certificates.
2. **Reverse Proxy Configuration (Nginx):**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name capacityconnect.moes.gov.in;

       ssl_certificate /etc/ssl/certs/moes_gov_in.crt;
       ssl_certificate_key /etc/ssl/private/moes_gov_in.key;

       location /api/ {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           proxy_pass http://127.0.0.1:3000;
       }
   }
   ```
3. **Accessibility Compliance:** Validated for GIGW 3.0 (Guidelines for Indian Government Websites) with bilingual language switcher, font resizers (`A-`, `A`, `A+`), and high contrast color tokens.
