const Expense = require("../models/Expense");
const parseOCR = require("../utils/ocrParser");
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

exports.uploadReceipt = async (req, res) => {
  try {
    const filePath = req.file.path;
    const result = await Tesseract.recognize(filePath, "eng");
    const ocrText = result.data.text;
    const parsedData = parseOCR(ocrText);

    const expense = new Expense({
      ...parsedData,
      userId: req.user.id,
      category: "draft",
      receiptUrl: `/uploads/${path.basename(filePath)}`,
      ocrRaw: { text: ocrText }
    });
    await expense.save();
    res.json({ expense, ocrRaw: ocrText });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listExpenses = async (req, res) => {
  try {
    let { month } = req.query;
    let filter = { userId: req.user.id };
    if (month) {
      const firstDay = new Date(`${month}-01`);
      const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0);
      filter.date = { $gte: firstDay, $lte: lastDay };
    }
    const expenses = await Expense.find(filter);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};