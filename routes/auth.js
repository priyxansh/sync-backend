const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        const result = await createUser(req.body);
        res.json(result);
    }
);

module.exports = router;
