const User = require("../models/User");

const checkUser = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(401).json({
            success: false,
            error: {
                message: "User not found."
            }
        })
    }
    next()
};

module.exports = checkUser;
