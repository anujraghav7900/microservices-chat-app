const express = require("express");

const router = express.Router();

const {
    getUsers,
    searchUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");


// SEARCH USER
router.get("/", protect, getUsers);
router.get("/search/:userId", protect, searchUser);
router.get("/:userId", protect, searchUser);

module.exports = router;
