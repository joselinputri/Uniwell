const HealthLog = require("../models/HealthLog");

// ✅ GET /api/health/logs - Get all health logs
exports.getLogs = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user.id };
    if (date) filter.date = date;
    
    const logs = await HealthLog.find(filter).sort({ date: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("❌ getLogs error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET /api/health/today - Get today's stats for Dashboard
exports.getTodayStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let log = await HealthLog.findOne({ userId: req.user.id, date: today });
    
    if (!log) {
      // Return default values if no log exists
      return res.json({
        success: true,
        data: {
          mood: "neutral",
          waterIntake: 0,
          waterGoal: 2000,
          sleepHours: 0,
          sleepGoal: 8,
          energyLevel: 50,
          exercises: []
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        mood: log.mood || "neutral",
        waterIntake: log.waterMl || 0,
        waterGoal: 2000,
        sleepHours: log.sleepHours || 0,
        sleepGoal: 8,
        energyLevel: log.energy || 50,
        exercises: log.exercises || []
      }
    });
  } catch (err) {
    console.error("❌ getTodayStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/health/logs - Create or Update daily health log (FIXED)
exports.createOrUpdateLog = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { mood, waterMl, sleepHours, energy, notes, exercises } = req.body;
    
    console.log("📝 Health check-in:", { mood, waterMl, sleepHours, energy });
    
    let log = await HealthLog.findOne({ userId: req.user.id, date: today });
    
    if (log) {
      // ✅ Update existing log
      if (mood !== undefined) log.mood = mood;
      if (waterMl !== undefined) log.waterMl = waterMl;
      if (sleepHours !== undefined) log.sleepHours = sleepHours;
      if (energy !== undefined) log.energy = energy;
      if (notes !== undefined) log.notes = notes;
      if (exercises !== undefined) log.exercises = exercises;
      
      await log.save();
      console.log("✅ Health log updated for:", today);
      
      // ✅ FIX: Use res.json() instead of return
      return res.json({ 
        success: true, 
        data: log, 
        message: "Health log updated" 
      });
    }
    
    // ✅ Create new log
    log = new HealthLog({
      userId: req.user.id,
      date: today,
      mood: mood || "neutral",
      waterMl: waterMl || 0,
      sleepHours: sleepHours || 0,
      energy: energy || 50,
      notes: notes || "",
      exercises: exercises || []
    });
    
    await log.save();
    console.log("✅ Health log created for:", today);
    
    // ✅ FIX: Use res.json() instead of return
    return res.json({ 
      success: true, 
      data: log, 
      message: "Health log created" 
    });
    
  } catch (err) {
    console.error("❌ createOrUpdateLog error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ✅ DELETE /api/health/logs/:date - Delete specific health log
exports.deleteLog = async (req, res) => {
  try {
    const result = await HealthLog.deleteOne({ 
      userId: req.user.id, 
      date: req.params.date 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Health log not found" 
      });
    }
    
    res.json({ success: true, message: "Health log deleted" });
  } catch (err) {
    console.error("❌ deleteLog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};