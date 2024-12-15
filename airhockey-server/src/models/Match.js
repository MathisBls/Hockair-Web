import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['ranked', 'friendly', 'tournament'],
    required: true,
  },
  parameters: {
    maxTime: {
      type: Number,
      default: 300, // 5 minutes
    },
    scoreLimit: {
      type: Number,
      default: 10,
    },
    itemsEnabled: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: String,
      enum: ['classic', 'timed', 'sudden death'],
      default: 'classic',
    },
  },
  result: {
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scorePlayer1: {
      type: Number,
      default: 0,
    },
    scorePlayer2: {
      type: Number,
      default: 0,
    },
  },
  replayData: {
    type: String,
    default: '',
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
});

const Match = mongoose.model('Match', matchSchema);

export default Match;
