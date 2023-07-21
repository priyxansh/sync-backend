const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const fetchUser = require("../middlewares/fetchUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const checkUser = require("../middlewares/checkUser");

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
        body("name")
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters long."),
        body("email").isEmail().withMessage("Invalid Email."),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long."),
    ],
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req)
            .array()
            .map((error) => ({
                name: "ValidationError",
                type: error.type,
                message: error.msg,
                field: error.path,
                location: error.location,
            }));

        if (errors.length !== 0) {
            return res.status(400).json({ success: false, errors: errors });
        }

        const { name, email, password } = req.body;

        // Checking if a user with provided email already exists
        const user = await User.findOne({ email: email });

        if (user) {
            return res.status(409).json({
                success: false,
                errors: [
                    {
                        name: "ConflictError",
                        message: "Email already in use.",
                    },
                ],
            });
        }

        try {
            // Generating salt and password hash
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Creating new user
            const user = await createUser({
                name: name,
                email: email,
                password: passwordHash,
            });

            // Generating JWT
            const payload = {
                user: {
                    id: user.id,
                },
            };

            const authToken = jwt.sign(payload, JWT_SECRET);

            res.status(201).json({
                success: true,
                data: {
                    authToken,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                errors: [
                    {
                        name: e.name,
                        message: e.message,
                    },
                ],
            });
        }
    }
);

// Authenticate a user using POST /api/auth/login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid Email."),
        body("password").notEmpty().withMessage("No password provided."),
    ],
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req)
            .array()
            .map((error) => ({
                name: "ValidationError",
                type: error.type,
                message: error.msg,
                field: error.path,
                location: error.location,
            }));

        if (errors.length !== 0) {
            return res.status(400).json({ success: false, errors: errors });
        }

        const { email, password } = req.body;

        // Checking if a user with provided email exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                errors: [
                    {
                        name: "AuthenticationError",
                        message: "Email not registered.",
                    },
                ],
            });
        }

        try {
            // Comparing provided password with password hash stored in the database
            const result = await bcrypt.compare(password, user.password);

            if (!result) {
                return res.status(401).json({
                    success: false,
                    errors: [
                        {
                            name: "AuthenticationError",
                            message: "Invalid login credentials.",
                        },
                    ],
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
                data: {
                    authToken,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                errors: [
                    {
                        name: e.name,
                        message: e.message,
                    },
                ],
            });
        }
    }
);

// Get logged-in user details using GET /api/auth/getuser
router.get("/user", fetchUser, checkUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        res.json({
            success: true,
            data: {
                user,
            },
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            errors: [
                {
                    name: e.name,
                    message: e.message,
                },
            ],
        });
    }
});

module.exports = router;
