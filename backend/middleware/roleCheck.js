/**
 * Middleware de verificación de roles
 * Verifica que el usuario tenga el rol necesario para acceder
 */

const { ROLES, ERROR_MESSAGES } = require("../config/constants");

/**
 * Verificar que el usuario tenga uno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    next();
  };
};

/**
 * Verificar que el usuario sea administrador
 */
const isAdmin = checkRole(ROLES.ADMIN);

/**
 * Verificar que el usuario sea comerciante
 */
const isMerchant = checkRole(ROLES.MERCHANT, ROLES.ADMIN);

/**
 * Verificar que el usuario sea usuario regular o superior
 */
const isUser = checkRole(ROLES.USER, ROLES.MERCHANT, ROLES.ADMIN);

/**
 * Verificar que el usuario sea el propietario del recurso o admin
 */
const isOwnerOrAdmin = (userIdParam = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const resourceUserId = req.params[userIdParam] || req.body.userId;

    if (req.user.role === ROLES.ADMIN || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  };
};

module.exports = {
  checkRole,
  isAdmin,
  isMerchant,
  isUser,
  isOwnerOrAdmin,
};
