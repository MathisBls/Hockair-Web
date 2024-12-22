import mongoose from 'mongoose';

const skinSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['puck', 'mallet', 'table'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    filePath: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  const Skin = mongoose.model('Skin', skinSchema);

  export default Skin;
