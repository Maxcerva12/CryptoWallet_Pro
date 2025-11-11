/**
 * Modelo de Pago QR
 * RF-10 a RF-15: Sistema de pagos QR
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { QR_STATUS, QR_CONFIG } = require("../config/constants");
const crypto = require("crypto");

const QRPayment = sequelize.define(
  "QRPayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      comment: "Código QR en formato base64",
      field: "qr_code", // Mapeo explícito a snake_case
    },
    qrToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Token único del QR para validación",
      field: "qr_token", // Mapeo explícito a snake_case
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "merchants",
        key: "id",
      },
      field: "merchant_id", // Mapeo explícito a snake_case
    },
    merchantWalletId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "wallets",
        key: "id",
      },
      field: "merchant_wallet_id", // Mapeo explícito a snake_case
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "El monto mínimo es 0.01",
        },
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "CC",
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(QR_STATUS)),
      defaultValue: QR_STATUS.ACTIVE,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at", // Mapeo explícito a snake_case
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "used_at", // Mapeo explícito a snake_case
    },
    usedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Usuario que realizó el pago",
      field: "used_by", // Mapeo explícito a snake_case
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "transactions",
        key: "id",
      },
      field: "transaction_id", // Mapeo explícito a snake_case
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Información adicional del pago",
    },
  },
  {
    tableName: "qr_payments",
    timestamps: true,
    underscored: true, // Usar snake_case automáticamente
    indexes: [
      {
        unique: true,
        fields: ["qr_token"],
      },
      {
        fields: ["merchant_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["expires_at"],
      },
    ],
    hooks: {
      // Generar token único, código QR y fecha de expiración antes de validar
      beforeValidate: (qrPayment) => {
        if (!qrPayment.qrToken) {
          qrPayment.qrToken = crypto.randomBytes(32).toString("hex");
        }

        if (!qrPayment.qrCode) {
          // Generar código QR simple (en producción usarías una librería de QR real)
          const qrData = JSON.stringify({
            token: qrPayment.qrToken,
            merchantId: qrPayment.merchantId,
            amount: qrPayment.amount,
            currency: qrPayment.currency,
          });
          qrPayment.qrCode = Buffer.from(qrData).toString("base64");
        }

        if (!qrPayment.expiresAt) {
          qrPayment.expiresAt = new Date(
            Date.now() + QR_CONFIG.EXPIRATION_TIME
          );
        }
      },
    },
  }
);

/**
 * Verificar si el QR ha expirado
 */
QRPayment.prototype.isExpired = function () {
  return new Date() > this.expiresAt;
};

/**
 * Verificar si el QR está activo y no ha sido usado
 */
QRPayment.prototype.isValid = function () {
  return this.status === QR_STATUS.ACTIVE && !this.isExpired() && !this.usedAt;
};

/**
 * Marcar QR como usado
 */
QRPayment.prototype.markAsUsed = async function (userId, transactionId) {
  return await this.update({
    status: QR_STATUS.USED,
    usedAt: new Date(),
    usedBy: userId,
    transactionId: transactionId,
  });
};

/**
 * Marcar QR como expirado
 */
QRPayment.prototype.markAsExpired = async function () {
  return await this.update({
    status: QR_STATUS.EXPIRED,
  });
};

/**
 * Cancelar QR
 */
QRPayment.prototype.cancel = async function () {
  return await this.update({
    status: QR_STATUS.CANCELLED,
  });
};

/**
 * Obtener datos para el QR
 */
QRPayment.prototype.getQRData = function () {
  return {
    token: this.qrToken,
    merchantId: this.merchantId,
    amount: this.amount,
    currency: this.currency,
    description: this.description,
    expiresAt: this.expiresAt,
  };
};

module.exports = QRPayment;
