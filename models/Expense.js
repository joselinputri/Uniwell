const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  currency: String,
  date: Date,
  merchant: String,
  items: [{ name: String, price: Number, qty: Number }],
  category: String,
  receiptUrl: String,
  ocrRaw: Object,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Expense", expenseSchema);