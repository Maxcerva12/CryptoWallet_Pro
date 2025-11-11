/**
 * Configuración de conexión a PostgreSQL usando Sequelize
 * Base de datos: Wallet_db
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

/**
 * Testear conexión a la base de datos
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a PostgreSQL establecida correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con PostgreSQL:", error.message);
    return false;
  }
};

/**
 * Sincronizar modelos con la base de datos
 * @param {boolean} force - Si es true, elimina y recrea las tablas
 */
const syncDatabase = async (force = false) => {
  try {
    // Forzar sincronización completa sin verificar tablas existentes
    // force: true -> DROP TABLE IF EXISTS + CREATE TABLE
    // match: false -> No verificar si la base de datos existe
    await sequelize.sync({ force, match: false });
    console.log("✅ Base de datos sincronizada correctamente");
  } catch (error) {
    console.error("❌ Error al sincronizar base de datos:", error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
