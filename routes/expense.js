const router = require("express").Router();
const expenseController = require("../controllers/expenseController");
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("receipt"), expenseController.uploadReceipt);
router.get("/", auth, expenseController.listExpenses);
router.put("/:id", auth, expenseController.updateExpense);
router.delete("/:id", auth, expenseController.deleteExpense);
module.exports = router;