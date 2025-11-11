/**
 * Script para insertar datos de prueba
 * Crea usuarios, comercios, transacciones de ejemplo
 */

require("dotenv").config();
const { User, Wallet, Merchant, Transaction, QRPayment } = require("../models");
const { setupAssociations } = require("../models");
const { ROLES, WALLET_CONFIG } = require("../config/constants");
const { getBlockchainService } = require("../services/blockchainService");

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando inserción de datos de prueba...\n");

    setupAssociations();

    // =============================
    // 0. LIMPIAR DATOS EXISTENTES
    // =============================
    console.log("🗑️ Limpiando datos existentes...");
    await QRPayment.destroy({ where: {}, truncate: true, cascade: true });
    await Transaction.destroy({ where: {}, truncate: true, cascade: true });
    await Merchant.destroy({ where: {}, truncate: true, cascade: true });
    await Wallet.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log("✅ Datos anteriores eliminados\n");

    // =============================
    // 1. CREAR USUARIO ADMINISTRADOR
    // =============================
    console.log("👤 Creando usuario administrador...");
    const admin = await User.create({
      fullName: "Administrador del Sistema",
      email: "admin@cryptowallet.com",
      password: "Admin123!",
      role: ROLES.ADMIN,
      phone: "+51 999 888 777",
    });
    console.log("✅ Admin creado:", admin.email);

    // =============================
    // 2. CREAR USUARIOS REGULARES
    // =============================
    console.log("\n👥 Creando usuarios regulares...");

    const user1 = await User.create({
      fullName: "Juan Pérez",
      email: "juan.perez@email.com",
      password: "User123!",
      role: ROLES.USER,
      phone: "+51 987 654 321",
    });

    const user2 = await User.create({
      fullName: "María García",
      email: "maria.garcia@email.com",
      password: "User123!",
      role: ROLES.USER,
      phone: "+51 987 654 322",
    });

    const user3 = await User.create({
      fullName: "Carlos López",
      email: "carlos.lopez@email.com",
      password: "User123!",
      role: ROLES.USER,
      phone: "+51 987 654 323",
    });

    console.log("✅ Usuarios creados:", user1.email, user2.email, user3.email);

    // =============================
    // 3. CREAR WALLETS AUTOMÁTICAS
    // =============================
    console.log("\n💰 Creando wallets para usuarios...");

    const wallet1 = await Wallet.create({
      userId: user1.id,
      balance: WALLET_CONFIG.INITIAL_BALANCE,
      currency: "CC",
    });

    const wallet2 = await Wallet.create({
      userId: user2.id,
      balance: WALLET_CONFIG.INITIAL_BALANCE,
      currency: "CC",
    });

    const wallet3 = await Wallet.create({
      userId: user3.id,
      balance: WALLET_CONFIG.INITIAL_BALANCE,
      currency: "CC",
    });

    console.log("✅ Wallets creadas");
    console.log(
      `   - ${user1.fullName}: ${wallet1.address} (${wallet1.balance} CC)`
    );
    console.log(
      `   - ${user2.fullName}: ${wallet2.address} (${wallet2.balance} CC)`
    );
    console.log(
      `   - ${user3.fullName}: ${wallet3.address} (${wallet3.balance} CC)`
    );

    // =============================
    // 4. CREAR COMERCIOS
    // =============================
    console.log("\n🏪 Creando comercios...");

    const merchantUser1 = await User.create({
      fullName: "Ana Martínez",
      email: "comercio1@cryptowallet.com",
      password: "Merchant123!",
      role: ROLES.MERCHANT,
      phone: "+51 912 345 678",
    });

    const merchantWallet1 = await Wallet.create({
      userId: merchantUser1.id,
      balance: 500,
      currency: "CC",
    });

    const merchant1 = await Merchant.create({
      userId: merchantUser1.id,
      businessName: "Restaurante El Buen Sabor",
      category: "Restaurante",
      description: "Comida peruana tradicional",
      phone: "+51 912 345 678",
      address: "Av. Principal 123",
      isVerified: true,
      totalSales: 0,
      totalTransactions: 0,
    });

    const merchantUser2 = await User.create({
      fullName: "Roberto Silva",
      email: "comercio2@cryptowallet.com",
      password: "Merchant123!",
      role: ROLES.MERCHANT,
      phone: "+51 912 345 679",
    });

    const merchantWallet2 = await Wallet.create({
      userId: merchantUser2.id,
      balance: 750,
      currency: "CC",
    });

    const merchant2 = await Merchant.create({
      userId: merchantUser2.id,
      businessName: "TechStore Pro",
      category: "Tecnología",
      description: "Productos tecnológicos y accesorios",
      phone: "+51 912 345 679",
      address: "Calle Comercio 456",
      isVerified: true,
      totalSales: 0,
      totalTransactions: 0,
    });

    console.log("✅ Comercios creados:");
    console.log(`   - ${merchant1.businessName} (${merchant1.category})`);
    console.log(`   - ${merchant2.businessName} (${merchant2.category})`);

    // =============================
    // 5. INICIALIZAR BLOCKCHAIN
    // =============================
    console.log("\n⛓️ Inicializando blockchain...");
    const blockchainService = getBlockchainService();
    await blockchainService.initialize();
    console.log("✅ Bloque génesis creado");

    // =============================
    // 6. CREAR TRANSACCIONES DE PRUEBA
    // =============================
    console.log("\n💸 Creando transacciones de prueba...");

    // Transacción 1: Juan a María
    const tx1 = await Transaction.create({
      fromWalletId: wallet1.id,
      toWalletId: wallet2.id,
      amount: 50,
      fee: 0.5,
      totalAmount: 50.5,
      currency: "CC",
      type: "transfer",
      status: "completed",
      description: "Pago por servicio",
      confirmedAt: new Date(),
    });

    await wallet1.updateBalance(50.5, "subtract");
    await wallet2.updateBalance(50, "add");
    await blockchainService.addTransaction(tx1);

    // Transacción 2: María a Carlos
    const tx2 = await Transaction.create({
      fromWalletId: wallet2.id,
      toWalletId: wallet3.id,
      amount: 30,
      fee: 0.3,
      totalAmount: 30.3,
      currency: "CC",
      type: "transfer",
      status: "completed",
      description: "Regalo",
      confirmedAt: new Date(),
    });

    await wallet2.updateBalance(30.3, "subtract");
    await wallet3.updateBalance(30, "add");
    await blockchainService.addTransaction(tx2);

    // Transacción 3: Carlos al Restaurante
    const tx3 = await Transaction.create({
      fromWalletId: wallet3.id,
      toWalletId: merchantWallet1.id,
      amount: 45,
      fee: 0,
      totalAmount: 45,
      currency: "CC",
      type: "qr_payment",
      status: "completed",
      description: "Pago en Restaurante El Buen Sabor",
      confirmedAt: new Date(),
      metadata: {
        merchantId: merchant1.id,
        merchantName: merchant1.businessName,
      },
    });

    await wallet3.updateBalance(45, "subtract");
    await merchantWallet1.updateBalance(45, "add");
    await merchant1.updateSalesStats(45);
    await blockchainService.addTransaction(tx3);

    console.log("✅ Transacciones creadas:");
    console.log(`   - ${tx1.txHash.substring(0, 16)}... (${tx1.amount} CC)`);
    console.log(`   - ${tx2.txHash.substring(0, 16)}... (${tx2.amount} CC)`);
    console.log(
      `   - ${tx3.txHash.substring(0, 16)}... (${tx3.amount} CC - QR Payment)`
    );

    // =============================
    // 7. CREAR QR DE PRUEBA
    // =============================
    console.log("\n📱 Creando códigos QR activos...");

    const qr1 = await QRPayment.create({
      merchantId: merchant1.id,
      merchantWalletId: merchantWallet1.id,
      amount: 25.5,
      currency: "CC",
      description: "Almuerzo ejecutivo",
      status: "active",
    });

    const qr2 = await QRPayment.create({
      merchantId: merchant2.id,
      merchantWalletId: merchantWallet2.id,
      amount: 150.0,
      currency: "CC",
      description: "Mouse inalámbrico",
      status: "active",
    });

    console.log("✅ Códigos QR creados:");
    console.log(`   - ${merchant1.businessName}: ${qr1.amount} CC`);
    console.log(`   - ${merchant2.businessName}: ${qr2.amount} CC`);

    // =============================
    // RESUMEN
    // =============================
    console.log("\n" + "=".repeat(50));
    console.log("✅ ¡DATOS DE PRUEBA INSERTADOS EXITOSAMENTE!");
    console.log("=".repeat(50));
    console.log("\n📊 RESUMEN:");
    console.log(`   • Usuarios: 6 (1 admin, 3 users, 2 merchants)`);
    console.log(`   • Wallets: 5`);
    console.log(`   • Comercios: 2`);
    console.log(`   • Transacciones: 3`);
    console.log(`   • QR Activos: 2`);
    console.log(`   • Bloques: ${await require("../models").Block.count()}`);

    console.log("\n🔑 CREDENCIALES DE ACCESO:");
    console.log("\n📌 Administrador:");
    console.log(`   Email: admin@cryptowallet.com`);
    console.log(`   Password: Admin123!`);

    console.log("\n📌 Usuario Regular (Juan):");
    console.log(`   Email: juan.perez@email.com`);
    console.log(`   Password: User123!`);
    console.log(`   Wallet: ${wallet1.address}`);

    console.log("\n📌 Comercio 1 (Restaurante):");
    console.log(`   Email: comercio1@cryptowallet.com`);
    console.log(`   Password: Merchant123!`);
    console.log(`   Wallet: ${merchantWallet1.address}`);

    console.log("\n💡 Ahora puedes:");
    console.log("   1. Ejecutar: npm run dev");
    console.log("   2. Probar la API en: http://localhost:5000");
    console.log("   3. Login con las credenciales arriba\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al insertar datos:", error);
    process.exit(1);
  }
}

// Ejecutar
seedDatabase();
