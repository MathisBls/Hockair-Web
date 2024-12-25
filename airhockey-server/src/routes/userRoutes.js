
import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUser, updateUserProfilePicture, activateUser, searchUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'src/assets/profile-pictures');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const upload = multer({ storage });

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns a token
 *       401:
 *         description: Unauthorized
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, getUserProfile);

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Mettre à jour le profil d'un utilisateur
 *     description: Permet à un utilisateur de mettre à jour son profil, y compris son mot de passe.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nouveau nom d'utilisateur
 *               email:
 *                 type: string
 *                 description: Nouvelle adresse e-mail
 *               currentPassword:
 *                 type: string
 *                 description: Mot de passe actuel (nécessaire pour changer de mot de passe)
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou mot de passe incorrect
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.put('/update', authenticateToken, updateUser);

/**
 * @swagger
 * /api/users/upload-profile-picture:
 *   post:
 *     summary: Met à jour la photo de profil de l'utilisateur
 *     description: Permet à un utilisateur de mettre à jour sa photo de profil. L'image est enregistrée sur le serveur, et le chemin est mis à jour dans la base de données.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Le fichier de la nouvelle photo de profil.
 *     responses:
 *       200:
 *         description: Photo de profil mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Photo de profil mise à jour avec succès
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Aucun fichier fourni
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.post('/upload-profile-picture', authenticateToken, upload.single('file'), updateUserProfilePicture);

router.post("/activate", activateUser);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Rechercher des utilisateurs
 *     description: Permet de rechercher des utilisateurs par nom d'utilisateur ou adresse e-mail.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Le terme de recherche (nom d'utilisateur ou adresse e-mail)
 *     responses:
 *       200:
 *         description: Utilisateurs trouvés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Aucun utilisateur trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.get('/search', authenticateToken, searchUsers);

export default router;
