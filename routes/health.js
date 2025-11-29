const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");
const auth = require("../middleware/auth");

// ✅ GET /api/health/logs - Get all health logs
router.get("/logs", auth, healthController.getLogs);

// ✅ GET /api/health/today - Get today's stats (ADDED)
router.get("/today", auth, healthController.getTodayStats);

// ✅ POST /api/health/logs - Create or update daily log
router.post("/logs", auth, healthController.createOrUpdateLog);

// ✅ DELETE /api/health/logs/:date - Delete specific log
router.delete("/logs/:date", auth, healthController.deleteLog);

module.exports = router;