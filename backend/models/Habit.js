const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  frequency: { type: String, enum: ['daily','weekly'], default: 'daily' },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now },
  checkins: [{ date: { type: Date, default: Date.now } }],
  
});

// prevent duplicate per user (index)
HabitSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Habit', HabitSchema);
