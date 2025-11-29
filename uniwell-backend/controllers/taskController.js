const Task = require("../models/Task");

// ✅ GET /api/tasks - Get all tasks
exports.listTasks = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { userId: req.user.id };
    
    if (from && to) {
      filter.dueAt = { $gte: new Date(from), $lte: new Date(to) };
    }
    
    const tasks = await Task.find(filter).sort({ dueAt: 1 });
    
    console.log(`✅ Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (err) {
    console.error("❌ listTasks error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET /api/tasks/upcoming - Get upcoming tasks for Dashboard (FIXED)
exports.getUpcoming = async (req, res) => {
  try {
    // ✅ FIXED: Don't filter by dueAt >= now, get all undone tasks
    const tasks = await Task.find({
      userId: req.user.id,
      isDone: false
    })
    .sort({ dueAt: 1 })
    .limit(5);
    
    console.log(`📋 Found ${tasks.length} total tasks for user ${req.user.id}`);
    
    // ✅ FIXED: Format response properly for Dashboard
    const formatted = tasks.map(t => {
      const dueDate = t.dueAt ? new Date(t.dueAt) : new Date();
      
      return {
        id: t._id,
        title: t.title || "Untitled Task",
        dueDate: dueDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        priority: t.priority || 'medium',
        category: t.category || 'General',
        isDone: t.isDone || false
      };
    });
    
    console.log(`✅ Returning ${formatted.length} upcoming tasks to Dashboard`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ getUpcoming error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ POST /api/tasks - Create new task (FIXED TIME HANDLING)
exports.createTask = async (req, res) => {
  try {
    const { title, date, time, category, priority, description } = req.body;
    
    console.log("📝 Creating task with:", { title, date, time, category, priority });
    
    // ✅ FIXED: Properly combine date and time using UTC
    let dueAt;
    
    if (date && time) {
      // Parse date and time components
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create date in local timezone to preserve the exact time user selected
      dueAt = new Date(year, month - 1, day, hours, minutes, 0);
      console.log("📅 Combined datetime:", { date, time }, "→", dueAt);
    } else if (date) {
      dueAt = new Date(date);
    } else {
      dueAt = new Date();
    }
    
    // Validate date
    if (isNaN(dueAt.getTime())) {
      console.error("❌ Invalid date created");
      return res.status(400).json({ message: "Invalid date/time format" });
    }
    
    const task = new Task({
      userId: req.user.id,
      title: title || "Untitled Task",
      description: description || "",
      dueAt,
      category: category || "General",
      priority: priority || "medium",
      isDone: false
    });
    
    await task.save();
    console.log("✅ Task created:", task._id, "with dueAt:", task.dueAt);
    
    // Return task with formatted date/time for frontend
    const responseTask = {
      ...task.toObject(),
      date: date,
      time: time
    };
    
    res.json(responseTask);
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ PUT /api/tasks/:id - Update task
exports.updateTask = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // ✅ FIXED: Handle time update properly
    if (date && time) {
      const dateTimeString = `${date}T${time}:00`;
      req.body.dueAt = new Date(dateTimeString);
      console.log("📅 Updating datetime to:", dateTimeString, "→", req.body.dueAt);
    }
    
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    console.log("✅ Task updated:", updated._id);
    res.json(updated);
  } catch (err) {
    console.error("❌ updateTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE /api/tasks/:id - Delete task
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    console.log("✅ Task deleted:", deleted._id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ message: err.message });
  }
};
