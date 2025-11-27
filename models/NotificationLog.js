const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  title: String,
  body: String,
  payload: Object,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("NotificationLog", notificationLogSchema);