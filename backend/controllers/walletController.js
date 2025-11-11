/**
 * Controlador de Wallet
 * Maneja operaciones de billetera
 */

const walletService = require("../services/walletService");
const { asyncHandler } = require("../middleware/errorHandler");
const { body, query } = require("express-validator");
const { validate } = require("../middleware/validation");

/**
 * Validación para transferencia
 */
const transferValidation = [
  body("toWalletAddress")
    .trim()
    .notEmpty()
    .withMessage("La dirección de destino es requerida"),

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
 * @route   GET /api/wallets/my-wallet
 * @desc    Obtener mi wallet
 * @access  Private
 */
const getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWalletByUserId(req.userId);

  res.status(200).json({
    success: true,
    wallet: {
      id: wallet.id,
      address: wallet.address,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency,
      isActive: wallet.isActive,
      lastTransactionAt: wallet.lastTransactionAt,
      createdAt: wallet.createdAt,
    },
  });
});

/**
 * @route   GET /api/wallets/balance
 * @desc    Obtener balance de mi wallet
 * @access  Private
 */
const getBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getBalance(req.userId);

  res.status(200).json({
    success: true,
    balance,
  });
});

/**
 * @route   POST /api/wallets/transfer
 * @desc    Transferir fondos
 * @access  Private
 */
const transfer = asyncHandler(async (req, res) => {
  const { toWalletAddress, amount, description } = req.body;

  const result = await walletService.transfer(
    req.userId,
    toWalletAddress,
    amount,
    description
  );

  res.status(200).json({
    success: true,
    message: "Transferencia realizada exitosamente",
    data: result,
  });
});

/**
 * @route   GET /api/wallets/transactions
 * @desc    Obtener historial de transacciones
 * @access  Private
 */
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;

  const result = await walletService.getTransactionHistory(req.userId, {
    page,
    limit,
    type,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @route   GET /api/wallets/stats
 * @desc    Obtener estadísticas de wallet
 * @access  Private
 */
const getWalletStats = asyncHandler(async (req, res) => {
  const stats = await walletService.getWalletStats(req.userId);

  res.status(200).json({
    success: true,
    stats,
  });
});

/**
 * @route   GET /api/wallets/:address
 * @desc    Obtener información pública de una wallet
 * @access  Public
 */
const getWalletByAddress = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const { Wallet, User } = require("../models");
  const wallet = await Wallet.findOne({
    where: { address },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["fullName", "role"],
      },
    ],
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: "Wallet no encontrada",
    });
  }

  res.status(200).json({
    success: true,
    wallet: {
      address: wallet.address,
      currency: wallet.currency,
      owner: wallet.user.fullName,
      // No revelamos el balance por privacidad
    },
  });
});

/**
 * @route   POST /api/wallets/create
 * @desc    Crear wallet manualmente
 * @access  Private
 */
const createWallet = asyncHandler(async (req, res) => {
  try {
    // Crear nueva wallet
    const wallet = await walletService.createWallet(req.userId);

    res.status(201).json({
      success: true,
      message: "Wallet creada exitosamente",
      wallet: {
        id: wallet.id,
        address: wallet.address,
        balance: parseFloat(wallet.balance),
        currency: wallet.currency,
        isActive: wallet.isActive,
      },
    });
  } catch (error) {
    if (error.message === "El usuario ya tiene una wallet") {
      return res.status(400).json({
        success: false,
        message: "Ya tienes una wallet creada",
      });
    }
    throw error;
  }
});

module.exports = {
  getMyWallet,
  getBalance,
  transfer,
  transferValidation,
  getTransactionHistory,
  getWalletStats,
  getWalletByAddress,
  createWallet,
};
