const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/car");

dotenv.config();

const corsMiddleware = require("./middlewares/corsMiddleware");
const { errorHandler } = require("./middlewares/errorMiddleware");
const connectDB = require("./config/db");
const { PORT } = require("./config/constant");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("Welcome to Morent API");
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
