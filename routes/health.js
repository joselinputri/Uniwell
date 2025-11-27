const router = require("express").Router();
const healthController = require("../controllers/healthController");
const auth = require("../middleware/auth");

router.get("/logs", auth, healthController.getLogs);
router.post("/logs", auth, healthController.createOrUpdateLog);
router.delete("/logs/:date", auth, healthController.deleteLog);
// Tambahkan log stats jika perlu

module.exports = router;