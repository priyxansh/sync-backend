const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const { MONGO_URI, MONGO_USER, MONGO_PASS } = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: MONGO_USER,
            pass: MONGO_PASS,
        });
    } catch (e) {
        console.log(e);
    }

    console.log("Connected to MongoDB successfully");
};

module.exports = connectDB;
