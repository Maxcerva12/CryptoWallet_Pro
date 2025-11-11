/**
 * Servicio de Autenticación
 * Lógica de negocio para login, register y JWT
 */

const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROLES,
} = require("../config/constants");
const { AppError } = require("../middleware/errorHandler");
const walletService = require("./walletService");

class AuthService {
  /**
   * Generar token JWT
   */
  generateToken(userId, role) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "30m",
    });
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const { fullName, email, password, role = ROLES.USER } = userData;

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError("El email ya está registrado", 409);
      }

      // Crear usuario
      const user = await User.create({
        fullName,
        email,
        password,
        role,
      });

      // Crear wallet automáticamente si es user o merchant
      let wallet = null;
      if (role === ROLES.USER || role === ROLES.MERCHANT) {
        wallet = await walletService.createWallet(user.id);
      }

      // Generar token
      const token = this.generateToken(user.id, user.role);

      return {
        success: true,
        message: SUCCESS_MESSAGES.USER_CREATED,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          wallet: wallet
            ? {
                id: wallet.id,
                address: wallet.address,
                balance: parseFloat(wallet.balance),
                currency: wallet.currency,
              }
            : null,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login de usuario
   */
  async login(email, password) {
    try {
      // Buscar usuario
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
      }

      // Verificar si la cuenta está bloqueada
      if (user.isLocked()) {
        const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        throw new AppError(
          `Cuenta bloqueada por múltiples intentos fallidos. Intenta en ${minutes} minutos`,
          403
        );
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        await user.incrementLoginAttempts();
        throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
      }

      // Verificar si la cuenta está activa
      if (!user.isActive) {
        throw new AppError("Cuenta desactivada", 403);
      }

      // Resetear intentos de login
      await user.resetLoginAttempts();

      // Generar token
      const token = this.generateToken(user.id, user.role);

      // Obtener wallet si existe
      let wallet = null;
      try {
        wallet = await walletService.getWalletByUserId(user.id);
      } catch (err) {
        // Usuario sin wallet (ej: admin)
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          wallet: wallet
            ? {
                address: wallet.address,
                balance: parseFloat(wallet.balance),
                currency: wallet.currency,
              }
            : null,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario actual (me)
   */
  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    // Obtener wallet si existe
    let wallet = null;
    try {
      wallet = await walletService.getWalletByUserId(userId);
    } catch (err) {
      // Usuario sin wallet
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      wallet: wallet
        ? {
            id: wallet.id,
            address: wallet.address,
            balance: parseFloat(wallet.balance),
            currency: wallet.currency,
          }
        : null,
    };
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    // Campos permitidos para actualizar
    const allowedFields = ["fullName", "phone"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    await user.update(updates);

    return {
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    // Verificar contraseña actual
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new AppError("Contraseña actual incorrecta", 401);
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
    };
  }

  /**
   * Verificar token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new AuthService();
