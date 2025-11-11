/**
 * Rutas de Autenticación
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { sanitizeInput } = require("../middleware/validation");

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  "/register",
  authController.registerValidation,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post("/login", authController.loginValidation, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil
 * @access  Private
 */
router.put("/profile", authenticate, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put("/change-password", authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

module.exports = router;
