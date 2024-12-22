import Skin from '../models/Skin.js';

// Récupérer tous les skins
export const getAllSkins = async (req, res) => {
  try {
    const skins = await Skin.find();
    res.status(200).json(skins);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des skins', error: error.message });
  }
};

// Créer un nouveau skin
export const createSkin = async (req, res) => {
  const { name, type, price, premiumOnly } = req.body;
  const filePath = req.file ? `/assets/${req.file.filename}` : null;

  if (!filePath) {
    return res.status(400).json({ message: 'Fichier requis pour créer un skin' });
  }

  try {
    const newSkin = await Skin.create({ name, type, price, premiumOnly, filePath });
    res.status(201).json(newSkin);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du skin', error: error.message });
  }
};

// Mettre à jour un skin existant
export const updateSkin = async (req, res) => {
  const { id } = req.params;
  const { name, type, price, premiumOnly } = req.body;
  const filePath = req.file ? `/assets/${req.file.filename}` : null;

  try {
    const updatedSkin = await Skin.findByIdAndUpdate(
      id,
      { name, type, price, premiumOnly, ...(filePath && { filePath }) },
      { new: true }
    );

    if (!updatedSkin) {
      return res.status(404).json({ message: 'Skin non trouvé' });
    }

    res.status(200).json(updatedSkin);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du skin', error: error.message });
  }
};
