import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middlewares/authMiddleware.js';
import {
  getTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentById,
  joinTournament,
  getTournamentParticipants
} from '../controllers/tournamentController.js';

const router = express.Router();

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tournaments.
 *       500:
 *         description: Server error.
 */
router.get('/', authenticateToken, getTournaments);

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the tournament.
 *               image:
 *                 type: string
 *                 description: URL of the tournament image.
 *               type:
 *                 type: string
 *                 enum:
 *                   - league
 *                   - bracket
 *                   - pool-and-bracket
 *                 description: Type of the tournament.
 *               isPremium:
 *                 type: boolean
 *                 description: Whether the tournament is premium.
 *               parameters:
 *                 type: object
 *                 properties:
 *                   maxPlayers:
 *                     type: number
 *                     description: Maximum number of players.
 *                   rules:
 *                     type: string
 *                     enum:
 *                       - classic
 *                       - timed
 *                       - sudden death
 *                     description: Rules of the tournament.
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Start date of the tournament.
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: End date of the tournament.
 *     responses:
 *       201:
 *         description: Tournament created successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Server error.
 */
router.post('/', authenticateToken, authorizeAdmin, createTournament);

/**
 * @swagger
 * /api/tournaments/{tournamentId}:
 *   put:
 *     summary: Update a tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: tournamentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the tournament.
 *               image:
 *                 type: string
 *                 description: URL of the tournament image.
 *               description:
 *                 type: string
 *                 description: Description of the tournament.
 *               type:
 *                 type: string
 *                 enum:
 *                   - league
 *                   - bracket
 *                   - pool-and-bracket
 *                 description: Type of the tournament.
 *               isPremium:
 *                 type: boolean
 *                 description: Whether the tournament is premium.
 *               parameters:
 *                 type: object
 *                 properties:
 *                   maxPlayers:
 *                     type: number
 *                   rules:
 *                     type: string
 *                     enum:
 *                       - classic
 *                       - timed
 *                       - sudden death
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Tournament updated successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Server error.
 */
router.put('/:tournamentId', authenticateToken, authorizeAdmin, updateTournament);

/**
 * @swagger
 * /api/tournaments/{tournamentId}:
 *   delete:
 *     summary: Delete a tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: tournamentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament deleted successfully.
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Server error.
 */
router.delete('/:tournamentId', authenticateToken, authorizeAdmin, deleteTournament);

/**
 * @swagger
 * /api/tournaments/{tournamentId}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: tournamentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament details.
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Server error.
 */
router.get('/:tournamentId', authenticateToken, getTournamentById);

/**
 * @swagger
 * /api/tournaments/{tournamentId}/join:
 *   post:
 *     summary: Join a tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: tournamentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined the tournament.
 *       404:
 *         description: Tournament not found.
 *       400:
 *         description: Already joined.
 *       500:
 *         description: Server error.
 */
router.post('/:tournamentId/join', authenticateToken, joinTournament);

/**
 * @swagger
 * /api/tournaments/{tournamentId}/participants:
 *   get:
 *     summary: Get tournament participants
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: tournamentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of participants.
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Server error.
 */
router.get('/:tournamentId/participants', authenticateToken, getTournamentParticipants);

export default router;
