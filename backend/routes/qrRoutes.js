/**
 * Rutas de QR Payments
 */

const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qrController");
const { authenticate } = require("../middleware/auth");
const { isMerchant, isAdmin } = require("../middleware/roleCheck");
const { sanitizeInput } = require("../middleware/validation");

router.use(sanitizeInput);

/**
 * @route   POST /api/qr/generate
 * @desc    Generar código QR (solo merchants)
 * @access  Private (Merchant)
 */
router.post(
  "/generate",
  authenticate,
  isMerchant,
  qrController.generateQRValidation,
  qrController.generateQR
);

/**
 * @route   GET /api/qr/my-qrs
 * @desc    Obtener mis códigos QR
 * @access  Private (Merchant)
 */
router.get("/my-qrs", authenticate, isMerchant, qrController.getMyQRs);

/**
 * @route   GET /api/qr/:token
 * @desc    Obtener información de un QR
 * @access  Public
 */
router.get("/:token", qrController.getQRInfo);

/**
 * @route   POST /api/qr/pay
 * @desc    Procesar pago mediante QR
 * @access  Private
 */
router.post(
  "/pay",
  authenticate,
  qrController.processPaymentValidation,
  qrController.processPayment
);

/**
 * @route   POST /api/qr/:token/cancel
 * @desc    Cancelar código QR
 * @access  Private (Merchant owner)
 */
router.post("/:token/cancel", authenticate, isMerchant, qrController.cancelQR);

/**
 * @route   POST /api/qr/clean-expired
 * @desc    Limpiar QRs expirados
 * @access  Private (Admin)
 */
router.post(
  "/clean-expired",
  authenticate,
  isAdmin,
  qrController.cleanExpiredQRs
);

module.exports = router;
