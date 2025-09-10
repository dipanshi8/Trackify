// backend/models/CheckIn.js
const mongoose = require("mongoose");

const CheckInSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  date: { type: String, required: true, default: Date.now },
});

// prevent duplicate check-in for same habit on same day
CheckInSchema.index({ habitId: 1, userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("CheckIn", CheckInSchema);
