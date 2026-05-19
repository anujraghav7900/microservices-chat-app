const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");


// SEND MESSAGE
const sendMessage = async (req, res) => {

    try {

        const { chatId, message, text } = req.body;

        const messageText = message || text;

        if (!messageText || !messageText.trim()) {
            return res.status(400).json({
                message: "Message text is required"
            });
        }

        // Logged in user
        const sender = await User.findById(req.user.id);

        // Find chat
        const chat = await Chat.findOne({ chatId })
            .populate("participants", "userId name");

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        // Create message
        const newMessage = await Message.create({

            chatId,

            sender: sender._id,

            message: messageText.trim()
        });

        // Update last message
        chat.lastMessage = messageText.trim();
        chat.lastMessageSender = sender._id;

        await chat.save();

        const savedMessage = await newMessage.populate(
            "sender",
            "userId name"
        );

        res.status(201).json({
            _id: savedMessage._id,
            chatId: savedMessage.chatId,
            text: savedMessage.message,
            message: savedMessage.message,
            sender: savedMessage.sender.name,
            senderUserId: savedMessage.sender.userId,
            receiverUserIds: chat.participants
                .filter((participant) =>
                    participant.userId !== savedMessage.sender.userId
                )
                .map((participant) => participant.userId),
            chat: {
                _id: chat._id,
                chatId: chat.chatId,
                chatType: chat.chatType,
                lastMessage: chat.lastMessage,
                lastMessageSenderUserId: savedMessage.sender.userId,
                updatedAt: chat.updatedAt,
                participants: chat.participants
            },
            createdAt: savedMessage.createdAt
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};




// GET CHAT MESSAGES
const getMessages = async (req, res) => {

    try {

        const messages = await Message.find({
            chatId: req.params.chatId
        })
        .populate("sender", "userId name")
        .sort({ createdAt: 1 });

        res.status(200).json(
            messages.map((message) => ({
                _id: message._id,
                chatId: message.chatId,
                text: message.message,
                message: message.message,
                sender: message.sender?.name || "Unknown",
                senderUserId: message.sender?.userId || "",
                createdAt: message.createdAt
            }))
        );

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    sendMessage,
    getMessages
};
