/**
 * Rutas de Wallet
 */

const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authenticate } = require("../middleware/auth");
const { sanitizeInput } = require("../middleware/validation");

// Aplicar autenticación a todas las rutas
router.use(authenticate);
router.use(sanitizeInput);

/**
 * @route   GET /api/wallets/my-wallet
 * @desc    Obtener mi wallet
 * @access  Private
 */
router.get("/my-wallet", walletController.getMyWallet);

/**
 * @route   GET /api/wallets/balance
 * @desc    Obtener balance
 * @access  Private
 */
router.get("/balance", walletController.getBalance);

/**
 * @route   POST /api/wallets/transfer
 * @desc    Transferir fondos
 * @access  Private
 */
router.post(
  "/transfer",
  walletController.transferValidation,
  walletController.transfer
);

/**
 * @route   POST /api/wallets/create
 * @desc    Crear wallet manualmente
 * @access  Private
 */
router.post("/create", walletController.createWallet);

/**
 * @route   GET /api/wallets/transactions
 * @desc    Historial de transacciones
 * @access  Private
 */
router.get("/transactions", walletController.getTransactionHistory);

/**
 * @route   GET /api/wallets/stats
 * @desc    Estadísticas de wallet
 * @access  Private
 */
router.get("/stats", walletController.getWalletStats);

module.exports = router;
