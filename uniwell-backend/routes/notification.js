const router = require("express").Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/", auth, notificationController.listNotifications);
router.put("/:id/read", auth, notificationController.readNotification);
module.exports = router;