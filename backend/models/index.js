/**
 * Definición de relaciones entre modelos
 * Inicialización de asociaciones Sequelize
 */

const User = require("./User");
const Wallet = require("./Wallet");
const Transaction = require("./Transaction");
const Block = require("./Block");
const Merchant = require("./Merchant");
const QRPayment = require("./QRPayment");

/**
 * Configurar todas las relaciones entre modelos
 */
const setupAssociations = () => {
  // Usuario - Wallet (1:1)
  User.hasOne(Wallet, {
    foreignKey: "userId",
    as: "wallet",
    onDelete: "CASCADE",
  });
  Wallet.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Usuario - Merchant (1:1)
  User.hasOne(Merchant, {
    foreignKey: "userId",
    as: "merchant",
    onDelete: "CASCADE",
  });
  Merchant.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Wallet - Transacciones (1:N como emisor)
  Wallet.hasMany(Transaction, {
    foreignKey: "fromWalletId",
    as: "sentTransactions",
  });
  Transaction.belongsTo(Wallet, {
    foreignKey: "fromWalletId",
    as: "fromWallet",
  });

  // Wallet - Transacciones (1:N como receptor)
  Wallet.hasMany(Transaction, {
    foreignKey: "toWalletId",
    as: "receivedTransactions",
  });
  Transaction.belongsTo(Wallet, {
    foreignKey: "toWalletId",
    as: "toWallet",
  });

  // Block - Transacciones (1:N)
  Block.hasMany(Transaction, {
    foreignKey: "blockId",
    as: "transactions",
  });
  Transaction.belongsTo(Block, {
    foreignKey: "blockId",
    as: "block",
  });

  // User - Bloques minados (1:N)
  User.hasMany(Block, {
    foreignKey: "minedBy",
    as: "minedBlocks",
  });
  Block.belongsTo(User, {
    foreignKey: "minedBy",
    as: "miner",
  });

  // Merchant - QRPayments (1:N)
  Merchant.hasMany(QRPayment, {
    foreignKey: "merchantId",
    as: "qrPayments",
  });
  QRPayment.belongsTo(Merchant, {
    foreignKey: "merchantId",
    as: "merchant",
  });

  // Wallet - QRPayments (1:N)
  Wallet.hasMany(QRPayment, {
    foreignKey: "merchantWalletId",
    as: "qrPayments",
  });
  QRPayment.belongsTo(Wallet, {
    foreignKey: "merchantWalletId",
    as: "merchantWallet",
  });

  // User - QRPayments usados (1:N)
  User.hasMany(QRPayment, {
    foreignKey: "usedBy",
    as: "usedQRPayments",
  });
  QRPayment.belongsTo(User, {
    foreignKey: "usedBy",
    as: "user",
  });

  // Transaction - QRPayment (1:1)
  QRPayment.hasOne(Transaction, {
    foreignKey: "id",
    sourceKey: "transactionId",
    as: "transaction",
  });

  console.log("✅ Asociaciones de modelos configuradas correctamente");
};

module.exports = {
  User,
  Wallet,
  Transaction,
  Block,
  Merchant,
  QRPayment,
  setupAssociations,
};
