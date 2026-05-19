const Chat = require("../models/Chat");
const User = require("../models/User");

const formatChat = (chat, currentUserId) => {

    const plainChat = chat.toObject ? chat.toObject() : chat;

    const otherUser = plainChat.participants.find(
        (participant) =>
            participant._id.toString() !== currentUserId
    );

    return {
        _id: plainChat._id,
        chatId: plainChat.chatId,
        chatType: plainChat.chatType,
        chatName: plainChat.chatName,
        lastMessage: plainChat.lastMessage,
        lastMessageSenderUserId:
            plainChat.lastMessageSender?.userId ||
            plainChat.lastMessageSender ||
            "",
        updatedAt: plainChat.updatedAt,
        participants: plainChat.participants,
        otherUser
    };
};


// GET LOGGED IN USER CHATS
const getMyChats = async (req, res) => {

    try {

        const chats = await Chat.find({
            participants: req.user.id
        })
        .populate("participants", "userId name")
        .populate("lastMessageSender", "userId name")
        .sort({ updatedAt: -1 });

        res.status(200).json(
            chats.map((chat) =>
                formatChat(chat, req.user.id)
            )
        );

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};


// CREATE PRIVATE CHAT
const createPrivateChat = async (req, res) => {

    try {

        const receiverUserId = req.body.receiverUserId || req.body.userId;

        // Logged in user
        const sender = await User.findById(req.user.id);

        // Receiver
        const receiver = await User.findOne({
            userId: receiverUserId
        });

        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found"
            });
        }

        // Generate unique chatId
        const users = [
            sender.userId,
            receiver.userId
        ].sort();

        const generatedChatId =
            `CHAT_${users[0]}_${users[1]}`;

        // Check existing chat
        let existingChat = await Chat.findOne({
            chatId: generatedChatId
        }).populate("participants", "userId name");

        if (existingChat) {
            return res.status(200).json(
                formatChat(existingChat, req.user.id)
            );
        }

        // Create chat
        const newChat = await Chat.create({

            chatId: generatedChatId,

            chatType: "private",

            participants: [
                sender._id,
                receiver._id
            ]
        });

        const savedChat = await newChat.populate(
            "participants",
            "userId name"
        );

        res.status(201).json(
            formatChat(savedChat, req.user.id)
        );

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};




// CREATE GROUP CHAT
const createGroupChat = async (req, res) => {

    try {

        const { chatName: bodyChatName, groupName, members } = req.body;

        const chatName = bodyChatName || groupName;

        // Logged in user
        const admin = await User.findById(req.user.id);

        // Find all users
        const users = await User.find({
            userId: { $in: members }
        });

        // Add admin also
        const allParticipants = [
            admin._id,
            ...users.map(user => user._id)
        ];

        // Generate unique group chatId
        const generatedChatId =
            `GROUP_${Date.now()}`;

        // Create group
        const newGroup = await Chat.create({

            chatId: generatedChatId,

            chatType: "group",

            chatName,

            groupAdmin: admin._id,

            participants: allParticipants
        });

        res.status(201).json({
            _id: newGroup._id,
            chatId: newGroup.chatId,
            chatType: newGroup.chatType,
            groupName: newGroup.chatName,
            groupAdmin: newGroup.groupAdmin,
            participants: newGroup.participants,
            lastMessage: newGroup.lastMessage
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getMyChats,
    createPrivateChat,
    createGroupChat
};
