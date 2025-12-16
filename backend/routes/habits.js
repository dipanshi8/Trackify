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
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    // Validate frequency
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Frequency must be "daily" or "weekly"' });
    }

    const habit = new Habit({ 
      userId: req.user._id, 
      name: name.trim(), 
      frequency, 
      category: category || 'General' 
    });
    
    await habit.save();
    return res.status(201).json(habit);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Habit with this name already exists' });
    }
    console.error('Create habit error:', err);
    return res.status(500).json({ message: 'Failed to create habit' });
  }
});

/**
 * GET /api/habits
 * List user's habits
 */
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const results = await Promise.all(habits.map(async (h) => {
      // Check if completed today
      const completedToday = await CheckIn.exists({ 
        habitId: h._id, 
        timestamp: { $gte: todayStart, $lt: todayEnd } 
      });

      // Get last check-in
      const lastCheck = await CheckIn.findOne({ habitId: h._id }).sort({ timestamp: -1 });
      
      // Calculate streak (simplified - counts consecutive days with check-ins)
      let streak = 0;
      if (lastCheck) {
        let checkDate = new Date(lastCheck.timestamp);
        checkDate.setHours(0, 0, 0, 0);
        let currentDate = new Date(now);
        currentDate.setHours(0, 0, 0, 0);
        
        while (currentDate >= checkDate) {
          const dayStart = new Date(checkDate);
          const dayEnd = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000);
          const hasCheckin = await CheckIn.exists({ 
            habitId: h._id, 
            timestamp: { $gte: dayStart, $lt: dayEnd } 
          });
          
          if (hasCheckin) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Compute completion rate (last 30 days)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const completions = await CheckIn.countDocuments({ 
        habitId: h._id, 
        timestamp: { $gte: since } 
      });
      const completionRate = Math.min(Math.round((completions / 30) * 100), 100);

      return { 
        ...h.toObject(), 
        completedToday: !!completedToday,
        streak, 
        completionRate 
      };
    }));
    
    return res.json(results);
  } catch (err) {
    console.error('Get habits error:', err);
    return res.status(500).json({ message: 'Failed to load habits' });
  }
});

/**
 * PUT /api/habits/:id
 * Edit habit
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }

    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user._id }, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    return res.json(habit);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Habit with this name already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Update habit error:', err);
    return res.status(500).json({ message: 'Failed to update habit' });
  }
});

/**
 * DELETE /api/habits/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }

    const habit = await Habit.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Delete associated check-ins
    await CheckIn.deleteMany({ habitId: id });
    
    return res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    console.error('Delete habit error:', err);
    return res.status(500).json({ message: 'Failed to delete habit' });
  }
});

/**
 * POST /api/habits/:id/checkin
 * Create checkin for today/week
 */
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }

    const habit = await Habit.findById(id);
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to check in this habit' });
    }

    const now = new Date();
    let exists;
    
    // Check for duplicate check-in based on frequency
    if (habit.frequency === 'daily') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      exists = await CheckIn.findOne({ 
        habitId: id, 
        timestamp: { $gte: start, $lt: end } 
      });
    } else {
      // Weekly: find ISO week range (Monday to Sunday)
      const day = now.getDay(); // 0..6 Sun..Sat
      const diffToMonday = ((day + 6) % 7); // Monday as start
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 7);
      exists = await CheckIn.findOne({ 
        habitId: id, 
        timestamp: { $gte: monday, $lt: sunday } 
      });
    }
    
    if (exists) {
      return res.status(400).json({ message: 'Already checked in for this period' });
    }

    // Create check-in with date string for unique index
    const dateStr = now.toISOString().split('T')[0];
    const checkin = new CheckIn({ 
      userId: req.user._id, 
      habitId: id, 
      timestamp: now,
      date: dateStr
    });
    
    await checkin.save();
    
    return res.status(201).json({ 
      message: 'Checked in successfully', 
      checkin 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already checked in for this period' });
    }
    console.error('Check-in error:', err);
    return res.status(500).json({ message: 'Failed to check in' });
  }
});

module.exports = router;
