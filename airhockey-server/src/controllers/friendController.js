import Friendship from '../models/FriendShip.js';
import User from '../models/User.js';
import { sendFriendRequestNotification } from '../services/emailService.js';

export const addFriend = async (req, res) => {
  const { recipientId } = req.body;
  const requesterId = req.user._id;

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required.' });
  }

  try {
    const existingRequest = await Friendship.findOne({
      requesterId,
      recipientId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent.' });
    }

    const recipient = await User.findById(recipientId);
    const requester = await User.findById(requesterId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }

    const newFriendship = await Friendship.create({
      requesterId,
      recipientId,
    });

    // Send email notification
    await sendFriendRequestNotification(recipient.email, requester.username);

    res.status(201).json({ message: 'Friend request sent.', newFriendship });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Accepter une demande d'ami
export const acceptFriend = async (req, res) => {
    const { requesterId } = req.body;
    const recipientId = req.user._id;

    try {
        const friendship = await Friendship.findOneAndUpdate(
            { requesterId, recipientId, status: 'pending' },
            { status: 'accepted' },
            { new: true }
        );

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found.' });
        }

        res.status(200).json({ message: 'Friend request accepted.', friendship });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// Refuser une demande d'ami
export const declineFriend = async (req, res) => {
    const { requesterId } = req.body;
    const recipientId = req.user._id;

    try {
        const friendship = await Friendship.findOneAndDelete({
            requesterId,
            recipientId,
            status: 'pending',
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found.' });
        }

        res.status(200).json({ message: 'Friend request declined.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// Récupérer la liste des amis
export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await Friendship.find({
            $or: [
                { requesterId: userId, status: 'accepted' },
                { recipientId: userId, status: 'accepted' },
            ],
        })
            .populate('requesterId', 'username elo level')
            .populate('recipientId', 'username elo level');

        const friends = friendships.map((friendship) => {
            const isRequester = String(friendship.requesterId._id) === String(userId);
            return isRequester ? friendship.recipientId : friendship.requesterId;
        });

        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// Récupérer les demandes d'amis
export const getFriendRequests = async (req, res) => {
    try {
        const requests = await Friendship.find({
            recipientId: req.user._id,
            status: 'pending',
        }).populate('requesterId', 'username elo level');

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const getBlockedFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await Friendship.find({
            $or: [
                { requesterId: userId, status: 'blocked' },
                { recipientId: userId, status: 'blocked' },
            ],
        })
            .populate('requesterId', 'username elo level')
            .populate('recipientId', 'username elo level');

        const blockedFriends = friendships.map((friendship) => {
            const isRequester = String(friendship.requesterId._id) === String(userId);
            return isRequester ? friendship.recipientId : friendship.requesterId;
        });

        res.status(200).json(blockedFriends);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// Bloquer un ami
export const blockFriend = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user._id;

    try {
        const friendship = await Friendship.findOneAndUpdate(
            {
                $or: [
                    { requesterId: userId, recipientId: friendId },
                    { requesterId: friendId, recipientId: userId },
                ],
                status: 'accepted',
            },
            { status: 'blocked' },
            { new: true }
        );

        if (!friendship) {
            return res.status(404).json({ message: 'Friend not found.' });
        }

        res.status(200).json({ message: 'Friend blocked.', friendship });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// debloquer un ami
export const unblockFriend = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user._id;

    try {
        const friendship = await Friendship.findOneAndUpdate(
            {
                $or: [
                    { requesterId: userId, recipientId: friendId },
                    { requesterId: friendId, recipientId: userId },
                ],
                status: 'blocked',
            },
            { status: 'accepted' },
            { new: true }
        );

        if (!friendship) {
            return res.status(404).json({ message: 'Friend not found.' });
        }

        res.status(200).json({ message: 'Friend unblocked.', friendship });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const deleteFriend = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user._id;

    try {
        const friendship = await Friendship.findOneAndDelete({
            $or: [
                { requesterId: userId, recipientId: friendId },
                { requesterId: friendId, recipientId: userId },
            ],
            status: 'accepted',
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friend not found.' });
        }

        res.status(200).json({ message: 'Friend deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
}
