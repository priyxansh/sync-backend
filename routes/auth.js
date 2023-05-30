const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Create a user using POST on /api/auth/ No auth required.

const createUser = async (userDetails) => {
    try {
        const user = await User.create(userDetails);
        return user;
    } catch (e) {
        return {
            error: {
                code: e.code,
                name: e.name,
                message: e.message,
            },
        };
    }
};

router.post("/", async (req, res) => {
    const user = await createUser(req.body);
    res.send(user);
});

module.exports = router;
