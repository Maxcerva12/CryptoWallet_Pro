/**
 * Servicio de Wallet
 * Lógica de negocio para operaciones de billetera
 */

const { Wallet, Transaction, User } = require("../models");
const {
  WALLET_CONFIG,
  TRANSACTION_CONFIG,
  ERROR_MESSAGES,
} = require("../config/constants");
const { AppError } = require("../middleware/errorHandler");
const { getBlockchainService } = require("./blockchainService");

class WalletService {
  /**
   * Crear wallet para un usuario
   */
  async createWallet(userId) {
    try {
      // Verificar si ya existe wallet
      const existingWallet = await Wallet.findOne({ where: { userId } });
      if (existingWallet) {
        throw new AppError("El usuario ya tiene una wallet", 400);
      }

      // Crear wallet con balance inicial
      const wallet = await Wallet.create({
        userId,
        balance: WALLET_CONFIG.INITIAL_BALANCE,
        currency: "CC",
      });

      return wallet;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener wallet por ID de usuario
   */
  async getWalletByUserId(userId) {
    const wallet = await Wallet.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email", "role"],
        },
      ],
    });

    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.WALLET_NOT_FOUND, 404);
    }

    return wallet;
  }

  /**
   * Obtener wallet por ID
   */
  async getWalletById(walletId) {
    const wallet = await Wallet.findByPk(walletId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email", "role"],
        },
      ],
    });

    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.WALLET_NOT_FOUND, 404);
    }

    return wallet;
  }

  /**
   * Obtener balance de wallet
   */
  async getBalance(userId) {
    const wallet = await this.getWalletByUserId(userId);

    return {
      balance: parseFloat(wallet.balance),
      currency: wallet.currency,
      address: wallet.address,
      formatted: wallet.getFormattedBalance(),
    };
  }

  /**
   * Transferir fondos entre wallets
   */
  async transfer(fromUserId, toWalletAddress, amount, description = "") {
    try {
      // Validar monto
      const transferAmount = parseFloat(amount);
      if (transferAmount < TRANSACTION_CONFIG.MIN_AMOUNT) {
        throw new AppError(
          `El monto mínimo es ${TRANSACTION_CONFIG.MIN_AMOUNT} CC`,
          400
        );
      }
      if (transferAmount > TRANSACTION_CONFIG.MAX_AMOUNT) {
        throw new AppError(
          `El monto máximo es ${TRANSACTION_CONFIG.MAX_AMOUNT} CC`,
          400
        );
      }

      // Calcular fee
      const fee = transferAmount * TRANSACTION_CONFIG.FEE_PERCENTAGE;
      const totalAmount = transferAmount + fee;

      // Obtener wallets
      const fromWallet = await this.getWalletByUserId(fromUserId);
      const toWallet = await Wallet.findOne({
        where: { address: toWalletAddress },
      });

      if (!toWallet) {
        throw new AppError("Wallet de destino no encontrada", 404);
      }

      // Verificar que no sea la misma wallet
      if (fromWallet.id === toWallet.id) {
        throw new AppError("No puedes transferir a tu propia wallet", 400);
      }

      // Verificar balance suficiente
      if (!fromWallet.hasSufficientBalance(totalAmount)) {
        throw new AppError(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 400);
      }

      // Crear transacción
      const transaction = await Transaction.create({
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        amount: transferAmount,
        fee: fee,
        totalAmount: totalAmount,
        currency: "CC",
        type: "transfer",
        status: "pending",
        description: description,
      });

      // Ejecutar transferencia
      await fromWallet.updateBalance(totalAmount, "subtract");
      await toWallet.updateBalance(transferAmount, "add");

      // Confirmar transacción
      await transaction.confirm();

      // Agregar a blockchain
      const blockchainService = getBlockchainService();
      await blockchainService.addTransaction(transaction);

      return {
        transaction,
        newBalance: await this.getBalance(fromUserId),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener historial de transacciones
   */
  async getTransactionHistory(userId, { page = 1, limit = 10, type = null }) {
    const wallet = await this.getWalletByUserId(userId);

    const offset = (page - 1) * limit;
    const where = {};

    if (type) {
      where.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: {
        [require("sequelize").Op.or]: [
          { fromWalletId: wallet.id, ...where },
          { toWalletId: wallet.id, ...where },
        ],
      },
      include: [
        {
          model: Wallet,
          as: "fromWallet",
          attributes: ["id", "address"],
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
          attributes: ["id", "address"],
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
      offset: offset,
    });

    // Marcar si es entrada o salida
    const transactions = rows.map((tx) => {
      const txData = tx.toJSON();
      txData.direction = tx.fromWalletId === wallet.id ? "sent" : "received";
      return txData;
    });

    return {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Obtener estadísticas de wallet
   */
  async getWalletStats(userId) {
    const wallet = await this.getWalletByUserId(userId);

    const { Op } = require("sequelize");

    // Total enviado
    const totalSent =
      (await Transaction.sum("amount", {
        where: {
          fromWalletId: wallet.id,
          status: "completed",
        },
      })) || 0;

    // Total recibido
    const totalReceived =
      (await Transaction.sum("amount", {
        where: {
          toWalletId: wallet.id,
          status: "completed",
        },
      })) || 0;

    // Total de transacciones
    const totalTransactions = await Transaction.count({
      where: {
        [Op.or]: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }],
        status: "completed",
      },
    });

    return {
      currentBalance: parseFloat(wallet.balance),
      totalSent: parseFloat(totalSent),
      totalReceived: parseFloat(totalReceived),
      totalTransactions,
      currency: wallet.currency,
      walletAddress: wallet.address,
      createdAt: wallet.createdAt,
      lastTransactionAt: wallet.lastTransactionAt,
    };
  }
}

module.exports = new WalletService();
