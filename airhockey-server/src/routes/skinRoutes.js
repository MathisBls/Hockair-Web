import express from 'express';
import multer from 'multer';
import { getAllSkins, createSkin, updateSkin, buySkin, equipSkin } from '../controllers/skinController.js';
import { authenticateToken, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configuration Multer pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/assets'); // Enregistrer les fichiers dans le dossier "assets"
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nom unique pour chaque fichier
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Skins
 *   description: Gestion des skins
 */

/**
 * @swagger
 * /api/skins:
 *   get:
 *     summary: Récupérer tous les skins
 *     tags: [Skins]
 *     responses:
 *       200:
 *         description: Liste de tous les skins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skin'
 */
router.get('/', getAllSkins);

/**
 * @swagger
 * /api/skins:
 *   post:
 *     summary: Ajouter un nouveau skin
 *     tags: [Skins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du skin
 *               type:
 *                 type: string
 *                 enum: [puck, mallet, table]
 *                 description: Type de skin
 *               price:
 *                 type: number
 *                 description: Prix du skin
 *               premiumOnly:
 *                 type: boolean
 *                 description: Disponible uniquement pour les utilisateurs premium
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier du skin
 *     responses:
 *       201:
 *         description: Skin créé avec succès
 *       400:
 *         description: Fichier manquant
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, authorizeAdmin, upload.single('file'), createSkin);

/**
 * @swagger
 * /api/skins/{id}:
 *   put:
 *     summary: Mettre à jour un skin existant
 *     tags: [Skins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du skin
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [puck, mallet, table]
 *               price:
 *                 type: number
 *               premiumOnly:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Skin mis à jour avec succès
 *       404:
 *         description: Skin non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, authorizeAdmin, upload.single('file'), updateSkin);

/** 
 * @swagger
 * /api/skins/buy/{skinId}:
 *   post:
 *     summary: Acheter un skin
 *     tags: [Skins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du skin
 *     responses:
 *       200:
 *         description: Skin acheté avec succès
 *       404:
 *         description: Skin non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/buy/:skinId', authenticateToken, buySkin);

/**
 * @swagger
 * /api/skins/equip/{skinId}:
 *   post:
 *     summary: Équiper un skin
 *     tags: [Skins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du skin
 *     responses:
 *       200:
 *         description: Skin équipé avec succès
 *       404:
 *         description: Skin non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/equip/:skinId', authenticateToken, equipSkin);

export default router;
