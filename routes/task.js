const router = require("express").Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

// list tasks, with from & to param for filter
router.get("/", auth, taskController.listTasks);
router.post("/", auth, taskController.createTask);
router.put("/:id", auth, taskController.updateTask);
router.delete("/:id", auth, taskController.deleteTask);
// upload attachment? (generic upload) bisa pakai /api/upload
module.exports = router;