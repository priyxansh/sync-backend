const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
        res.json(result);
    }
);

module.exports = router;
