/**
 * Controlador de Comercios
 * Maneja registro y gestión de comercios
 */

const { Merchant, User, Wallet, Transaction } = require("../models");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const { validate } = require("../middleware/validation");
const { MERCHANT_CATEGORIES, ROLES } = require("../config/constants");
const walletService = require("../services/walletService");

/**
 * Validación para registro de comercio
 */
const registerMerchantValidation = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("El nombre del negocio es requerido")
    .isLength({ min: 2, max: 150 })
    .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

  body("category")
    .notEmpty()
    .withMessage("La categoría es requerida")
    .isIn(MERCHANT_CATEGORIES)
    .withMessage("Categoría no válida"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("La descripción es muy larga"),

  body("phone").optional().trim(),

  body("address").optional().trim(),

  validate,
];

/**
 * @route   POST /api/merchants/register
 * @desc    Registrar como comercio
 * @access  Private
 */
const registerMerchant = asyncHandler(async (req, res) => {
  const {
    businessName,
    category,
    description,
    phone,
    address,
    website,
    taxId,
  } = req.body;

  // Verificar que el usuario no sea ya un comercio
  const existingMerchant = await Merchant.findOne({
    where: { userId: req.userId },
  });

  if (existingMerchant) {
    throw new AppError("Ya estás registrado como comercio", 400);
  }

  // Crear merchant
  const merchant = await Merchant.create({
    userId: req.userId,
    businessName,
    category,
    description,
    phone,
    address,
    website,
    taxId,
  });

  // Actualizar rol del usuario a merchant
  const user = await User.findByPk(req.userId);
  if (user.role === ROLES.USER) {
    await user.update({ role: ROLES.MERCHANT });
  }

  // Asegurar que tiene wallet
  try {
    await walletService.getWalletByUserId(req.userId);
  } catch (err) {
    await walletService.createWallet(req.userId);
  }

  res.status(201).json({
    success: true,
    message: "Comercio registrado exitosamente",
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      category: merchant.category,
      isVerified: merchant.isVerified,
    },
  });
});

/**
 * @route   GET /api/merchants/my-business
 * @desc    Obtener mi información de comercio
 * @access  Private (Merchant)
 */
const getMyBusiness = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "fullName", "email"],
        include: [
          {
            model: Wallet,
            as: "wallet",
            attributes: ["address", "balance", "currency"],
          },
        ],
      },
    ],
  });

  if (!merchant) {
    throw new AppError("No estás registrado como comercio", 404);
  }

  res.status(200).json({
    success: true,
    merchant,
  });
});

/**
 * @route   PUT /api/merchants/my-business
 * @desc    Actualizar información de mi comercio
 * @access  Private (Merchant)
 */
const updateMyBusiness = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
  });

  if (!merchant) {
    throw new AppError("No estás registrado como comercio", 404);
  }

  // Campos permitidos para actualizar
  const allowedFields = [
    "businessName",
    "category",
    "description",
    "phone",
    "address",
    "website",
  ];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  await merchant.update(updates);

  res.status(200).json({
    success: true,
    message: "Información actualizada exitosamente",
    merchant,
  });
});

/**
 * @route   GET /api/merchants/payments
 * @desc    Obtener pagos recibidos
 * @access  Private (Merchant)
 */
const getReceivedPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
    include: [
      {
        model: User,
        as: "user",
        include: [
          {
            model: Wallet,
            as: "wallet",
          },
        ],
      },
    ],
  });

  if (!merchant) {
    throw new AppError("No estás registrado como comercio", 404);
  }

  const wallet = merchant.user.wallet;
  const offset = (page - 1) * limit;
  const where = { toWalletId: wallet.id, type: "qr_payment" };

  if (status) {
    where.status = status;
  }

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [
      {
        model: Wallet,
        as: "fromWallet",
        attributes: ["address"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["fullName", "email"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    payments: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  });
});

/**
 * @route   GET /api/merchants/balance
 * @desc    Obtener balance del comercio
 * @access  Private (Merchant)
 */
const getMerchantBalance = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
  });

  if (!merchant) {
    throw new AppError("No estás registrado como comercio", 404);
  }

  const balance = await walletService.getBalance(req.userId);

  res.status(200).json({
    success: true,
    balance,
    stats: {
      totalSales: parseFloat(merchant.totalSales),
      totalTransactions: merchant.totalTransactions,
      rating: parseFloat(merchant.rating) || 0,
    },
  });
});

/**
 * @route   GET /api/merchants/stats
 * @desc    Obtener estadísticas del comercio
 * @access  Private (Merchant)
 */
const getMerchantStats = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findOne({
    where: { userId: req.userId },
    include: [
      {
        model: User,
        as: "user",
        include: [
          {
            model: Wallet,
            as: "wallet",
          },
        ],
      },
    ],
  });

  if (!merchant) {
    throw new AppError("No estás registrado como comercio", 404);
  }

  const wallet = merchant.user.wallet;

  // Estadísticas de últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { Op } = require("sequelize");

  const recentTransactions = await Transaction.count({
    where: {
      toWalletId: wallet.id,
      type: "qr_payment",
      status: "completed",
      createdAt: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
  });

  const recentSales =
    (await Transaction.sum("amount", {
      where: {
        toWalletId: wallet.id,
        type: "qr_payment",
        status: "completed",
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    })) || 0;

  res.status(200).json({
    success: true,
    stats: {
      businessName: merchant.businessName,
      category: merchant.category,
      isVerified: merchant.isVerified,
      totalSales: parseFloat(merchant.totalSales),
      totalTransactions: merchant.totalTransactions,
      currentBalance: parseFloat(wallet.balance),
      last30Days: {
        transactions: recentTransactions,
        sales: parseFloat(recentSales),
      },
      createdAt: merchant.createdAt,
    },
  });
});

/**
 * @route   GET /api/merchants/all
 * @desc    Listar todos los comercios (público)
 * @access  Public
 */
const getAllMerchants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const offset = (page - 1) * limit;
  const where = { isActive: true };

  if (category) {
    where.category = category;
  }

  const { count, rows } = await Merchant.findAndCountAll({
    where,
    attributes: [
      "id",
      "businessName",
      "category",
      "description",
      "rating",
      "isVerified",
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    merchants: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  });
});

module.exports = {
  registerMerchant,
  registerMerchantValidation,
  getMyBusiness,
  updateMyBusiness,
  getReceivedPayments,
  getMerchantBalance,
  getMerchantStats,
  getAllMerchants,
};
