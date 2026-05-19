const User = require("../models/User");

// GET ALL USERS EXCEPT LOGGED IN USER
const getUsers = async (req, res) => {

    try {

        const users = await User.find({
            _id: { $ne: req.user.id }
        })
        .select("-password")
        .sort({ name: 1 })
        .limit(50);

        res.status(200).json(users);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};


// SEARCH USERS BY USER ID OR NAME
const searchUser = async (req, res) => {

    try {

        const search = req.params.userId;

        const users = await User.find({
            $or: [
                { userId: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } }
            ],
            _id: { $ne: req.user.id }
        })
        .select("-password")
        .limit(10);

        if (users.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(users);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getUsers,
    searchUser
};
