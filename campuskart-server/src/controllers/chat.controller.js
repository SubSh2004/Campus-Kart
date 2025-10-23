import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

// Get all users for chat list (excluding current user)
export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('username email hostelName')
      .sort({ username: 1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Get or create chat between two users
export const getOrCreateChat = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id.toString();

    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        unreadCount: { [senderId]: 0, [receiverId]: 0 }
      });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    res.status(500).json({ success: false, message: 'Failed to get chat' });
  }
};

// Get messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id.toString();

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(100); // Last 100 messages

    // Mark messages as read
    await Message.updateMany(
      { chatId, receiverId: userId, read: false },
      { read: true }
    );

    // Update unread count in chat
    await Chat.findByIdAndUpdate(chatId, {
      [`unreadCount.${userId}`]: 0
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, receiverId, message } = req.body;
    const senderId = req.user._id.toString();
    const senderName = req.user.username;

    const newMessage = await Message.create({
      chatId,
      senderId,
      senderName,
      receiverId,
      message
    });

    // Update chat with last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message,
      lastMessageTime: new Date(),
      $inc: { [`unreadCount.${receiverId}`]: 1 }
    });

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const chats = await Chat.find({
      participants: userId
    }).sort({ lastMessageTime: -1 });

    // Get other participant details for each chat
    const chatsWithUsers = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.participants.find(id => id !== userId);
        const otherUser = await User.findById(otherUserId).select('username email');
        
        return {
          ...chat.toObject(),
          otherUser,
          unreadCount: chat.unreadCount?.get(userId) || 0
        };
      })
    );

    res.json({ success: true, chats: chatsWithUsers });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: false
    });

    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};
