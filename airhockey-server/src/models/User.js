// User model avec Mongoose
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  elo: {
    type: Number,
    default: 800,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  victories: {
    type: Number,
    default: 0,
  },
  defeats: {
    type: Number,
    default: 0,
  },
  subscription: {
    status: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  ownedSkins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skin',
    },
  ],
  ownedItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  matchHistory: [
    {
      matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
      },
      result: {
        type: String,
        enum: ['win', 'lose', 'draw'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  friends: [
    {
      friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending',
      },
    },
  ],
  isActivated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware pour mettre à jour updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
