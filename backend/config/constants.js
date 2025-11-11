/**
 * Constantes del sistema CryptoWallet Pro
 */

module.exports = {
  // Roles de usuario
  ROLES: {
    USER: 'user',
    MERCHANT: 'merchant',
    ADMIN: 'admin'
  },

  // Estados de transacción
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },

  // Tipos de transacción
  TRANSACTION_TYPES: {
    TRANSFER: 'transfer',
    QR_PAYMENT: 'qr_payment',
    REWARD: 'reward',
    FEE: 'fee'
  },

  // Estados de QR
  QR_STATUS: {
    ACTIVE: 'active',
    USED: 'used',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },

  // Configuración de wallet
  WALLET_CONFIG: {
    INITIAL_BALANCE: parseFloat(process.env.INITIAL_BALANCE) || 1000,
    MIN_BALANCE: 0,
    MAX_BALANCE: 1000000
  },

  // Configuración de transacciones
  TRANSACTION_CONFIG: {
    FEE_PERCENTAGE: parseFloat(process.env.TRANSACTION_FEE) || 0.01,
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 10000
  },

  // Configuración de QR
  QR_CONFIG: {
    EXPIRATION_TIME: 15 * 60 * 1000, // 15 minutos en milisegundos
    QR_SIZE: 300,
    ERROR_CORRECTION_LEVEL: 'M'
  },

  // Blockchain simulation
  BLOCKCHAIN_CONFIG: {
    DIFFICULTY: parseInt(process.env.BLOCK_DIFFICULTY) || 2,
    MINING_REWARD: parseFloat(process.env.MINING_REWARD) || 10,
    GENESIS_BLOCK: 'GENESIS_BLOCK_CRYPTOWALLET_PRO_2024'
  },

  // Categorías de comercios
  MERCHANT_CATEGORIES: [
    'Restaurante',
    'Tienda de ropa',
    'Supermercado',
    'Tecnología',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Otro'
  ],

  // Mensajes de error
  ERROR_MESSAGES: {
    INSUFFICIENT_BALANCE: 'Saldo insuficiente para realizar la transacción',
    INVALID_AMOUNT: 'Monto inválido',
    USER_NOT_FOUND: 'Usuario no encontrado',
    WALLET_NOT_FOUND: 'Wallet no encontrada',
    TRANSACTION_FAILED: 'Error al procesar la transacción',
    QR_EXPIRED: 'El código QR ha expirado',
    QR_ALREADY_USED: 'El código QR ya ha sido utilizado',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado'
  },

  // Mensajes de éxito
  SUCCESS_MESSAGES: {
    USER_CREATED: 'Usuario creado exitosamente',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    TRANSACTION_SUCCESS: 'Transacción completada exitosamente',
    QR_GENERATED: 'Código QR generado exitosamente',
    PROFILE_UPDATED: 'Perfil actualizado exitosamente'
  },

  // Regex patterns para validación
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    WALLET_ID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  }
};
