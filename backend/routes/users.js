// routes/users.js
const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Habit = require('../models/Habit');
const CheckIn = require('../models/CheckIn');

const router = express.Router();

/**
 * GET /api/users/search?q=...
 * Search users by username or email (exclude self)
 */
router.get('/search', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    
    if (q.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } } // Exclude self
      ]
    })
      .limit(10)
      .select('username email _id');

    return res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ message: 'Search failed' });
  }
});

/**
 * GET /api/users/:id
 * Get user info for profile page
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('followers', 'username email _id')
      .populate('following', 'username email _id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's habits
    const habits = await require('../models/Habit').find({ userId: id });

    // Recent check-ins
    const recentCheckins = await CheckIn.find({ userId: id })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('habitId', 'name');

    return res.json({
      ...user.toObject(),
      habits: habits || [],
      recentCheckins: recentCheckins.map(c => ({
        habitTitle: c.habitId ? c.habitId.name : 'Habit deleted',
        timestamp: c.timestamp,
      })),
    });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ message: 'Could not load profile. Please try again.' });
  }
});

/**
 * GET /api/users/:id/habits
 * Optional: get only habits of a user
 */
router.get('/:id/habits', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const habits = await Habit.find({ userId: id }).sort({ createdAt: -1 });
    
    // Augment with check-in data
    const now = new Date();
    const results = await Promise.all(habits.map(async (h) => {
      const lastCheck = await CheckIn.findOne({ habitId: h._id }).sort({ timestamp: -1 });
      
      // Check if completed today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const completedToday = await CheckIn.exists({ 
        habitId: h._id, 
        timestamp: { $gte: todayStart, $lt: todayEnd } 
      });

      // Calculate streak (simplified)
      let streak = 0;
      if (lastCheck) {
        const daysDiff = Math.floor((now - lastCheck.timestamp) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) streak = 1; // Can be improved with proper streak calculation
      }

      // Completion rate (last 30 days)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const completions = await CheckIn.countDocuments({ habitId: h._id, timestamp: { $gte: since } });
      const completionRate = Math.round((completions / 30) * 100);

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
    return res.status(500).json({ message: 'Could not load habits.' });
  }
});

/**
 * POST /api/users/:id/follow
 */
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const me = await User.findById(req.user._id);
    const target = await User.findById(id);
    
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (me.following.some(f => f.toString() === id)) {
      return res.json({ message: 'Already following this user' });
    }

    me.following.push(target._id);
    target.followers.push(me._id);
    await me.save();
    await target.save();

    return res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.error('Follow error:', err);
    return res.status(500).json({ message: 'Failed to follow user' });
  }
});

/**
 * POST /api/users/:id/unfollow
 */
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const me = await User.findById(req.user._id);
    const target = await User.findById(id);
    
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    me.following = me.following.filter(f => f.toString() !== id);
    target.followers = target.followers.filter(f => f.toString() !== req.user._id.toString());

    await me.save();
    await target.save();

    return res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('Unfollow error:', err);
    return res.status(500).json({ message: 'Failed to unfollow user' });
  }
});

/**
 * GET /api/users/feed
 * Recent check-ins from followed users
 */
router.get('/feed', auth, async (req, res) => {
  try {
    const following = req.user.following || [];
    
    if (following.length === 0) {
      return res.json([]);
    }

    const feed = await CheckIn.find({ userId: { $in: following } })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username email')
      .populate('habitId', 'name category frequency');

    const result = feed
      .filter(f => f.userId && f.habitId) // Filter out any null populated fields
      .map(f => ({
        _id: f._id,
        user: {
          _id: f.userId._id,
          username: f.userId.username,
          email: f.userId.email
        },
        habit: f.habitId.name,
        category: f.habitId.category || 'General',
        frequency: f.habitId.frequency,
        streak: 0, // Can be calculated if needed
        timestamp: f.timestamp
      }));

    return res.json(result);
  } catch (err) {
    console.error('Feed error:', err);
    return res.status(500).json({ message: 'Failed to load feed' });
  }
});

module.exports = router;
