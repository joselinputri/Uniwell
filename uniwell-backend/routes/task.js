const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

// ✅ GET /api/tasks - Get all tasks
router.get("/", auth, taskController.listTasks);

// ✅ GET /api/tasks/upcoming - Get upcoming tasks
router.get("/upcoming", auth, taskController.getUpcoming);

// ✅ POST /api/tasks - Create new task
router.post("/", auth, taskController.createTask);

// ✅ PUT /api/tasks/:id - Update task
router.put("/:id", auth, taskController.updateTask);

// ✅ DELETE /api/tasks/:id - Delete task
router.delete("/:id", auth, taskController.deleteTask);

module.exports = router;