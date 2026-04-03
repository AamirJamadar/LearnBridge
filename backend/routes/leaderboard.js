const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const QuizScore = require('../models/QuizScore');
const router = express.Router();

// @route   GET api/leaderboard
// @desc    Get global leaderboard (top users by totalScore)
router.get('/', async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('username totalScore highScores createdAt')
      .sort({ totalScore: -1 })
      .limit(10);

    // Add ranks
    const ranked = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user._doc
    }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/leaderboard/me
// @desc    Get current user's ranking and position
router.get('/me', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('username totalScore')
      .sort({ totalScore: -1 });

    const userPosition = users.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;

    const user = await User.findById(req.user._id)
      .select('username totalScore highScores');

    res.json({
      rank: userPosition,
      position: userPosition <= 3 ? ['gold', 'silver', 'bronze'][userPosition - 1] : 'normal',
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

