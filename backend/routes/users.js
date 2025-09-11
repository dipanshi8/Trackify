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
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .limit(10)
      .select('username email');

    // exclude self
    const filtered = users.filter(u => u._id.toString() !== req.user._id.toString());
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



/**
 * GET /api/users/feed
 * Recent check-ins from followed users
 */


router.get('/feed', auth, async (req, res) => {
  try {
    const following = req.user.following || [];
    const feed = await CheckIn.find({ userId: { $in: following } })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username')
      .populate('habitId', 'name category frequency');

    const result = feed.map(f => ({
      id: f._id,
      user: f.userId.username,
      habit: f.habitId.name,
      category: f.habitId.category,
      frequency: f.habitId.frequency,
      timestamp: f.timestamp
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * GET /api/users/:id
 * Get user info for profile page
 */
router.get('/:id',auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('habits')
      .populate('followers', 'username email')
      .populate('following', 'username email');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // recent check-ins
    const recentCheckins = await CheckIn.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('habitId', 'name');

    res.json({
      ...user.toObject(),
      recentCheckins: recentCheckins.map(c => ({
        habitTitle: c.habitId ? c.habitId.name : 'Habit deleted',
        timestamp: c.timestamp,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load profile. Please try again.' });
  }
});

/**
 * GET /api/users/:id/habits
 * Optional: get only habits of a user
 */
router.get('/:id/habits', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.params.id });
    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load habits.' });
  }
});

/**
 * POST /api/users/:id/follow
 */
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot follow yourself' });

    const me = await User.findById(req.user._id);
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (!me.following.includes(target._id)) {
      me.following.push(target._id);
      target.followers.push(me._id);
      await me.save();
      await target.save();
    }

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/users/:id/unfollow
 */
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const me = await User.findById(req.user._id);
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    me.following = me.following.filter(f => f.toString() !== id);
    target.followers = target.followers.filter(f => f.toString() !== req.user._id.toString());

    await me.save();
    await target.save();

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
