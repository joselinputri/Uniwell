const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  category: String,
  time: String,
  nextRunAt: Date,
  repeat: { type: String, enum: ["none", "daily", "weekly"], default: "none" },
  daysOfWeek: [Number], // 0=Sunday, ..., 6=Saturday
  linkedEntity: String, // e.g. "task:<id>"
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Reminder", reminderSchema);