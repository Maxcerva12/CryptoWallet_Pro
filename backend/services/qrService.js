/**
 * Servicio de QR
 * Generación y validación de códigos QR para pagos
 */

const QRCode = require("qrcode");
const { QRPayment, Merchant, Wallet, Transaction } = require("../models");
const { QR_CONFIG, QR_STATUS, ERROR_MESSAGES } = require("../config/constants");
const { AppError } = require("../middleware/errorHandler");
const walletService = require("./walletService");
const { getBlockchainService } = require("./blockchainService");

class QRService {
  /**
   * Generar código QR para pago
   */
  async generatePaymentQR(merchantId, amount, description = "") {
    try {
      // Validar monto
      if (amount <= 0) {
        throw new AppError("El monto debe ser mayor a 0", 400);
      }

      // Obtener merchant y su wallet
      const merchant = await Merchant.findByPk(merchantId, {
        include: [
          {
            model: require("../models").User,
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
        throw new AppError("Comercio no encontrado", 404);
      }

      if (!merchant.isActive) {
        throw new AppError("Comercio inactivo", 400);
      }

      const merchantWallet = merchant.user.wallet;
      if (!merchantWallet) {
        throw new AppError("El comercio no tiene una wallet configurada", 400);
      }

      // Crear registro de QR Payment
      const qrPayment = await QRPayment.create({
        merchantId,
        merchantWalletId: merchantWallet.id,
        amount: parseFloat(amount),
        currency: "CC",
        description,
        status: QR_STATUS.ACTIVE,
      });

      // Preparar datos para el QR
      const qrData = {
        token: qrPayment.qrToken,
        merchantId: merchant.id,
        merchantName: merchant.businessName,
        amount: parseFloat(amount),
        currency: "CC",
        description,
        expiresAt: qrPayment.expiresAt.toISOString(),
      };

      // Generar código QR en base64
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: QR_CONFIG.QR_SIZE,
        margin: 2,
        errorCorrectionLevel: QR_CONFIG.ERROR_CORRECTION_LEVEL,
      });

      // Actualizar con el código QR generado
      await qrPayment.update({ qrCode: qrCodeImage });

      return {
        id: qrPayment.id,
        token: qrPayment.qrToken,
        qrCode: qrCodeImage,
        amount: parseFloat(amount),
        currency: "CC",
        description,
        merchantName: merchant.businessName,
        expiresAt: qrPayment.expiresAt,
        status: qrPayment.status,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener información de un QR
   */
  async getQRInfo(qrToken) {
    const qrPayment = await QRPayment.findOne({
      where: { qrToken },
      include: [
        {
          model: Merchant,
          as: "merchant",
          attributes: ["id", "businessName", "category"],
        },
      ],
    });

    if (!qrPayment) {
      throw new AppError("Código QR no encontrado", 404);
    }

    return {
      id: qrPayment.id,
      token: qrPayment.qrToken,
      amount: parseFloat(qrPayment.amount),
      currency: qrPayment.currency,
      description: qrPayment.description,
      status: qrPayment.status,
      isValid: qrPayment.isValid(),
      isExpired: qrPayment.isExpired(),
      merchant: qrPayment.merchant,
      expiresAt: qrPayment.expiresAt,
      createdAt: qrPayment.createdAt,
    };
  }

  /**
   * Procesar pago mediante QR
   */
  async processQRPayment(userId, qrToken) {
    try {
      // Obtener QR payment
      const qrPayment = await QRPayment.findOne({
        where: { qrToken },
        include: [
          {
            model: Merchant,
            as: "merchant",
          },
          {
            model: Wallet,
            as: "merchantWallet",
          },
        ],
      });

      if (!qrPayment) {
        throw new AppError("Código QR no encontrado", 404);
      }

      // Validar estado del QR
      if (!qrPayment.isValid()) {
        if (qrPayment.isExpired()) {
          await qrPayment.markAsExpired();
          throw new AppError(ERROR_MESSAGES.QR_EXPIRED, 400);
        }
        if (qrPayment.status === QR_STATUS.USED) {
          throw new AppError(ERROR_MESSAGES.QR_ALREADY_USED, 400);
        }
        throw new AppError("Código QR no válido", 400);
      }

      // Obtener wallet del usuario
      const userWallet = await walletService.getWalletByUserId(userId);

      // Verificar que el usuario no sea el mismo comercio
      if (userWallet.id === qrPayment.merchantWalletId) {
        throw new AppError("No puedes pagar tu propio código QR", 400);
      }

      // Verificar saldo suficiente
      const totalAmount = parseFloat(qrPayment.amount);
      if (!userWallet.hasSufficientBalance(totalAmount)) {
        throw new AppError(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 400);
      }

      // Crear transacción
      const transaction = await Transaction.create({
        fromWalletId: userWallet.id,
        toWalletId: qrPayment.merchantWalletId,
        amount: qrPayment.amount,
        fee: 0, // Sin fee para pagos QR
        totalAmount: qrPayment.amount,
        currency: "CC",
        type: "qr_payment",
        status: "pending",
        description: `Pago QR: ${qrPayment.description}`,
        metadata: {
          qrPaymentId: qrPayment.id,
          merchantId: qrPayment.merchantId,
          merchantName: qrPayment.merchant.businessName,
        },
      });

      // Ejecutar transferencia
      await userWallet.updateBalance(totalAmount, "subtract");
      await qrPayment.merchantWallet.updateBalance(totalAmount, "add");

      // Confirmar transacción
      await transaction.confirm();

      // Marcar QR como usado
      await qrPayment.markAsUsed(userId, transaction.id);

      // Actualizar estadísticas del comercio
      await qrPayment.merchant.updateSalesStats(totalAmount);

      // Agregar a blockchain
      const blockchainService = getBlockchainService();
      await blockchainService.addTransaction(transaction);

      return {
        success: true,
        transaction: {
          id: transaction.id,
          txHash: transaction.txHash,
          amount: parseFloat(transaction.amount),
          currency: transaction.currency,
          merchantName: qrPayment.merchant.businessName,
          description: transaction.description,
          timestamp: transaction.createdAt,
        },
        newBalance: await walletService.getBalance(userId),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar un QR
   */
  async cancelQR(qrToken, merchantId) {
    const qrPayment = await QRPayment.findOne({
      where: { qrToken, merchantId },
    });

    if (!qrPayment) {
      throw new AppError("Código QR no encontrado", 404);
    }

    if (qrPayment.status === QR_STATUS.USED) {
      throw new AppError("No se puede cancelar un QR ya utilizado", 400);
    }

    await qrPayment.cancel();

    return {
      success: true,
      message: "Código QR cancelado exitosamente",
    };
  }

  /**
   * Obtener QRs activos de un comercio
   */
  async getMerchantQRs(merchantId, { page = 1, limit = 10, status = null }) {
    const offset = (page - 1) * limit;
    const where = { merchantId };

    if (status) {
      where.status = status;
    }

    const { count, rows } = await QRPayment.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    return {
      qrPayments: rows.map((qr) => ({
        id: qr.id,
        token: qr.qrToken,
        amount: parseFloat(qr.amount),
        currency: qr.currency,
        description: qr.description,
        status: qr.status,
        isExpired: qr.isExpired(),
        expiresAt: qr.expiresAt,
        usedAt: qr.usedAt,
        createdAt: qr.createdAt,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Limpiar QRs expirados (tarea programada)
   */
  async cleanExpiredQRs() {
    const expiredQRs = await QRPayment.findAll({
      where: {
        status: QR_STATUS.ACTIVE,
        expiresAt: {
          [require("sequelize").Op.lt]: new Date(),
        },
      },
    });

    for (const qr of expiredQRs) {
      await qr.markAsExpired();
    }

    return {
      cleaned: expiredQRs.length,
    };
  }
}

module.exports = new QRService();
