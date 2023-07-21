const connectDB = require("./db");
const express = require("express");

const app = express();
const port = 5000;

connectDB()
    .then(() => {
        app.use(express.json());

        app.use("/api/auth", require("./routes/auth"));
        app.use("/api/notes", require("./routes/notes"));
        
        app.listen(port, () => {
            console.log("Sync backend live at port", port);
        });
    })
    .catch(console.log);
