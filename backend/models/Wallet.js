/**
 * Modelo de Wallet (Billetera Virtual)
 * RF-05 a RF-09: Gestión de wallets
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { WALLET_CONFIG } = require("../config/constants");

const Wallet = sequelize.define(
  "Wallet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "user_id", // Mapeo explícito a snake_case
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Dirección única de la wallet (simulada)",
    },
    balance: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: WALLET_CONFIG.INITIAL_BALANCE,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "El balance no puede ser negativo",
        },
        isDecimal: {
          msg: "El balance debe ser un número decimal",
        },
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "CC", // CryptoCoin
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active", // Mapeo explícito a snake_case
    },
    lastTransactionAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_transaction_at", // Mapeo explícito a snake_case
    },
  },
  {
    tableName: "wallets",
    timestamps: true,
    underscored: true, // Usar snake_case automáticamente
    hooks: {
      // Generar address única antes de crear
      beforeValidate: (wallet) => {
        if (!wallet.address) {
          wallet.address = `CC${Date.now()}${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;
        }
      },
    },
  }
);

/**
 * Método para actualizar balance
 */
Wallet.prototype.updateBalance = async function (amount, operation = "add") {
  const currentBalance = parseFloat(this.balance);
  let newBalance;

  if (operation === "add") {
    newBalance = currentBalance + parseFloat(amount);
  } else if (operation === "subtract") {
    newBalance = currentBalance - parseFloat(amount);

    if (newBalance < 0) {
      throw new Error("Saldo insuficiente");
    }
  } else {
    throw new Error("Operación no válida");
  }

  await this.update({
    balance: newBalance,
    lastTransactionAt: new Date(),
  });

  return newBalance;
};

/**
 * Método para verificar si hay saldo suficiente
 */
Wallet.prototype.hasSufficientBalance = function (amount) {
  return parseFloat(this.balance) >= parseFloat(amount);
};

/**
 * Método para obtener balance formateado
 */
Wallet.prototype.getFormattedBalance = function () {
  return `${parseFloat(this.balance).toFixed(2)} ${this.currency}`;
};

module.exports = Wallet;
