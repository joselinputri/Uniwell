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

// ✅ GET /api/tasks/upcoming - Get upcoming tasks for Dashboard
exports.getUpcoming = async (req, res) => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      userId: req.user.id,
      dueAt: { $gte: now },
      isDone: false
    })
    .sort({ dueAt: 1 })
    .limit(5);
    
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
    
    console.log(`✅ Found ${formatted.length} upcoming tasks`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ getUpcoming error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ POST /api/tasks - Create new task
exports.createTask = async (req, res) => {
  try {
    const { title, date, time, category, priority, description } = req.body;
    
    // ✅ FIXED: Properly combine date and time
    let dueAt = new Date();
    
    if (date && time) {
      dueAt = new Date(`${date}T${time}`);
    } else if (date) {
      dueAt = new Date(date);
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
    console.log("✅ Task created:", task._id);
    
    res.json(task);
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ PUT /api/tasks/:id - Update task
exports.updateTask = async (req, res) => {
  try {
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