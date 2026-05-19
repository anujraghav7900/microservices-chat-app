const express = require("express");

const router = express.Router();

const {
    sendMessage,
    getMessages
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");


// SEND MESSAGE
router.post("/", protect, sendMessage);


// GET MESSAGES
router.get("/:chatId", protect, getMessages);

module.exports = router;