const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const Habit = require('../models/Habit');
const CheckIn = require('../models/CheckIn');

const router = express.Router();

/**
 * POST /api/habits
 * Create habit
 * Body: { name, frequency, category }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, frequency = 'daily', category = 'General' } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    // unique enforced by index but catch duplicates gracefully
    const habit = new Habit({ userId: req.user._id, name: name.trim(), frequency, category });
    await habit.save();
    res.json(habit);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Habit with same name already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/habits
 * List user's habits
 */
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    // augment with today's status and streaks (simple)
    const now = new Date();
    const results = await Promise.all(habits.map(async (h) => {
      const lastCheck = await CheckIn.findOne({ habitId: h._id }).sort({ timestamp: -1 });
      // compute streak naive: count consecutive days/weeks backward
      let streak = 0;
      // compute completion rate (last 30 days)
      const since = new Date(Date.now() - 30*24*60*60*1000);
      const completions = await CheckIn.countDocuments({ habitId: h._id, timestamp: { $gte: since } });
      const completionRate = Math.round((completions / 30) * 100);
      return { ...h.toObject(), lastCheck, streak, completionRate };
    }));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/habits/:id
 * Edit habit
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const habit = await Habit.findOneAndUpdate({ _id: id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate habit name' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/habits/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Habit.findOneAndDelete({ _id: id, userId: req.user._id });
    await CheckIn.deleteMany({ habitId: id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/habits/:id/checkin
 * Create checkin for today/week
 */
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your habit' });

    const now = new Date();
    // check duplicate per frequency
    let exists;
    if (habit.frequency === 'daily') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 24*60*60*1000);
      exists = await CheckIn.findOne({ habitId: id, timestamp: { $gte: start, $lt: end } });
    } else {
      // weekly: find ISO week range
      const day = now.getDay(); // 0..6 Sun..Sat
      const diffToMonday = ((day + 6) % 7); // Monday as start
      const monday = new Date(now); monday.setDate(now.getDate() - diffToMonday); monday.setHours(0,0,0,0);
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 7);
      exists = await CheckIn.findOne({ habitId: id, timestamp: { $gte: monday, $lt: sunday } });
    }
    if (exists) return res.status(400).json({ message: 'Already checked in for this period' });

    const checkin = new CheckIn({ userId: req.user._id, habitId: id, timestamp: now });
    await checkin.save();
    res.json({ message: 'Checked in', checkin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
