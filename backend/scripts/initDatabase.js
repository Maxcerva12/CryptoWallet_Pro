/**
 * Script de inicialización de la base de datos
 * Crea todas las tablas y relaciones
 */

require("dotenv").config();
const {
  sequelize,
  testConnection,
  syncDatabase,
} = require("../config/database");
const { setupAssociations } = require("../models");
const { getBlockchainService } = require("../services/blockchainService");

async function initializeDatabase() {
  try {
    console.log("🚀 Iniciando configuración de base de datos...\n");

    // 1. Testear conexión
    console.log("📡 Probando conexión a PostgreSQL...");
    const connected = await testConnection();

    if (!connected) {
      throw new Error("No se pudo conectar a la base de datos");
    }

    // 2. Configurar asociaciones
    console.log("🔗 Configurando relaciones entre modelos...");
    setupAssociations();

    // 3. Limpiar schema público (elimina todas las tablas)
    console.log("🧹 Limpiando schema público...");
    console.log(
      "⚠️  ADVERTENCIA: Esto eliminará todas las tablas y tipos existentes"
    );
    console.log("    Presiona Ctrl+C para cancelar o espera 5 segundos...\n");

    // Esperar 5 segundos
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Eliminar y recrear el schema público para limpiar completamente
    await sequelize.query("DROP SCHEMA IF EXISTS public CASCADE");
    await sequelize.query("CREATE SCHEMA public");
    await sequelize.query("GRANT ALL ON SCHEMA public TO postgres");
    await sequelize.query("GRANT ALL ON SCHEMA public TO public");
    console.log("✅ Schema público limpiado correctamente\n");

    // 4. Sincronizar modelos (crear tablas)
    console.log("� Creando tablas en la base de datos...");
    // Usar sync con force: true y logging desactivado para evitar cache issues
    await sequelize.sync({ force: true, logging: console.log });
    console.log("✅ Base de datos sincronizada correctamente");

    // 5. Inicializar blockchain
    console.log("⛓️  Inicializando blockchain...");
    const blockchainService = getBlockchainService();
    await blockchainService.initialize();

    console.log("\n✅ ¡Base de datos inicializada exitosamente!");
    console.log("\n📋 Tablas creadas:");
    console.log("   - users");
    console.log("   - wallets");
    console.log("   - merchants");
    console.log("   - transactions");
    console.log("   - blocks");
    console.log("   - qr_payments");
    console.log(
      '\n💡 Próximo paso: ejecuta "npm run seed" para insertar datos de prueba'
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al inicializar base de datos:", error);
    process.exit(1);
  }
}

// Ejecutar
initializeDatabase();
