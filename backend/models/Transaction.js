/**
 * Modelo de Transacción
 * RF-20 a RF-23: Registro de transacciones
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const {
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
} = require("../config/constants");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Hash único de la transacción (simulación blockchain)",
      field: "tx_hash", // Mapeo explícito a snake_case
    },
    fromWalletId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "wallets",
        key: "id",
      },
      field: "from_wallet_id", // Mapeo explícito a snake_case
    },
    toWalletId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "wallets",
        key: "id",
      },
      field: "to_wallet_id", // Mapeo explícito a snake_case
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "El monto mínimo es 0.01",
        },
        isDecimal: {
          msg: "El monto debe ser un número decimal",
        },
      },
    },
    fee: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      comment: "Monto total = amount + fee",
      field: "total_amount", // Mapeo explícito a snake_case
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "CC",
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)),
      defaultValue: TRANSACTION_TYPES.TRANSFER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TRANSACTION_STATUS)),
      defaultValue: TRANSACTION_STATUS.PENDING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Información adicional (QR ID, comercio, etc.)",
    },
    blockId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "blocks",
        key: "id",
      },
      comment: "ID del bloque que contiene esta transacción",
      field: "block_id", // Mapeo explícito a snake_case
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "confirmed_at", // Mapeo explícito a snake_case
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    underscored: true, // Usar snake_case automáticamente
    hooks: {
      // Generar hash único antes de validar
      beforeValidate: (transaction) => {
        if (!transaction.txHash) {
          const crypto = require("crypto");
          const data = `${transaction.fromWalletId}${transaction.toWalletId}${
            transaction.amount
          }${Date.now()}`;
          transaction.txHash = crypto
            .createHash("sha256")
            .update(data)
            .digest("hex");
        }

        // Calcular monto total
        transaction.totalAmount =
          parseFloat(transaction.amount) + parseFloat(transaction.fee || 0);
      },
    },
  }
);

/**
 * Método para confirmar transacción
 */
Transaction.prototype.confirm = async function () {
  return await this.update({
    status: TRANSACTION_STATUS.COMPLETED,
    confirmedAt: new Date(),
  });
};

/**
 * Método para marcar como fallida
 */
Transaction.prototype.fail = async function (reason) {
  return await this.update({
    status: TRANSACTION_STATUS.FAILED,
    metadata: {
      ...this.metadata,
      failReason: reason,
    },
  });
};

/**
 * Verificar si la transacción está completa
 */
Transaction.prototype.isCompleted = function () {
  return this.status === TRANSACTION_STATUS.COMPLETED;
};

/**
 * Verificar si la transacción está pendiente
 */
Transaction.prototype.isPending = function () {
  return this.status === TRANSACTION_STATUS.PENDING;
};

module.exports = Transaction;
