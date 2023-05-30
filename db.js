const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost/notesdb";

const connectDB = () => {
    mongoose
        .connect(mongoURI)
        .then(() => console.log("Connected to MongoDB successfully"))
        .catch((error) => console.log(error));
};

module.exports = connectDB;
