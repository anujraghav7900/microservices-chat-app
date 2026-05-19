const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER USER
const registerUser = async (req, res) => {

    try {

        const { name, userId, email, password } = req.body;

        // Check existing email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Check existing userId
        const existingUserId = await User.findOne({ userId });

        if (existingUserId) {
            return res.status(400).json({
                message: "User ID already taken"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({

            userId,

            name,

            email,

            password: hashedPassword
        });

        res.status(201).json({

            message: "User Registered Successfully",

            user: {
                userId: user.userId,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};




// LOGIN USER
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({

            message: "Login Successful",

            token,

            user: {
                userId: user.userId,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};