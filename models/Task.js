const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  dueAt: Date,
  category: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  attachments: [String],
  isDone: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Task", taskSchema);