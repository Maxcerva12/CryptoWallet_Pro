/**
 * Servidor principal de CryptoWallet Pro
 * Backend API REST con Express.js
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { testConnection, syncDatabase } = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");
const { setupAssociations } = require("./models");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const qrRoutes = require("./routes/qrRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// MIDDLEWARES GLOBALES
// ======================

// Seguridad con Helmet
app.use(helmet());

// CORS - Permitir peticiones del frontend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origin (como Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

// Logger de peticiones HTTP
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parser de JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === "development" ? 1000 : 100, // Más permisivo en desarrollo
  message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde",
});
app.use("/api/", limiter);

// Rate limiting estricto para login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 50 : 5, // Más permisivo en desarrollo
  message:
    "Demasiados intentos de inicio de sesión, por favor intenta más tarde",
});
app.use("/api/auth/login", authLimiter);

// ======================
// RUTAS
// ======================

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CryptoWallet Pro API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/admin", adminRoutes);

// Ruta 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// ======================
// MANEJADOR DE ERRORES
// ======================
app.use(errorHandler);

// ======================
// INICIAR SERVIDOR
// ======================

const startServer = async () => {
  try {
    // Conectar a la base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ No se pudo conectar a la base de datos");
      process.exit(1);
    }

    // Configurar asociaciones de modelos ANTES de sincronizar
    setupAssociations();

    // NO sincronizar en desarrollo, las tablas ya existen
    // Si necesitas recrear tablas, usa: node scripts/initDatabase.js

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("");
      console.log("🚀 ======================================");
      console.log(`🪙  CryptoWallet Pro API Server`);
      console.log(`🌐  Server running on: http://localhost:${PORT}`);
      console.log(`📊  Environment: ${process.env.NODE_ENV}`);
      console.log(`💾  Database: ${process.env.DB_NAME}`);
      console.log("🚀 ======================================");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Iniciar aplicación
startServer();

module.exports = app;
