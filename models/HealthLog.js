const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String }, // YYYY-MM-DD
  mood: String,
  moodScore: Number,
  sleepStart: String,
  sleepEnd: String,
  sleepHours: Number,
  waterMl: Number,
  exercised: Boolean,
  energy: Number,
  notes: String,
  attachments: [String],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("HealthLog", healthLogSchema);