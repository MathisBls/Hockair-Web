import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['league', 'bracket', 'pool-and-bracket'],
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  parameters: {
    maxPlayers: {
      type: Number,
      required: true,
    },
    rules: {
      type: String,
      enum: ['classic', 'timed', 'sudden death'],
      default: 'classic',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  },
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
  ],
  leaderboard: [
    {
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rank: {
        type: Number,
      },
      points: {
        type: Number,
      },
    },
  ],
  prizes: {
    firstPlace: {
      type: String,
    },
    secondPlace: {
      type: String,
    },
    thirdPlace: {
      type: String,
    },
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
