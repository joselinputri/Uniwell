require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { connectWithRetry, mongooseConnection } = require("./utils/db");
const app = express();

// Mongoose warning fix (optional)
try {
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", true);
} catch (e) {
  console.warn("Could not set mongoose strictQuery:", e && e.message);
}

// === CORS configuration
const isProd = process.env.NODE_ENV === "production";
let allowedOrigins = [];
if (process.env.FRONTEND_URLS) {
  allowedOrigins = process.env.FRONTEND_URLS.split(",").map(s => s.trim());
} else {
  allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://localhost:3000"
  ];
}

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    // in dev, accept all origins for convenience
    if (!isProd) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['Authorization']
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware: block API routes (except /api/test) while DB not connected
app.use("/api", (req, res, next) => {
  // allow health test route even if DB not ready
  if (req.path === "/test") return next();

  const readyState = mongooseConnection().readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  if (readyState !== 1) {
    // Return 503 Service Unavailable so frontend/proxy gets a clear status
    return res.status(503).json({
      message: "Service temporarily unavailable: database not connected",
      dbState: readyState
    });
  }
  return next();
});

// Routes (mounted after /api middleware)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/health", require("./routes/health"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/reminders", require("./routes/reminder"));
app.use("/api/expenses", require("./routes/expense"));
app.use("/api/notifications", require("./routes/notification"));

// Healthcheck - always available (reports DB state)
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is running!",
    timestamp: new Date(),
    dbState: mongooseConnection().readyState
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "404 not found", path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err && err.message ? err.message : err);
  // If error originated from CORS or others that set status, preserve it
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5050;

// Start server listener immediately so Vite proxy has an upstream to talk to.
// DB connection runs in background. API routes are protected by middleware above.
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);

  // Try to connect to MongoDB with retries in background
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not defined in environment. Database connection skipped.");
    return;
  }

  connectWithRetry(mongoUri, {}, 6)
    .then(() => {
      console.log("MongoDB connection established (background).");
    })
    .catch((err) => {
      // connectWithRetry already logged attempts; here we log once more.
      console.error("MongoDB connection ultimately failed after retries:", err && err.message ? err.message : err);
      // Do not process.exit here so developer can inspect server responses (503) and logs.
      // Optionally: send alert or take further action.
    });
});

// Graceful handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // in production you might want to exit, but for dev keep it visible
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});