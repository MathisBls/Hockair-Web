import mongoose from "mongoose";

const rankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rank: {
    type: String,
    enum: [
      "Iron",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Master",
      "Grandmaster",
      "Challenger",
      "Legend",
      "Mythic",
    ],
    required: true,
  },
  elo: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});

const Rank = mongoose.model("Rank", rankSchema);

export default Rank;
