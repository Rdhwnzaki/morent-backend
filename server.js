const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth")

dotenv.config();

const corsMiddleware = require("./middlewares/corsMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const connectDB = require("./config/db");
const { PORT } = require("./config/constant");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/auth", authRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("Welcome to Morent API");
});

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
