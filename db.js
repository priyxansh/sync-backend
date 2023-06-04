const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const { MONGO_URI, MONGO_USER, MONGO_PASS} = process.env

const connectDB = () => {
    mongoose
        .connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: MONGO_USER,
            pass: MONGO_PASS,
        })
        .then(() => console.log("Connected to MongoDB successfully"))
        .catch((error) => console.log(error));
};

module.exports = connectDB;
