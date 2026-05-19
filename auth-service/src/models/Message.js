const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
{
    chatId: {
        type: String,
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    messageType: {
        type: String,
        enum: ["text", "image", "video", "file"],
        default: "text"
    },

    seenBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Message", messageSchema);