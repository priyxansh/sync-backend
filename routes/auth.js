const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const fetchUser = require("../middlewares/fetchUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Configuring dotenv for .env files
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

// Create a user using POST on /api/auth/user
const createUser = async (userDetails) => {
    const user = await User.create(userDetails);
    return user;
};

router.post(
    "/user",
    [
        body("name").isLength({ min: 3 }),
        body("email").isEmail(),
        body(
            "password",
            "Password must atleast be 8 characters long."
        ).isLength({ min: 8 }),
    ],
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        try {
            // Generating salt and password hash
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(req.body.password, salt);

            // Creating new user
            const user = await createUser({
                name: req.body.name,
                email: req.body.email,
                password: passwordHash,
            });

            // Generating JWT
            const payload = {
                user: {
                    id: user.id,
                },
            };

            const authToken = jwt.sign(payload, JWT_SECRET);

            res.status(200).json({
                success: true,
                authToken,
            });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: {
                    code: e.code,
                    name: e.name,
                    message: e.message,
                },
            });
        }
    }
);

// Authenticate a user using POST /api/auth/login
router.post(
    "/login",
    [
        body("email").isEmail(),
        body("password", "Please enter a password.").isLength({ min: 1 }),
    ],
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // Checking if a user with provided email exists
        if (!user) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Invalid login credentials. Please try again.",
                },
            });
        }

        // Comparing provided password with password hash stored in the database
        const result = await bcrypt.compare(password, user.password);

        if (!result) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Invalid login credentials. Please try again.",
                },
            });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        // Generating JWT
        const authToken = jwt.sign(payload, JWT_SECRET);

        res.status(200).json({
            success: true,
            authToken,
        });
    }
);

// Get logged-in user details using POST /api/auth/getuser
router.post("/getuser", fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        res.json({ success: true, user });
    } catch (e) {
        return res.status(400).json({
            success: false,
            error: {
                code: e.code,
                name: e.name,
                message: e.message,
            },
        });
    }
});

module.exports = router;
