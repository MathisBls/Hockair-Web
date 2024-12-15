import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    effect: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['offensive', 'defensive', 'utility'],
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  const Item = mongoose.model('Item', itemSchema);

  export default Item;
