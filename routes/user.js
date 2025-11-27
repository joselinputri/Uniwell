const router = require("express").Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.put("/me", auth, userController.updateProfile);
router.post("/me/push-subscription", auth, userController.savePushSub);
module.exports = router;