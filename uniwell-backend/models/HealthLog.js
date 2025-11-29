const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  }, // Format: YYYY-MM-DD
  mood: {
    type: String,
    enum: ["excellent", "good", "neutral", "poor", "bad"],
    default: "neutral"
  },
  moodScore: Number,
  sleepStart: String,
  sleepEnd: String,
  sleepHours: {
    type: Number,
    default: 0
  },
  waterMl: {
    type: Number,
    default: 0
  },
  exercised: {
    type: Boolean,
    default: false
  },
  energy: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  notes: String,
  attachments: [String],
  
  // ✅ FIXED: Proper array of objects schema
  exercises: [{
    id: { type: String, required: false },
    type: { type: String, required: false },
    steps: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    time: { type: String, required: false },
    date: { type: String, required: false }
  }],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index untuk query cepat
healthLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("HealthLog", healthLogSchema);