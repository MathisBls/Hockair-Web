import express from 'express';
import {
  addFriend,
  acceptFriend,
  declineFriend,
  getFriends,
  getFriendRequests,
  blockFriend,
  unblockFriend,
  getBlockedFriends,
  deleteFriend
} from '../controllers/friendController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/list', authenticateToken, getFriends);

router.get('/requests', authenticateToken, getFriendRequests);

router.post('/add', authenticateToken, addFriend);

router.post('/accept', authenticateToken, acceptFriend);

router.post('/decline', authenticateToken, declineFriend);

router.post('/block', authenticateToken, blockFriend);

router.get('/blocked', authenticateToken, getBlockedFriends);

router.post('/unblock', authenticateToken, unblockFriend);

router.delete('/delete', authenticateToken, deleteFriend);

export default router;
