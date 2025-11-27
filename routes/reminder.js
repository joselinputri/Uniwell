const router = require("express").Router();
const reminderController = require("../controllers/reminderController");
const auth = require("../middleware/auth");

router.get("/", auth, reminderController.listReminders);
router.post("/", auth, reminderController.createReminder);
router.put("/:id", auth, reminderController.updateReminder);
router.delete("/:id", auth, reminderController.deleteReminder);
router.post("/:id/trigger-now", auth, reminderController.triggerNow);
module.exports = router;