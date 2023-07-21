const User = require("../models/User");

const checkUser = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            errors: [
                {
                    name: "AuthenticationError",
                    message: "User not found.",
                },
            ],
        });
    }
    next();
};

module.exports = checkUser;
