const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    // Get JWT from request header
    const authToken = req.header("auth-token");

    if (!authToken) {
        return res.status(401).json({
            success: false,
            errors: [
                {
                    name: "AuthenticationError",
                    message: "No auth token provided.",
                },
            ],
        });
    }

    try {
        const payload = jwt.verify(authToken, JWT_SECRET);
        req.user = payload.user;
        next();
    } catch (e) {
        return res.status(401).json({
            success: false,
            errors: [
                {
                    code: e.code,
                    name: e.name,
                    message: e.message,
                },
            ],
        });
    }
};

module.exports = fetchUser;
