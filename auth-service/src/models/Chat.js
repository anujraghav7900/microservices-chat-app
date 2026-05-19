const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
{
    chatId: {
        type: String,
        required: true,
        unique: true
    },

    chatType: {
        type: String,
        enum: ["private", "group"],
        default: "private"
    },

    chatName: {
        type: String,
        default: ""
    },

    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    groupImage: {
        type: String,
        default: ""
    },

    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    lastMessage: {
        type: String,
        default: ""
    },

    lastMessageSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Chat", chatSchema);
