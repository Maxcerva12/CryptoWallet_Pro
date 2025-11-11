/**
 * Modelo de Comercio (Merchant)
 * RF-16 a RF-19: Gestión de comercios
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { MERCHANT_CATEGORIES } = require("../config/constants");

const Merchant = sequelize.define(
  "Merchant",
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
    businessName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "business_name", // Mapeo explícito a snake_case
      validate: {
        notEmpty: {
          msg: "El nombre del negocio es requerido",
        },
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [MERCHANT_CATEGORIES],
          msg: "Categoría no válida",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL o path del logo del comercio",
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida",
        },
      },
    },
    taxId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "RUC o identificación tributaria",
      field: "tax_id", // Mapeo explícito a snake_case
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Comercio verificado por administrador",
      field: "is_verified", // Mapeo explícito a snake_case
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active", // Mapeo explícito a snake_case
    },
    totalSales: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
      allowNull: false,
      comment: "Total acumulado de ventas",
      field: "total_sales", // Mapeo explícito a snake_case
    },
    totalTransactions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: "Número total de transacciones",
      field: "total_transactions", // Mapeo explícito a snake_case
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Información adicional del comercio",
    },
  },
  {
    tableName: "merchants",
    timestamps: true,
    underscored: true, // Usar snake_case automáticamente
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["is_active", "is_verified"],
      },
    ],
  }
);

/**
 * Actualizar estadísticas de ventas
 */
Merchant.prototype.updateSalesStats = async function (amount) {
  return await this.update({
    totalSales: parseFloat(this.totalSales) + parseFloat(amount),
    totalTransactions: this.totalTransactions + 1,
  });
};

/**
 * Verificar comercio
 */
Merchant.prototype.verify = async function () {
  return await this.update({ isVerified: true });
};

/**
 * Obtener tasa de éxito de transacciones
 */
Merchant.prototype.getSuccessRate = function () {
  // Esto se calcularía con transacciones completadas vs totales
  return 100; // Placeholder
};

module.exports = Merchant;
