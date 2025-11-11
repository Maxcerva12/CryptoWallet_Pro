/**
 * Controlador de Administración
 * Panel de control para administradores del sistema
 */

const {
  User,
  Wallet,
  Transaction,
  Merchant,
  Block,
  QRPayment,
} = require("../models");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { getBlockchainService } = require("../services/blockchainService");
const { Op } = require("sequelize");

/**
 * @route   GET /api/admin/stats
 * @desc    Obtener estadísticas generales del sistema
 * @access  Private (Admin)
 */
const getSystemStats = asyncHandler(async (req, res) => {
  // Contar usuarios
  const totalUsers = await User.count();
  const totalMerchants = await Merchant.count();
  const totalActiveUsers = await User.count({ where: { isActive: true } });

  // Contar wallets y suma de balances
  const totalWallets = await Wallet.count();
  const totalBalance = (await Wallet.sum("balance")) || 0;

  // Contar transacciones
  const totalTransactions = await Transaction.count();
  const completedTransactions = await Transaction.count({
    where: { status: "completed" },
  });
  const pendingTransactions = await Transaction.count({
    where: { status: "pending" },
  });

  // Volumen de transacciones
  const totalVolume =
    (await Transaction.sum("amount", {
      where: { status: "completed" },
    })) || 0;

  // Blockchain stats
  const blockchainService = getBlockchainService();
  const blockchainStats = await blockchainService.getStats();

  // QR stats
  const totalQRs = await QRPayment.count();
  const activeQRs = await QRPayment.count({ where: { status: "active" } });
  const usedQRs = await QRPayment.count({ where: { status: "used" } });

  // Últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsers = await User.count({
    where: {
      createdAt: { [Op.gte]: sevenDaysAgo },
    },
  });

  const recentTransactions = await Transaction.count({
    where: {
      createdAt: { [Op.gte]: sevenDaysAgo },
      status: "completed",
    },
  });

  res.status(200).json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
        active: totalActiveUsers,
        merchants: totalMerchants,
        recentRegistrations: recentUsers,
      },
      wallets: {
        total: totalWallets,
        totalBalance: parseFloat(totalBalance),
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        pending: pendingTransactions,
        totalVolume: parseFloat(totalVolume),
        recent: recentTransactions,
      },
      blockchain: blockchainStats,
      qrPayments: {
        total: totalQRs,
        active: activeQRs,
        used: usedQRs,
      },
    },
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    Listar todos los usuarios
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isActive } = req.query;
  const offset = (page - 1) * limit;
  const where = {};

  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === "true";

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Wallet,
        as: "wallet",
        attributes: ["address", "balance", "currency"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    users: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  });
});

/**
 * @route   GET /api/admin/transactions
 * @desc    Listar todas las transacciones
 * @access  Private (Admin)
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const offset = (page - 1) * limit;
  const where = {};

  if (status) where.status = status;
  if (type) where.type = type;

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
      {
        model: Wallet,
        as: "toWallet",
        attributes: ["address"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["fullName", "email"],
          },
        ],
      },
      {
        model: Block,
        as: "block",
        attributes: ["blockNumber", "hash"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    transactions: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  });
});

/**
 * @route   GET /api/admin/merchants
 * @desc    Listar todos los comercios
 * @access  Private (Admin)
 */
const getAllMerchants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isVerified, category } = req.query;
  const offset = (page - 1) * limit;
  const where = {};

  if (isVerified !== undefined) where.isVerified = isVerified === "true";
  if (category) where.category = category;

  const { count, rows } = await Merchant.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["fullName", "email"],
      },
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

/**
 * @route   PUT /api/admin/users/:userId/toggle-status
 * @desc    Activar/desactivar usuario
 * @access  Private (Admin)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  await user.update({ isActive: !user.isActive });

  res.status(200).json({
    success: true,
    message: `Usuario ${
      user.isActive ? "activado" : "desactivado"
    } exitosamente`,
    user: {
      id: user.id,
      fullName: user.fullName,
      isActive: user.isActive,
    },
  });
});

/**
 * @route   PUT /api/admin/merchants/:merchantId/verify
 * @desc    Verificar comercio
 * @access  Private (Admin)
 */
const verifyMerchant = asyncHandler(async (req, res) => {
  const { merchantId } = req.params;

  const merchant = await Merchant.findByPk(merchantId);
  if (!merchant) {
    throw new AppError("Comercio no encontrado", 404);
  }

  await merchant.verify();

  res.status(200).json({
    success: true,
    message: "Comercio verificado exitosamente",
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      isVerified: merchant.isVerified,
    },
  });
});

/**
 * @route   GET /api/admin/blockchain/validate
 * @desc    Validar integridad de la blockchain
 * @access  Private (Admin)
 */
const validateBlockchain = asyncHandler(async (req, res) => {
  const blockchainService = getBlockchainService();
  const validation = await blockchainService.validateChain();

  res.status(200).json({
    success: true,
    validation,
  });
});

/**
 * @route   GET /api/admin/blockchain/blocks
 * @desc    Listar bloques de la blockchain
 * @access  Private (Admin)
 */
const getBlocks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await Block.findAndCountAll({
    order: [["blockNumber", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    blocks: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  });
});

/**
 * @route   GET /api/admin/reports/daily
 * @desc    Reporte diario del sistema
 * @access  Private (Admin)
 */
const getDailyReport = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const newUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [today, tomorrow] },
    },
  });

  const newTransactions = await Transaction.count({
    where: {
      createdAt: { [Op.between]: [today, tomorrow] },
      status: "completed",
    },
  });

  const dailyVolume =
    (await Transaction.sum("amount", {
      where: {
        createdAt: { [Op.between]: [today, tomorrow] },
        status: "completed",
      },
    })) || 0;

  const newMerchants = await Merchant.count({
    where: {
      createdAt: { [Op.between]: [today, tomorrow] },
    },
  });

  res.status(200).json({
    success: true,
    report: {
      date: today.toISOString().split("T")[0],
      newUsers,
      newMerchants,
      transactions: newTransactions,
      volume: parseFloat(dailyVolume),
    },
  });
});

module.exports = {
  getSystemStats,
  getAllUsers,
  getAllTransactions,
  getAllMerchants,
  toggleUserStatus,
  verifyMerchant,
  validateBlockchain,
  getBlocks,
  getDailyReport,
};
