/**
 * server.js - Production-Ready REST API & Static File Server
 * Capacity Connect LMS (Ministry of Earth Sciences)
 */

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

// API Gateway
const apiGateway = require("./gateway/apiGateway.js");

// Controllers
const authController = require("./controllers/authController.js");
const courseController = require("./controllers/courseController.js");
const liveClassController = require("./controllers/liveClassController.js");
const quizController = require("./controllers/quizController.js");
const certificateController = require("./controllers/certificateController.js");
const adminController = require("./controllers/adminController.js");

// Models
const NotificationModel = require("./models/Notification.js");
const DiscussionModel = require("./models/Discussion.js");

// Middleware
const { optionalAuth, requireAuth } = require("./middleware/authMiddleware.js");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, "../../");

// MIME types for static assets
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".woff": "font/woff"
};

/**
 * Utility to parse request body as JSON
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
      if (body.length > 1e7) {
        // 10MB limit
        req.destroy();
        reject(new Error("Request payload too large"));
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on("error", reject);
  });
}

/**
 * Helper to decorate res with Express-like helpers (.status, .json, .send)
 */
function enhanceResponse(res) {
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (obj) {
    this.setHeader("Content-Type", "application/json; charset=utf-8");
    this.end(JSON.stringify(obj, null, 2));
    return this;
  };
  res.send = function (content) {
    this.end(content);
    return this;
  };
}

/**
 * Main Request Handler
 */
async function handleRequest(req, res) {
  enhanceResponse(res);

  // Set CORS headers for enterprise API accessibility
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  req.query = parsedUrl.query || {};

  // Parse JSON body for mutation requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    req.body = await parseJsonBody(req);
  } else {
    req.body = {};
  }

  // Populate req.user if Authorization header is present
  await new Promise(resolve => optionalAuth(req, res, resolve));

  // --- SECURE API GATEWAY ROUTING ---
  if (pathname.startsWith("/api/")) {
    try {
      return await apiGateway.dispatch(req, res, pathname);
    } catch (err) {
      console.error(`[API Gateway Error] ${req.method} ${pathname}:`, err);
      return res.status(500).json({
        success: false,
        error: err.message || "Internal server error"
      });
    }
  }

  // --- STATIC FILE SERVING ---
  serveStaticFile(pathname, res);
}

/**
 * Static file server for frontend client
 */
function serveStaticFile(reqPath, res) {
  let relativePath = reqPath === "/" ? "/index.html" : reqPath;

  // Prevent directory traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");

  // Priority check: frontend/ directory first, then root directory
  let filePath = path.join(ROOT_DIR, "frontend", safePath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT_DIR, safePath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    // SPA fallback: return index.html
    const spaFallback = fs.existsSync(path.join(ROOT_DIR, "frontend/index.html"))
      ? path.join(ROOT_DIR, "frontend/index.html")
      : path.join(ROOT_DIR, "index.html");

    if (fs.existsSync(spaFallback)) {
      filePath = spaFallback;
    } else {
      res.status(404).setHeader("Content-Type", "text/plain");
      return res.end("404 Not Found");
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).setHeader("Content-Type", "text/plain");
      return res.end("Error reading file: " + err.message);
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-cache");
    res.end(data);
  });
}

// Start HTTP server
const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Capacity Connect (समर्थ-पृथ्वी) LMS Server running!`);
    console.log(`🏛️  MoES Enterprise E-Learning & Capacity Building`);
    console.log(`🌐 Local Preview:   http://localhost:${PORT}`);
    console.log(`📡 REST API Root:   http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = { server, handleRequest };
