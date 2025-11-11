/**
 * Rutas de Administración
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");
const { sanitizeInput } = require("../middleware/validation");

// Aplicar autenticación y verificación de admin a todas las rutas
router.use(authenticate);
router.use(isAdmin);
router.use(sanitizeInput);

/**
 * @route   GET /api/admin/stats
 * @desc    Estadísticas del sistema
 * @access  Private (Admin)
 */
router.get("/stats", adminController.getSystemStats);

/**
 * @route   GET /api/admin/users
 * @desc    Listar usuarios
 * @access  Private (Admin)
 */
router.get("/users", adminController.getAllUsers);

/**
 * @route   GET /api/admin/transactions
 * @desc    Listar transacciones
 * @access  Private (Admin)
 */
router.get("/transactions", adminController.getAllTransactions);

/**
 * @route   GET /api/admin/merchants
 * @desc    Listar comercios
 * @access  Private (Admin)
 */
router.get("/merchants", adminController.getAllMerchants);

/**
 * @route   PUT /api/admin/users/:userId/toggle-status
 * @desc    Activar/desactivar usuario
 * @access  Private (Admin)
 */
router.put("/users/:userId/toggle-status", adminController.toggleUserStatus);

/**
 * @route   PUT /api/admin/merchants/:merchantId/verify
 * @desc    Verificar comercio
 * @access  Private (Admin)
 */
router.put("/merchants/:merchantId/verify", adminController.verifyMerchant);

/**
 * @route   GET /api/admin/blockchain/validate
 * @desc    Validar blockchain
 * @access  Private (Admin)
 */
router.get("/blockchain/validate", adminController.validateBlockchain);

/**
 * @route   GET /api/admin/blockchain/blocks
 * @desc    Listar bloques
 * @access  Private (Admin)
 */
router.get("/blockchain/blocks", adminController.getBlocks);

/**
 * @route   GET /api/admin/reports/daily
 * @desc    Reporte diario
 * @access  Private (Admin)
 */
router.get("/reports/daily", adminController.getDailyReport);

module.exports = router;
