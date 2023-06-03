const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Configuring dotenv for .env files
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

// Create a user using POST on /api/auth/user
const createUser = async (userDetails) => {
    try {
        const user = await User.create(userDetails);
        return {
            success: true,
            user,
        };
    } catch (e) {
        return {
            errors: [
                {
                    code: e.code,
                    name: e.name,
                    message: e.message,
                },
            ],
        };
    }
};

router.post(
    "/user",
    [
        body("name").isLength({ min: 3 }),
        body("email").isEmail(),
        body("password").isLength({ min: 8 }),
    ],
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        // Generating salt and password hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(req.body.password, salt);

        const result = await createUser({
            name: req.body.name,
            email: req.body.email,
            password: passwordHash,
        });

        // const data = {
        //     user: {
        //         id: result.user.id,
        //     },
        // };

        // const authtoken = jwt.sign(data, JWT_SECRET);
        res.json(result);
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

        res.json({ success: true, user });
    }
);
module.exports = router;
