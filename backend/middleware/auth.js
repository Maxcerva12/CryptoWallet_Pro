/**
 * Middleware de autenticación JWT
 * Verifica tokens JWT y extrae información del usuario
 */

const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { ERROR_MESSAGES } = require("../config/constants");

/**
 * Verificar token JWT en el header Authorization
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Cuenta desactivada",
      });
    }

    // Agregar usuario al request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado. Por favor inicia sesión nuevamente",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al verificar autenticación",
      error: error.message,
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega info del usuario si existe
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (user && user.isActive) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
    }

    next();
  } catch (error) {
    // Ignorar errores y continuar sin autenticación
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
