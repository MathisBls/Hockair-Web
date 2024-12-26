import Message from "../models/Message.js";
import User from "../models/User.js";

export const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
        return res.status(400).json({ message: "Receiver ID and content are required." });
    }

    try {
        const newMessage = await Message.create({
            senderId,
            receiverId,
            content,
        });

        res.status(201).json({ message: "Message sent successfully.", newMessage });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// Récupérer les messages entre deux utilisateurs
export const getMessages = async (req, res) => {
    const { friendId } = req.params;
    const userId = req.user._id;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// Marquer les messages comme lus
export const markAsRead = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user._id;

    try {
        await Message.updateMany(
            { senderId: friendId, receiverId: userId, read: false },
            { read: true }
        );

        res.status(200).json({ message: "Messages marked as read." });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

export const getChatList = async (req, res) => {
    const userId = req.user._id;

    try {
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .populate("senderId", "username profilePicture")
            .populate("receiverId", "username profilePicture");

        const chatList = messages.reduce((acc, message) => {
            const friendId =
                message.senderId._id.toString() === userId.toString()
                    ? message.receiverId
                    : message.senderId;

            if (!acc.some((chat) => chat._id.toString() === friendId._id.toString())) {
                acc.push(friendId);
            }

            return acc;
        }, []);

        res.status(200).json(chatList);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

export const postMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
        return res.status(400).json({ message: 'Receiver ID and content are required.' });
    }

    try {
        const newMessage = await Message.create({ senderId, receiverId, content });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message.', error: error.message });
    }
}

export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      if (
        message.senderId.toString() !== userId.toString() &&
        message.receiverId.toString() !== userId.toString()
      ) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this message." });
      }

      await Message.findByIdAndDelete(messageId);

      res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };

  export const getLatestMessages = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const messages = await Message.aggregate([
        {
          $match: {
            $or: [{ senderId: userId }, { receiverId: userId }],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$receiverId",
                "$senderId",
              ],
            },
            lastMessage: { $first: "$$ROOT" },
          },
        },
      ])
        .lookup({
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        });
  
      const formattedMessages = messages.map((msg) => ({
        contactId: msg._id,
        lastMessage: msg.lastMessage,
        userDetails: msg.userDetails[0] || null,
      }));
  
      res.status(200).json(formattedMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching latest messages.", error: error.message });
    }
  };