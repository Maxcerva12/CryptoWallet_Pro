/**
 * Modelo de Bloque (Simulación Blockchain)
 * RF-23: Estructura de bloques encadenados
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const crypto = require("crypto");

const Block = sequelize.define(
  "Block",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      field: "block_number", // Mapeo explícito a snake_case
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: "Hash SHA-256 del bloque actual",
    },
    previousHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: "Hash del bloque anterior (encadenamiento)",
      field: "previous_hash", // Mapeo explícito a snake_case
    },
    nonce: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: "Número usado una vez para el proof-of-work",
    },
    difficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      allowNull: false,
    },
    transactionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "transaction_count", // Mapeo explícito a snake_case
    },
    merkleRoot: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "Raíz del árbol de Merkle de transacciones",
      field: "merkle_root", // Mapeo explícito a snake_case
    },
    minedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: 'Usuario que "minó" el bloque (simulado)',
      field: "mined_by", // Mapeo explícito a snake_case
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_valid", // Mapeo explícito a snake_case
    },
  },
  {
    tableName: "blocks",
    timestamps: true,
    underscored: true, // Usar snake_case automáticamente
    indexes: [
      {
        unique: true,
        fields: ["block_number"],
      },
      {
        fields: ["hash"],
      },
      {
        fields: ["previous_hash"],
      },
    ],
  }
);

/**
 * Calcular el hash del bloque
 */
Block.calculateHash = function (
  blockNumber,
  timestamp,
  previousHash,
  transactionData,
  nonce
) {
  const data = `${blockNumber}${timestamp}${previousHash}${JSON.stringify(
    transactionData
  )}${nonce}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Minar bloque (Proof of Work simulado)
 */
Block.prototype.mineBlock = async function (difficulty) {
  const target = "0".repeat(difficulty);

  while (this.hash.substring(0, difficulty) !== target) {
    this.nonce++;
    this.hash = Block.calculateHash(
      this.blockNumber,
      this.timestamp,
      this.previousHash,
      {},
      this.nonce
    );
  }

  await this.save();
  return this.hash;
};

/**
 * Validar integridad del bloque
 */
Block.prototype.validate = function () {
  const calculatedHash = Block.calculateHash(
    this.blockNumber,
    this.timestamp,
    this.previousHash,
    {},
    this.nonce
  );

  return calculatedHash === this.hash;
};

/**
 * Verificar encadenamiento con bloque anterior
 */
Block.prototype.isPreviousHashValid = async function () {
  if (this.blockNumber === 0) return true; // Bloque génesis

  const previousBlock = await Block.findOne({
    where: { blockNumber: this.blockNumber - 1 },
  });

  if (!previousBlock) return false;

  return this.previousHash === previousBlock.hash;
};

module.exports = Block;
