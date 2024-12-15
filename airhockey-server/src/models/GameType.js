import mongoose from 'mongoose';

const gameTypeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    eloImpact: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const GameType = mongoose.model('GameType', gameTypeSchema);

export default GameType;
