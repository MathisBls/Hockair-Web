import Rank from "../models/Rank.js";

// Récupérer tous les rangs
export const getRanks = async (req, res) => {
  try {
    const ranks = await Rank.find();
    res.status(200).json(ranks);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Créer un nouveau rang
export const createRank = async (req, res) => {
  const { name, rank, elo, icon } = req.body;

  try {
    const newRank = await Rank.create({ name, rank, elo, icon });
    res.status(201).json(newRank);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Mettre à jour un rang
export const updateRank = async (req, res) => {
  const { rankId } = req.params;
  const { name, rank, elo, icon } = req.body;

  try {
    const updatedRank = await Rank.findByIdAndUpdate(rankId, { name, rank, elo, icon }, { new: true });
    res.status(200).json(updatedRank);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Supprimer un rang
export const deleteRank = async (req, res) => {
  const { rankId } = req.params;

  try {
    await Rank.findByIdAndDelete(rankId);
    res.status(200).json({ message: "Rank deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Récupérer un rang par ID
export const getRankById = async (req, res) => {
  const { rankId } = req.params;

  try {
    const rank = await Rank.findById(rankId);
    if (!rank) {
      return res.status(404).json({ message: "Rank not found." });
    }
    res.status(200).json(rank);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
