// Load environment variables FIRST before any other imports
// This ensures JWT_SECRET and other env vars are available when routes are loaded
require('dotenv').config();

// Validate critical environment variables before proceeding
if (!process.env.JWT_SECRET) {
  console.error('\n❌ CRITICAL ERROR: JWT_SECRET is not set in environment variables!');
  console.error('   Authentication will not work without JWT_SECRET.');
  console.error('   Please set JWT_SECRET in your .env file or environment variables.\n');
  process.exit(1);
}

// Validate JWT_SECRET is not empty
if (process.env.JWT_SECRET.trim().length < 10) {
  console.error('\n❌ CRITICAL ERROR: JWT_SECRET is too short (minimum 10 characters)!');
  console.error('   Please set a secure JWT_SECRET in your .env file.\n');
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const userRoutes = require("./routes/users");

const app = express();

// Middleware - parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - enables cross-origin requests from frontend
// This middleware must be placed BEFORE all route definitions to apply to all API requests
// It handles preflight OPTIONS requests automatically for all routes
const corsOptions = {
  // Allow specific origins for production, or all origins in development
  origin: process.env.NODE_ENV === 'production' 
    ? [
        "http://localhost:3000", // Local development frontend
        "https://trackify-ggjb.vercel.app", // Vercel deployed frontend (explicit)
        process.env.FRONTEND_URL // Additional frontend URL if set
      ].filter(Boolean) // Remove undefined values
    : true, // Allow all origins in development for easier testing
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  credentials: true, // Allow cookies and authentication headers (Bearer tokens)
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed request headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀", status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database (non-blocking - server will start even if DB fails initially)
    connectDB().catch(err => {
      console.error("Database connection failed:", err.message);
      console.warn("Server will continue but database operations may fail");
    });

    // Start server regardless of DB connection status
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   API routes: http://localhost:${PORT}/api`);
      console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
