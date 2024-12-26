import express from "express";
import { authenticateToken, authorizeAdmin } from '../middlewares/authMiddleware.js';
import {
  getRanks,
  createRank,
  updateRank,
  deleteRank,
  getRankById,
} from "../controllers/rankController.js";

const router = express.Router();

/**
 * @swagger
 * /api/ranks:
 *   get:
 *     summary: Get all ranks
 *     tags: [Ranks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ranks.
 *       500:
 *         description: Server error.
 */
router.get("/", authenticateToken, getRanks);

/**
 * @swagger
 * /api/ranks:
 *   post:
 *     summary: Create a new rank
 *     tags: [Ranks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Rank data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rank:
 *                 type: string
 *                 enum: [Iron, Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Challenger, Legend, Mythic]
 *               elo:
 *                 type: number
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rank created successfully.
 *       500:
 *         description: Server error.
 */
router.post("/", authenticateToken, authorizeAdmin, createRank);

/**
 * @swagger
 * /api/ranks/{rankId}:
 *   put:
 *     summary: Update a rank
 *     tags: [Ranks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: rankId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated rank data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rank:
 *                 type: string
 *                 enum: [Iron, Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Challenger, Legend, Mythic]
 *               elo:
 *                 type: number
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rank updated successfully.
 *       500:
 *         description: Server error.
 */
router.put("/:rankId", authenticateToken, authorizeAdmin, updateRank);

/**
 * @swagger
 * /api/ranks/{rankId}:
 *   delete:
 *     summary: Delete a rank
 *     tags: [Ranks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: rankId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rank deleted successfully.
 *       500:
 *         description: Server error.
 */
router.delete("/:rankId", authenticateToken, authorizeAdmin, deleteRank);

/**
 * @swagger
 * /api/ranks/{rankId}:
 *   get:
 *     summary: Get rank by ID
 *     tags: [Ranks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: rankId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rank details.
 *       404:
 *         description: Rank not found.
 *       500:
 *         description: Server error.
 */
router.get("/:rankId", authenticateToken, getRankById);

export default router;
