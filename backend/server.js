const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require('./config/db');

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const userRoutes = require('./routes/users');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

// connect DB


// routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes)
app.use('/api/users', userRoutes);
app.use("/api/users", require("./routes/users"));


app.get("/", (req, res) => res.send("API running...."));

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));


