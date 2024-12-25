const leaderboardSchema = new mongoose.Schema({
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    elo: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
