/**
 * Rutas de Merchants
 */

const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const { authenticate } = require("../middleware/auth");
const { isMerchant } = require("../middleware/roleCheck");
const { sanitizeInput } = require("../middleware/validation");

router.use(sanitizeInput);

/**
 * @route   GET /api/merchants/all
 * @desc    Listar comercios (público)
 * @access  Public
 */
router.get("/all", merchantController.getAllMerchants);

/**
 * @route   POST /api/merchants/register
 * @desc    Registrar como comercio
 * @access  Private
 */
router.post(
  "/register",
  authenticate,
  merchantController.registerMerchantValidation,
  merchantController.registerMerchant
);

/**
 * @route   GET /api/merchants/my-business
 * @desc    Obtener mi información de comercio
 * @access  Private (Merchant)
 */
router.get(
  "/my-business",
  authenticate,
  isMerchant,
  merchantController.getMyBusiness
);

/**
 * @route   PUT /api/merchants/my-business
 * @desc    Actualizar mi comercio
 * @access  Private (Merchant)
 */
router.put(
  "/my-business",
  authenticate,
  isMerchant,
  merchantController.updateMyBusiness
);

/**
 * @route   GET /api/merchants/payments
 * @desc    Pagos recibidos
 * @access  Private (Merchant)
 */
router.get(
  "/payments",
  authenticate,
  isMerchant,
  merchantController.getReceivedPayments
);

/**
 * @route   GET /api/merchants/balance
 * @desc    Balance del comercio
 * @access  Private (Merchant)
 */
router.get(
  "/balance",
  authenticate,
  isMerchant,
  merchantController.getMerchantBalance
);

/**
 * @route   GET /api/merchants/stats
 * @desc    Estadísticas del comercio
 * @access  Private (Merchant)
 */
router.get(
  "/stats",
  authenticate,
  isMerchant,
  merchantController.getMerchantStats
);

module.exports = router;
