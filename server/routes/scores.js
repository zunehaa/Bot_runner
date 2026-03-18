const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Score = require('../models/Score');
const User = require('../models/User');

// Submit Score
router.post('/submit', auth, async (req, res) => {
  try {
    const { score, coins, distance } = req.body;
    const userId = req.user;

    // Basic Anti-Cheat
    // In our front-end: score = Math.floor(distance * 8) + coins * 5
    const expectedMaxScore = Math.floor(distance * 8) + coins * 5;
    if (score > expectedMaxScore + 100) { // small tolerance for floating point
      return res.status(400).json({ message: 'Invalid score detected' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update User Stats
    user.coins += coins;
    if (score > user.highScore) {
      user.highScore = score;
    }
    await user.save();

    // Create Score entry
    const newScore = new Score({
      user: userId,
      username: user.username,
      score,
      coins,
      distance
    });
    await newScore.save();

    res.json({
      message: 'Score submitted',
      stats: {
        coins: user.coins,
        highScore: user.highScore
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Top 10 Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .select('username score distance createdAt');
    
    res.json(scores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
