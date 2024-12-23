import Skin from '../models/Skin.js';
import User from '../models/User.js';

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

export const buySkin = async (req, res) => {
  const userId = req.user._id;
  const { skinId } = req.params;

  try {
    const user = await User.findById(userId);
    const skin = await Skin.findById(skinId);

    if (!skin) {
      return res.status(404).json({ message: 'Skin non trouvé' });
    }

    if (user.money < skin.price) {
      return res.status(400).json({ message: 'Fonds insuffisants' });
    }

    if (user.ownedSkins.includes(skinId)) {
      return res.status(400).json({ message: 'Skin déjà acheté' });
    }

    // Ajouter le skin aux skins possédés
    user.ownedSkins.push(skinId);
    user.money -= skin.price;
    await user.save();

    res.status(200).json({ message: 'Skin acheté avec succès', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'achat du skin', error: error.message });
  }
};

// Équiper un skin
export const equipSkin = async (req, res) => {
  const userId = req.user._id;
  const { skinId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user.ownedSkins.includes(skinId)) {
      return res.status(400).json({ message: 'Skin non possédé' });
    }

    // Équiper le skin
    user.equippedSkin = skinId;
    await user.save();

    res.status(200).json({ message: 'Skin équipé avec succès', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'équipement du skin', error: error.message });
  }
};
