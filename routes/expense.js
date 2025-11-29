const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const controller = require("../controllers/expenseController");
const auth = require("../middleware/auth");
const multer = require("multer");

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, "..", "uploads");
const receiptsDir = path.join(uploadsDir, "receipts");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, receiptsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ✅ GET /api/expenses - Get all expenses
router.get("/", auth, controller.getExpenses);

// ✅ POST /api/expenses - Create expense manually (ADDED)
router.post("/", auth, async (req, res) => {
  try {
    const Expense = require("../models/Expense");
    const expense = new Expense({
      userId: req.user.id,
      amount: req.body.amount || 0,
      merchant: req.body.merchant || "",
      category: req.body.category || "Others",
      date: req.body.date ? new Date(req.body.date) : new Date(),
      items: req.body.items || []
    });
    
    await expense.save();
    console.log("✅ Manual expense created:", expense._id);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("❌ Create expense error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ POST /api/expenses/upload - Upload receipt with OCR
router.post("/upload", auth, upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    const file = files.find(f => 
      ["receipt", "file", "image", "avatar"].includes(f.fieldname)
    ) || files[0];
    
    if (!file) {
      return res.status(400).json({ 
        message: "No file uploaded. Use field name 'receipt' or 'file'." 
      });
    }
    
    req.savedFile = file;
    return controller.uploadReceipt(req, res);
  } catch (err) {
    console.error("❌ Expense upload route error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ✅ PUT /api/expenses/:id - Update expense
router.put("/:id", auth, controller.updateExpense);

// ✅ DELETE /api/expenses/:id - Delete expense
router.delete("/:id", auth, controller.deleteExpense);

module.exports = router;