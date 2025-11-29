const Expense = require("../models/Expense");
const path = require("path");

// ✅ Optional OCR (tesseract.js) support
let useTesseract = false;
let tesseract = null;
try {
  tesseract = require("tesseract.js");
  useTesseract = true;
  console.log("✅ Tesseract OCR enabled");
} catch (err) {
  console.warn("⚠️ tesseract.js not installed - OCR disabled (optional)");
}

// ✅ Parse amount from OCR text
function parseAmountFromText(text) {
  if (!text) return null;
  
  const patterns = [
    /(?:total|jumlah|bayar|tagihan)\s*[:\-]?\s*Rp?\.?\s*([\d\.,]+)/gi,
    /Rp\.?\s*([\d\.,]+)/g
  ];
  
  let maxAmount = 0;
  
  for (let pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const normalized = match[1]
        .replace(/\.(?=\d{3}\b)/g, "")
        .replace(/,/g, ".");
      
      const num = parseFloat(normalized);
      if (!isNaN(num) && num > 0 && num < 10000000) {
        maxAmount = Math.max(maxAmount, num);
      }
    }
  }
  
  return maxAmount > 0 ? Math.round(maxAmount) : null;
}

// ✅ Guess category from merchant name
function guessCategory(merchant) {
  const lower = (merchant || "").toLowerCase();
  
  if (/cafe|coffee|resto|makan|warung|kedai|bakery/i.test(lower)) return "Food";
  if (/kampus|toko buku|fotocopy|print|gramedia/i.test(lower)) return "Academic";
  if (/gojek|grab|taxi|bensin|spbu|transport/i.test(lower)) return "Transport";
  if (/laundry|salon|gym|fitness/i.test(lower)) return "Lifestyle";
  if (/apotek|klinik|dokter|hospital/i.test(lower)) return "Health";
  if (/cinema|bioskop|game|entertainment/i.test(lower)) return "Entertainment";
  
  return "Others";
}

// ✅ POST /api/expenses/upload - Upload receipt with OCR
exports.uploadReceipt = async (req, res) => {
  try {
    const file = req.savedFile;
    const userId = req.user && req.user.id;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    console.log("📷 Receipt uploaded:", file.filename);

    const baseExpense = {
      userId,
      receiptUrl: `/uploads/receipts/${file.filename}`,
      ocrRaw: null,
      merchant: req.body.merchant || "Unknown Merchant",
      date: req.body.date ? new Date(req.body.date) : new Date(),
      amount: req.body.amount ? Number(req.body.amount) : 0, // ✅ Default to 0
      category: req.body.category || "",
      items: req.body.items ? JSON.parse(req.body.items) : []
    };

    // ✅ Run OCR if available
    if (useTesseract && file.mimetype.startsWith('image/')) {
      try {
        console.log("🔍 Running OCR...");
        const { createWorker } = tesseract;
        const worker = await createWorker();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        
        const { data: { text } } = await worker.recognize(
          path.join(file.destination || "./uploads/receipts", file.filename)
        );
        
        await worker.terminate();
        
        console.log("✅ OCR completed");
        baseExpense.ocrRaw = { text };
        
        // Extract amount if not provided
        if (!baseExpense.amount || baseExpense.amount === 0) {
          const parsed = parseAmountFromText(text);
          if (parsed) {
            baseExpense.amount = parsed;
            console.log("💰 Amount extracted from OCR:", parsed);
          }
        }
        
        // Extract merchant if not provided
        if (!baseExpense.merchant || baseExpense.merchant === "Unknown Merchant") {
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            baseExpense.merchant = lines[0].substring(0, 50);
          }
        }
      } catch (err) {
        console.warn("⚠️ OCR failed:", err.message);
        baseExpense.ocrRaw = { error: "OCR processing failed" };
      }
    } else {
      baseExpense.ocrRaw = { info: "OCR not available or not an image" };
    }

    // ✅ Auto-categorize if not set
    if (!baseExpense.category) {
      baseExpense.category = guessCategory(baseExpense.merchant);
      console.log("🏷️ Category guessed:", baseExpense.category);
    }

    // ✅ FIXED: Save even if amount is 0 (user can edit later)
    const expense = new Expense(baseExpense);
    await expense.save();
    
    console.log("✅ Expense saved:", expense._id);
    
    // ✅ Return success with warning if amount is 0
    const response = {
      success: true,
      data: expense
    };
    
    if (expense.amount === 0) {
      response.message = "Receipt uploaded. Please enter amount manually.";
    } else {
      response.message = "Receipt processed successfully";
    }
    
    res.status(201).json(response);
    
  } catch (err) {
    console.error("❌ uploadReceipt error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process receipt" 
    });
  }
};

// ✅ GET /api/expenses - Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const filter = { userId };
    
    if (req.query.month) {
      const [y, m] = req.query.month.split("-");
      const from = new Date(Number(y), Number(m) - 1, 1);
      const to = new Date(Number(y), Number(m), 1);
      filter.date = { $gte: from, $lt: to };
    }
    
    const list = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(200);
    
    console.log(`✅ Found ${list.length} expenses`);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error("❌ getExpenses error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch expenses" });
  }
};

// ✅ PUT /api/expenses/:id - Update expense
exports.updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user && req.user.id;
    
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId }, 
      req.body, 
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    
    console.log("✅ Expense updated:", expense._id);
    res.json({ success: true, message: "Expense updated", data: expense });
  } catch (err) {
    console.error("❌ updateExpense error:", err);
    res.status(500).json({ success: false, message: "Failed to update expense" });
  }
};

// ✅ DELETE /api/expenses/:id - Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user && req.user.id;
    
    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    
    console.log("✅ Expense deleted:", expense._id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("❌ deleteExpense error:", err);
    res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
};