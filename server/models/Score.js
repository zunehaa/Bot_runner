const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  score: { type: Number, required: true },
  coins: { type: Number, required: true },
  distance: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for fast leaderboard sorting
ScoreSchema.index({ score: -1 });

module.exports = mongoose.model('Score', ScoreSchema);
