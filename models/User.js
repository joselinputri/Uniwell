const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  avatarUrl: String,
  age: Number,
  heightCm: Number,
  weightKg: Number,
  gender: { type: String, enum: ["male", "female", "other"] },
  dailyWaterGoalMl: { type: Number, default: 2000 },
  dailySleepGoalHrs: { type: Number, default: 7 },
  pushSubscription: Object,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("User", userSchema);