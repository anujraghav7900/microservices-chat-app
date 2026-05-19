const express = require("express");

const router = express.Router();

const {
    getMyChats,
    createPrivateChat,
    createGroupChat
} = require("../controllers/chatController");

const protect = require("../middleware/authMiddleware");


// LOGGED IN USER CHATS
router.get("/", protect, getMyChats);


// PRIVATE CHAT
router.post("/private", protect, createPrivateChat);


// GROUP CHAT
router.post("/group", protect, createGroupChat);

module.exports = router;
