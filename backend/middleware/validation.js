/**
 * Middleware de validación de datos de entrada
 * Utiliza express-validator para validar requests
 */

const { validationResult } = require("express-validator");

/**
 * Verificar resultados de validación
 * Si hay errores, retorna respuesta 400 con detalles
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

/**
 * Sanitizar entrada del usuario
 * Remueve espacios en blanco al inicio y final
 */
const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitizar query
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

/**
 * Validar UUID format
 */
const isValidUUID = (value) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validar monto decimal
 */
const isValidAmount = (value) => {
  const amount = parseFloat(value);
  return !isNaN(amount) && amount > 0 && isFinite(amount);
};

/**
 * Validar email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña fuerte
 */
const isStrongPassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
};

module.exports = {
  validate,
  sanitizeInput,
  isValidUUID,
  isValidAmount,
  isValidEmail,
  isStrongPassword,
};
