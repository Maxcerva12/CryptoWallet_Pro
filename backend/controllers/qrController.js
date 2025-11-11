/**
 * Controlador de QR
 * Maneja generación y procesamiento de códigos QR
 */

const qrService = require("../services/qrService");
const { Merchant } = require("../models");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const { validate } = require("../middleware/validation");

/**
 * Validación para generar QR
 */
const generateQRValidation = [
  body("amount")
    .notEmpty()
    .withMessage("El monto es requerido")
    .isFloat({ min: 0.01 })
    .withMessage("El monto debe ser mayor a 0"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("La descripción es muy larga"),

  validate,
];

/**
 * Validación para procesar pago
 */
const processPaymentValidation = [
  body("qrToken").trim().notEmpty().withMessage("El token del QR es requerido"),

  validate,
];

/**
 * @route   POST /api/qr/generate
 * @desc    Generar código QR de pago
 * @access  Private (Merchant)
 */
const generateQR = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  // Obtener merchant del usuario actual
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
  });

  if (!merchant) {
    throw new AppError("Debes ser un comercio para generar códigos QR", 403);
  }

  const qrData = await qrService.generatePaymentQR(
    merchant.id,
    amount,
    description
  );

  res.status(201).json({
    success: true,
    message: "Código QR generado exitosamente",
    data: qrData,
  });
});

/**
 * @route   GET /api/qr/:token
 * @desc    Obtener información de un QR
 * @access  Public
 */
const getQRInfo = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const qrInfo = await qrService.getQRInfo(token);

  res.status(200).json({
    success: true,
    data: qrInfo,
  });
});

/**
 * @route   POST /api/qr/pay
 * @desc    Procesar pago mediante QR
 * @access  Private
 */
const processPayment = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;

  const result = await qrService.processQRPayment(req.userId, qrToken);

  res.status(200).json(result);
});

/**
 * @route   POST /api/qr/:token/cancel
 * @desc    Cancelar un código QR
 * @access  Private (Merchant owner)
 */
const cancelQR = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Obtener merchant del usuario actual
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
  });

  if (!merchant) {
    throw new AppError("Debes ser un comercio para cancelar códigos QR", 403);
  }

  const result = await qrService.cancelQR(token, merchant.id);

  res.status(200).json(result);
});

/**
 * @route   GET /api/qr/my-qrs
 * @desc    Obtener mis códigos QR (merchant)
 * @access  Private (Merchant)
 */
const getMyQRs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  // Obtener merchant del usuario actual
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
  });

  if (!merchant) {
    throw new AppError("Debes ser un comercio para ver códigos QR", 403);
  }

  const result = await qrService.getMerchantQRs(merchant.id, {
    page,
    limit,
    status,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @route   POST /api/qr/clean-expired
 * @desc    Limpiar QRs expirados (admin/cron)
 * @access  Private (Admin)
 */
const cleanExpiredQRs = asyncHandler(async (req, res) => {
  const result = await qrService.cleanExpiredQRs();

  res.status(200).json({
    success: true,
    message: `${result.cleaned} códigos QR expirados limpiados`,
    data: result,
  });
});

module.exports = {
  generateQR,
  generateQRValidation,
  getQRInfo,
  processPayment,
  processPaymentValidation,
  cancelQR,
  getMyQRs,
  cleanExpiredQRs,
};
